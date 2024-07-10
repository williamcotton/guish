import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { headPlugin } from "./headPlugin";
import { CommandNode } from "../types";

describe("headPlugin", () => {
  describe("parse", () => {
    it("should parse a head command with specified number of lines", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "head", type: "Word" },
        suffix: [{ text: "-n5", type: "Word" }],
      };

      const result = headPlugin.parse(command);

      expect(result).toEqual({
        type: "head",
        lines: "5",
      });
    });

    it("should parse a head command without specified number of lines", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "head", type: "Word" },
        suffix: [],
      };

      const result = headPlugin.parse(command);

      expect(result).toEqual({
        type: "head",
        lines: "10", // Default value
      });
    });
  });

  describe("compile", () => {
    it("should compile a head command with specified number of lines", () => {
      const module = {
        type: "head",
        lines: "5",
      };

      const result = headPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "head", type: "Word" },
        suffix: [{ type: "Word", text: "-n5" }],
      });
    });

    it("should compile a head command with default number of lines", () => {
      const module = {
        type: "head",
        lines: "10",
      };

      const result = headPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "head", type: "Word" },
        suffix: [{ type: "Word", text: "-n10" }],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetLines = jest.fn();

      const { getByLabelText, getByText } = render(
        React.createElement(headPlugin.component, {
          lines: "5",
          setLines: mockSetLines,
        })
      );

      // Check if the component title is rendered
      expect(getByText("head")).toBeInTheDocument();

      // Check if the input field is rendered with the correct value
      const input = getByLabelText("Number of lines:") as HTMLInputElement;
      expect(input).toHaveValue(5);

      // Simulate changing the input value
      fireEvent.change(input, { target: { value: "15" } });
      expect(mockSetLines).toHaveBeenCalledWith("15");
    });

    it("should not allow negative numbers", () => {
      const mockSetLines = jest.fn();

      const { getByLabelText } = render(
        React.createElement(headPlugin.component, {
          lines: "5",
          setLines: mockSetLines,
        })
      );

      const input = getByLabelText("Number of lines:") as HTMLInputElement;

      // Attempt to set a negative number
      fireEvent.change(input, { target: { value: "-5" } });

      // The setLines function should not be called with a negative number
      expect(mockSetLines).not.toHaveBeenCalled();
      expect(input).toHaveValue(5); // The input value should remain unchanged
    });

    it("should allow clearing the input", () => {
      const mockSetLines = jest.fn();

      const { getByLabelText } = render(
        React.createElement(headPlugin.component, {
          lines: "5",
          setLines: mockSetLines,
        })
      );

      const input = getByLabelText("Number of lines:") as HTMLInputElement;

      // Simulate clearing the input
      fireEvent.change(input, { target: { value: "" } });

      // The setLines function should be called with an empty string
      expect(mockSetLines).toHaveBeenCalledWith("");
    });
  });
});
