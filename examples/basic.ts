import { helloInnit } from "../src/index";

// Define namespaces and environments
const namespaces = ["app", "api", "db"] as const;
const environments = ["dev", "prod", "test"] as const;

// Create the logger
const logger = helloInnit(namespaces, environments);

// Example 1: Basic usage
// To enable via environment variable before running:
// DEBUG=app:dev,db:dev node examples/basic.js

// Log various messages with different loggers
logger.app.dev("Starting application in development mode");
logger.api.dev("API server initialized");
logger.db.dev("Database connection established");

// Production logs (these won't show unless DEBUG includes prod environment)
logger.app.prod("Production app is running");
logger.db.prod("Production database connected");

// Example 2: Programmatically enable specific loggers
// This will enable app:test logging even if not in DEBUG env var
logger.app.test.enabled = true;
logger.app.test("Running tests...");

// Example 3: Use with nested objects
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

// Example showing how lazy initialization works
console.log("Changing DEBUG env var after initialization still works!");
// In real code, you would set process.env.DEBUG here
// process.env.DEBUG = "api:prod";

// This will pick up any changes to the DEBUG environment variable
// even though logger was created earlier
logger.api.prod("This will show if DEBUG=api:prod is set");
