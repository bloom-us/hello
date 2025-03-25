import { expect } from "chai";
import { helloInnit } from "../src/index";
import sinon from "sinon";
import debug from "debug";

describe("Lazy Initialization Tests", () => {
  let originalDebug: typeof debug.default;
  let debugStub: sinon.SinonStub;

  beforeEach(() => {
    // Save original debug function
    originalDebug = debug.default;

    // Create a spy/stub for the debug function
    debugStub = sinon.stub();
    (debug as any).default = debugStub;

    // Make the stub return a mock debug instance
    debugStub.returns(sinon.stub());
  });

  afterEach(() => {
    // Restore original debug function
    (debug as any).default = originalDebug;
    sinon.restore();
  });

  it("should not create debug instances until they are used", () => {
    // Define namespaces and environments
    const namespaces = ["app", "api"] as const;
    const environments = ["dev", "prod"] as const;

    // Create hello object
    const hello = helloInnit(namespaces, environments);

    // Debug should not have been called yet
    expect(debugStub.called).to.be.false;

    // Access a debug instance property (but don't call it)
    const isEnabled = hello.app.dev.enabled;

    // Now debug should have been called once with the correct namespace
    expect(debugStub.calledOnce).to.be.true;
    expect(debugStub.firstCall.args[0]).to.equal("app:dev");

    // Reset the stub call count
    debugStub.reset();

    // Access another debug instance
    hello.api.prod.namespace;

    // Debug should be called again with a different namespace
    expect(debugStub.calledOnce).to.be.true;
    expect(debugStub.firstCall.args[0]).to.equal("api:prod");

    // Reset the stub call count
    debugStub.reset();

    // Access the same instance again
    hello.api.prod("test");

    // Debug should not be called again since the instance was already created
    expect(debugStub.called).to.be.false;
  });

  it("should respect DEBUG env changes after creation", () => {
    // Mock process.env.DEBUG
    const originalEnv = process.env.DEBUG;
    process.env.DEBUG = undefined;

    // Create a real debug instance for this test
    (debug as any).default = originalDebug;

    // Define namespaces and environments
    const namespaces = ["app"] as const;
    const environments = ["dev"] as const;

    // Create hello object
    const hello = helloInnit(namespaces, environments);

    // Initially, debug should be disabled
    expect(hello.app.dev.enabled).to.be.false;

    // Now set DEBUG env var to enable this namespace
    process.env.DEBUG = "app:dev";

    // Debug should now be enabled since we're using lazy initialization
    expect(hello.app.dev.enabled).to.be.true;

    // Restore original DEBUG env var
    process.env.DEBUG = originalEnv;
  });
});
