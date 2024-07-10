import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { teePlugin } from "./teePlugin";
import { CommandNode } from "../types";

// Mock the electron API
const mockShowSaveDialog = jest.fn();
window.electron = {
  showSaveDialog: mockShowSaveDialog,
} as any;

describe("teePlugin", () => {
  describe("parse", () => {
    it("should parse a simple tee command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "tee", type: "Word" },
        suffix: [{ text: "output.txt", type: "Word" }],
      };

      const result = teePlugin.parse(command);

      expect(result).toEqual({
        type: "tee",
        flags: "",
        file: "output.txt",
      });
    });

    it("should parse a tee command with append flag", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "tee", type: "Word" },
        suffix: [
          { text: "-a", type: "Word" },
          { text: "output.txt", type: "Word" },
        ],
      };

      const result = teePlugin.parse(command);

      expect(result).toEqual({
        type: "tee",
        flags: "a",
        file: "output.txt",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple tee command", () => {
      const module = {
        type: "tee",
        flags: "",
        file: "output.txt",
      };

      const result = teePlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "tee", type: "Word" },
        suffix: [{ type: "Word", text: "output.txt" }],
      });
    });

    it("should compile a tee command with append flag", () => {
      const module = {
        type: "tee",
        flags: "a",
        file: "output.txt",
      };

      const result = teePlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "tee", type: "Word" },
        suffix: [
          { type: "Word", text: "-a" },
          { type: "Word", text: "output.txt" },
        ],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", async () => {
      const mockSetFlags = jest.fn();
      const mockSetFile = jest.fn();

      const { getByLabelText, getByPlaceholderText, getByText } = render(
        React.createElement(teePlugin.component, {
          flags: "",
          file: "output.txt",
          setFlags: mockSetFlags,
          setFile: mockSetFile,
        })
      );

      const appendCheckbox = getByLabelText(
        "-a (Append to file)"
      ) as HTMLInputElement;
      expect(appendCheckbox).not.toBeChecked();

      const fileInput = getByPlaceholderText(
        "Enter filename or select file"
      ) as HTMLInputElement;
      expect(fileInput).toHaveValue("output.txt");

      fireEvent.click(appendCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("a");

      fireEvent.change(fileInput, { target: { value: "new_output.txt" } });
      expect(mockSetFile).toHaveBeenCalledWith("new_output.txt");

      // Test file selection button
      mockShowSaveDialog.mockResolvedValue({
        filePath: "/path/to/selected_file.txt",
      });
      const selectButton = getByText("Select File");
      fireEvent.click(selectButton);

      // Wait for the async operation to complete
      await waitFor(() => {
        expect(mockSetFile).toHaveBeenCalledWith("/path/to/selected_file.txt");
      });
    });
  });
});
