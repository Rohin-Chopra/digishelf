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
      if (type === "aws:apigatewayv2/api:Api") {
        state.apiEndpoint = `https://${name}.execute-api.ap-southeast-4.amazonaws.com`;
        state.executionArn = `arn:mock:execute-api:${name}`;
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

function fixture(): { webOutputDir: string; apiDistDir: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "digishelf-build-"));
  const write = (file: string, body = "") => {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), body);
  };
  write("web/public/assets/main-abc123.js");
  write("web/public/favicon.ico");
  write("web/public/tmdb-logo.svg");
  write("web/server/index.mjs");
  write("api/bootstrap");
  return {
    webOutputDir: path.join(dir, "web"),
    apiDistDir: path.join(dir, "api"),
  };
}

const outputOf = <T>(output: pulumi.Output<T>) =>
  new Promise<T>((resolve) => output.apply(resolve));

describe("createSite", () => {
  let site: { url: pulumi.Output<string> };

  beforeAll(async () => {
    const { createSite } = await import("../app/site.ts");
    site = createSite({
      name: "digishelf-test",
      ...fixture(),
      domain: "digishelf.example.com",
      hostedZone: "example.com",
      tmdbApiKey: pulumi.secret("tmdb-key"),
    });
    await outputOf(site.url);
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  const ofType = (type: string) => created.filter((r) => r.type === type);
  const fn = (name: string) =>
    ofType("aws:lambda/function:Function").find((f) => f.name === name)!;

  it("uploads the public dir with immutable caching for fingerprinted assets", () => {
    const objects = ofType("aws:s3/bucketObjectv2:BucketObjectv2");
    expect(objects.map((o) => o.inputs.key).sort()).toEqual([
      "assets/main-abc123.js",
      "favicon.ico",
      "tmdb-logo.svg",
    ]);
    const js = objects.find((o) => o.inputs.key === "assets/main-abc123.js");
    expect(js?.inputs.cacheControl).toBe("public,max-age=31536000,immutable");
    expect(js?.inputs.contentType).toBe("text/javascript; charset=utf-8");
  });

  it("routes /graphql to the API, public files to S3 and the rest to SSR", () => {
    const [distribution] = ofType("aws:cloudfront/distribution:Distribution");
    const ordered = distribution!.inputs.orderedCacheBehaviors as {
      pathPattern: string;
      targetOriginId: string;
    }[];
    expect(ordered.map((b) => [b.pathPattern, b.targetOriginId])).toEqual([
      ["/graphql", "api"],
      ["/assets/*", "s3"],
      ["/favicon.ico", "s3"],
      ["/tmdb-logo.svg", "s3"],
    ]);
    expect(
      (distribution!.inputs.defaultCacheBehavior as { targetOriginId: string })
        .targetOriginId,
    ).toBe("web");
    const origins = distribution!.inputs.origins as {
      originId: string;
      domainName: string;
    }[];
    expect(
      Object.fromEntries(origins.map((o) => [o.originId, o.domainName])),
    ).toMatchObject({
      web: "digishelf-test-web.execute-api.ap-southeast-4.amazonaws.com",
      api: "digishelf-test-api.execute-api.ap-southeast-4.amazonaws.com",
    });
    expect(distribution!.inputs.aliases).toEqual(["digishelf.example.com"]);
  });

  it("fronts both Lambdas with HTTP APIs, not function URLs", () => {
    expect(ofType("aws:lambda/functionUrl:FunctionUrl")).toEqual([]);
    const routes = ofType("aws:apigatewayv2/route:Route").map(
      (r) => r.inputs.routeKey,
    );
    expect(routes.sort()).toEqual([
      "$default",
      "GET /graphql",
      "POST /graphql",
    ]);
    const integrations = ofType("aws:apigatewayv2/integration:Integration");
    expect(integrations.map((i) => i.inputs.payloadFormatVersion)).toEqual([
      "2.0",
      "2.0",
    ]);
    expect(ofType("aws:lambda/permission:Permission")).toHaveLength(2);
  });

  it("runs SSR on Node 26 and the Go API on al2023, with the TMDB key only in the API", () => {
    const web = fn("digishelf-test-web");
    expect(web.inputs).toMatchObject({
      runtime: "nodejs26.x",
      handler: "index.handler",
    });
    expect(web.inputs.environment).toBeUndefined();

    const api = fn("digishelf-test-api");
    expect(api.inputs).toMatchObject({
      runtime: "provided.al2023",
      handler: "bootstrap",
      architectures: ["arm64"],
    });
    // The TMDB key makes the whole environment block a Pulumi secret.
    const environment = api.inputs.environment as {
      [SECRET_SIG]: string;
      value: { variables: Record<string, unknown> };
    };
    expect(environment[SECRET_SIG]).toBeDefined();
    expect(environment.value.variables).toEqual({ TMDB_API_KEY: "tmdb-key" });
  });

  it("points A and AAAA records at the distribution", () => {
    const records = ofType("aws:route53/record:Record").filter(
      (r) => r.inputs.aliases,
    );
    expect(records.map((r) => r.inputs.type).sort()).toEqual(["A", "AAAA"]);
    expect(records.every((r) => r.inputs.zoneId === "Z123")).toBe(true);
  });
});
