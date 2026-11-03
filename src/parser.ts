import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { parse as parseYaml } from "yaml";
import type { OpenAPIDocument } from "./types.js";

/** Load an OpenAPI 3.x spec from a JSON or YAML file. */
export async function loadSpec(path: string): Promise<OpenAPIDocument> {
  const raw = await readFile(path, "utf8");
  const ext = extname(path).toLowerCase();
  const doc = (ext === ".json" ? JSON.parse(raw) : parseYaml(raw)) as OpenAPIDocument;

  if (!doc || typeof doc.openapi !== "string" || !doc.openapi.startsWith("3.")) {
    throw new Error(`Unsupported spec: expected OpenAPI 3.x, got ${doc?.openapi ?? "unknown"}`);
  }
  if (!doc.paths) throw new Error("Spec has no 'paths'");
  return doc;
}
