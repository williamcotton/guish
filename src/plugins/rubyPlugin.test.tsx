import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { rubyPlugin } from "./rubyPlugin";
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

describe("rubyPlugin", () => {
  describe("parse", () => {
    it("should parse a simple ruby command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "ruby", type: "Word" },
        suffix: [
          { text: "-e", type: "Word" },
          { text: "puts 'Hello, World!'", type: "Word" },
        ],
      };

      const result = rubyPlugin.parse(command);

      expect(result).toEqual({
        type: "ruby",
        code: "puts 'Hello, World!'",
      });
    });

    it("should handle an empty ruby command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "ruby", type: "Word" },
        suffix: [],
      };

      const result = rubyPlugin.parse(command);

      expect(result).toEqual({
        type: "ruby",
        code: "",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple ruby command", () => {
      const module = {
        type: "ruby",
        code: "puts 'Hello, World!'",
      };

      const result = rubyPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "ruby", type: "Word" },
        suffix: [
          { type: "Word", text: "-e" },
          { type: "Word", text: "puts 'Hello, World!'" },
        ],
      });
    });

    it("should handle empty code", () => {
      const module = {
        type: "ruby",
        code: "",
      };

      const result = rubyPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "ruby", type: "Word" },
        suffix: [],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetCode = jest.fn();

      const { getByTestId } = render(
        React.createElement(rubyPlugin.component, {
          code: "puts 'Hello, World!'",
          setCode: mockSetCode,
        })
      );

      const codeEditor = getByTestId("code-editor");
      expect(codeEditor).toHaveValue("puts 'Hello, World!'");

      fireEvent.change(codeEditor, {
        target: { value: "puts 'Updated code'" },
      });
      expect(mockSetCode).toHaveBeenCalledWith("puts 'Updated code'");
    });
  });
});
