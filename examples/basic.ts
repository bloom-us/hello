import { helloInnit } from "../src/index";

// Define namespaces and environments
const namespaces = ["app", "api", "db"] as const;
const environments = ["dev", "prod", "test"] as const;

console.log("Creating the logger...");
// Create the logger - note that no debug instances are created yet!
const logger = helloInnit(namespaces, environments);
console.log("Logger created, but no debug instances exist until used!");

// Example 1: Basic usage
// To enable via environment variable before running:
// DEBUG=app:dev,db:dev node examples/basic.js

console.log("\n--- Example 1: Basic Usage ---");
// Log various messages with different loggers - debug instances are created on-demand
logger.app.dev("Starting application in development mode");
logger.api.dev("API server initialized");
logger.db.dev("Database connection established");

// Production logs (these won't show unless DEBUG includes prod environment)
logger.app.prod("Production app is running");
logger.db.prod("Production database connected");

// Example 2: Programmatically enable specific loggers
console.log("\n--- Example 2: Programmatic Enabling ---");
// This will enable app:test logging even if not in DEBUG env var
logger.app.test.enabled = true;
logger.app.test("Running tests...");

// Example 3: Use with nested objects
console.log("\n--- Example 3: Complex Objects ---");
function complexObject() {
  logger.app.dev("Creating complex object with properties: %o", {
    id: 123,
    name: "Test Object",
    nested: {
      property: "value",
      items: [1, 2, 3],
    },
  });
}
complexObject();

// Example 4: Lazy initialization with environment variable changes
console.log("\n--- Example 4: Lazy Initialization with DEBUG changes ---");
console.log("Setting DEBUG environment variable after logger creation");

// This demonstrates that we can change the DEBUG environment variable
// even after creating the logger and it will still work
if (typeof process !== "undefined") {
  console.log("Previous DEBUG value:", process.env.DEBUG || "(none)");
  process.env.DEBUG = "api:prod";
  console.log("New DEBUG value:", process.env.DEBUG);
}

// This will pick up the new DEBUG value even though the logger
// was created before setting it!
logger.api.prod("This will show because we just set DEBUG=api:prod");

// Now we can verify which debuggers are enabled
console.log("\n--- Enabled Status for All Loggers ---");
for (const ns of namespaces) {
  for (const env of environments) {
    console.log(`${ns}:${env} enabled:`, (logger as any)[ns][env].enabled);
  }
}
