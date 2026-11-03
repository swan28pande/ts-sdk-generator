import type { SchemaObject } from "./types.js";

export function refName(ref: string): string {
  return toPascal(ref.split("/").pop()!);
}

export function toPascal(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : ""))
    .replace(/^./, (c) => c.toUpperCase());
}

/** Convert an OpenAPI schema into a Zod expression string. */
export function schemaToZod(schema: SchemaObject | undefined): string {
  if (!schema) return "z.unknown()";
  if (schema.$ref) return `${refName(schema.$ref)}Schema`;

  let out: string;
  if (schema.enum) {
    out = schema.enum.every((v) => typeof v === "string")
      ? `z.enum([${schema.enum.map((v) => JSON.stringify(v)).join(", ")}])`
      : `z.union([${schema.enum.map((v) => `z.literal(${JSON.stringify(v)})`).join(", ")}])`;
  } else if (schema.oneOf || schema.anyOf) {
    const parts = (schema.oneOf ?? schema.anyOf)!.map(schemaToZod);
    out = parts.length === 1 ? parts[0] : `z.union([${parts.join(", ")}])`;
  } else if (schema.allOf) {
    out = schema.allOf.map(schemaToZod).reduce((a, b) => `z.intersection(${a}, ${b})`);
  } else {
    switch (schema.type) {
      case "string":
        out = schema.format === "date-time" ? "z.string().datetime()" : "z.string()";
        break;
      case "integer":
        out = "z.number().int()";
        break;
      case "number":
        out = "z.number()";
        break;
      case "boolean":
        out = "z.boolean()";
        break;
      case "array":
        out = `z.array(${schemaToZod(schema.items)})`;
        break;
      case "object":
      default:
        if (schema.properties || schema.type === "object") {
          out = objectToZod(schema);
        } else {
          out = "z.unknown()";
        }
    }
  }
  return schema.nullable ? `${out}.nullable()` : out;
}

function objectToZod(schema: SchemaObject): string {
  const required = new Set(schema.required ?? []);
  const props = Object.entries(schema.properties ?? {}).map(([key, value]) => {
    const expr = schemaToZod(value) + (required.has(key) ? "" : ".optional()");
    return `  ${JSON.stringify(key)}: ${expr}`;
  });
  let out = props.length ? `z.object({\n${props.join(",\n")}\n})` : "z.object({})";
  if (schema.additionalProperties) {
    const extra =
      schema.additionalProperties === true ? "z.unknown()" : schemaToZod(schema.additionalProperties);
    out += `.catchall(${extra})`;
  }
  return out;
}
