import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { genericPlugin } from "./genericPlugin";
import { CommandNode } from "../types";

describe("genericPlugin", () => {
  describe("parse", () => {
    it("should parse a simple command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "echo", type: "Word" },
        suffix: [{ text: "Hello, World!", type: "Word" }],
      };

      const result = genericPlugin.parse(command);

      expect(result).toEqual({
        type: "generic",
        command: "echo",
        args: "Hello, World!",
      });
    });

    it("should parse a command with multiple arguments", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "ls", type: "Word" },
        suffix: [
          { text: "-l", type: "Word" },
          { text: "-a", type: "Word" },
          { text: "/home", type: "Word" },
        ],
      };

      const result = genericPlugin.parse(command);

      expect(result).toEqual({
        type: "generic",
        command: "ls",
        args: "-l -a /home",
      });
    });

    it("should handle a command with no arguments", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "pwd", type: "Word" },
        suffix: [],
      };

      const result = genericPlugin.parse(command);

      expect(result).toEqual({
        type: "generic",
        command: "pwd",
        args: "",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple command", () => {
      const module = {
        type: "generic",
        command: "echo",
        args: "Hello, World!",
      };

      const result = genericPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "echo", type: "Word" },
        suffix: [
          { type: "Word", text: "Hello," },
          { type: "Word", text: "World!" },
        ],
      });
    });

    it("should compile a command with multiple arguments", () => {
      const module = {
        type: "generic",
        command: "ls",
        args: "-l -a /home",
      };

      const result = genericPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "ls", type: "Word" },
        suffix: [
          { type: "Word", text: "-l" },
          { type: "Word", text: "-a" },
          { type: "Word", text: "/home" },
        ],
      });
    });

    it("should handle a command with no arguments", () => {
      const module = {
        type: "generic",
        command: "pwd",
        args: "",
      };

      const result = genericPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "pwd", type: "Word" },
        suffix: [],
      });
    });
  });

  describe("component", () => {
    it("should render correctly with command and args", () => {
      const { getByText } = render(
        React.createElement(genericPlugin.component, {
          command: "echo",
          args: "Hello, World!",
        })
      );

      expect(getByText("echo")).toBeInTheDocument();
      expect(getByText("Hello, World!")).toBeInTheDocument();
    });

    it("should render correctly with only command", () => {
      const { getByText, queryByText } = render(
        React.createElement(genericPlugin.component, {
          command: "pwd",
          args: "",
        })
      );

      expect(getByText("pwd")).toBeInTheDocument();
      expect(queryByText("args")).not.toBeInTheDocument();
    });
  });
});