import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { wcPlugin } from "./wcPlugin";
import { CommandNode } from "../types";

describe("wcPlugin", () => {
  describe("parse", () => {
    it("should parse a simple wc command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "wc", type: "Word" },
        suffix: [],
      };

      const result = wcPlugin.parse(command);

      expect(result).toEqual({
        type: "wc",
        flags: "",
      });
    });

    it("should parse a wc command with line flag", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "wc", type: "Word" },
        suffix: [{ text: "-l", type: "Word" }],
      };

      const result = wcPlugin.parse(command);

      expect(result).toEqual({
        type: "wc",
        flags: "l",
      });
    });

    it("should parse a wc command with multiple flags", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "wc", type: "Word" },
        suffix: [{ text: "-lwc", type: "Word" }],
      };

      const result = wcPlugin.parse(command);

      expect(result).toEqual({
        type: "wc",
        flags: "lwc",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple wc command", () => {
      const module = {
        type: "wc",
        flags: "",
      };

      const result = wcPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "wc", type: "Word" },
        suffix: [],
      });
    });

    it("should compile a wc command with line flag", () => {
      const module = {
        type: "wc",
        flags: "l",
      };

      const result = wcPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "wc", type: "Word" },
        suffix: [{ type: "Word", text: "-l" }],
      });
    });

    it("should compile a wc command with multiple flags", () => {
      const module = {
        type: "wc",
        flags: "lwc",
      };

      const result = wcPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "wc", type: "Word" },
        suffix: [{ type: "Word", text: "-lwc" }],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetFlags = jest.fn();

      const { getByLabelText } = render(
        React.createElement(wcPlugin.component, {
          flags: "",
          setFlags: mockSetFlags,
        })
      );

      const lineCheckbox = getByLabelText("-l (Count lines)") as HTMLInputElement;
      expect(lineCheckbox).not.toBeChecked();

      const wordCheckbox = getByLabelText("-w (Count words)") as HTMLInputElement;
      expect(wordCheckbox).not.toBeChecked();

      const byteCheckbox = getByLabelText("-c (Count bytes)") as HTMLInputElement;
      expect(byteCheckbox).not.toBeChecked();

      fireEvent.click(lineCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("l");

      fireEvent.click(wordCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("w");

      fireEvent.click(byteCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("c");

      fireEvent.click(lineCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("l");
      expect(mockSetFlags).toHaveBeenCalledWith("w");
      expect(mockSetFlags).toHaveBeenCalledWith("c");
    });

    it("should handle multiple flag toggles correctly", () => {
      const mockSetFlags = jest.fn();

      const { getByLabelText } = render(
        React.createElement(wcPlugin.component, {
          flags: "",
          setFlags: mockSetFlags,
        })
      );

      const lineCheckbox = getByLabelText("-l (Count lines)") as HTMLInputElement;
      const wordCheckbox = getByLabelText("-w (Count words)") as HTMLInputElement;
      const byteCheckbox = getByLabelText("-c (Count bytes)") as HTMLInputElement;

      fireEvent.click(lineCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("l");

      fireEvent.click(wordCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("w");

      fireEvent.click(byteCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("c");

      fireEvent.click(lineCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("l");
    });
  });
});