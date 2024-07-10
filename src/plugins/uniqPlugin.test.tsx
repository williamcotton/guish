import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { uniqPlugin } from "./uniqPlugin";
import { CommandNode } from "../types";

describe("uniqPlugin", () => {
  describe("parse", () => {
    it("should parse a simple uniq command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "uniq", type: "Word" },
        suffix: [],
      };

      const result = uniqPlugin.parse(command);

      expect(result).toEqual({
        type: "uniq",
        flags: "",
      });
    });

    it("should parse a uniq command with count flag", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "uniq", type: "Word" },
        suffix: [{ text: "-c", type: "Word" }],
      };

      const result = uniqPlugin.parse(command);

      expect(result).toEqual({
        type: "uniq",
        flags: "c",
      });
    });

    it("should parse a uniq command with duplicate flag", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "uniq", type: "Word" },
        suffix: [{ text: "-d", type: "Word" }],
      };

      const result = uniqPlugin.parse(command);

      expect(result).toEqual({
        type: "uniq",
        flags: "d",
      });
    });

    it("should parse a uniq command with both flags", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "uniq", type: "Word" },
        suffix: [{ text: "-cd", type: "Word" }],
      };

      const result = uniqPlugin.parse(command);

      expect(result).toEqual({
        type: "uniq",
        flags: "cd",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple uniq command", () => {
      const module = {
        type: "uniq",
        flags: "",
      };

      const result = uniqPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "uniq", type: "Word" },
        suffix: [],
      });
    });

    it("should compile a uniq command with count flag", () => {
      const module = {
        type: "uniq",
        flags: "c",
      };

      const result = uniqPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "uniq", type: "Word" },
        suffix: [{ type: "Word", text: "-c" }],
      });
    });

    it("should compile a uniq command with duplicate flag", () => {
      const module = {
        type: "uniq",
        flags: "d",
      };

      const result = uniqPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "uniq", type: "Word" },
        suffix: [{ type: "Word", text: "-d" }],
      });
    });

    it("should compile a uniq command with both flags", () => {
      const module = {
        type: "uniq",
        flags: "cd",
      };

      const result = uniqPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "uniq", type: "Word" },
        suffix: [{ type: "Word", text: "-cd" }],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetFlags = jest.fn();

      const { getByLabelText } = render(
        React.createElement(uniqPlugin.component, {
          flags: "",
          setFlags: mockSetFlags,
        })
      );

      const countCheckbox = getByLabelText(
        "-c (Count occurrences)"
      ) as HTMLInputElement;
      expect(countCheckbox).not.toBeChecked();

      const duplicateCheckbox = getByLabelText(
        "-d (Only print duplicate lines)"
      ) as HTMLInputElement;
      expect(duplicateCheckbox).not.toBeChecked();

      fireEvent.click(countCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("c");

      fireEvent.click(duplicateCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("d");

      fireEvent.click(countCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("c");
    });

    it("should handle multiple flag toggles correctly", () => {
      const mockSetFlags = jest.fn();

      const { getByLabelText } = render(
        React.createElement(uniqPlugin.component, {
          flags: "",
          setFlags: mockSetFlags,
        })
      );

      const countCheckbox = getByLabelText(
        "-c (Count occurrences)"
      ) as HTMLInputElement;
      const duplicateCheckbox = getByLabelText(
        "-d (Only print duplicate lines)"
      ) as HTMLInputElement;

      fireEvent.click(countCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("c");

      fireEvent.click(duplicateCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("d");

      fireEvent.click(countCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("c");

      fireEvent.click(duplicateCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("d");
    });
  });
});
