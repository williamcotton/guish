import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { sedPlugin } from "./sedPlugin";
import { CommandNode } from "../types";

describe("sedPlugin", () => {
  describe("parse", () => {
    it("should parse a simple sed command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "sed", type: "Word" },
        suffix: [{ text: "s/foo/bar/g", type: "Word" }],
      };

      const result = sedPlugin.parse(command);

      expect(result).toEqual({
        type: "sed",
        script: "s/foo/bar/g",
        flags: "",
      });
    });

    it("should parse a sed command with flags", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "sed", type: "Word" },
        suffix: [
          { text: "-i", type: "Word" },
          { text: "s/foo/bar/g", type: "Word" },
        ],
      };

      const result = sedPlugin.parse(command);

      expect(result).toEqual({
        type: "sed",
        script: "s/foo/bar/g",
        flags: "i",
      });
    });

    it("should handle an empty sed command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "sed", type: "Word" },
        suffix: [],
      };

      const result = sedPlugin.parse(command);

      expect(result).toEqual({
        type: "sed",
        script: "",
        flags: "",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple sed command", () => {
      const module = {
        type: "sed",
        script: "s/foo/bar/g",
        flags: "",
      };

      const result = sedPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "sed", type: "Word" },
        suffix: [{ type: "Word", text: "s/foo/bar/g" }],
      });
    });

    it("should compile a sed command with flags", () => {
      const module = {
        type: "sed",
        script: "s/foo/bar/g",
        flags: "i",
      };

      const result = sedPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "sed", type: "Word" },
        suffix: [
          { type: "Word", text: "-i" },
          { type: "Word", text: "s/foo/bar/g" },
        ],
      });
    });

    it("should handle empty script", () => {
      const module = {
        type: "sed",
        script: "",
        flags: "",
      };

      const result = sedPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "sed", type: "Word" },
        suffix: [],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetScript = jest.fn();
      const mockSetFlags = jest.fn();

      const { getByPlaceholderText } = render(
        React.createElement(sedPlugin.component, {
          script: "s/foo/bar/g",
          flags: "",
          setScript: mockSetScript,
          setFlags: mockSetFlags,
        })
      );

      const scriptInput = getByPlaceholderText("Enter sed script (e.g., s/foo/bar/)");
      expect(scriptInput).toHaveValue("s/foo/bar/g");

      fireEvent.change(scriptInput, { target: { value: "s/hello/world/g" } });
      expect(mockSetScript).toHaveBeenCalledWith("s/hello/world/g");
    });
  });
});
