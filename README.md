# Hello Debug

A type-safe wrapper for the [debug](https://www.npmjs.com/package/debug) package with lazy initialization and environment-specific loggers.

## Key Features

- **Lazy initialization** - Debug instances are only created when accessed, respecting DEBUG env vars at runtime
- **Type-safe API** - Full TypeScript support with strongly typed namespaces and environments
- **Multi-environment support** - Organize loggers by both namespaces and environments

## Installation

```bash
npm install hello-debug
```

## Quick Start

```typescript
import { helloInnit } from "hello-debug";

// Define namespaces and environments with const assertions for type safety
const namespaces = ["app", "api", "db"] as const;
const environments = ["dev", "prod"] as const;

// Create logger - no debug instances are created yet
const logger = helloInnit(namespaces, environments);

// Use loggers (instances are created on-demand)
logger.app.dev("Starting application");
logger.db.prod("Database connected");

// Environment variable controls which logs are shown
// DEBUG=app:dev,db:* node your-app.js

// Can be programmatically enabled
logger.api.dev.enabled = true;
```

## Why Lazy Initialization?

The key advantage is that debug instances are created only when they're accessed, not when the logger is created. This means:

1. You can set/change the DEBUG environment variable at any time before using a logger
2. Debug instances are only created for parts of your code that execute
3. Memory usage is optimized by only creating instances as needed

```typescript
// Create logger early in application startup
const logger = helloInnit(namespaces, environments);

// Later, perhaps in response to a runtime flag:
process.env.DEBUG = "api:prod";

// Will respect the new DEBUG setting even though logger was created earlier
logger.api.prod("This will now be visible");
```

## Pattern Generation

```typescript
import { createDebugPatterns } from "hello-debug";

const pattern = createDebugPatterns(namespaces, environments);
// "app:dev,api:dev,db:dev,app:prod,api:prod,db:prod"

// Use directly:
process.env.DEBUG = pattern;
```

## License

MIT
