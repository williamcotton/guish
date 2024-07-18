import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { pastePlugin } from "./pastePlugin";
import { CommandNode } from "../types";

describe("pastePlugin", () => {
  describe("parse", () => {
    it("should parse a simple paste command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "paste", type: "Word" },
        suffix: [
          { text: "file1.txt", type: "Word" },
          { text: "file2.txt", type: "Word" },
        ],
      };

      const result = pastePlugin.parse(command);

      expect(result).toEqual({
        type: "paste",
        flags: "",
        delimiter: "",
        files: ["file1.txt", "file2.txt"],
      });
    });

    it("should parse a paste command with flags and delimiter", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "paste", type: "Word" },
        suffix: [
          { text: "-sd+", type: "Word" },
          { text: "file1.txt", type: "Word" },
          { text: "file2.txt", type: "Word" },
        ],
      };

      const result = pastePlugin.parse(command);

      expect(result).toEqual({
        type: "paste",
        flags: "sd",
        delimiter: "+",
        files: ["file1.txt", "file2.txt"],
      });
    });

    it("should handle stdin input", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "paste", type: "Word" },
        suffix: [{ text: "-", type: "Word" }],
      };

      const result = pastePlugin.parse(command);

      expect(result).toEqual({
        type: "paste",
        flags: "",
        delimiter: "",
        files: ["-"],
      });
    });

    it("should parse the command for seq 1 10 | paste -sd+ -", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "paste", type: "Word" },
        suffix: [
          { text: "-sd+", type: "Word" },
          { text: "-", type: "Word" },
        ],
      };

      const result = pastePlugin.parse(command);

      expect(result).toEqual({
        type: "paste",
        flags: "sd",
        delimiter: "+",
        files: ["-"],
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple paste command", () => {
      const module = {
        type: "paste",
        flags: "",
        delimiter: "",
        files: ["file1.txt", "file2.txt"],
      };

      const result = pastePlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "paste", type: "Word" },
        suffix: [
          { type: "Word", text: "file1.txt" },
          { type: "Word", text: "file2.txt" },
        ],
      });
    });

    it("should compile a paste command with flags and delimiter", () => {
      const module = {
        type: "paste",
        flags: "sd",
        delimiter: "+",
        files: ["file1.txt", "file2.txt"],
      };

      const result = pastePlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "paste", type: "Word" },
        suffix: [
          { type: "Word", text: "-sd+" },
          { type: "Word", text: "file1.txt" },
          { type: "Word", text: "file2.txt" },
        ],
      });
    });

    it("should handle stdin input", () => {
      const module = {
        type: "paste",
        flags: "sd",
        delimiter: "+",
        files: ["-"],
      };

      const result = pastePlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "paste", type: "Word" },
        suffix: [
          { type: "Word", text: "-sd+" },
          { type: "Word", text: "-" },
        ],
      });
    });

    it("should compile the command for seq 1 10 | paste -sd+ -", () => {
      const module = {
        type: "paste",
        flags: "sd",
        delimiter: "+",
        files: ["-"],
      };

      const result = pastePlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "paste", type: "Word" },
        suffix: [
          { type: "Word", text: "-sd+" },
          { type: "Word", text: "-" },
        ],
      });
    });

    it("should compile with 's' flag only", () => {
      const module = {
        type: "paste",
        flags: "s",
        delimiter: "",
        files: ["file1.txt", "file2.txt"],
      };

      const result = pastePlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "paste", type: "Word" },
        suffix: [
          { type: "Word", text: "-s" },
          { type: "Word", text: "file1.txt" },
          { type: "Word", text: "file2.txt" },
        ],
      });
    });

    it("should compile with 'd' flag only", () => {
      const module = {
        type: "paste",
        flags: "d",
        delimiter: ",",
        files: ["file1.txt", "file2.txt"],
      };

      const result = pastePlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "paste", type: "Word" },
        suffix: [
          { type: "Word", text: "-d," },
          { type: "Word", text: "file1.txt" },
          { type: "Word", text: "file2.txt" },
        ],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetFlags = jest.fn();
      const mockSetDelimiter = jest.fn();
      const mockSetFiles = jest.fn();

      const { getByLabelText, getByPlaceholderText } = render(
        React.createElement(pastePlugin.component, {
          flags: "d",
          delimiter: ",",
          files: ["file1.txt", "file2.txt"],
          setFlags: mockSetFlags,
          setDelimiter: mockSetDelimiter,
          setFiles: mockSetFiles,
        })
      );

      const serialModeCheckbox = getByLabelText(
        "-s (Serial mode)"
      ) as HTMLInputElement;
      expect(serialModeCheckbox).not.toBeChecked();

      const useDelimiterCheckbox = getByLabelText(
        "-d (Use delimiter)"
      ) as HTMLInputElement;
      expect(useDelimiterCheckbox).toBeChecked();

      const delimiterInput = getByPlaceholderText(
        "Enter delimiter"
      ) as HTMLInputElement;
      expect(delimiterInput).toHaveValue(",");

      const filesTextarea = getByPlaceholderText(
        "Enter files (one per line) or - for stdin"
      ) as HTMLTextAreaElement;
      expect(filesTextarea).toHaveValue("file1.txt\nfile2.txt");

      fireEvent.click(serialModeCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("sd");

      fireEvent.change(delimiterInput, { target: { value: "+" } });
      expect(mockSetDelimiter).toHaveBeenCalledWith("+");

      fireEvent.change(filesTextarea, {
        target: { value: "file1.txt\nfile2.txt\n-" },
      });
      expect(mockSetFiles).toHaveBeenCalledWith([
        "file1.txt",
        "file2.txt",
        "-",
      ]);
    });

    it("should handle setting flags in the correct order", () => {
      const mockSetFlags = jest.fn();
      const { getByLabelText } = render(
        React.createElement(pastePlugin.component, {
          flags: "",
          delimiter: "",
          files: [],
          setFlags: mockSetFlags,
          setDelimiter: jest.fn(),
          setFiles: jest.fn(),
        })
      );

      const serialModeCheckbox = getByLabelText(
        "-s (Serial mode)"
      ) as HTMLInputElement;
      const useDelimiterCheckbox = getByLabelText(
        "-d (Use delimiter)"
      ) as HTMLInputElement;

      fireEvent.click(serialModeCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("s");

      fireEvent.click(useDelimiterCheckbox);
      expect(mockSetFlags).toHaveBeenLastCalledWith("d");
    });
  });
});
