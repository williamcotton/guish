import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { catPlugin, CatModuleType } from "./catPlugin";
import { CommandNode } from "../types";

describe("catPlugin", () => {
  describe("parse", () => {
    it("should parse a simple cat command with one file", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "cat", type: "Word" },
        suffix: [{ text: "file1.txt", type: "Word" }],
      };

      const result = catPlugin.parse(command);

      expect(result).toEqual({
        type: "cat",
        files: ["file1.txt"],
      });
    });

    it("should parse a cat command with multiple files", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "cat", type: "Word" },
        suffix: [
          { text: "file1.txt", type: "Word" },
          { text: "file2.txt", type: "Word" },
          { text: "file3.txt", type: "Word" },
        ],
      };

      const result = catPlugin.parse(command);

      expect(result).toEqual({
        type: "cat",
        files: ["file1.txt", "file2.txt", "file3.txt"],
      });
    });

    it("should handle an empty cat command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "cat", type: "Word" },
        suffix: [],
      };

      const result = catPlugin.parse(command);

      expect(result).toEqual({
        type: "cat",
        files: [],
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple cat command with one file", () => {
      const module: CatModuleType = {
        type: "cat",
        files: ["file1.txt"],
      };

      const result = catPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "cat", type: "Word" },
        suffix: [{ type: "Word", text: "file1.txt" }],
      });
    });

    it("should compile a cat command with multiple files", () => {
      const module: CatModuleType = {
        type: "cat",
        files: ["file1.txt", "file2.txt", "file3.txt"],
      };

      const result = catPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "cat", type: "Word" },
        suffix: [
          { type: "Word", text: "file1.txt" },
          { type: "Word", text: "file2.txt" },
          { type: "Word", text: "file3.txt" },
        ],
      });
    });

    it("should handle an empty file list", () => {
      const module: CatModuleType = {
        type: "cat",
        files: [],
      };

      const result = catPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "cat", type: "Word" },
        suffix: [],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetFiles = jest.fn();
      const { getByRole } = render(
        React.createElement(catPlugin.component, {
          files: ["file1.txt", "file2.txt"],
          setFiles: mockSetFiles,
        })
      );

      const textarea = getByRole("textbox");
      expect(textarea).toHaveValue("file1.txt\nfile2.txt");

      fireEvent.change(textarea, {
        target: { value: "file1.txt\nfile2.txt\nfile3.txt" },
      });
      expect(mockSetFiles).toHaveBeenCalledWith([
        "file1.txt",
        "file2.txt",
        "file3.txt",
      ]);
    });

    it("should handle empty file list", () => {
      const mockSetFiles = jest.fn();
      const { getByRole } = render(
        React.createElement(catPlugin.component, {
          files: [],
          setFiles: mockSetFiles,
        })
      );

      const textarea = getByRole("textbox");
      expect(textarea).toHaveValue("");

      fireEvent.change(textarea, {
        target: { value: "file1.txt" },
      });
      expect(mockSetFiles).toHaveBeenCalledWith(["file1.txt"]);
    });
  });
});
