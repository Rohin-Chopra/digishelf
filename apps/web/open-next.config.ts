import type { OpenNextConfig } from "@opennextjs/aws/types/open-next.js";

// One Lambda behind CloudFront. Prerendered pages are read from S3; there is no
// on-demand revalidation yet, so the tag cache and revalidation queue are no-ops.
const config = {
  default: {
    override: {
      wrapper: "aws-lambda",
      converter: "aws-apigw-v2",
      incrementalCache: "s3-lite",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
} satisfies OpenNextConfig;

export default config;
