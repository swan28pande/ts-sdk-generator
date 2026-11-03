// Minimal subset of the OpenAPI 3.x shape used by the generator.

export interface SchemaObject {
  $ref?: string;
  type?: "string" | "number" | "integer" | "boolean" | "array" | "object";
  format?: string;
  enum?: (string | number)[];
  items?: SchemaObject;
  properties?: Record<string, SchemaObject>;
  required?: string[];
  nullable?: boolean;
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  allOf?: SchemaObject[];
  additionalProperties?: boolean | SchemaObject;
}

export interface ParameterObject {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required?: boolean;
  schema?: SchemaObject;
}

export interface MediaTypeObject {
  schema?: SchemaObject;
}

export interface OperationObject {
  operationId?: string;
  summary?: string;
  parameters?: ParameterObject[];
  requestBody?: { required?: boolean; content?: Record<string, MediaTypeObject> };
  responses?: Record<string, { description?: string; content?: Record<string, MediaTypeObject> }>;
}

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
export const HTTP_METHODS: HttpMethod[] = ["get", "post", "put", "patch", "delete"];

export type PathItemObject = Partial<Record<HttpMethod, OperationObject>> & {
  parameters?: ParameterObject[];
};

export interface OpenAPIDocument {
  openapi: string;
  info: { title: string; version: string };
  servers?: { url: string }[];
  paths: Record<string, PathItemObject>;
  components?: { schemas?: Record<string, SchemaObject> };
}
