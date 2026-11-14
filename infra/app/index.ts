import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as pulumi from "@pulumi/pulumi";
import { createSite } from "./site.ts";

const config = new pulumi.Config();
const here = path.dirname(fileURLToPath(import.meta.url));

const site = createSite({
  name: `digishelf-${pulumi.getStack()}`,
  webOutputDir: path.resolve(here, "../../apps/web/.output"),
  apiDistDir: path.resolve(here, "../../apps/api/dist"),
  domain: config.require("domain"),
  hostedZone: config.require("hostedZone"),
  tmdbApiKey: config.requireSecret("tmdbApiKey"),
});

export const url = site.url;
export const distributionId = site.distributionId;
export const assetsBucket = site.assetsBucket;
export const webFunction = site.webFunction;
export const apiFunction = site.apiFunction;
