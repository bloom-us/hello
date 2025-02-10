# TypeScript Debug Pattern Generator

A strongly-typed utility for creating structured debug patterns across multiple namespaces and environments using the `debug` package.

## Features

- Type-safe debug pattern generation
- Support for multiple namespaces and environments
- Structured logging with environment-specific debuggers
- Full TypeScript support with preserved literal types

## Installation

```bash
npm install @your-scope/ts-debug-pattern-generator
```

Make sure you also have the `debug` package installed as a peer dependency:

```bash
npm install debug
```

## Usage

### Basic Example

```typescript
import {
  helloInnit,
  createDebugPatterns,
} from "@your-scope/ts-debug-pattern-generator";

// Define your namespaces and environments
const namespaces = ["api", "db", "auth"] as const;
const environments = ["dev", "prod"] as const;

// Create your debug patterns
const patterns = createDebugPatterns(namespaces, environments);
// Results in: "api:dev,db:dev,auth:dev,api:prod,db:prod,auth:prod"

// Initialize your debuggers
const hello = helloInnit(namespaces, environments);

// Use your typed debuggers
hello.api.dev("API Development log");
hello.db.prod("Database Production log");
hello.auth.dev("Auth Development log");
```

### Type Safety

The package provides full type safety and autocompletion:

```typescript
// This works ✅
hello.api.dev("Valid namespace and environment");

// These will cause TypeScript errors ❌
hello.invalid.dev("Invalid namespace");
hello.api.invalid("Invalid environment");
```

## API Reference

### `createDebugPatterns<N, E>`

Creates a comma-separated string of debug patterns based on provided namespaces and environments.

```typescript
function createDebugPatterns<
  N extends readonly string[],
  E extends readonly string[]
>(namespaces: N, environments: E): string;
```

### `helloInnit<N, E>`

Creates a structured object containing debug instances for each namespace-environment combination.

```typescript
function helloInnit<N extends readonly string[], E extends readonly string[]>(
  namespaces: N,
  environments: E
): Hello<N, E>;
```

## Environment Variables

Like the `debug` package, you can enable debugging by setting the `DEBUG` environment variable:

```bash
DEBUG="api:dev,db:dev" node your-app.js
```

## Advanced Usage

### Custom Pattern Generation

You can use the `createDebugPatterns` function to generate patterns for specific use cases:

```typescript
const serviceNamespaces = ["users", "orders", "products"] as const;
const serviceEnvs = ["local", "staging", "prod"] as const;

const patterns = createDebugPatterns(serviceNamespaces, serviceEnvs);
// Use these patterns in your debug configuration
```

### Type Definitions

The package includes several useful type definitions:

```typescript
type Hello<N extends readonly string[], E extends readonly string[]>
type DebugMap<E extends readonly string[]>
```

## License

MIT
