import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { xargsPlugin } from "./xargsPlugin";
import { CommandNode } from "../types";

describe("xargsPlugin", () => {
  describe("parse", () => {
    it("should parse a simple xargs command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "xargs", type: "Word" },
        suffix: [{ text: "echo", type: "Word" }],
      };

      const result = xargsPlugin.parse(command);

      expect(result).toEqual({
        type: "xargs",
        flags: "",
        command: "echo",
      });
    });

    it("should parse an xargs command with flags", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "xargs", type: "Word" },
        suffix: [
          { text: "-n1", type: "Word" },
          { text: "-I{}", type: "Word" },
          { text: "echo", type: "Word" },
          { text: "Item:", type: "Word" },
          { text: "{}", type: "Word" },
        ],
      };

      const result = xargsPlugin.parse(command);

      expect(result).toEqual({
        type: "xargs",
        flags: "-n1 -I{}",
        command: "echo Item: {}",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple xargs command", () => {
      const module = {
        type: "xargs",
        flags: "",
        command: "echo",
      };

      const result = xargsPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "xargs", type: "Word" },
        suffix: [{ type: "Word", text: "echo" }],
      });
    });

    it("should compile an xargs command with flags", () => {
      const module = {
        type: "xargs",
        flags: "-n1 -I{}",
        command: "echo Item: {}",
      };

      const result = xargsPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "xargs", type: "Word" },
        suffix: [
          { type: "Word", text: "-n1" },
          { type: "Word", text: "-I{}" },
          { type: "Word", text: "echo" },
          { type: "Word", text: "Item:" },
          { type: "Word", text: "{}" },
        ],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetFlags = jest.fn();
      const mockSetCommand = jest.fn();

      const { getByLabelText, getByPlaceholderText } = render(
        React.createElement(xargsPlugin.component, {
          flags: "-n1 -I{}",
          command: "echo Item: {}",
          setFlags: mockSetFlags,
          setCommand: mockSetCommand,
        })
      );

      const nFlagCheckbox = getByLabelText("Use -n flag") as HTMLInputElement;
      expect(nFlagCheckbox).toBeChecked();

      const nFlagInput = getByPlaceholderText("n value") as HTMLInputElement;
      expect(nFlagInput).toHaveValue("1");

      const iFlagCheckbox = getByLabelText("Use -I flag") as HTMLInputElement;
      expect(iFlagCheckbox).toBeChecked();

      const iFlagInput = getByPlaceholderText("I value") as HTMLInputElement;
      expect(iFlagInput).toHaveValue("{}");

      const commandInput = getByPlaceholderText(
        "Enter command to execute"
      ) as HTMLInputElement;
      expect(commandInput).toHaveValue("echo Item: {}");

      fireEvent.click(nFlagCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("-I{}");

      fireEvent.change(iFlagInput, { target: { value: "[]" } });
      expect(mockSetFlags).toHaveBeenCalledWith("-n1 -I[]");

      fireEvent.change(commandInput, {
        target: { value: "echo New Item: {}" },
      });
      expect(mockSetCommand).toHaveBeenCalledWith("echo New Item: {}");
    });
  });
});
