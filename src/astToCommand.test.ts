import { astToCommand } from "./astToCommand";
import { ScriptNode } from "./types";

describe("astToCommand", () => {
  it("should handle a simple command", () => {
    const ast: ScriptNode = {
      type: "Script",
      commands: [
        {
          type: "Command",
          name: { text: "echo", type: "Word" },
          suffix: [{ text: "Hello, World!", type: "Word" }],
        },
      ],
    };
    expect(astToCommand(ast)).toBe("echo 'Hello, World!'");
  });

  it("should handle a pipeline", () => {
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
    expect(astToCommand(ast)).toBe("echo 'Hello, World!' | grep World");
  });

  it("should handle logical expressions", () => {
    const ast: ScriptNode = {
      type: "Script",
      commands: [
        {
          type: "LogicalExpression",
          op: "&&",
          left: {
            type: "Command",
            name: { text: "echo", type: "Word" },
            suffix: [{ text: "Hello", type: "Word" }],
          },
          right: {
            type: "Command",
            name: { text: "echo", type: "Word" },
            suffix: [{ text: "World", type: "Word" }],
          },
        },
      ],
    };
    expect(astToCommand(ast)).toBe("echo Hello && echo World");
  });

  it("should handle nested logical expressions and pipelines", () => {
    const ast: ScriptNode = {
      type: "Script",
      commands: [
        {
          type: "LogicalExpression",
          op: "||",
          left: {
            type: "Pipeline",
            commands: [
              {
                type: "Command",
                name: { text: "echo", type: "Word" },
                suffix: [{ text: "Hello", type: "Word" }],
              },
              {
                type: "Command",
                name: { text: "grep", type: "Word" },
                suffix: [{ text: "H", type: "Word" }],
              },
            ],
          },
          right: {
            type: "Command",
            name: { text: "echo", type: "Word" },
            suffix: [{ text: "Not found", type: "Word" }],
          },
        },
      ],
    };
    expect(astToCommand(ast)).toBe("echo Hello | grep H || echo 'Not found'");
  });

  it("should handle commands with multiple arguments", () => {
    const ast: ScriptNode = {
      type: "Script",
      commands: [
        {
          type: "Command",
          name: { text: "ls", type: "Word" },
          suffix: [
            { text: "-l", type: "Word" },
            { text: "-a", type: "Word" },
            { text: "/home", type: "Word" },
          ],
        },
      ],
    };
    expect(astToCommand(ast)).toBe("ls -l -a /home");
  });

  it("should handle commands with quoted arguments", () => {
    const ast: ScriptNode = {
      type: "Script",
      commands: [
        {
          type: "Command",
          name: { text: "echo", type: "Word" },
          suffix: [{ text: 'Hello "quoted" World', type: "Word" }],
        },
      ],
    };
    expect(astToCommand(ast)).toBe("echo 'Hello \"quoted\" World'");
  });

  it("should handle empty commands", () => {
    const ast: ScriptNode = {
      type: "Script",
      commands: [],
    };
    expect(astToCommand(ast)).toBe("");
  });

  it("should handle complex nested structures", () => {
    const ast: ScriptNode = {
      type: "Script",
      commands: [
        {
          type: "LogicalExpression",
          op: "&&",
          left: {
            type: "Pipeline",
            commands: [
              {
                type: "Command",
                name: { text: "cat", type: "Word" },
                suffix: [{ text: "file.txt", type: "Word" }],
              },
              {
                type: "Command",
                name: { text: "grep", type: "Word" },
                suffix: [{ text: "pattern", type: "Word" }],
              },
            ],
          },
          right: {
            type: "LogicalExpression",
            op: "||",
            left: {
              type: "Command",
              name: { text: "echo", type: "Word" },
              suffix: [{ text: "Found", type: "Word" }],
            },
            right: {
              type: "Command",
              name: { text: "echo", type: "Word" },
              suffix: [{ text: "Not found", type: "Word" }],
            },
          },
        },
      ],
    };
    expect(astToCommand(ast)).toBe(
      "cat 'file.txt' | grep pattern && echo Found || echo 'Not found'"
    );
  });
});
