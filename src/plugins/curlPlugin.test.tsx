import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { curlPlugin, CurlModuleType } from "./curlPlugin";
import { CommandNode } from "../types";

describe("curlPlugin", () => {
  describe("parse", () => {
    it("should parse a simple GET request", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "curl", type: "Word" },
        suffix: [{ text: "https://api.example.com", type: "Word" }],
      };

      const result = curlPlugin.parse(command);

      expect(result).toEqual({
        type: "curl",
        url: "https://api.example.com",
        method: "GET",
        headers: [],
        data: "",
        options: {
          silent: false,
          insecure: false,
          compressed: false,
          location: false,
        },
      });
    });

    it("should parse a POST request with data and headers", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "curl", type: "Word" },
        suffix: [
          { text: "-X", type: "Word" },
          { text: "POST", type: "Word" },
          { text: "-H", type: "Word" },
          { text: "Content-Type: application/json", type: "Word" },
          { text: "-d", type: "Word" },
          { text: '{"key":"value"}', type: "Word" },
          { text: "https://api.example.com", type: "Word" },
        ],
      };

      const result = curlPlugin.parse(command);

      expect(result).toEqual({
        type: "curl",
        url: "https://api.example.com",
        method: "POST",
        headers: ["Content-Type: application/json"],
        data: '{"key":"value"}',
        options: {
          silent: false,
          insecure: false,
          compressed: false,
          location: false,
        },
      });
    });

    it("should parse a request with all options", () => {
      const command: CommandNode = {
        type: "Command",
        name: { text: "curl", type: "Word" },
        suffix: [
          { text: "-s", type: "Word" },
          { text: "-k", type: "Word" },
          { text: "--compressed", type: "Word" },
          { text: "-L", type: "Word" },
          { text: "https://api.example.com", type: "Word" },
        ],
      };

      const result = curlPlugin.parse(command);

      expect(result).toEqual({
        type: "curl",
        url: "https://api.example.com",
        method: "GET",
        headers: [],
        data: "",
        options: {
          silent: true,
          insecure: true,
          compressed: true,
          location: true,
        },
      });
    });
  });

  describe("compile", () => {
    it("should compile a simple GET request", () => {
      const module: CurlModuleType = {
        type: "curl",
        url: "https://api.example.com",
        method: "GET",
        headers: [],
        data: "",
        options: {
          silent: false,
          insecure: false,
          compressed: false,
          location: false,
        },
      };

      const result = curlPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "curl", type: "Word" },
        suffix: [{ type: "Word", text: "https://api.example.com" }],
      });
    });

    it("should compile a POST request with data and headers", () => {
      const module: CurlModuleType = {
        type: "curl",
        url: "https://api.example.com",
        method: "POST",
        headers: ["Content-Type: application/json"],
        data: '{"key":"value"}',
        options: {
          silent: false,
          insecure: false,
          compressed: false,
          location: false,
        },
      };

      const result = curlPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "curl", type: "Word" },
        suffix: [
          { type: "Word", text: "-X" },
          { type: "Word", text: "POST" },
          { type: "Word", text: "-H" },
          { type: "Word", text: '"Content-Type: application/json"' },
          { type: "Word", text: "-d" },
          { type: "Word", text: "'{\"key\":\"value\"}'" },
          { type: "Word", text: "https://api.example.com" },
        ],
      });
    });

    it("should compile a request with all options", () => {
      const module: CurlModuleType = {
        type: "curl",
        url: "https://api.example.com",
        method: "GET",
        headers: [],
        data: "",
        options: {
          silent: true,
          insecure: true,
          compressed: true,
          location: true,
        },
      };

      const result = curlPlugin.compile(module);

      expect(result).toEqual({
        type: "Command",
        name: { text: "curl", type: "Word" },
        suffix: [
          { type: "Word", text: "-s" },
          { type: "Word", text: "-k" },
          { type: "Word", text: "--compressed" },
          { type: "Word", text: "-L" },
          { type: "Word", text: "https://api.example.com" },
        ],
      });
    });
  });

  describe("component", () => {
    it("should render and update URL correctly", () => {
      const mockSetUrl = jest.fn();
      const { getByLabelText } = render(
        React.createElement(curlPlugin.component, {
          url: "https://api.example.com",
          method: "GET",
          headers: [],
          data: "",
          options: {
            silent: false,
            insecure: false,
            compressed: false,
            location: false,
          },
          setUrl: mockSetUrl,
          setMethod: jest.fn(),
          setHeaders: jest.fn(),
          setData: jest.fn(),
          setOptions: jest.fn(),
        })
      );

      const urlInput = getByLabelText("URL") as HTMLInputElement;
      expect(urlInput.value).toBe("https://api.example.com");

      fireEvent.change(urlInput, {
        target: { value: "https://new-api.example.com" },
      });
      expect(mockSetUrl).toHaveBeenCalledWith("https://new-api.example.com");
    });

    it("should render and update method correctly", () => {
      const mockSetMethod = jest.fn();
      const { getByLabelText } = render(
        React.createElement(curlPlugin.component, {
          url: "https://api.example.com",
          method: "GET",
          headers: [],
          data: "",
          options: {
            silent: false,
            insecure: false,
            compressed: false,
            location: false,
          },
          setUrl: jest.fn(),
          setMethod: mockSetMethod,
          setHeaders: jest.fn(),
          setData: jest.fn(),
          setOptions: jest.fn(),
        })
      );

      const methodSelect = getByLabelText("Method") as HTMLSelectElement;
      expect(methodSelect.value).toBe("GET");

      fireEvent.change(methodSelect, { target: { value: "POST" } });
      expect(mockSetMethod).toHaveBeenCalledWith("POST");
    });

    it("should render and update options correctly", () => {
      const mockSetOptions = jest.fn();
      const { getByLabelText } = render(
        React.createElement(curlPlugin.component, {
          url: "https://api.example.com",
          method: "GET",
          headers: [],
          data: "",
          options: {
            silent: false,
            insecure: false,
            compressed: false,
            location: false,
          },
          setUrl: jest.fn(),
          setMethod: jest.fn(),
          setHeaders: jest.fn(),
          setData: jest.fn(),
          setOptions: mockSetOptions,
        })
      );

      const silentCheckbox = getByLabelText("Silent (-s)") as HTMLInputElement;
      expect(silentCheckbox.checked).toBe(false);

      fireEvent.click(silentCheckbox);
      expect(mockSetOptions).toHaveBeenCalledWith(expect.objectContaining({ silent: true }));
    });
  });
});