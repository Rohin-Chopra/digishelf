import * as fs from "node:fs";
import * as path from "node:path";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { contentType } from "./content-type.ts";

// AWS managed CloudFront policies.
const CACHING_DISABLED = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad";
const CACHING_OPTIMIZED = "658327ea-f89d-4fab-a63d-7e88639e58f6";
const ALL_VIEWER_EXCEPT_HOST = "b689b0a8-53d0-40ab-baf2-68738e2966ac";

export interface SiteArgs {
  name: string;
  /** `apps/web/.output`, produced by `pnpm --filter web build` (Nitro aws-lambda preset). */
  webOutputDir: string;
  /** `apps/api/dist`, holding the Go `bootstrap` from `pnpm --filter api build`. */
  apiDistDir: string;
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

/** CloudFront path patterns for everything in the public dir (`assets/*`, `favicon.ico`, ...). */
export function publicPatterns(publicDir: string): string[] {
  return fs
    .readdirSync(publicDir, { withFileTypes: true })
    .map((entry) =>
      entry.isDirectory() ? `/${entry.name}/*` : `/${entry.name}`,
    )
    .sort();
}

/**
 * A Lambda behind its own API Gateway HTTP API. Lambda function URLs aren't available in
 * ap-southeast-4, and both Nitro's aws-lambda handler and the Go API speak the v2 payload.
 */
function httpLambda(
  name: string,
  args: {
    function: Omit<aws.lambda.FunctionArgs, "role" | "loggingConfig" | "name">;
    routes: string[];
    throttle?: { burst: number; rate: number };
  },
) {
  const role = new aws.iam.Role(name, {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
      Service: "lambda.amazonaws.com",
    }),
  });
  new aws.iam.RolePolicyAttachment(`${name}-logs`, {
    role: role.name,
    policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
  });
  const logGroup = new aws.cloudwatch.LogGroup(name, {
    name: `/aws/lambda/${name}`,
    retentionInDays: 30,
  });
  const fn = new aws.lambda.Function(
    name,
    {
      ...args.function,
      name,
      role: role.arn,
      architectures: ["arm64"],
      loggingConfig: { logFormat: "Text", logGroup: logGroup.name },
    },
    { dependsOn: [logGroup] },
  );

  const api = new aws.apigatewayv2.Api(name, { protocolType: "HTTP" });
  const integration = new aws.apigatewayv2.Integration(name, {
    apiId: api.id,
    integrationType: "AWS_PROXY",
    integrationUri: fn.invokeArn,
    payloadFormatVersion: "2.0",
  });
  for (const route of args.routes) {
    new aws.apigatewayv2.Route(`${name}-${route.replace(/\W+/g, "-")}`, {
      apiId: api.id,
      routeKey: route,
      target: pulumi.interpolate`integrations/${integration.id}`,
    });
  }
  new aws.apigatewayv2.Stage(name, {
    apiId: api.id,
    name: "$default",
    autoDeploy: true,
    defaultRouteSettings: args.throttle && {
      throttlingBurstLimit: args.throttle.burst,
      throttlingRateLimit: args.throttle.rate,
    },
  });
  new aws.lambda.Permission(`${name}-apigateway`, {
    function: fn.name,
    action: "lambda:InvokeFunction",
    principal: "apigateway.amazonaws.com",
    sourceArn: pulumi.interpolate`${api.executionArn}/*/*`,
  });

  return { fn, host: api.apiEndpoint.apply((url) => new URL(url).host) };
}

export function createSite(args: SiteArgs) {
  const { name } = args;
  const publicDir = path.join(args.webOutputDir, "public");

  // ---- static files ----

  const bucket = new aws.s3.Bucket(`${name}-assets`, { forceDestroy: true });
  new aws.s3.BucketPublicAccessBlock(`${name}-assets`, {
    bucket: bucket.id,
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true,
  });
  for (const file of listFiles(publicDir)) {
    const key = file.split(path.sep).join("/");
    new aws.s3.BucketObjectv2(`${name}-${key}`, {
      bucket: bucket.id,
      key,
      source: new pulumi.asset.FileAsset(path.join(publicDir, file)),
      contentType: contentType(file),
      // Vite fingerprints everything under assets/.
      cacheControl: key.startsWith("assets/")
        ? "public,max-age=31536000,immutable"
        : "public,max-age=0,s-maxage=86400,must-revalidate",
    });
  }

  // ---- SSR (TanStack Start) and GraphQL (Go) ----

  const web = httpLambda(`${name}-web`, {
    function: {
      runtime: "nodejs26.x",
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        path.join(args.webOutputDir, "server"),
      ),
      memorySize: 1024,
      timeout: 15,
    },
    routes: ["$default"],
  });

  const api = httpLambda(`${name}-api`, {
    function: {
      runtime: "provided.al2023",
      handler: "bootstrap",
      code: new pulumi.asset.FileArchive(args.apiDistDir),
      memorySize: 256,
      timeout: 10,
      environment: { variables: { TMDB_API_KEY: args.tmdbApiKey } },
    },
    routes: ["GET /graphql", "POST /graphql"],
    // Every search is a TMDB call; keep a runaway client from burning the key's rate limit.
    throttle: { burst: 20, rate: 10 },
  });

  // ---- CDN ----

  const s3Access = new aws.cloudfront.OriginAccessControl(`${name}-s3`, {
    originAccessControlOriginType: "s3",
    signingBehavior: "always",
    signingProtocol: "sigv4",
  });

  // The origin request policy drops Host (API Gateway needs its own), so pass
  // the viewer's host on for SSR.
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

  const httpOrigin = (originId: string, domainName: pulumi.Input<string>) => ({
    originId,
    domainName,
    customOriginConfig: {
      httpPort: 80,
      httpsPort: 443,
      originProtocolPolicy: "https-only",
      originSslProtocols: ["TLSv1.2"],
    },
  });
  const ALL_METHODS = [
    "GET",
    "HEAD",
    "OPTIONS",
    "PUT",
    "POST",
    "PATCH",
    "DELETE",
  ];

  const distribution = new aws.cloudfront.Distribution(`${name}-site`, {
    enabled: true,
    isIpv6Enabled: true,
    httpVersion: "http2and3",
    priceClass: "PriceClass_All",
    aliases: [args.domain],
    origins: [
      httpOrigin("web", web.host),
      httpOrigin("api", api.host),
      {
        originId: "s3",
        domainName: bucket.bucketRegionalDomainName,
        originAccessControlId: s3Access.id,
      },
    ],
    defaultCacheBehavior: {
      targetOriginId: "web",
      viewerProtocolPolicy: "redirect-to-https",
      allowedMethods: ALL_METHODS,
      cachedMethods: ["GET", "HEAD"],
      compress: true,
      cachePolicyId: CACHING_DISABLED,
      originRequestPolicyId: ALL_VIEWER_EXCEPT_HOST,
      functionAssociations: [
        { eventType: "viewer-request", functionArn: forwardedHost.arn },
      ],
    },
    orderedCacheBehaviors: [
      {
        pathPattern: "/graphql",
        targetOriginId: "api",
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ALL_METHODS,
        cachedMethods: ["GET", "HEAD"],
        compress: true,
        cachePolicyId: CACHING_DISABLED,
        originRequestPolicyId: ALL_VIEWER_EXCEPT_HOST,
      },
      ...publicPatterns(publicDir).map((pathPattern) => ({
        pathPattern,
        targetOriginId: "s3",
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD", "OPTIONS"],
        cachedMethods: ["GET", "HEAD"],
        compress: true,
        cachePolicyId: CACHING_OPTIMIZED,
      })),
    ],
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
              Resource: `${bucketArn}/*`,
              Condition: { StringEquals: { "AWS:SourceArn": distributionArn } },
            },
          ],
        }),
      ),
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
    webFunction: web.fn.name,
    apiFunction: api.fn.name,
  };
}
