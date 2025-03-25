import { expect } from "chai";
import { helloInnit } from "../src/index";
import sinon from "sinon";
import type { Debugger } from "debug";

describe("Lazy Initialization Tests", () => {
  let createDebugStub: sinon.SinonStub;
  let debugInstances: Map<string, any>;

  beforeEach(() => {
    // Create a map to store created instances by namespace
    debugInstances = new Map();

    // Create a stub that will create and track debug instances
    createDebugStub = sinon.stub().callsFake((namespace: string) => {
      // Create a mock debug instance
      const instance = sinon.stub() as any;
      instance.enabled = false;
      instance.namespace = namespace;

      // Store it for later access in tests
      debugInstances.set(namespace, instance);

      return instance;
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should not create debug instances until they are used", () => {
    // Define namespaces and environments
    const namespaces = ["app", "api"] as const;
    const environments = ["dev", "prod"] as const;

    // Create hello object with our stub factory
    const hello = helloInnit(namespaces, environments, createDebugStub);

    // Debug factory should not have been called yet
    expect(createDebugStub.called).to.be.false;
    expect(debugInstances.size).to.equal(0);

    // Access a debug instance property (but don't call it)
    const isEnabled = hello.app.dev.enabled;

    // Now debug factory should have been called once with the correct namespace
    expect(createDebugStub.calledOnce).to.be.true;
    expect(createDebugStub.firstCall.args[0]).to.equal("app:dev");
    expect(debugInstances.size).to.equal(1);
    expect(debugInstances.has("app:dev")).to.be.true;

    // Reset the stub call count
    createDebugStub.resetHistory();

    // Access another debug instance
    hello.api.prod.namespace;

    // Debug factory should be called again with a different namespace
    expect(createDebugStub.calledOnce).to.be.true;
    expect(createDebugStub.firstCall.args[0]).to.equal("api:prod");
    expect(debugInstances.size).to.equal(2);

    // Reset the stub call count
    createDebugStub.resetHistory();

    // Access the same instance again
    hello.api.prod("test");

    // Debug factory should not be called again since the instance was already created
    expect(createDebugStub.called).to.be.false;
    expect(debugInstances.size).to.equal(2); // Still only 2 instances
  });

  it("should respect DEBUG env changes after creation", () => {
    // Define namespaces and environments
    const namespaces = ["app"] as const;
    const environments = ["dev"] as const;

    // Create hello object with our stub factory
    const hello = helloInnit(namespaces, environments, createDebugStub);

    // It might not exist yet, so we need to access the property first to create it
    expect(hello.app.dev.enabled).to.be.false;

    // Get the created instance
    const appDevInstance = debugInstances.get("app:dev");
    expect(appDevInstance).to.exist;

    // Simulate DEBUG env change by updating the mock instance
    appDevInstance.enabled = true;

    // Debug should now be enabled when we access it through our logger
    expect(hello.app.dev.enabled).to.be.true;
  });
});
