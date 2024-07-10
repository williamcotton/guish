import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { cdPlugin } from "./cdPlugin";
import { CommandNode } from "../types";

// Mock the electron API
const mockShowDirectoryDialog = jest.fn();
window.electron = {
  showDirectoryDialog: mockShowDirectoryDialog,
} as any;

describe("cdPlugin", () => {
  describe("parse", () => {
    it("should parse a simple cd command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "cd", type: "Word" },
        suffix: [{ text: "/home/user", type: "Word" }],
      };

      const result = cdPlugin.parse(command);

      expect(result).toEqual({
        type: "cd",
        path: "/home/user",
      });
    });

    it("should handle an empty cd command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "cd", type: "Word" },
        suffix: [],
      };

      const result = cdPlugin.parse(command);

      expect(result).toEqual({
        type: "cd",
        path: "",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple cd command", () => {
      const module = {
        type: "cd",
        path: "/home/user",
      };

      const result = cdPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "cd", type: "Word" },
        suffix: [{ type: "Word", text: "/home/user" }],
      });
    });

    it("should handle an empty path", () => {
      const module = {
        type: "cd",
        path: "",
      };

      const result = cdPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "cd", type: "Word" },
        suffix: [],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetPath = jest.fn();
      const { getByPlaceholderText, getByText } = render(
        React.createElement(cdPlugin.component, {
          path: "/home/user",
          setPath: mockSetPath,
        })
      );

      const input = getByPlaceholderText("Enter directory path or select directory");
      expect(input).toHaveValue("/home/user");

      fireEvent.change(input, { target: { value: "/home/user/documents" } });
      expect(mockSetPath).toHaveBeenCalledWith("/home/user/documents");

      const button = getByText("Select Directory");
      expect(button).toBeInTheDocument();
    });

    it("should handle directory selection", async () => {
      mockShowDirectoryDialog.mockResolvedValue({
        canceled: false,
        filePaths: ["/selected/directory"],
      });

      const mockSetPath = jest.fn();
      const { getByText } = render(
        React.createElement(cdPlugin.component, {
          path: "",
          setPath: mockSetPath,
        })
      );

      const button = getByText("Select Directory");
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockShowDirectoryDialog).toHaveBeenCalledWith({
          title: "Select Directory",
          properties: ["openDirectory"],
        });
        expect(mockSetPath).toHaveBeenCalledWith("/selected/directory");
      });
    });
  });
});
