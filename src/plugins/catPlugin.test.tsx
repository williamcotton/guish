import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { catPlugin, CatModuleType } from "./catPlugin";
import { CommandNode } from "../types";

// Mock the electron API
const mockShowOpenScriptDialog = jest.fn();
window.electron = {
  showOpenScriptDialog: mockShowOpenScriptDialog,
} as any;

describe("catPlugin", () => {
  describe("parse", () => {
    it("should parse a simple cat command with file", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "cat", type: "Word" },
        suffix: [{ text: "file.txt", type: "Word" }],
      };

      const result = catPlugin.parse(command);

      expect(result).toEqual({
        type: "cat",
        file: "file.txt",
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
        file: "",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple cat command with file", () => {
      const module: CatModuleType = {
        type: "cat",
        file: "file.txt",
      };

      const result = catPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "cat", type: "Word" },
        suffix: [{ type: "Word", text: "file.txt" }],
      });
    });

    it("should handle empty file", () => {
      const module: CatModuleType = {
        type: "cat",
        file: "",
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
      const mockSetFile = jest.fn();
      const { getByPlaceholderText, getByText } = render(
        React.createElement(catPlugin.component, {
          file: "file.txt",
          setFile: mockSetFile,
        })
      );

      const input = getByPlaceholderText(
        "Enter filename or select file"
      ) as HTMLInputElement;
      expect(input.value).toBe("file.txt");

      fireEvent.change(input, { target: { value: "newfile.txt" } });
      expect(mockSetFile).toHaveBeenCalledWith("newfile.txt");

      const selectButton = getByText("Select File");
      expect(selectButton).toBeInTheDocument();
    });

    it("should handle file selection", async () => {
      mockShowOpenScriptDialog.mockResolvedValue({
        canceled: false,
        filePaths: ["/path/to/selected_file.txt"],
      });

      const mockSetFile = jest.fn();
      const { getByText } = render(
        React.createElement(catPlugin.component, {
          file: "",
          setFile: mockSetFile,
        })
      );

      const selectButton = getByText("Select File");
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(mockShowOpenScriptDialog).toHaveBeenCalled();
        expect(mockSetFile).toHaveBeenCalledWith("/path/to/selected_file.txt");
      });
    });
  });
});
