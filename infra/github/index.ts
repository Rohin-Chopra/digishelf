// Lets GitHub Actions deploy with short-lived AWS credentials (OIDC); no access keys in GitHub.
// Only jobs in this repo's `production` GitHub environment can assume the role.
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const repo = config.get("repo") ?? "Rohin-Chopra/digishelf";
const environments = config.getObject<string[]>("environments") ?? [
  "production",
];
const hostedZone = config.get("hostedZone") ?? "rohinchopra.com";
const prefix = "digishelf-";

const account = aws.getCallerIdentityOutput().accountId;
const region = aws.getRegionOutput().region;
// Created by makemycareer's infra/github; there is one per account.
const github = aws.iam.getOpenIdConnectProviderOutput({
  url: "https://token.actions.githubusercontent.com",
});
const zone = aws.route53.getZoneOutput({
  name: hostedZone,
  privateZone: false,
});
const stateKey = aws.kms.getAliasOutput({ name: "alias/digishelf-pulumi" });

const role = new aws.iam.Role(`${prefix}github-deploy`, {
  name: `${prefix}github-deploy`,
  maxSessionDuration: 3600,
  assumeRolePolicy: github.arn.apply((arn) =>
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { Federated: arn },
          Action: "sts:AssumeRoleWithWebIdentity",
          Condition: {
            StringEquals: {
              "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
            },
            StringLike: {
              "token.actions.githubusercontent.com:sub": environments.map(
                (env) => `repo:${repo}:environment:${env}`,
              ),
            },
          },
        },
      ],
    }),
  ),
});

new aws.iam.RolePolicy(`${prefix}github-deploy`, {
  role: role.id,
  policy: pulumi
    .all([account, region, zone.zoneId, stateKey.targetKeyArn])
    .apply(([account, region, zoneId, keyArn]) =>
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PulumiState",
            Effect: "Allow",
            Action: [
              "s3:ListBucket",
              "s3:GetObject",
              "s3:PutObject",
              "s3:DeleteObject",
            ],
            Resource: [
              `arn:aws:s3:::${prefix}pulumi-state-${account}`,
              `arn:aws:s3:::${prefix}pulumi-state-${account}/*`,
            ],
          },
          {
            Sid: "PulumiSecrets",
            Effect: "Allow",
            Action: ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey"],
            Resource: keyArn,
          },
          {
            // Bucket names are generated from the resource name, e.g. digishelf-production-assets-1a2b3c.
            Sid: "SiteAssets",
            Effect: "Allow",
            Action: ["s3:*"],
            Resource: [
              `arn:aws:s3:::${prefix}*-assets-*`,
              `arn:aws:s3:::${prefix}*-assets-*/*`,
            ],
          },
          {
            Sid: "Lambdas",
            Effect: "Allow",
            Action: ["lambda:*"],
            Resource: [
              `arn:aws:lambda:${region}:${account}:function:${prefix}*`,
            ],
          },
          {
            Sid: "Logs",
            Effect: "Allow",
            Action: ["logs:*"],
            Resource: [
              `arn:aws:logs:${region}:${account}:log-group:/aws/lambda/${prefix}*`,
            ],
          },
          {
            Sid: "Describe",
            Effect: "Allow",
            Action: [
              "logs:DescribeLogGroups",
              "sts:GetCallerIdentity",
              "s3:ListAllMyBuckets",
            ],
            Resource: "*",
          },
          {
            // CloudFront IDs are generated, so these can't be narrowed by name.
            Sid: "Cdn",
            Effect: "Allow",
            Action: ["cloudfront:*"],
            Resource: "*",
          },
          {
            // CloudFront certificates must live in us-east-1.
            Sid: "Certificates",
            Effect: "Allow",
            Action: ["acm:*"],
            Resource: `arn:aws:acm:us-east-1:${account}:certificate/*`,
          },
          {
            Sid: "CertificateRequest",
            Effect: "Allow",
            Action: ["acm:ListCertificates", "acm:RequestCertificate"],
            Resource: "*",
          },
          {
            Sid: "DnsZone",
            Effect: "Allow",
            Action: [
              "route53:GetHostedZone",
              "route53:ListResourceRecordSets",
              "route53:ChangeResourceRecordSets",
              "route53:ListTagsForResource",
            ],
            Resource: `arn:aws:route53:::hostedzone/${zoneId}`,
          },
          {
            Sid: "DnsLookup",
            Effect: "Allow",
            Action: [
              "route53:ListHostedZones",
              "route53:ListHostedZonesByName",
              "route53:GetChange",
            ],
            Resource: "*",
          },
          {
            // Pulumi auto-names roles `<name>-server-<suffix>`; excludes this role itself.
            Sid: "LambdaRoles",
            Effect: "Allow",
            Action: [
              "iam:GetRole",
              "iam:CreateRole",
              "iam:DeleteRole",
              "iam:UpdateRole",
              "iam:TagRole",
              "iam:UntagRole",
              "iam:UpdateAssumeRolePolicy",
              "iam:ListRolePolicies",
              "iam:ListAttachedRolePolicies",
              "iam:GetRolePolicy",
              "iam:PutRolePolicy",
              "iam:DeleteRolePolicy",
              "iam:AttachRolePolicy",
              "iam:DetachRolePolicy",
              "iam:ListInstanceProfilesForRole",
            ],
            Resource: environments.map(
              (env) => `arn:aws:iam::${account}:role/${prefix}${env}-*`,
            ),
          },
          {
            Sid: "PassLambdaRoles",
            Effect: "Allow",
            Action: "iam:PassRole",
            Resource: environments.map(
              (env) => `arn:aws:iam::${account}:role/${prefix}${env}-*`,
            ),
            Condition: {
              StringEquals: { "iam:PassedToService": "lambda.amazonaws.com" },
            },
          },
        ],
      }),
    ),
});

export const roleArn = role.arn;
