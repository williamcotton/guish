import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { nodejsxPlugin } from "./nodejsxPlugin";
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

describe("nodejsxPlugin", () => {
  describe("parse", () => {
    it("should parse a simple nodejsx command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "nodejsx", type: "Word" },
        suffix: [{ text: "console.log('Hello, World!')", type: "Word" }],
      };

      const result = nodejsxPlugin.parse(command);

      expect(result).toEqual({
        type: "nodejsx",
        code: "console.log('Hello, World!')",
      });
    });

    it("should handle an empty nodejsx command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "nodejsx", type: "Word" },
        suffix: [],
      };

      const result = nodejsxPlugin.parse(command);

      expect(result).toEqual({
        type: "nodejsx",
        code: "",
      });
    });

    it("should handle multi-word JSX code", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "nodejsx", type: "Word" },
        suffix: [
          { text: "const", type: "Word" },
          { text: "App", type: "Word" },
          { text: "=", type: "Word" },
          { text: "()=>", type: "Word" },
          { text: "<div>Hello</div>;", type: "Word" },
        ],
      };

      const result = nodejsxPlugin.parse(command);

      expect(result).toEqual({
        type: "nodejsx",
        code: "const App = ()=> <div>Hello</div>;",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple nodejsx command", () => {
      const module = {
        type: "nodejsx",
        code: "console.log('Hello, World!')",
      };

      const result = nodejsxPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "nodejsx", type: "Word" },
        suffix: [{ type: "Word", text: "console.log('Hello, World!')" }],
      });
    });

    it("should handle empty code", () => {
      const module = {
        type: "nodejsx",
        code: "",
      };

      const result = nodejsxPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "nodejsx", type: "Word" },
        suffix: [],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetCode = jest.fn();

      const { getByTestId } = render(
        React.createElement(nodejsxPlugin.component, {
          code: "const App = () => <div>Hello</div>;",
          setCode: mockSetCode,
        })
      );

      const codeEditor = getByTestId("code-editor");
      expect(codeEditor).toHaveValue("const App = () => <div>Hello</div>;");

      fireEvent.change(codeEditor, {
        target: { value: "const NewApp = () => <span>World</span>;" },
      });
      expect(mockSetCode).toHaveBeenCalledWith(
        "const NewApp = () => <span>World</span>;"
      );
    });
  });
});
