import React from "react";
import { render } from "@testing-library/react";
import { useAst } from "./useAst";
import { ScriptNode, EnhancedModuleType, CommandNode } from "./types";

// Mock the Plugins
jest.mock("./Plugins", () => ({
  Plugins: {
    get: jest.fn((type) => {
      if (type === "echo") {
        return {
          parse: (command: CommandNode) => ({
            type: "echo",
            text: command.suffix?.[0]?.text || "",
          }),
          compile: (module: EnhancedModuleType): CommandNode => ({
            type: "Command",
            name: { text: "echo", type: "Word" },
            suffix: [{ type: "Word", text: module.text }],
          }),
        };
      } else if (type === "grep") {
        return {
          parse: (command: CommandNode) => ({
            type: "grep",
            pattern: command.suffix?.[0]?.text || "",
            flags: "",
          }),
          compile: (module: EnhancedModuleType): CommandNode => ({
            type: "Command",
            name: { text: "grep", type: "Word" },
            suffix: [{ type: "Word", text: module.pattern }],
          }),
        };
      }
      return null;
    }),
  },
}));

// Mock the genericPlugin
jest.mock("./plugins/genericPlugin", () => ({
  genericPlugin: {
    parse: (command: CommandNode) => ({
      type: "generic",
      command: command.name.text,
      args: command.suffix?.map((arg) => arg.text).join(" ") || "",
    }),
    compile: (module: EnhancedModuleType): CommandNode => ({
      type: "Command",
      name: { text: module.command, type: "Word" },
      suffix: module.args
        .split(" ")
        .map((arg: string) => ({ type: "Word", text: arg })),
    }),
  },
}));

type UseAstReturn = ReturnType<typeof useAst>;

const TestComponent: React.FC<{ testFunc: (hook: UseAstReturn) => void }> = ({
  testFunc,
}) => {
  const hook = useAst();
  testFunc(hook);
  return null;
};

const renderUseAst = (testFunc: (hook: UseAstReturn) => void) => {
  render(<TestComponent testFunc={testFunc} />);
};

describe("useAst", () => {
  describe("astToModules", () => {
    it("should convert a simple ScriptNode to modules", () => {
      renderUseAst((hook) => {
        const ast: ScriptNode = {
          type: "Script",
          commands: [
            {
              type: "Pipeline",
              commands: [
                {
                  type: "Command",
                  name: { text: "echo", type: "Word" },
                  suffix: [{ text: "Hello, World!", type: "Word" }],
                },
              ],
            },
          ],
        };

        const modules = hook.astToModules(ast);

        expect(modules).toEqual([
          {
            type: "echo",
            text: "Hello, World!",
          },
        ]);
      });
    });

    it("should handle a pipeline with multiple commands", () => {
      renderUseAst((hook) => {
        const ast: ScriptNode = {
          type: "Script",
          commands: [
            {
              type: "Pipeline",
              commands: [
                {
                  type: "Command",
                  name: { text: "echo", type: "Word" },
                  suffix: [{ text: "Hello, World!", type: "Word" }],
                },
                {
                  type: "Command",
                  name: { text: "grep", type: "Word" },
                  suffix: [{ text: "World", type: "Word" }],
                },
              ],
            },
          ],
        };

        const modules = hook.astToModules(ast);

        expect(modules).toEqual([
          {
            type: "echo",
            text: "Hello, World!",
            operator: "pipe",
          },
          {
            type: "grep",
            pattern: "World",
            flags: "",
          },
        ]);
      });
    });
  });

  describe("compileCommand", () => {
    it("should compile a simple module to a command", () => {
      renderUseAst((hook) => {
        const modules: EnhancedModuleType[] = [
          {
            type: "echo",
            text: "Hello, World!",
          },
        ];

        const command = hook.compileCommand(modules);

        expect(command).toBe("echo 'Hello, World!'");
      });
    });

    it("should compile multiple modules to a pipeline", () => {
      renderUseAst((hook) => {
        const modules: EnhancedModuleType[] = [
          {
            type: "echo",
            text: "Hello, World!",
            operator: "pipe",
          },
          {
            type: "grep",
            pattern: "World",
            flags: "",
          },
        ];

        const command = hook.compileCommand(modules);

        expect(command).toBe("echo 'Hello, World!' | grep World");
      });
    });

    it("should compile modules with logical operators", () => {
      renderUseAst((hook) => {
        const modules: EnhancedModuleType[] = [
          {
            type: "echo",
            text: "Hello",
            operator: "and",
          },
          {
            type: "echo",
            text: "World",
          },
        ];

        const command = hook.compileCommand(modules);

        expect(command).toBe("echo Hello && echo World");
      });
    });
  });
});
