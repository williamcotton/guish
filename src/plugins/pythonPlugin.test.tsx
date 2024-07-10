import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { pythonPlugin } from "./pythonPlugin";
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

describe("pythonPlugin", () => {
  describe("parse", () => {
    it("should parse a simple python command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "python", type: "Word" },
        suffix: [
          { text: "-c", type: "Word" },
          { text: "print('Hello, World!')", type: "Word" },
        ],
      };

      const result = pythonPlugin.parse(command);

      expect(result).toEqual({
        type: "python",
        code: "print('Hello, World!')",
      });
    });

    it("should handle an empty python command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "python", type: "Word" },
        suffix: [],
      };

      const result = pythonPlugin.parse(command);

      expect(result).toEqual({
        type: "python",
        code: "",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple python command", () => {
      const module = {
        type: "python",
        code: "print('Hello, World!')",
      };

      const result = pythonPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "python", type: "Word" },
        suffix: [
          { type: "Word", text: "-c" },
          { type: "Word", text: "print('Hello, World!')" },
        ],
      });
    });

    it("should handle empty code", () => {
      const module = {
        type: "python",
        code: "",
      };

      const result = pythonPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "python", type: "Word" },
        suffix: [],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetCode = jest.fn();

      const { getByTestId } = render(
        React.createElement(pythonPlugin.component, {
          code: "print('Hello, World!')",
          setCode: mockSetCode,
        })
      );

      const codeEditor = getByTestId("code-editor");
      expect(codeEditor).toHaveValue("print('Hello, World!')");

      fireEvent.change(codeEditor, {
        target: { value: "print('Updated code')" },
      });
      expect(mockSetCode).toHaveBeenCalledWith("print('Updated code')");
    });
  });
});
