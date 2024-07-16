import { astToCommand } from "./astToCommand";
import {
  ScriptNode,
  PipelineNode,
  LogicalExpressionNode,
  CommandNode,
  FunctionNode,
  CompoundListNode,
  SubshellNode,
  ForNode,
  CaseNode,
  IfNode,
  WhileNode,
  UntilNode,
  WordNode,
} from "./types";

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

  it("should handle function definitions", () => {
    const ast: ScriptNode = {
      type: "Script",
      commands: [
        {
          type: "Function",
          name: { text: "greet", type: "Name" },
          body: {
            type: "CompoundList",
            commands: [
              {
                type: "Command",
                name: { text: "echo", type: "Word" },
                suffix: [{ text: "Hello, $1!", type: "Word" }],
              },
            ],
            redirections: [],
          },
          redirections: [],
        },
      ],
    };
    expect(astToCommand(ast)).toBe("greet() { echo 'Hello, $1!'; }");
  });

  it("should handle subshell commands", () => {
    const ast: ScriptNode = {
      type: "Script",
      commands: [
        {
          type: "Subshell",
          list: {
            type: "CompoundList",
            commands: [
              {
                type: "Command",
                name: { text: "echo", type: "Word" },
                suffix: [{ text: "In subshell", type: "Word" }],
              },
            ],
            redirections: [],
          },
        },
      ],
    };
    expect(astToCommand(ast)).toBe("(echo 'In subshell')");
  });

  it("should handle for loops", () => {
    const ast: ScriptNode = {
      type: "Script",
      commands: [
        {
          type: "For",
          name: { text: "item", type: "Name" },
          wordlist: [
            { text: "apple", type: "Word" },
            { text: "banana", type: "Word" },
            { text: "cherry", type: "Word" },
          ],
          do: {
            type: "CompoundList",
            commands: [
              {
                type: "Command",
                name: { text: "echo", type: "Word" },
                suffix: [{ text: "$item", type: "Word" }],
              },
            ],
            redirections: [],
          },
        },
      ],
    };
    expect(astToCommand(ast)).toBe(
      "for item in apple banana cherry; do echo $item; done"
    );
  });

  it("should handle case statements", () => {
    const ast: ScriptNode = {
      type: "Script",
      commands: [
        {
          type: "Case",
          clause: { text: "$1", type: "Word" },
          cases: [
            {
              type: "CaseItem",
              pattern: [{ text: "start", type: "Word" }],
              body: {
                type: "CompoundList",
                commands: [
                  {
                    type: "Command",
                    name: { text: "echo", type: "Word" },
                    suffix: [{ text: "Starting...", type: "Word" }],
                  },
                ],
                redirections: [],
              },
            },
            {
              type: "CaseItem",
              pattern: [{ text: "stop", type: "Word" }],
              body: {
                type: "CompoundList",
                commands: [
                  {
                    type: "Command",
                    name: { text: "echo", type: "Word" },
                    suffix: [{ text: "Stopping...", type: "Word" }],
                  },
                ],
                redirections: [],
              },
            },
          ],
        },
      ],
    };
    expect(astToCommand(ast)).toBe(
      "case $1 in\nstart) echo 'Starting...';;\nstop) echo 'Stopping...';;\nesac"
    );
  });

  it("should handle if statements", () => {
    const ast: ScriptNode = {
      type: "Script",
      commands: [
        {
          type: "If",
          clause: {
            type: "CompoundList",
            commands: [
              {
                type: "Command",
                name: { text: "test", type: "Word" },
                suffix: [
                  { text: "$1", type: "Word" },
                  { text: "=", type: "Word" },
                  { text: "yes", type: "Word" },
                ],
              },
            ],
            redirections: [],
          },
          then: {
            type: "CompoundList",
            commands: [
              {
                type: "Command",
                name: { text: "echo", type: "Word" },
                suffix: [{ text: "Affirmative", type: "Word" }],
              },
            ],
            redirections: [],
          },
          else: {
            type: "CompoundList",
            commands: [
              {
                type: "Command",
                name: { text: "echo", type: "Word" },
                suffix: [{ text: "Negative", type: "Word" }],
              },
            ],
            redirections: [],
          },
        },
      ],
    };
    expect(astToCommand(ast)).toBe(
      "if test $1 = yes; then echo Affirmative; else echo Negative; fi"
    );
  });

  it("should handle while loops", () => {
    const ast: ScriptNode = {
      type: "Script",
      commands: [
        {
          type: "While",
          clause: {
            type: "CompoundList",
            commands: [
              {
                type: "Command",
                name: { text: "test", type: "Word" },
                suffix: [
                  { text: "$count", type: "Word" },
                  { text: "-gt", type: "Word" },
                  { text: "0", type: "Word" },
                ],
              },
            ],
            redirections: [],
          },
          do: {
            type: "CompoundList",
            commands: [
              {
                type: "Command",
                name: { text: "echo", type: "Word" },
                suffix: [{ text: "$count", type: "Word" }],
              },
            ],
            redirections: [],
          },
        },
      ],
    };
    expect(astToCommand(ast)).toBe(
      "while test $count -gt 0; do echo $count; done"
    );
  });

  it("should handle until loops", () => {
    const ast: ScriptNode = {
      type: "Script",
      commands: [
        {
          type: "Until",
          clause: {
            type: "CompoundList",
            commands: [
              {
                type: "Command",
                name: { text: "test", type: "Word" },
                suffix: [
                  { text: "$count", type: "Word" },
                  { text: "-eq", type: "Word" },
                  { text: "0", type: "Word" },
                ],
              },
            ],
            redirections: [],
          },
          do: {
            type: "CompoundList",
            commands: [
              {
                type: "Command",
                name: { text: "echo", type: "Word" },
                suffix: [{ text: "$count", type: "Word" }],
              },
            ],
            redirections: [],
          },
        },
      ],
    };
    expect(astToCommand(ast)).toBe(
      "until test $count -eq 0; do echo $count; done"
    );
  });

  it("should handle words with expansions", () => {
    const ast: ScriptNode = {
      type: "Script",
      commands: [
        {
          type: "Command",
          name: { text: "echo", type: "Word" },
          suffix: [
            {
              text: "Hello, ${NAME}!",
              type: "Word",
              expansion: [
                {
                  type: "ParameterExpansion",
                  parameter: "NAME",
                  loc: { start: 7, end: 13 },
                },
              ],
            },
          ],
        },
      ],
    };
    expect(astToCommand(ast)).toBe("echo 'Hello, ${NAME}!'");
  });

  it("should handle assignment words", () => {
    const ast: ScriptNode = {
      type: "Script",
      commands: [
        {
          type: "Command",
          prefix: [{ type: "AssignmentWord", text: "VAR=value" }],
          name: { text: "echo", type: "Word" },
          suffix: [{ text: "$VAR", type: "Word" }],
        },
      ],
    };
    expect(astToCommand(ast)).toBe("VAR=value echo $VAR");
  });

  it("should handle redirections", () => {
    const ast: ScriptNode = {
      type: "Script",
      commands: [
        {
          type: "Command",
          name: { text: "echo", type: "Word" },
          suffix: [
            { text: "Hello", type: "Word" },
            {
              type: "Redirect",
              op: ">",
              file: { text: "output.txt", type: "Word" },
            },
          ],
        },
      ],
    };
    expect(astToCommand(ast)).toBe("echo Hello >output.txt");
  });

  it("should handle unrecognized node types", () => {
    const ast = {
      type: "Script",
      commands: [
        {
          type: "UnknownType",
          someProperty: "someValue",
        },
      ],
    };

    // Spy on console.warn
    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => null);

    const result = astToCommand(ast as ScriptNode);

    // Check that console.warn was called with the correct message
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Unhandled node type: UnknownType"
    );

    // Check that an empty string is returned
    expect(result).toBe("");

    // Restore the original console.warn
    consoleWarnSpy.mockRestore();
  });
});
