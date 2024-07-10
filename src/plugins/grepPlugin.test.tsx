import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { grepPlugin } from "./grepPlugin";
import { CommandNode } from "../types";

describe("grepPlugin", () => {
  describe("parse", () => {
    it("should parse a simple grep command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "grep", type: "Word" },
        suffix: [{ text: "pattern", type: "Word" }],
      };

      const result = grepPlugin.parse(command);

      expect(result).toEqual({
        type: "grep",
        pattern: "pattern",
        flags: "",
      });
    });

    it("should parse a grep command with flags", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "grep", type: "Word" },
        suffix: [
          { text: "-i", type: "Word" },
          { text: "-v", type: "Word" },
          { text: "pattern", type: "Word" },
        ],
      };

      const result = grepPlugin.parse(command);

      expect(result).toEqual({
        type: "grep",
        pattern: "pattern",
        flags: "iv",
      });
    });

    it("should handle an empty grep command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "grep", type: "Word" },
        suffix: [],
      };

      const result = grepPlugin.parse(command);

      expect(result).toEqual({
        type: "grep",
        pattern: "",
        flags: "",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple grep command", () => {
      const module = {
        type: "grep",
        pattern: "pattern",
        flags: "",
      };

      const result = grepPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "grep", type: "Word" },
        suffix: [{ type: "Word", text: "pattern" }],
      });
    });

    it("should compile a grep command with flags", () => {
      const module = {
        type: "grep",
        pattern: "pattern",
        flags: "iv",
      };

      const result = grepPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "grep", type: "Word" },
        suffix: [
          { type: "Word", text: "-iv" },
          { type: "Word", text: "pattern" },
        ],
      });
    });

    it("should handle an empty pattern", () => {
      const module = {
        type: "grep",
        pattern: "",
        flags: "i",
      };

      const result = grepPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "grep", type: "Word" },
        suffix: [{ type: "Word", text: "-i" }],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetPattern = jest.fn();
      const mockSetFlags = jest.fn();

      const { getByPlaceholderText, getByLabelText } = render(
        React.createElement(grepPlugin.component, {
          pattern: "test",
          flags: "i",
          setPattern: mockSetPattern,
          setFlags: mockSetFlags,
        })
      );

      const patternInput = getByPlaceholderText("Enter grep pattern...");
      expect(patternInput).toHaveValue("test");

      // Use getByLabelText to find checkboxes
      const caseInsensitiveCheckbox = getByLabelText("-i (Case insensitive)");
      expect(caseInsensitiveCheckbox).toBeChecked();

      const invertMatchCheckbox = getByLabelText("-v (Invert match)");
      expect(invertMatchCheckbox).not.toBeChecked();

      fireEvent.change(patternInput, { target: { value: "new pattern" } });
      expect(mockSetPattern).toHaveBeenCalledWith("new pattern");

      fireEvent.click(invertMatchCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("iv");
    });
  });
});
