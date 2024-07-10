import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { awkPlugin } from "./awkPlugin";
import { CommandNode } from "../types";

// Mock the CodeEditor component
jest.mock("../codeEditor", () => ({
  __esModule: true,
  default: jest.fn(({ value, onChange }) => (
    <textarea
      data-testid="program-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )),
}));

describe("awkPlugin", () => {
  describe("parse", () => {
    it("should parse a simple awk command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "awk", type: "Word" },
        suffix: [
          { text: "-F,", type: "Word" },
          { text: "{print $1}", type: "Word" },
        ],
      };

      const result = awkPlugin.parse(command);

      expect(result).toEqual({
        type: "awk",
        program: "{print $1}",
        fieldSeparator: ",",
      });
    });

    it("should handle missing field separator", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "awk", type: "Word" },
        suffix: [
          { text: "{print $1}", type: "Word" },
        ],
      };

      const result = awkPlugin.parse(command);

      expect(result).toEqual({
        type: "awk",
        program: "{print $1}",
        fieldSeparator: "",
      });
    });

    it("should handle complex awk programs", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "awk", type: "Word" },
        suffix: [
          { text: "-F:", type: "Word" },
          { text: "BEGIN {print \"Start\"} {print $1, $2} END {print \"End\"}", type: "Word" },
        ],
      };

      const result = awkPlugin.parse(command);

      expect(result).toEqual({
        type: "awk",
        program: "BEGIN {print \"Start\"} {print $1, $2} END {print \"End\"}",
        fieldSeparator: ":",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple awk command", () => {
      const module = {
        type: "awk",
        program: "{print $1}",
        fieldSeparator: ",",
      };

      const result = awkPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "awk", type: "Word" },
        suffix: [
          { type: "Word", text: "-F," },
          { type: "Word", text: "{print $1}" },
        ],
      });
    });

    it("should handle empty field separator", () => {
      const module = {
        type: "awk",
        program: "{print $1, $2}",
        fieldSeparator: "",
      };

      const result = awkPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "awk", type: "Word" },
        suffix: [
          { type: "Word", text: "{print $1, $2}" },
        ],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetProgram = jest.fn();
      const mockSetFieldSeparator = jest.fn();
      const { getByLabelText, getByTestId } = render(
        React.createElement(awkPlugin.component, {
          program: "{print $1}",
          fieldSeparator: ",",
          setProgram: mockSetProgram,
          setFieldSeparator: mockSetFieldSeparator,
        })
      );

      const fieldSeparatorInput = getByLabelText("Field Separator:");
      expect(fieldSeparatorInput).toHaveValue(",");

      const programEditor = getByTestId("program-editor");
      expect(programEditor).toHaveValue("{print $1}");

      fireEvent.change(fieldSeparatorInput, { target: { value: ":" } });
      expect(mockSetFieldSeparator).toHaveBeenCalledWith(":");

      fireEvent.change(programEditor, {
        target: { value: "{print $1, $2}" },
      });
      expect(mockSetProgram).toHaveBeenCalledWith("{print $1, $2}");
    });
  });
});
