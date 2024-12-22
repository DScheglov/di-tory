# di-tory - Documentation

**di-tory** is a lightweight dependency injection library for TypeScript.

## Motivation

The library is designed to enable writing clean and testable code without
cluttering the codebase with dependency injection boilerplate or relying
on a heavy dependency injection framework.

So the `di-tory` is:

- **Lightweight**: The library is designed to be as small as possible.
- **Type Safe**: The library is written in TypeScript and provides type-safe DI.
- **Framework Agnostic**: The library is designed to be used with any framework or without any framework.
- **Platform Agnostic**: The library is designed to be used in Node.js, the browser, or any other platform.

## Installation

```ts
npm install di-tory
```

## Examples

- [Getting Started Example](examples/getting-started/src/index.ts)
- [Express Example](examples/express/src/index.ts)

## [Concepts](./concepts.md)

The library is based on the following concepts:

- [Module](./concepts.md#module): A container for instances and methods.
- [Module Builder](./concepts.md#module-builder): A builder for a module.
- [Visibility](./concepts.md#visibility): A way to define the visibility of instances and methods.
- [Resolver](./concepts.md#resolver): A function that creates an instance, resolving its dependencies.
- [Lifecycle (Scope)](./concepts.md#lifecycle-scope): A way to manage the lifecycle of instances.
- [Implementation](./concepts.md#implementation): A way to define a module methods.
- [Initializers](./concepts.md#initializers): A way to resolve circular dependencies, by initializing instances after their creation.

## [Module Builder API](./module-builder-api.md)

The library core is a `ModuleBuilder` object, which is used to define a module structure.

The `ModuleBuilder` is exposed as a factory function `Module`, so you cna import it like this:

```ts
import { Module } from 'di-tory';
```

The `ModuleBuilder` has the following methods:

- [`.private(resolvers, scope?)`](./module-builder-api.md#privateresolvers-scope-method): Defines resolution rules for private instances.
- [`.public(resolvers, scope?)`](./module-builder-api.md#publicresolvers-scope-method): Defines resolution rules for public instances.
- [`.privateImpl(implementation)`](./module-builder-api.md#privateimplimplementation-method): Defines private methods.
- [`.publicImpl(implementation)`](./module-builder-api.md#publicimplimplementation-method): Defines public methods.
- [`.init(initializers)`](./module-builder-api.md#initinitializers-method): Defines initializers for instances.
- [`.create(params)`](./module-builder-api.md#createparams-method): Creates an instance of the module.

## [Lifecycle (Scope)](./life-cycles.md)

*... coming soon ...*
