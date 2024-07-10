import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { echoPlugin } from "./echoPlugin";
import { CommandNode } from "../types";

// Mock the CodeEditor component
jest.mock("../codeEditor", () => ({
  __esModule: true,
  default: jest.fn(({ value, onChange }) => (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} />
  )),
}));

describe("echoPlugin", () => {
  describe("parse", () => {
    it("should parse a simple echo command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "echo", type: "Word" },
        suffix: [{ text: "Hello, World!", type: "Word" }],
      };

      const result = echoPlugin.parse(command);

      expect(result).toEqual({
        type: "echo",
        text: "Hello, World!",
      });
    });

    it("should handle multiple words", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "echo", type: "Word" },
        suffix: [
          { text: "Hello,", type: "Word" },
          { text: "World!", type: "Word" },
        ],
      };

      const result = echoPlugin.parse(command);

      expect(result).toEqual({
        type: "echo",
        text: "Hello, World!",
      });
    });

    it("should handle quotes", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "echo", type: "Word" },
        suffix: [{ text: '"Hello, World!"', type: "Word" }],
      };

      const result = echoPlugin.parse(command);

      expect(result).toEqual({
        type: "echo",
        text: "Hello, World!",
      });
    });

    it("should handle empty echo", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "echo", type: "Word" },
        suffix: [],
      };

      const result = echoPlugin.parse(command);

      expect(result).toEqual({
        type: "echo",
        text: "",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple echo command", () => {
      const module = {
        type: "echo",
        text: "Hello, World!",
      };

      const result = echoPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "echo", type: "Word" },
        suffix: [{ type: "Word", text: "Hello, World!" }],
      });
    });

    it("should handle empty text", () => {
      const module = {
        type: "echo",
        text: "",
      };

      const result = echoPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "echo", type: "Word" },
        suffix: [],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetText = jest.fn();
      const { getByRole } = render(
        React.createElement(echoPlugin.component, {
          text: "Hello, World!",
          setText: mockSetText,
        })
      );

      const editor = getByRole("textbox");
      expect(editor).toHaveValue("Hello, World!");

      fireEvent.change(editor, { target: { value: "New text" } });
      expect(mockSetText).toHaveBeenCalledWith("New text");
    });
  });
});
