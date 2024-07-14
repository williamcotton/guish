import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { assignmentPlugin, AssignmentModuleType } from "./assignmentPlugin";
import { CommandNode } from "../types";

describe("assignmentPlugin", () => {
  describe("parse", () => {
    it("should parse a single assignment command", () => {
      const command: CommandNode = {
        type: "Command",
        prefix: [
          {
            type: "AssignmentWord",
            text: "TEST_VAR=123",
          },
        ],
      };

      const result = assignmentPlugin.parse(command);

      expect(result).toEqual({
        type: "assignment",
        variable: "TEST_VAR",
        value: "123",
      });
    });

    it("should handle empty assignment", () => {
      const command: CommandNode = {
        type: "Command",
        prefix: [
          {
            type: "AssignmentWord",
            text: "EMPTY_VAR=",
          },
        ],
      };

      const result = assignmentPlugin.parse(command);

      expect(result).toEqual({
        type: "assignment",
        variable: "EMPTY_VAR",
        value: "",
      });
    });
  });

  describe("compile", () => {
    it("should compile an assignment module", () => {
      const module: AssignmentModuleType = {
        type: "assignment",
        variable: "TEST_VAR",
        value: "123",
      };

      const result = assignmentPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        prefix: [
          {
            type: "AssignmentWord",
            text: "TEST_VAR=123",
          },
        ],
      });
    });

    it("should handle empty value in compile", () => {
      const module: AssignmentModuleType = {
        type: "assignment",
        variable: "EMPTY_VAR",
        value: "",
      };

      const result = assignmentPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        prefix: [
          {
            type: "AssignmentWord",
            text: "EMPTY_VAR=",
          },
        ],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetVariable = jest.fn();
      const mockSetValue = jest.fn();

      const { getByPlaceholderText } = render(
        React.createElement(assignmentPlugin.component, {
          type: "assignment",
          variable: "TEST_VAR",
          value: "123",
          setVariable: mockSetVariable,
          setValue: mockSetValue,
        })
      );

      const variableInput = getByPlaceholderText(
        "Variable"
      ) as HTMLInputElement;
      const valueInput = getByPlaceholderText("Value") as HTMLInputElement;

      expect(variableInput.value).toBe("TEST_VAR");
      expect(valueInput.value).toBe("123");

      fireEvent.change(variableInput, { target: { value: "NEW_VAR" } });
      expect(mockSetVariable).toHaveBeenCalledWith("NEW_VAR");

      fireEvent.change(valueInput, { target: { value: "456" } });
      expect(mockSetValue).toHaveBeenCalledWith("456");
    });

    it("should display the assignment title", () => {
      const { getByText } = render(
        React.createElement(assignmentPlugin.component, {
          type: "assignment",
          variable: "TEST_VAR",
          value: "123",
          setVariable: jest.fn(),
          setValue: jest.fn(),
        })
      );

      expect(getByText("Assignment")).toBeInTheDocument();
    });
  });
});
