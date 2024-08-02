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
        hostname: "",
        user: "",
        port: "",
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
        hostname: "",
        user: "",
        port: "",
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
        hostname: "",
        user: "",
        port: "",
      });
    });

    it("should parse a pg command with hostname, user, and port", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "pg", type: "Word" },
        suffix: [
          { text: "-d", type: "Word" },
          { text: "mydb", type: "Word" },
          { text: "-c", type: "Word" },
          { text: "SELECT * FROM users", type: "Word" },
          { text: "-h", type: "Word" },
          { text: "localhost", type: "Word" },
          { text: "-U", type: "Word" },
          { text: "user", type: "Word" },
          { text: "-W", type: "Word" },
          { text: "-p", type: "Word" },
          { text: "5432", type: "Word" },
        ],
      };

      const result = pgPlugin.parse(command);

      expect(result).toEqual({
        type: "pg",
        database: "mydb",
        query: "SELECT * FROM users",
        hostname: "localhost",
        user: "user",
        port: "5432",
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple pg command", () => {
      const module = {
        type: "pg",
        database: "mydb",
        query: "SELECT * FROM users",
        hostname: "",
        user: "",
        port: "",
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
        hostname: "",
        user: "",
        port: "",
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
        hostname: "",
        user: "",
        port: "",
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

    it("should compile a pg command with hostname, user, and port", () => {
      const module = {
        type: "pg",
        database: "mydb",
        query: "SELECT * FROM users",
        hostname: "localhost",
        user: "user",
        port: "5432",
      };

      const result = pgPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "pg", type: "Word" },
        suffix: [
          { type: "Word", text: "-d" },
          { type: "Word", text: "mydb" },
          { type: "Word", text: "-h" },
          { type: "Word", text: "localhost" },
          { type: "Word", text: "-U" },
          { type: "Word", text: "user" },
          { type: "Word", text: "-p" },
          { type: "Word", text: "5432" },
          { type: "Word", text: "-c" },
          { type: "Word", text: "SELECT * FROM users" },
        ],
      });
    });
  });

  describe("component", () => {
    it("should render and update correctly", () => {
      const mockSetDatabase = jest.fn();
      const mockSetQuery = jest.fn();
      const mockSetHostname = jest.fn();
      const mockSetUser = jest.fn();
      const mockSetPort = jest.fn();
      const { getByLabelText, getByTestId, getByText } = render(
        React.createElement(pgPlugin.component, {
          database: "mydb",
          query: "SELECT * FROM users",
          hostname: "localhost",
          user: "user",
          port: "5432",
          setDatabase: mockSetDatabase,
          setQuery: mockSetQuery,
          setHostname: mockSetHostname,
          setUser: mockSetUser,
          setPort: mockSetPort,
        })
      );

      const showSettingsButton = getByText("Show Settings");
      fireEvent.click(showSettingsButton);

      const databaseInput = getByLabelText("Database");
      expect(databaseInput).toHaveValue("mydb");

      const queryEditor = getByTestId("query-editor");
      expect(queryEditor).toHaveValue("SELECT * FROM users");

      const hostnameInput = getByLabelText("Hostname");
      expect(hostnameInput).toHaveValue("localhost");

      const userInput = getByLabelText("User");
      expect(userInput).toHaveValue("user");

      const portInput = getByLabelText("Port");
      expect(portInput).toHaveValue("5432");

      fireEvent.change(databaseInput, { target: { value: "newdb" } });
      expect(mockSetDatabase).toHaveBeenCalledWith("newdb");

      fireEvent.change(queryEditor, {
        target: { value: "SELECT * FROM products" },
      });
      expect(mockSetQuery).toHaveBeenCalledWith("SELECT * FROM products");

      fireEvent.change(hostnameInput, { target: { value: "newhost" } });
      expect(mockSetHostname).toHaveBeenCalledWith("newhost");

      fireEvent.change(userInput, { target: { value: "newuser" } });
      expect(mockSetUser).toHaveBeenCalledWith("newuser");

      fireEvent.change(portInput, { target: { value: "1234" } });
      expect(mockSetPort).toHaveBeenCalledWith("1234");
    });
  });
});
