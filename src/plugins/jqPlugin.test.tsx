import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { jqPlugin } from "./jqPlugin";
import { CommandNode } from "../types";

// Mock the CodeEditor component
jest.mock("../codeEditor", () => ({
  __esModule: true,
  default: jest.fn(({ value, onChange }) => (
    <textarea
      data-testid="code-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )),
}));

describe("jqPlugin", () => {
  describe("parse", () => {
    it("should parse a simple jq command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "jq", type: "Word" },
        suffix: [{ text: "'.[] | {id: .id, name: .name}'", type: "Word" }],
      };

      const result = jqPlugin.parse(command);

      expect(result).toEqual({
        type: "jq",
        filter: ".[] | {id: .id, name: .name}",
        flags: {
          compact: false,
          raw: false,
          slurp: false,
        },
      });
    });

    it("should parse a jq command with flags", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "jq", type: "Word" },
        suffix: [
          { text: "-c", type: "Word" },
          { text: "-r", type: "Word" },
          { text: "'.[]'", type: "Word" },
        ],
      };

      const result = jqPlugin.parse(command);

      expect(result).toEqual({
        type: "jq",
        filter: ".[]",
        flags: {
          compact: true,
          raw: true,
          slurp: false,
        },
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple jq command", () => {
      const module = {
        type: "jq",
        filter: ".[] | {id: .id, name: .name}",
        flags: {
          compact: false,
          raw: false,
          slurp: false,
        },
      };

      const result = jqPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "jq", type: "Word" },
        suffix: [{ type: "Word", text: ".[] | {id: .id, name: .name}" }],
      });
    });

    it("should compile a jq command with flags", () => {
      const module = {
        type: "jq",
        filter: ".[]",
        flags: {
          compact: true,
          raw: true,
          slurp: false,
        },
      };

      const result = jqPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "jq", type: "Word" },
        suffix: [
          { type: "Word", text: "-c" },
          { type: "Word", text: "-r" },
          { type: "Word", text: ".[]" },
        ],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetFilter = jest.fn();
      const mockSetFlags = jest.fn();

      const { getByTestId, getByLabelText } = render(
        React.createElement(jqPlugin.component, {
          filter: ".[] | {id: .id, name: .name}",
          flags: {
            compact: false,
            raw: false,
            slurp: false,
          },
          setFilter: mockSetFilter,
          setFlags: mockSetFlags,
        })
      );

      const filterEditor = getByTestId("code-editor");
      expect(filterEditor).toHaveValue(".[] | {id: .id, name: .name}");

      const compactCheckbox = getByLabelText("Compact (-c)");
      const rawCheckbox = getByLabelText("Raw output (-r)");
      const slurpCheckbox = getByLabelText("Slurp (-s)");

      expect(compactCheckbox).not.toBeChecked();
      expect(rawCheckbox).not.toBeChecked();
      expect(slurpCheckbox).not.toBeChecked();

      fireEvent.change(filterEditor, { target: { value: ".[] | .name" } });
      expect(mockSetFilter).toHaveBeenCalledWith(".[] | .name");

      fireEvent.click(compactCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith(expect.objectContaining({ compact: true }));
    });
  });
});
