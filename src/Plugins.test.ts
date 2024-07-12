import { Plugins, Plugin } from "./Plugins";

describe("Plugins", () => {
  // Clear registered plugins before each test
  beforeEach(() => {
    // @ts-ignore: Accessing private property for testing
    Plugins.plugins = {};
  });

  it("should register a plugin", () => {
    const mockPlugin: Plugin = {
      name: "Mock Plugin",
      command: "mock",
      parse: jest.fn(),
      component: jest.fn(),
      compile: jest.fn(),
    };

    Plugins.register(mockPlugin);

    expect(Plugins.get("mock")).toBe(mockPlugin);
  });

  it("should return undefined for unregistered plugin", () => {
    expect(Plugins.get("nonexistent")).toBeUndefined();
  });

  it("should override existing plugin when registering with same command", () => {
    const mockPlugin1: Plugin = {
      name: "Mock Plugin 1",
      command: "mock",
      parse: jest.fn(),
      component: jest.fn(),
      compile: jest.fn(),
    };

    const mockPlugin2: Plugin = {
      name: "Mock Plugin 2",
      command: "mock",
      parse: jest.fn(),
      component: jest.fn(),
      compile: jest.fn(),
    };

    Plugins.register(mockPlugin1);
    Plugins.register(mockPlugin2);

    expect(Plugins.get("mock")).toBe(mockPlugin2);
  });

  it("should register multiple plugins", () => {
    const mockPlugin1: Plugin = {
      name: "Mock Plugin 1",
      command: "mock1",
      parse: jest.fn(),
      component: jest.fn(),
      compile: jest.fn(),
    };

    const mockPlugin2: Plugin = {
      name: "Mock Plugin 2",
      command: "mock2",
      parse: jest.fn(),
      component: jest.fn(),
      compile: jest.fn(),
    };

    Plugins.register(mockPlugin1);
    Plugins.register(mockPlugin2);

    expect(Plugins.get("mock1")).toBe(mockPlugin1);
    expect(Plugins.get("mock2")).toBe(mockPlugin2);
  });

  it("should handle plugins with containerClasses", () => {
    const mockPlugin: Plugin = {
      name: "Mock Plugin",
      command: "mock",
      parse: jest.fn(),
      component: jest.fn(),
      compile: jest.fn(),
      containerClasses: "custom-class",
    };

    Plugins.register(mockPlugin);

    const retrievedPlugin = Plugins.get("mock");
    expect(retrievedPlugin).toBeDefined();
    expect(retrievedPlugin?.containerClasses).toBe("custom-class");
  });
});
