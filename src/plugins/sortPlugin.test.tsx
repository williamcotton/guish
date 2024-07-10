import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { sortPlugin } from "./sortPlugin";
import { CommandNode } from "../types";

describe("sortPlugin", () => {
  describe("parse", () => {
    it("should parse a simple sort command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "sort", type: "Word" },
        suffix: [],
      };

      const result = sortPlugin.parse(command);

      expect(result).toEqual({
        type: "sort",
        flags: "",
        options: "",
      });
    });

    it("should parse a sort command with r flag", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "sort", type: "Word" },
        suffix: [{ text: "-r", type: "Word" }],
      };

      const result = sortPlugin.parse(command);

      expect(result).toEqual({
        type: "sort",
        flags: "r",
        options: "",
      });
    });

    it("should parse a sort command with n flag", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "sort", type: "Word" },
        suffix: [{ text: "-n", type: "Word" }],
      };

      const result = sortPlugin.parse(command);

      expect(result).toEqual({
        type: "sort",
        flags: "n",
        options: "",
      });
    });

    it("should parse a sort command with both r and n flags", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "sort", type: "Word" },
        suffix: [{ text: "-rn", type: "Word" }],
      };

      const result = sortPlugin.parse(command);

      expect(result).toEqual({
        type: "sort",
        flags: "rn",
        options: "",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple sort command", () => {
      const module = {
        type: "sort",
        flags: "",
        options: "",
      };

      const result = sortPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "sort", type: "Word" },
        suffix: [],
      });
    });

    it("should compile a sort command with r flag", () => {
      const module = {
        type: "sort",
        flags: "r",
        options: "",
      };

      const result = sortPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "sort", type: "Word" },
        suffix: [{ type: "Word", text: "-r" }],
      });
    });

    it("should compile a sort command with n flag", () => {
      const module = {
        type: "sort",
        flags: "n",
        options: "",
      };

      const result = sortPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "sort", type: "Word" },
        suffix: [{ type: "Word", text: "-n" }],
      });
    });

    it("should compile a sort command with both r and n flags", () => {
      const module = {
        type: "sort",
        flags: "rn",
        options: "",
      };

      const result = sortPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "sort", type: "Word" },
        suffix: [{ type: "Word", text: "-rn" }],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetFlags = jest.fn();
      const mockSetOptions = jest.fn();

      const { getByLabelText } = render(
        React.createElement(sortPlugin.component, {
          flags: "r",
          options: "",
          setFlags: mockSetFlags,
          setOptions: mockSetOptions,
        })
      );

      const reverseCheckbox = getByLabelText(
        "-r (Reverse)"
      ) as HTMLInputElement;
      expect(reverseCheckbox).toBeChecked();

      const numericCheckbox = getByLabelText(
        "-n (Numeric sort)"
      ) as HTMLInputElement;
      expect(numericCheckbox).not.toBeChecked();

      fireEvent.click(numericCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("rn");

      fireEvent.click(reverseCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("");
    });

    it("should handle multiple flag toggles correctly", () => {
      const mockSetFlags = jest.fn();
      const mockSetOptions = jest.fn();

      const { getByLabelText } = render(
        React.createElement(sortPlugin.component, {
          flags: "",
          options: "",
          setFlags: mockSetFlags,
          setOptions: mockSetOptions,
        })
      );

      const reverseCheckbox = getByLabelText(
        "-r (Reverse)"
      ) as HTMLInputElement;
      const numericCheckbox = getByLabelText(
        "-n (Numeric sort)"
      ) as HTMLInputElement;

      fireEvent.click(reverseCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("r");

      fireEvent.click(numericCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("n");

      fireEvent.click(reverseCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("r");
    });
  });
});
