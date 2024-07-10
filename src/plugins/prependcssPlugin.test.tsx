import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { prependcssPlugin } from "./prependcssPlugin";
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

describe("prependcssPlugin", () => {
  describe("parse", () => {
    it("should parse a simple prependcss command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "prependcss", type: "Word" },
        suffix: [
          { text: "-c", type: "Word" },
          { text: "body { font-family: Arial; }", type: "Word" },
        ],
      };

      const result = prependcssPlugin.parse(command);

      expect(result).toEqual({
        type: "prependcss",
        css: "body { font-family: Arial; }",
      });
    });

    it("should handle an empty prependcss command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "prependcss", type: "Word" },
        suffix: [],
      };

      const result = prependcssPlugin.parse(command);

      expect(result).toEqual({
        type: "prependcss",
        css: "",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple prependcss command", () => {
      const module = {
        type: "prependcss",
        css: "body { font-family: Arial; }",
      };

      const result = prependcssPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "prependcss", type: "Word" },
        suffix: [
          { type: "Word", text: "-c" },
          { type: "Word", text: "body { font-family: Arial; }" },
        ],
      });
    });

    it("should handle empty CSS", () => {
      const module = {
        type: "prependcss",
        css: "",
      };

      const result = prependcssPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "prependcss", type: "Word" },
        suffix: [],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetCss = jest.fn();

      const { getByTestId } = render(
        React.createElement(prependcssPlugin.component, {
          css: "body { font-family: Arial; }",
          setCss: mockSetCss,
        })
      );

      const codeEditor = getByTestId("code-editor");
      expect(codeEditor).toHaveValue("body { font-family: Arial; }");

      fireEvent.change(codeEditor, {
        target: { value: "body { font-family: sans-serif; }" },
      });
      expect(mockSetCss).toHaveBeenCalledWith("body { font-family: sans-serif; }");
    });
  });
});
