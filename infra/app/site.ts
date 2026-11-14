import * as fs from "node:fs";
import * as path from "node:path";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { contentType } from "./content-type.ts";

// AWS managed CloudFront policies.
const CACHING_DISABLED = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad";
const CACHING_OPTIMIZED = "658327ea-f89d-4fab-a63d-7e88639e58f6";
const ALL_VIEWER_EXCEPT_HOST = "b689b0a8-53d0-40ab-baf2-68738e2966ac";

const ASSETS_PREFIX = "_assets";
const CACHE_PREFIX = "_cache";

interface OpenNextOutput {
  behaviors: { pattern: string; origin: string }[];
}

export interface SiteArgs {
  name: string;
  /** `apps/web/.open-next`, produced by `pnpm --filter web build:aws`. */
  openNextDir: string;
  domain: string;
  hostedZone: string;
  tmdbApiKey: pulumi.Input<string>;
}

function listFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(dir, path.join(entry.parentPath, entry.name)))
    .sort();
}

/** CloudFront paths served straight from S3 (static files), per OpenNext. */
export function assetPatterns(output: OpenNextOutput): string[] {
  return output.behaviors
    .filter((behavior) => behavior.origin === "s3")
    .map((behavior) => behavior.pattern);
}

export function createSite(args: SiteArgs) {
  const { name, openNextDir } = args;
  const output = JSON.parse(
    fs.readFileSync(path.join(openNextDir, "open-next.output.json"), "utf8"),
  ) as OpenNextOutput;

  // ---- static assets and prerendered pages ----

  const bucket = new aws.s3.Bucket(`${name}-assets`, { forceDestroy: true });
  new aws.s3.BucketPublicAccessBlock(`${name}-assets`, {
    bucket: bucket.id,
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true,
  });

  const uploads: [string, string, string][] = [
    [
      "assets",
      ASSETS_PREFIX,
      "public,max-age=0,s-maxage=31536000,must-revalidate",
    ],
    ["cache", CACHE_PREFIX, "no-store"],
  ];
  for (const [dir, prefix, cacheControl] of uploads) {
    const root = path.join(openNextDir, dir);
    for (const file of listFiles(root)) {
      const key = `${prefix}/${file.split(path.sep).join("/")}`;
      new aws.s3.BucketObjectv2(`${name}-${key}`, {
        bucket: bucket.id,
        key,
        source: new pulumi.asset.FileAsset(path.join(root, file)),
        contentType: contentType(file),
        cacheControl: key.startsWith(`${ASSETS_PREFIX}/_next/static/`)
          ? "public,max-age=31536000,immutable"
          : cacheControl,
      });
    }
  }

  // ---- server function ----

  const role = new aws.iam.Role(`${name}-server`, {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
      Service: "lambda.amazonaws.com",
    }),
  });
  new aws.iam.RolePolicyAttachment(`${name}-server-logs`, {
    role: role.name,
    policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
  });
  new aws.iam.RolePolicy(`${name}-server-cache`, {
    role: role.id,
    policy: bucket.arn.apply((arn) =>
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: ["s3:GetObject", "s3:PutObject"],
            Resource: `${arn}/${CACHE_PREFIX}/*`,
          },
          { Effect: "Allow", Action: "s3:ListBucket", Resource: arn },
        ],
      }),
    ),
  });

  const logGroup = new aws.cloudwatch.LogGroup(`${name}-server`, {
    name: `/aws/lambda/${name}-server`,
    retentionInDays: 30,
  });

  const server = new aws.lambda.Function(
    `${name}-server`,
    {
      name: `${name}-server`,
      runtime: "nodejs26.x",
      architectures: ["arm64"],
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        path.join(openNextDir, "server-functions/default"),
      ),
      role: role.arn,
      memorySize: 1024,
      timeout: 15,
      loggingConfig: { logFormat: "Text", logGroup: logGroup.name },
      environment: {
        variables: {
          TMDB_API_KEY: args.tmdbApiKey,
          CACHE_BUCKET_NAME: bucket.bucket,
          CACHE_BUCKET_KEY_PREFIX: CACHE_PREFIX,
          CACHE_BUCKET_REGION: aws.getRegionOutput().region,
        },
      },
    },
    { dependsOn: [logGroup] },
  );

  const functionUrl = new aws.lambda.FunctionUrl(`${name}-server`, {
    functionName: server.name,
    authorizationType: "AWS_IAM",
  });

  // ---- CDN ----

  const s3Access = new aws.cloudfront.OriginAccessControl(`${name}-s3`, {
    originAccessControlOriginType: "s3",
    signingBehavior: "always",
    signingProtocol: "sigv4",
  });
  const lambdaAccess = new aws.cloudfront.OriginAccessControl(
    `${name}-lambda`,
    {
      originAccessControlOriginType: "lambda",
      signingBehavior: "always",
      signingProtocol: "sigv4",
    },
  );

  // The origin request policy drops Host (the function URL needs its own), so
  // pass the viewer's host on for Next.
  const forwardedHost = new aws.cloudfront.Function(`${name}-forwarded-host`, {
    runtime: "cloudfront-js-2.0",
    publish: true,
    code: [
      "function handler(event) {",
      "  var request = event.request;",
      "  request.headers['x-forwarded-host'] = { value: request.headers.host.value };",
      "  return request;",
      "}",
    ].join("\n"),
  });

  const usEast1 = new aws.Provider(`${name}-us-east-1`, {
    region: "us-east-1",
  });
  const zone = aws.route53.getZoneOutput({
    name: args.hostedZone,
    privateZone: false,
  });
  const certificate = new aws.acm.Certificate(
    `${name}-site`,
    { domainName: args.domain, validationMethod: "DNS" },
    { provider: usEast1 },
  );
  const validationRecord = new aws.route53.Record(`${name}-cert-validation`, {
    zoneId: zone.zoneId,
    name: certificate.domainValidationOptions[0].resourceRecordName,
    type: certificate.domainValidationOptions[0].resourceRecordType,
    records: [certificate.domainValidationOptions[0].resourceRecordValue],
    ttl: 300,
    allowOverwrite: true,
  });
  const validation = new aws.acm.CertificateValidation(
    `${name}-site`,
    {
      certificateArn: certificate.arn,
      validationRecordFqdns: [validationRecord.fqdn],
    },
    { provider: usEast1 },
  );

  const distribution = new aws.cloudfront.Distribution(`${name}-site`, {
    enabled: true,
    isIpv6Enabled: true,
    httpVersion: "http2and3",
    priceClass: "PriceClass_All",
    aliases: [args.domain],
    origins: [
      {
        originId: "server",
        domainName: functionUrl.functionUrl.apply((url) => new URL(url).host),
        originAccessControlId: lambdaAccess.id,
        customOriginConfig: {
          httpPort: 80,
          httpsPort: 443,
          originProtocolPolicy: "https-only",
          originSslProtocols: ["TLSv1.2"],
        },
      },
      {
        originId: "s3",
        domainName: bucket.bucketRegionalDomainName,
        originPath: `/${ASSETS_PREFIX}`,
        originAccessControlId: s3Access.id,
      },
    ],
    defaultCacheBehavior: {
      targetOriginId: "server",
      viewerProtocolPolicy: "redirect-to-https",
      allowedMethods: [
        "GET",
        "HEAD",
        "OPTIONS",
        "PUT",
        "POST",
        "PATCH",
        "DELETE",
      ],
      cachedMethods: ["GET", "HEAD"],
      compress: true,
      cachePolicyId: CACHING_DISABLED,
      originRequestPolicyId: ALL_VIEWER_EXCEPT_HOST,
      functionAssociations: [
        { eventType: "viewer-request", functionArn: forwardedHost.arn },
      ],
    },
    orderedCacheBehaviors: assetPatterns(output).map((pattern) => ({
      pathPattern: pattern,
      targetOriginId: "s3",
      viewerProtocolPolicy: "redirect-to-https",
      allowedMethods: ["GET", "HEAD", "OPTIONS"],
      cachedMethods: ["GET", "HEAD"],
      compress: true,
      cachePolicyId: CACHING_OPTIMIZED,
    })),
    restrictions: { geoRestriction: { restrictionType: "none" } },
    viewerCertificate: {
      acmCertificateArn: validation.certificateArn,
      sslSupportMethod: "sni-only",
      minimumProtocolVersion: "TLSv1.2_2021",
    },
  });

  new aws.s3.BucketPolicy(`${name}-assets`, {
    bucket: bucket.id,
    policy: pulumi
      .all([bucket.arn, distribution.arn])
      .apply(([bucketArn, distributionArn]) =>
        JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { Service: "cloudfront.amazonaws.com" },
              Action: "s3:GetObject",
              Resource: `${bucketArn}/${ASSETS_PREFIX}/*`,
              Condition: { StringEquals: { "AWS:SourceArn": distributionArn } },
            },
          ],
        }),
      ),
  });

  // Function URLs with IAM auth need both permissions for CloudFront's OAC.
  new aws.lambda.Permission(`${name}-cloudfront-url`, {
    function: server.name,
    action: "lambda:InvokeFunctionUrl",
    principal: "cloudfront.amazonaws.com",
    sourceArn: distribution.arn,
    functionUrlAuthType: "AWS_IAM",
  });
  new aws.lambda.Permission(`${name}-cloudfront-invoke`, {
    function: server.name,
    action: "lambda:InvokeFunction",
    principal: "cloudfront.amazonaws.com",
    sourceArn: distribution.arn,
    invokedViaFunctionUrl: true,
  });

  for (const type of ["A", "AAAA"]) {
    new aws.route53.Record(`${name}-site-${type}`, {
      zoneId: zone.zoneId,
      name: args.domain,
      type,
      aliases: [
        {
          name: distribution.domainName,
          zoneId: distribution.hostedZoneId,
          evaluateTargetHealth: false,
        },
      ],
    });
  }

  return {
    url: pulumi.interpolate`https://${args.domain}`,
    distributionId: distribution.id,
    assetsBucket: bucket.bucket,
    serverFunction: server.name,
  };
}
