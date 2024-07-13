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

    it("should parse a sort command with additional options", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "sort", type: "Word" },
        suffix: [
          { text: "-k2", type: "Word" },
          { text: "file.txt", type: "Word" },
        ],
      };

      const result = sortPlugin.parse(command);

      expect(result).toEqual({
        type: "sort",
        flags: "k2",
        options: "file.txt",
      });
    });

    it("should parse a sort command with flags and additional options", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "sort", type: "Word" },
        suffix: [
          { text: "-rn", type: "Word" },
          { text: "-k2", type: "Word" },
          { text: "file.txt", type: "Word" },
        ],
      };

      const result = sortPlugin.parse(command);

      expect(result).toEqual({
        type: "sort",
        flags: "rnk2",
        options: "file.txt",
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

    it("should compile a sort command with additional options", () => {
      const module = {
        type: "sort",
        flags: "k2",
        options: "file.txt",
      };

      const result = sortPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "sort", type: "Word" },
        suffix: [
          { type: "Word", text: "-k2" },
          { type: "Word", text: "file.txt" },
        ],
      });
    });

    it("should compile a sort command with flags and additional options", () => {
      const module = {
        type: "sort",
        flags: "rnk2",
        options: "file.txt",
      };

      const result = sortPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "sort", type: "Word" },
        suffix: [
          { type: "Word", text: "-rnk2" },
          { type: "Word", text: "file.txt" },
        ],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetFlags = jest.fn();
      const mockSetOptions = jest.fn();

      const { getByLabelText, getByPlaceholderText } = render(
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
      const numericCheckbox = getByLabelText(
        "-n (Numeric sort)"
      ) as HTMLInputElement;
      const optionsInput = getByPlaceholderText(
        "Additional options..."
      ) as HTMLInputElement;

      expect(reverseCheckbox).toBeChecked();
      expect(numericCheckbox).not.toBeChecked();
      expect(optionsInput).toHaveValue("");

      fireEvent.click(reverseCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("");

      fireEvent.click(numericCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("rn");

      fireEvent.change(optionsInput, { target: { value: "-k2" } });
      expect(mockSetOptions).toHaveBeenCalledWith("-k2");
    });

    it("should handle initial state with both flags", () => {
      const mockSetFlags = jest.fn();
      const { getByLabelText } = render(
        React.createElement(sortPlugin.component, {
          flags: "rn",
          options: "",
          setFlags: mockSetFlags,
          setOptions: jest.fn(),
        })
      );

      const reverseCheckbox = getByLabelText(
        "-r (Reverse)"
      ) as HTMLInputElement;
      const numericCheckbox = getByLabelText(
        "-n (Numeric sort)"
      ) as HTMLInputElement;

      expect(reverseCheckbox).toBeChecked();
      expect(numericCheckbox).toBeChecked();

      fireEvent.click(reverseCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("n");

      fireEvent.click(numericCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("r");
    });
  });
});
