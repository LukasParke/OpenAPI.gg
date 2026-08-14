# OpenAPI Generator

A browser-based editor for creating OpenAPI 3.1 documents. Specs are stored locally in IndexedDB and can be imported or exported as JSON and YAML.

## Features

- Manage multiple local OpenAPI documents
- Edit API metadata, servers, and server variables
- Configure reusable security schemes and global security requirements
- Create paths, parameters, servers, HTTP operations, request bodies, and responses
- Build recursive schemas with properties, arrays, enums, composition, and reusable references
- Build reusable components and named webhooks
- Edit advanced OpenAPI fields and specification extensions as JSON
- Continuously validate document structure, references, parameters, operation IDs, and security
- Undo and redo changes across editor screens
- Autosave saved specifications and inspect exact JSON or YAML in the Review workspace
- Jump to sections, paths, and components with `Ctrl+K` or `Cmd+K`
- Import JSON or YAML and export either format
- Select color themes and light or dark mode

All document data stays in your browser unless you explicitly download or upload a file.

## Development

Requires Node.js and pnpm.

```bash
pnpm install
pnpm dev
```

The development server is available at `http://localhost:5173`.

## Verification

```bash
pnpm check
pnpm test
pnpm lint
pnpm build
```

## Production

Build and start the Node server:

```bash
pnpm build
pnpm start
```

The server uses the standard SvelteKit adapter-node environment variables, including `HOST` and `PORT`.
