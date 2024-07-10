import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { nodePlugin } from "./nodePlugin";
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

describe("nodePlugin", () => {
  describe("parse", () => {
    it("should parse a simple node command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "node", type: "Word" },
        suffix: [
          { text: "-e", type: "Word" },
          { text: "console.log('Hello, World!')", type: "Word" },
        ],
      };

      const result = nodePlugin.parse(command);

      expect(result).toEqual({
        type: "node",
        code: "console.log('Hello, World!')",
      });
    });

    it("should handle an empty node command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "node", type: "Word" },
        suffix: [],
      };

      const result = nodePlugin.parse(command);

      expect(result).toEqual({
        type: "node",
        code: "",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple node command", () => {
      const module = {
        type: "node",
        code: "console.log('Hello, World!')",
      };

      const result = nodePlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "node", type: "Word" },
        suffix: [
          { type: "Word", text: "-e" },
          { type: "Word", text: "console.log('Hello, World!')" },
        ],
      });
    });

    it("should handle empty code", () => {
      const module = {
        type: "node",
        code: "",
      };

      const result = nodePlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "node", type: "Word" },
        suffix: [],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetCode = jest.fn();

      const { getByTestId } = render(
        React.createElement(nodePlugin.component, {
          code: "console.log('Hello, World!')",
          setCode: mockSetCode,
        })
      );

      const codeEditor = getByTestId("code-editor");
      expect(codeEditor).toHaveValue("console.log('Hello, World!')");

      fireEvent.change(codeEditor, {
        target: { value: "console.log('Updated code')" },
      });
      expect(mockSetCode).toHaveBeenCalledWith("console.log('Updated code')");
    });
  });
});