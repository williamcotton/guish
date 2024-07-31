import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { fsharpPlugin } from "./fsharpPlugin";
import { CommandNode } from "../types";

// Mock the CodeEditor component
jest.mock("../codeEditor", () => ({
  __esModule: true,
  default: jest.fn(({ value, onChange }) => (
    <textarea
      data-testid="code-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )),
}));

describe("fsharpPlugin", () => {
  describe("parse", () => {
    it("should parse a simple fsharp command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "fsharp", type: "Word" },
        suffix: [{ text: "printfn \"Hello, World!\"", type: "Word" }],
      };

      const result = fsharpPlugin.parse(command);

      expect(result).toEqual({
        type: "fsharp",
        code: "printfn \"Hello, World!\"",
      });
    });

    it("should handle an empty fsharp command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "fsharp", type: "Word" },
        suffix: [],
      };

      const result = fsharpPlugin.parse(command);

      expect(result).toEqual({
        type: "fsharp",
        code: "",
      });
    });

    it("should handle multi-word F# code", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "fsharp", type: "Word" },
        suffix: [
          { text: "let", type: "Word" },
          { text: "x", type: "Word" },
          { text: "=", type: "Word" },
          { text: "5", type: "Word" },
          { text: "printfn", type: "Word" },
          { text: "\"%d\"", type: "Word" },
          { text: "x", type: "Word" },
        ],
      };

      const result = fsharpPlugin.parse(command);

      expect(result).toEqual({
        type: "fsharp",
        code: "let x = 5 printfn \"%d\" x",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple fsharp command", () => {
      const module = {
        type: "fsharp",
        code: "printfn \"Hello, World!\"",
      };

      const result = fsharpPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "fsharp", type: "Word" },
        suffix: [{ type: "Word", text: "printfn \"Hello, World!\"" }],
      });
    });

    it("should handle empty code", () => {
      const module = {
        type: "fsharp",
        code: "",
      };

      const result = fsharpPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "fsharp", type: "Word" },
        suffix: [],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetCode = jest.fn();

      const { getByTestId } = render(
        React.createElement(fsharpPlugin.component, {
          code: "printfn \"Hello, World!\"",
          setCode: mockSetCode,
        })
      );

      const codeEditor = getByTestId("code-editor");
      expect(codeEditor).toHaveValue("printfn \"Hello, World!\"");

      fireEvent.change(codeEditor, {
        target: { value: "let x = 5\nprintfn \"%d\" x" },
      });
      expect(mockSetCode).toHaveBeenCalledWith("let x = 5\nprintfn \"%d\" x");
    });
  });
});
