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
    it("should render and update pattern correctly", () => {
      const mockSetPattern = jest.fn();
      const { getByPlaceholderText } = render(
        React.createElement(grepPlugin.component, {
          pattern: "test",
          flags: "",
          setPattern: mockSetPattern,
          setFlags: jest.fn(),
        })
      );

      const patternInput = getByPlaceholderText("Enter grep pattern...");
      expect(patternInput).toHaveValue("test");

      fireEvent.change(patternInput, { target: { value: "new pattern" } });
      expect(mockSetPattern).toHaveBeenCalledWith("new pattern");
    });

    it("should handle flag checkboxes correctly", () => {
      const mockSetFlags = jest.fn();
      const { getByLabelText } = render(
        React.createElement(grepPlugin.component, {
          pattern: "test",
          flags: "",
          setPattern: jest.fn(),
          setFlags: mockSetFlags,
        })
      );

      const caseInsensitiveCheckbox = getByLabelText(
        "-i (Case insensitive)"
      ) as HTMLInputElement;
      const invertMatchCheckbox = getByLabelText(
        "-v (Invert match)"
      ) as HTMLInputElement;

      expect(caseInsensitiveCheckbox.checked).toBe(false);
      expect(invertMatchCheckbox.checked).toBe(false);

      // Test checking case insensitive flag
      fireEvent.click(caseInsensitiveCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("i");

      // Test checking invert match flag
      fireEvent.click(invertMatchCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("v");

      // Reset mock calls
      mockSetFlags.mockClear();

      // Test unchecking case insensitive flag
      fireEvent.click(caseInsensitiveCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("i");

      // Reset mock calls
      mockSetFlags.mockClear();

      // Test unchecking invert match flag
      fireEvent.click(invertMatchCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("v");
    });

    it("should handle initial flags correctly", () => {
      const { getByLabelText } = render(
        React.createElement(grepPlugin.component, {
          pattern: "test",
          flags: "iv",
          setPattern: jest.fn(),
          setFlags: jest.fn(),
        })
      );

      const caseInsensitiveCheckbox = getByLabelText(
        "-i (Case insensitive)"
      ) as HTMLInputElement;
      const invertMatchCheckbox = getByLabelText(
        "-v (Invert match)"
      ) as HTMLInputElement;

      expect(caseInsensitiveCheckbox.checked).toBe(true);
      expect(invertMatchCheckbox.checked).toBe(true);
    });

    it("should handle multiple flag changes", () => {
      const mockSetFlags = jest.fn();
      const { getByLabelText } = render(
        React.createElement(grepPlugin.component, {
          pattern: "test",
          flags: "",
          setPattern: jest.fn(),
          setFlags: mockSetFlags,
        })
      );

      const caseInsensitiveCheckbox = getByLabelText(
        "-i (Case insensitive)"
      ) as HTMLInputElement;
      const invertMatchCheckbox = getByLabelText(
        "-v (Invert match)"
      ) as HTMLInputElement;

      // Check both flags
      fireEvent.click(caseInsensitiveCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("i");

      fireEvent.click(invertMatchCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("v");

      // Reset mock calls
      mockSetFlags.mockClear();

      // Uncheck case insensitive
      fireEvent.click(caseInsensitiveCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("i");

      // Reset mock calls
      mockSetFlags.mockClear();

      // Check case insensitive again
      fireEvent.click(caseInsensitiveCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("i");

      // Reset mock calls
      mockSetFlags.mockClear();

      // Uncheck both flags
      fireEvent.click(caseInsensitiveCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("i");

      fireEvent.click(invertMatchCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("v");
    });
  });
});
