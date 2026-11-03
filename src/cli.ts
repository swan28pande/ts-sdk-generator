#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { loadSpec } from "./parser.js";
import { generate } from "./generator.js";

const USAGE = `Usage: ts-sdk-gen <spec.(yaml|json)> [-o <output.ts>]

Options:
  -o, --output   Output file (default: ./sdk/client.ts)
  -h, --help     Show this help`;

async function main(argv: string[]): Promise<void> {
  let input: string | undefined;
  let output = "sdk/client.ts";

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") return void console.log(USAGE);
    if (arg === "-o" || arg === "--output") output = argv[++i];
    else if (!input) input = arg;
  }

  if (!input || !output) {
    console.error(USAGE);
    process.exit(1);
  }

  const doc = await loadSpec(resolve(input));
  const code = generate(doc);
  const outPath = resolve(output);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, code);
  console.log(`Generated SDK for "${doc.info.title}" -> ${output}`);
}

main(process.argv.slice(2)).catch((err) => {
  console.error(`Error: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
