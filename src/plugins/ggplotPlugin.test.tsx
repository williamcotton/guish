import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ggplotPlugin } from "./ggplotPlugin";
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

describe("ggplotPlugin", () => {
  describe("parse", () => {
    it("should parse a simple ggplot command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "ggplot", type: "Word" },
        suffix: [{ text: 'ggplot(data, aes(x, y)) + geom_point()', type: "Word" }],
      };

      const result = ggplotPlugin.parse(command);

      expect(result).toEqual({
        type: "ggplot",
        code: 'ggplot(data, aes(x, y)) + geom_point()',
      });
    });

    it("should handle an empty ggplot command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "ggplot", type: "Word" },
        suffix: [],
      };

      const result = ggplotPlugin.parse(command);

      expect(result).toEqual({
        type: "ggplot",
        code: "",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple ggplot command", () => {
      const module = {
        type: "ggplot",
        code: 'ggplot(data, aes(x, y)) + geom_point()',
      };

      const result = ggplotPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "ggplot", type: "Word" },
        suffix: [{ type: "Word", text: 'ggplot(data, aes(x, y)) + geom_point()' }],
      });
    });

    it("should handle an empty code", () => {
      const module = {
        type: "ggplot",
        code: "",
      };

      const result = ggplotPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "ggplot", type: "Word" },
        suffix: [],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetCode = jest.fn();
      const { getByTestId } = render(
        React.createElement(ggplotPlugin.component, {
          code: 'ggplot(data, aes(x, y)) + geom_point()',
          setCode: mockSetCode,
        })
      );

      const codeEditor = getByTestId("code-editor") as HTMLTextAreaElement;
      expect(codeEditor.value).toBe('ggplot(data, aes(x, y)) + geom_point()');

      fireEvent.change(codeEditor, {
        target: { value: 'ggplot(data, aes(x, y)) + geom_line()' },
      });
      expect(mockSetCode).toHaveBeenCalledWith('ggplot(data, aes(x, y)) + geom_line()');
    });
  });
});
