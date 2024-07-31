import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { tablechoPlugin, TablechoModuleType } from "./tablechoPlugin";
import { CommandNode } from "../types";

describe("tablechoPlugin", () => {
  describe("parse", () => {
    it("should parse a simple tablecho command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "tablecho", type: "Word" },
        suffix: [{ text: "'one,two,three\n1,2,3\n4,5,6'", type: "Word" }],
      };

      const result = tablechoPlugin.parse(command);

      expect(result).toEqual({
        type: "tablecho",
        data: [
          ["one", "two", "three"],
          ["1", "2", "3"],
          ["4", "5", "6"],
        ],
      });
    });

    it("should handle an empty tablecho command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "tablecho", type: "Word" },
        suffix: [],
      };

      const result = tablechoPlugin.parse(command);

      expect(result).toEqual({
        type: "tablecho",
        data: [[""]],
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple tablecho command", () => {
      const module = {
        type: "tablecho",
        data: [
          ["one", "two", "three"],
          ["1", "2", "3"],
          ["4", "5", "6"],
        ],
      };

      const result = tablechoPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "tablecho", type: "Word" },
        suffix: [{ type: "Word", text: "one,two,three\n1,2,3\n4,5,6" }],
      });
    });

  it("should handle empty data", () => {
    const module: TablechoModuleType = {
      type: "tablecho",
      data: [] as string[][],
    };

    const result = tablechoPlugin.compile(module);

    expect(result).toEqual({
      type: "Command",
      name: { text: "tablecho", type: "Word" },
      suffix: [{ type: "Word", text: "" }],
    });
  });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetData = jest.fn();
      const initialData = [
        ["one", "two"],
        ["1", "2"],
      ];

      render(
        React.createElement(tablechoPlugin.component, {
          data: initialData,
          setData: mockSetData,
        })
      );

      // Check if the initial data is rendered
      expect(screen.getByDisplayValue("one")).toBeInTheDocument();
      expect(screen.getByDisplayValue("1")).toBeInTheDocument();

      // Test adding a column
      fireEvent.click(screen.getByText("Add Column"));
      expect(mockSetData).toHaveBeenCalledWith([
        ["one", "two", ""],
        ["1", "2", ""],
      ]);

      // Test adding a row
      fireEvent.click(screen.getByText("Add Row"));
      expect(mockSetData).toHaveBeenCalledWith([
        ["one", "two"],
        ["1", "2"],
        ["", "", ""]
      ]);

      // Test updating a cell
      const firstInput = screen.getAllByRole("textbox")[0];
      fireEvent.change(firstInput, { target: { value: "new value" } });
      expect(mockSetData).toHaveBeenCalledWith([
        ["new value", "two"],
        ["1", "2"],
      ]);
    });

    it("should handle empty initial data", () => {
      const mockSetData = jest.fn();

      render(
        React.createElement(tablechoPlugin.component, {
          data: [],
          setData: mockSetData,
        })
      );

      // Check if the "Add Column" and "Add Row" buttons are rendered
      expect(screen.getByText("Add Column")).toBeInTheDocument();
      expect(screen.getByText("Add Row")).toBeInTheDocument();

      // Test adding a column to empty data
      fireEvent.click(screen.getByText("Add Column"));
      expect(mockSetData).toHaveBeenCalledWith([]);

      // Test adding a row to empty data
      fireEvent.click(screen.getByText("Add Row"));
      expect(mockSetData).toHaveBeenCalledWith([]);
    });
  });
});
