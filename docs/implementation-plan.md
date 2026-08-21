# OpenAPI Generator completion plan

This plan restores and completes the scope from the repository's deleted `TODO.md`.

## Document editing

- [x] API information, contact, license, servers, import, export, and local persistence
- [x] Paths, path parameters, query/header/cookie parameters, and all HTTP methods
- [x] Operation request bodies, responses, tags, external documentation, and reusable references
- [x] Top-level tags and external documentation
- [x] Specification extensions

## Reusable components

- [x] Recursive schema builder for strings, numbers, integers, booleans, arrays, objects, enums, null, `oneOf`, `allOf`, and `anyOf`
- [x] Builders for schemas, security schemes, path items, parameters, request bodies, responses, headers, examples, callbacks, and links
- [x] `$ref` selection wherever reusable components are accepted

## Webhooks

- [x] Named webhook builder using the same path-item and operation editors as normal paths

## UI and quality

- [x] Replace remaining native prompts, alerts, and confirms with in-app controls or Skeleton modals
- [x] Theme selector
- [x] Breadcrumbs
- [x] Integration tests for document creation and editing
- [x] Keep type checking, linting, build, and production smoke tests green

## Product-quality pass

- [x] Continuous OpenAPI document validation with actionable diagnostics
- [x] Autosave for saved specifications with visible save status
- [x] Cross-screen undo and redo with keyboard shortcuts
- [x] Ctrl+K quick switcher for sections, paths, and reusable components
- [x] Review workspace with live JSON/YAML source and clipboard actions
- [x] Integration coverage for validation and editor history

## Developer experience pass

- [x] Interactive API documentation and API client preview
- [x] Crash-safe recovery for unsaved drafts
- [x] Validated, transactional JSON/YAML imports with visible errors
- [x] Browser-native filename handling without Node shims
