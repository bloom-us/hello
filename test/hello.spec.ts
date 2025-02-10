/// <reference types="mocha" />
/// <reference types="chai" />

import { expect } from "chai";
import { createDebugPatterns, helloInnit, type Hello } from "../src/index";

describe("Debug Package Tests", () => {
  describe("createDebugPatterns", () => {
    it("should create correct patterns for single namespace and environment", () => {
      const namespaces = ["app"] as const;
      const environments = ["dev"] as const;

      const patterns = createDebugPatterns(namespaces, environments);
      expect(patterns).to.equal("app:dev");
    });

    it("should create correct patterns for multiple namespaces and single environment", () => {
      const namespaces = ["app", "api", "db"] as const;
      const environments = ["dev"] as const;

      const patterns = createDebugPatterns(namespaces, environments);
      expect(patterns).to.equal("app:dev,api:dev,db:dev");
    });

    it("should create correct patterns for single namespace and multiple environments", () => {
      const namespaces = ["app"] as const;
      const environments = ["dev", "prod", "test"] as const;

      const patterns = createDebugPatterns(namespaces, environments);
      expect(patterns).to.equal("app:dev,app:prod,app:test");
    });

    it("should create correct patterns for multiple namespaces and environments", () => {
      const namespaces = ["app", "api"] as const;
      const environments = ["dev", "prod"] as const;

      const patterns = createDebugPatterns(namespaces, environments);
      expect(patterns).to.equal("app:dev,api:dev,app:prod,api:prod");
    });
  });

  describe("helloInnit", () => {
    it("should create debug instances with correct namespaces and environments", () => {
      const namespaces = ["app"] as const;
      const environments = ["dev"] as const;

      const hello = helloInnit(namespaces, environments);

      // Check structure
      expect(hello).to.have.property("app");
      expect(hello.app).to.have.property("dev");

      // Verify debug instance
      expect(hello.app.dev).to.be.a("function");
      expect((hello.app.dev as any).namespace).to.equal("app:dev");
    });

    it("should create nested structure for multiple namespaces and environments", () => {
      const namespaces = ["app", "api"] as const;
      const environments = ["dev", "prod"] as const;

      const hello = helloInnit(namespaces, environments);

      // Check structure
      expect(hello).to.have.all.keys("app", "api");
      expect(hello.app).to.have.all.keys("dev", "prod");
      expect(hello.api).to.have.all.keys("dev", "prod");

      // Verify debug instances
      expect(hello.app.dev).to.be.a("function");
      expect((hello.app.dev as any).namespace).to.equal("app:dev");
      expect(hello.api.prod).to.be.a("function");
      expect((hello.api.prod as any).namespace).to.equal("api:prod");
    });

    it("should return type-safe object with correct structure", () => {
      const namespaces = ["app", "api"] as const;
      const environments = ["dev", "prod"] as const;

      const hello: Hello<typeof namespaces, typeof environments> = helloInnit(
        namespaces,
        environments
      );

      // TypeScript compilation will fail if the structure is incorrect
      const devLogger = hello.app.dev;
      const prodLogger = hello.api.prod;

      expect(devLogger).to.be.a("function");
      expect(prodLogger).to.be.a("function");
    });

    it("should create independent debug instances for each namespace-environment combination", () => {
      const namespaces = ["app"] as const;
      const environments = ["dev", "prod"] as const;

      const hello = helloInnit(namespaces, environments);

      // Enable dev logger but not prod logger
      hello.app.dev.enabled = true;
      hello.app.prod.enabled = false;

      expect(hello.app.dev.enabled).to.be.true;
      expect(hello.app.prod.enabled).to.be.false;
    });
  });
});
