import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { trPlugin } from "./trPlugin";
import { CommandNode } from "../types";

describe("trPlugin", () => {
  describe("parse", () => {
    it("should parse a simple tr command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "tr", type: "Word" },
        suffix: [
          { text: "a-z", type: "Word" },
          { text: "A-Z", type: "Word" },
        ],
      };

      const result = trPlugin.parse(command);

      expect(result).toEqual({
        type: "tr",
        flags: "",
        set1: "a-z",
        set2: "A-Z",
      });
    });

    it("should parse a tr command with flags", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "tr", type: "Word" },
        suffix: [
          { text: "-d", type: "Word" },
          { text: "[:space:]", type: "Word" },
        ],
      };

      const result = trPlugin.parse(command);

      expect(result).toEqual({
        type: "tr",
        flags: "d",
        set1: "-d",
        set2: "[:space:]",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple tr command", () => {
      const module = {
        type: "tr",
        flags: "",
        set1: "a-z",
        set2: "A-Z",
      };

      const result = trPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "tr", type: "Word" },
        suffix: [
          { type: "Word", text: "a-z" },
          { type: "Word", text: "A-Z" },
        ],
      });
    });

    it("should compile a tr command with flags", () => {
      const module = {
        type: "tr",
        flags: "d",
        set1: "[:space:]",
        set2: "",
      };

      const result = trPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "tr", type: "Word" },
        suffix: [
          { type: "Word", text: "-d" },
          { type: "Word", text: "[:space:]" },
        ],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetFlags = jest.fn();
      const mockSetSet1 = jest.fn();
      const mockSetSet2 = jest.fn();

      const { getByLabelText, getByPlaceholderText } = render(
        React.createElement(trPlugin.component, {
          flags: "",
          set1: "a-z",
          set2: "A-Z",
          setFlags: mockSetFlags,
          setSet1: mockSetSet1,
          setSet2: mockSetSet2,
        })
      );

      const deleteCheckbox = getByLabelText(
        "-d (Delete characters)"
      ) as HTMLInputElement;
      expect(deleteCheckbox).not.toBeChecked();

      const squeezeCheckbox = getByLabelText(
        "-s (Squeeze repeats)"
      ) as HTMLInputElement;
      expect(squeezeCheckbox).not.toBeChecked();

      const set1Input = getByPlaceholderText(
        "Set 1 (characters to translate from)"
      ) as HTMLInputElement;
      expect(set1Input).toHaveValue("a-z");

      const set2Input = getByPlaceholderText(
        "Set 2 (characters to translate to)"
      ) as HTMLInputElement;
      expect(set2Input).toHaveValue("A-Z");

      fireEvent.click(deleteCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("d");

      fireEvent.click(squeezeCheckbox);
      expect(mockSetFlags).toHaveBeenCalledWith("s");

      fireEvent.change(set1Input, { target: { value: "0-9" } });
      expect(mockSetSet1).toHaveBeenCalledWith("0-9");

      fireEvent.change(set2Input, { target: { value: "a-j" } });
      expect(mockSetSet2).toHaveBeenCalledWith("a-j");
    });
  });
});
