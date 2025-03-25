# Hello Debug

A type-safe, lazy-initialized wrapper for the [debug](https://www.npmjs.com/package/debug) package that supports multiple namespaces and environments.

## Features

- **Type safety**: Full TypeScript support with strongly typed namespaces and environments
- **Lazy initialization**: Debug instances are only created when actually used
- **Environment variable awareness**: Respects DEBUG environment variable changes even after initialization
- **Multi-environment support**: Organize your debug loggers by both namespaces and environments
- **Pattern generation**: Helper functions to generate debug patterns

## Installation

```bash
npm install hello-debug
```

## Basic Usage

```typescript
import { helloInnit } from "hello-debug";

// Define your namespaces and environments
const namespaces = ["app", "api", "db"] as const;
const environments = ["dev", "prod", "test"] as const;

// Create your logger
const logger = helloInnit(namespaces, environments);

// Use it
logger.app.dev("Application starting in dev mode");
logger.db.prod("Connected to production database");
```

## Setting Debug Environment Variables

### Method 1: Through environment variables (recommended)

Set the DEBUG environment variable before running your application:

```bash
# Enable all dev loggers
DEBUG=app:dev,api:dev,db:dev node your-app.js

# Enable all db loggers in all environments
DEBUG=db:* node your-app.js

# Mix and match
DEBUG=app:dev,db:* node your-app.js
```

### Method 2: Programmatically

```typescript
// Enable specific loggers programmatically
logger.app.dev.enabled = true;
logger.db.prod.enabled = true;
```

## Lazy Initialization

The key feature of this library is lazy initialization of debug instances:

1. Debug instances are created only when actually accessed
2. Changes to the DEBUG environment variable are respected even after initialization
3. This means you can:
   - Set the DEBUG variable at any point before using a logger
   - Only create debug instances for the parts of your code that are actually executed

Example:

```typescript
// Create logger at application startup
const logger = helloInnit(namespaces, environments);

// ... later in the application ...

// Set DEBUG environment variable on the fly
process.env.DEBUG = "api:prod";

// Now this will log, even though the logger was created before setting DEBUG
logger.api.prod("This will appear!");
```

## Pattern Generation

You can generate debug patterns for use with the DEBUG environment variable:

```typescript
import { createDebugPatterns } from "hello-debug";

const namespaces = ["app", "api", "db"] as const;
const environments = ["dev", "prod"] as const;

const pattern = createDebugPatterns(namespaces, environments);
// pattern will be: "app:dev,api:dev,db:dev,app:prod,api:prod,db:prod"

// You can use this directly:
process.env.DEBUG = pattern;
```

## License

MIT
