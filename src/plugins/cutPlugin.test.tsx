import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { cutPlugin, CutModuleType } from "./cutPlugin";
import { CommandNode } from "../types";


describe("cutPlugin", () => {
  describe("parse", () => {
    it("should parse a simple cut command with delimiter and fields", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "cut", type: "Word" },
        suffix: [
          { text: "-d,", type: "Word" },
          { text: "-f1,3", type: "Word" },
        ],
      };

      const result = cutPlugin.parse(command);

      expect(result).toEqual({
        type: "cut",
        delimiter: ",",
        fields: "1,3",
      });
    });

    it("should parse a cut command with only fields", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "cut", type: "Word" },
        suffix: [
          { text: "-f1-3", type: "Word" },
        ],
      };

      const result = cutPlugin.parse(command);

      expect(result).toEqual({
        type: "cut",
        delimiter: "",
        fields: "1-3",
      });
    });

    it("should handle an empty cut command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "cut", type: "Word" },
        suffix: [],
      };

      const result = cutPlugin.parse(command);

      expect(result).toEqual({
        type: "cut",
        delimiter: "",
        fields: "",
      });
    });
  });

  describe("compile", () => {
    it("should compile a cut command with delimiter and fields", () => {
      const module: CutModuleType = {
        type: "cut",
        delimiter: ",",
        fields: "1,3",
      };

      const result = cutPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "cut", type: "Word" },
        suffix: [
          { type: "Word", text: "-d," },
          { type: "Word", text: "-f1,3" },
        ],
      });
    });

    it("should compile a cut command with only fields", () => {
      const module: CutModuleType = {
        type: "cut",
        delimiter: "",
        fields: "1-3",
      };

      const result = cutPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "cut", type: "Word" },
        suffix: [
          { type: "Word", text: "-f1-3" },
        ],
      });
    });

    it("should handle empty delimiter and fields", () => {
      const module: CutModuleType = {
        type: "cut",
        delimiter: "",
        fields: "",
      };

      const result = cutPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "cut", type: "Word" },
        suffix: [],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetDelimiter = jest.fn();
      const mockSetFields = jest.fn();

      const { getByLabelText } = render(
        React.createElement(cutPlugin.component, {
          delimiter: ",",
          fields: "1,3",
          setDelimiter: mockSetDelimiter,
          setFields: mockSetFields,
        })
      );

      const delimiterInput = getByLabelText("Delimiter") as HTMLInputElement;
      expect(delimiterInput.value).toBe(",");

      const fieldsInput = getByLabelText("Fields") as HTMLInputElement;
      expect(fieldsInput.value).toBe("1,3");

      fireEvent.change(delimiterInput, { target: { value: ":" } });
      expect(mockSetDelimiter).toHaveBeenCalledWith(":");

      fireEvent.change(fieldsInput, { target: { value: "1-3" } });
      expect(mockSetFields).toHaveBeenCalledWith("1-3");
    });
  });
});
