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
    it("should parse a simple tee command with file", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "tee", type: "Word" },
        suffix: [{ text: "output.txt", type: "Word" }],
      };

      const result = teePlugin.parse(command);

      expect(result).toEqual({
        type: "tee",
        flags: "",
        redirect: { type: "file", target: "output.txt" },
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
        redirect: { type: "file", target: "output.txt" },
      });
    });

    it("should parse a tee command with command redirection", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "tee", type: "Word" },
        suffix: [{ text: ">(sort)", type: "Word" }],
      };

      const result = teePlugin.parse(command);

      expect(result).toEqual({
        type: "tee",
        flags: "",
        redirect: { type: "command", target: "sort" },
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple tee command with file", () => {
      const module = {
        type: "tee",
        flags: "",
        redirect: { type: "file", target: "output.txt" },
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
        redirect: { type: "file", target: "output.txt" },
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

    it("should compile a tee command with command redirection", () => {
      const module = {
        type: "tee",
        flags: "",
        redirect: { type: "command", target: "sort" },
      };

      const result = teePlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "tee", type: "Word" },
        suffix: [{ type: "Word", text: ">(sort)", quoteChar: "" }],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly for file redirection", async () => {
      const mockSetFlags = jest.fn();
      const mockSetRedirect = jest.fn();

      const { getByLabelText, getByPlaceholderText, getByText } = render(
        React.createElement(teePlugin.component, {
          flags: "",
          redirect: { type: "file", target: "output.txt" },
          setFlags: mockSetFlags,
          setRedirect: mockSetRedirect,
        })
      );

      const appendCheckbox = getByLabelText(
        "-a (Append to file)"
      ) as HTMLInputElement;
      expect(appendCheckbox).not.toBeChecked();

      const targetInput = getByPlaceholderText(
        "Enter filename or select file"
      ) as HTMLInputElement;
      expect(targetInput).toHaveValue("output.txt");

      fireEvent.click(appendCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("a");

      fireEvent.change(targetInput, { target: { value: "new_output.txt" } });
      expect(mockSetRedirect).toHaveBeenCalledWith({
        type: "file",
        target: "new_output.txt",
      });

      // Test file selection button
      mockShowSaveDialog.mockResolvedValue({
        filePath: "/path/to/selected_file.txt",
      });
      const selectButton = getByText("Select File");
      fireEvent.click(selectButton);

      // Wait for the async operation to complete
      await waitFor(() => {
        expect(mockSetRedirect).toHaveBeenCalledWith({
          type: "file",
          target: "/path/to/selected_file.txt",
        });
      });
    });

    it("should render and update correctly for command redirection", () => {
      const mockSetFlags = jest.fn();
      const mockSetRedirect = jest.fn();

      const { getByLabelText, getByPlaceholderText, queryByText } = render(
        React.createElement(teePlugin.component, {
          flags: "",
          redirect: { type: "command", target: "sort" },
          setFlags: mockSetFlags,
          setRedirect: mockSetRedirect,
        })
      );

      const typeSelect = getByLabelText("Redirect type:") as HTMLSelectElement;
      expect(typeSelect.value).toBe("command");

      const targetInput = getByPlaceholderText(
        "Enter command"
      ) as HTMLInputElement;
      expect(targetInput).toHaveValue("sort");

      fireEvent.change(typeSelect, { target: { value: "file" } });
      expect(mockSetRedirect).toHaveBeenCalledWith({
        type: "file",
        target: "sort",
      });

      fireEvent.change(targetInput, { target: { value: "grep pattern" } });
      expect(mockSetRedirect).toHaveBeenCalledWith({
        type: "command",
        target: "grep pattern",
      });

      // Ensure "Select File" button is not present for command redirection
      expect(queryByText("Select File")).not.toBeInTheDocument();
    });
  });
});
