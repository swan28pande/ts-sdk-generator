# ts-sdk-generator

A CLI that parses an OpenAPI 3.x spec (YAML or JSON) and generates a typed TypeScript SDK client with [Zod](https://zod.dev) validation.

## What it generates

A single `client.ts` file containing:

- A Zod schema and inferred TypeScript type for each entry in `components.schemas`
- An `ApiClient` class with one method per operation (named by `operationId`)
- Request params and bodies validated with Zod before sending; responses validated after receiving
- An `ApiError` thrown on non-2xx responses

## Usage

```bash
npm install
npm run build
node dist/cli.js path/to/openapi.yaml -o src/sdk/client.ts
```

Try it on the bundled example:

```bash
npm run example   # writes examples/generated/client.ts
```

Using the generated client (your project needs `zod` installed):

```ts
import { ApiClient } from "./sdk/client";

const api = new ApiClient({ headers: { Authorization: "Bearer ..." } });
const pets = await api.listPets({ limit: 10 });
const pet = await api.createPet({ name: "Rex", status: "available" });
```

## Supported (so far)

- Types: `string`, `number`, `integer`, `boolean`, `array`, `object`, `enum`, `nullable`
- Composition: `$ref`, `allOf`, `oneOf`, `anyOf`, `additionalProperties`
- Path and query parameters, JSON request and response bodies

Not yet supported: header and cookie params, non-JSON content types, auth schemes, external `$ref`s.

## Project layout

```
src/
  cli.ts        argument parsing and file output
  parser.ts     loads and validates the spec
  zod.ts        OpenAPI schema to Zod expression
  generator.ts  emits schemas and the client class
  types.ts      minimal OpenAPI type definitions
```

## License

MIT
