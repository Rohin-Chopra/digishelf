#!/usr/bin/env bash
# One-off, with admin AWS credentials: the Pulumi state bucket, the KMS key that encrypts
# stack secrets, the GitHub deploy role, and the TMDB key. Safe to re-run.
#   TMDB_API_KEY=... infra/bootstrap.sh
set -euo pipefail
region=ap-southeast-4
cd "$(dirname "$0")"

account="$(aws sts get-caller-identity --query Account --output text)"
bucket="digishelf-pulumi-state-$account"

if ! aws s3api head-bucket --bucket "$bucket" 2>/dev/null; then
  aws s3api create-bucket --bucket "$bucket" --region "$region" \
    --create-bucket-configuration "LocationConstraint=$region" >/dev/null
fi
aws s3api put-bucket-versioning --bucket "$bucket" --versioning-configuration Status=Enabled
aws s3api put-public-access-block --bucket "$bucket" --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

if ! aws kms describe-key --region "$region" --key-id alias/digishelf-pulumi >/dev/null 2>&1; then
  key_id="$(aws kms create-key --region "$region" --description "digishelf Pulumi secrets" \
    --query KeyMetadata.KeyId --output text)"
  aws kms create-alias --region "$region" --alias-name alias/digishelf-pulumi --target-key-id "$key_id"
fi

export PULUMI_BACKEND_URL="s3://$bucket?region=$region"
secrets="awskms://alias/digishelf-pulumi?region=$region"

(cd github && pulumi stack select --create main --secrets-provider "$secrets" && pulumi up --yes)
(cd app && pulumi stack select --create production --secrets-provider "$secrets")
if [ -n "${TMDB_API_KEY:-}" ]; then
  (cd app && pulumi config set --secret tmdbApiKey "$TMDB_API_KEY" --stack production)
fi

echo
echo "Set the GitHub repo variable AWS_ROLE_ARN to: $(cd github && pulumi stack output roleArn)"
