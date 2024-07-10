import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { pgPlugin } from "./pgPlugin";
import { CommandNode } from "../types";

// Mock the CodeEditor component
jest.mock("../codeEditor", () => ({
  __esModule: true,
  default: jest.fn(({ value, onChange }) => (
    <textarea
      data-testid="query-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )),
}));

describe("pgPlugin", () => {
  describe("parse", () => {
    it("should parse a simple pg command", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "pg", type: "Word" },
        suffix: [
          { text: "-d", type: "Word" },
          { text: "mydb", type: "Word" },
          { text: "-c", type: "Word" },
          { text: "SELECT * FROM users", type: "Word" },
        ],
      };

      const result = pgPlugin.parse(command);

      expect(result).toEqual({
        type: "pg",
        database: "mydb",
        query: "SELECT * FROM users",
      });
    });

    it("should handle missing database", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "pg", type: "Word" },
        suffix: [
          { text: "-c", type: "Word" },
          { text: "SELECT * FROM users", type: "Word" },
        ],
      };

      const result = pgPlugin.parse(command);

      expect(result).toEqual({
        type: "pg",
        database: "",
        query: "SELECT * FROM users",
      });
    });

    it("should handle missing query", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "pg", type: "Word" },
        suffix: [
          { text: "-d", type: "Word" },
          { text: "mydb", type: "Word" },
        ],
      };

      const result = pgPlugin.parse(command);

      expect(result).toEqual({
        type: "pg",
        database: "mydb",
        query: "",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple pg command", () => {
      const module = {
        type: "pg",
        database: "mydb",
        query: "SELECT * FROM users",
      };

      const result = pgPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "pg", type: "Word" },
        suffix: [
          { type: "Word", text: "-d" },
          { type: "Word", text: "mydb" },
          { type: "Word", text: "-c" },
          { type: "Word", text: "SELECT * FROM users" },
        ],
      });
    });

    it("should handle empty database", () => {
      const module = {
        type: "pg",
        database: "",
        query: "SELECT * FROM users",
      };

      const result = pgPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "pg", type: "Word" },
        suffix: [
          { type: "Word", text: "-c" },
          { type: "Word", text: "SELECT * FROM users" },
        ],
      });
    });

    it("should handle empty query", () => {
      const module = {
        type: "pg",
        database: "mydb",
        query: "",
      };

      const result = pgPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "pg", type: "Word" },
        suffix: [
          { type: "Word", text: "-d" },
          { type: "Word", text: "mydb" },
        ],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetDatabase = jest.fn();
      const mockSetQuery = jest.fn();
      const { getByLabelText, getByTestId } = render(
        React.createElement(pgPlugin.component, {
          database: "mydb",
          query: "SELECT * FROM users",
          setDatabase: mockSetDatabase,
          setQuery: mockSetQuery,
        })
      );

      const databaseInput = getByLabelText("Database");
      expect(databaseInput).toHaveValue("mydb");

      const queryEditor = getByTestId("query-editor");
      expect(queryEditor).toHaveValue("SELECT * FROM users");

      fireEvent.change(databaseInput, { target: { value: "newdb" } });
      expect(mockSetDatabase).toHaveBeenCalledWith("newdb");

      fireEvent.change(queryEditor, {
        target: { value: "SELECT * FROM products" },
      });
      expect(mockSetQuery).toHaveBeenCalledWith("SELECT * FROM products");
    });
  });
});
