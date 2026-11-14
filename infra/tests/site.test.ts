import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as pulumi from "@pulumi/pulumi";
import { beforeAll, describe, expect, it } from "vitest";

interface Created {
  type: string;
  name: string;
  inputs: Record<string, unknown>;
}
const created: Created[] = [];
const SECRET_SIG = "4dabf18193072939515e22adb298388d";

pulumi.runtime.setMocks(
  {
    newResource: ({ type, name, inputs }) => {
      created.push({ type, name, inputs });
      const state: Record<string, unknown> = {
        ...inputs,
        arn: `arn:mock:${name}`,
      };
      if (type === "aws:s3/bucket:Bucket") {
        state.bucket = `${name}-abc123`;
        state.bucketRegionalDomainName = `${name}-abc123.s3.ap-southeast-4.amazonaws.com`;
      }
      if (type === "aws:cloudwatch/logGroup:LogGroup") state.name = inputs.name;
      if (type === "aws:lambda/function:Function") state.name = inputs.name;
      if (type === "aws:lambda/functionUrl:FunctionUrl") {
        state.functionUrl = "https://abc123.lambda-url.ap-southeast-4.on.aws/";
      }
      if (type === "aws:acm/certificate:Certificate") {
        state.domainValidationOptions = [
          {
            resourceRecordName: "_x.digishelf",
            resourceRecordType: "CNAME",
            resourceRecordValue: "_y.acm",
          },
        ];
      }
      return { id: `${name}-id`, state };
    },
    call: ({ token }) => {
      if (token === "aws:route53/getZone:getZone") return { zoneId: "Z123" };
      if (token === "aws:index/getRegion:getRegion")
        return { region: "ap-southeast-4", name: "ap-southeast-4" };
      return {};
    },
  },
  "digishelf-app",
  "test",
  false,
);

function fixture(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "open-next-"));
  const write = (file: string, body = "") => {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), body);
  };
  write(
    "open-next.output.json",
    JSON.stringify({
      behaviors: [
        { pattern: "_next/image*", origin: "imageOptimizer" },
        { pattern: "_next/data/*", origin: "default" },
        { pattern: "*", origin: "default" },
        { pattern: "_next/*", origin: "s3" },
        { pattern: "tmdb-logo.svg", origin: "s3" },
      ],
    }),
  );
  write("assets/_next/static/chunks/app.js");
  write("assets/tmdb-logo.svg");
  write("cache/BUILD/index.cache");
  write("server-functions/default/index.mjs");
  return dir;
}

const outputOf = <T>(output: pulumi.Output<T>) =>
  new Promise<T>((resolve) => output.apply(resolve));

describe("createSite", () => {
  let site: { url: pulumi.Output<string> };

  beforeAll(async () => {
    const { createSite } = await import("../app/site.ts");
    site = createSite({
      name: "digishelf-test",
      openNextDir: fixture(),
      domain: "digishelf.example.com",
      hostedZone: "example.com",
      tmdbApiKey: pulumi.secret("tmdb-key"),
    });
    await outputOf(site.url);
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  const ofType = (type: string) => created.filter((r) => r.type === type);

  it("uploads assets under _assets/ and the cache under _cache/", () => {
    const objects = ofType("aws:s3/bucketObjectv2:BucketObjectv2");
    expect(objects.map((o) => o.inputs.key).sort()).toEqual([
      "_assets/_next/static/chunks/app.js",
      "_assets/tmdb-logo.svg",
      "_cache/BUILD/index.cache",
    ]);
    const js = objects.find(
      (o) => o.inputs.key === "_assets/_next/static/chunks/app.js",
    );
    expect(js?.inputs.cacheControl).toBe("public,max-age=31536000,immutable");
    expect(js?.inputs.contentType).toBe("text/javascript; charset=utf-8");
  });

  it("routes only OpenNext's s3 behaviours to the bucket", () => {
    const [distribution] = ofType("aws:cloudfront/distribution:Distribution");
    const ordered = distribution.inputs.orderedCacheBehaviors as {
      pathPattern: string;
      targetOriginId: string;
    }[];
    expect(ordered.map((b) => [b.pathPattern, b.targetOriginId])).toEqual([
      ["_next/*", "s3"],
      ["tmdb-logo.svg", "s3"],
    ]);
    const origins = distribution.inputs.origins as {
      originId: string;
      domainName: string;
    }[];
    expect(origins.find((o) => o.originId === "server")?.domainName).toBe(
      "abc123.lambda-url.ap-southeast-4.on.aws",
    );
    expect(distribution.inputs.aliases).toEqual(["digishelf.example.com"]);
  });

  it("runs the server on Node 26 with the cache and TMDB env", () => {
    const [server] = ofType("aws:lambda/function:Function");
    expect(server.inputs.runtime).toBe("nodejs26.x");
    // The TMDB key makes the whole environment block a Pulumi secret.
    const environment = server.inputs.environment as {
      [SECRET_SIG]: string;
      value: { variables: Record<string, unknown> };
    };
    expect(environment[SECRET_SIG]).toBeDefined();
    const env = environment.value.variables;
    expect(env).toMatchObject({
      TMDB_API_KEY: "tmdb-key",
      CACHE_BUCKET_NAME: "digishelf-test-assets-abc123",
      CACHE_BUCKET_KEY_PREFIX: "_cache",
      CACHE_BUCKET_REGION: "ap-southeast-4",
    });
    const [url] = ofType("aws:lambda/functionUrl:FunctionUrl");
    expect(url.inputs.authorizationType).toBe("AWS_IAM");
  });

  it("points A and AAAA records at the distribution", () => {
    const records = ofType("aws:route53/record:Record").filter(
      (r) => r.inputs.aliases,
    );
    expect(records.map((r) => r.inputs.type).sort()).toEqual(["A", "AAAA"]);
    expect(records.every((r) => r.inputs.zoneId === "Z123")).toBe(true);
  });
});
