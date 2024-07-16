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

    it("should handle all option checkboxes correctly", () => {
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
      const insecureCheckbox = getByLabelText(
        "Insecure (-k)"
      ) as HTMLInputElement;
      const compressedCheckbox = getByLabelText(
        "Compressed (--compressed)"
      ) as HTMLInputElement;
      const locationCheckbox = getByLabelText(
        "Follow redirects (-L)"
      ) as HTMLInputElement;

      expect(silentCheckbox.checked).toBe(false);
      expect(insecureCheckbox.checked).toBe(false);
      expect(compressedCheckbox.checked).toBe(false);
      expect(locationCheckbox.checked).toBe(false);

      fireEvent.click(silentCheckbox);
      expect(mockSetOptions).toHaveBeenCalledWith(
        expect.objectContaining({ silent: true })
      );

      fireEvent.click(insecureCheckbox);
      expect(mockSetOptions).toHaveBeenCalledWith(
        expect.objectContaining({ insecure: true })
      );

      fireEvent.click(compressedCheckbox);
      expect(mockSetOptions).toHaveBeenCalledWith(
        expect.objectContaining({ compressed: true })
      );

      fireEvent.click(locationCheckbox);
      expect(mockSetOptions).toHaveBeenCalledWith(
        expect.objectContaining({ location: true })
      );

      // Test unchecking
      fireEvent.click(insecureCheckbox);
      expect(mockSetOptions).toHaveBeenCalledWith(
        expect.objectContaining({ insecure: false })
      );

      fireEvent.click(compressedCheckbox);
      expect(mockSetOptions).toHaveBeenCalledWith(
        expect.objectContaining({ compressed: false })
      );

      fireEvent.click(locationCheckbox);
      expect(mockSetOptions).toHaveBeenCalledWith(
        expect.objectContaining({ location: false })
      );
    });

    it("should handle method changes correctly", () => {
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

      fireEvent.change(methodSelect, { target: { value: "PUT" } });
      expect(mockSetMethod).toHaveBeenCalledWith("PUT");

      fireEvent.change(methodSelect, { target: { value: "DELETE" } });
      expect(mockSetMethod).toHaveBeenCalledWith("DELETE");
    });

    it("should handle headers input correctly", () => {
      const mockSetHeaders = jest.fn();
      const { getByLabelText } = render(
        React.createElement(curlPlugin.component, {
          url: "https://api.example.com",
          method: "GET",
          headers: ["Content-Type: application/json"],
          data: "",
          options: {
            silent: false,
            insecure: false,
            compressed: false,
            location: false,
          },
          setUrl: jest.fn(),
          setMethod: jest.fn(),
          setHeaders: mockSetHeaders,
          setData: jest.fn(),
          setOptions: jest.fn(),
        })
      );

      const headersTextarea = getByLabelText("Headers") as HTMLTextAreaElement;
      expect(headersTextarea.value).toBe("Content-Type: application/json");

      fireEvent.change(headersTextarea, {
        target: {
          value: "Content-Type: application/json\nAuthorization: Bearer token",
        },
      });
      expect(mockSetHeaders).toHaveBeenCalledWith([
        "Content-Type: application/json",
        "Authorization: Bearer token",
      ]);
    });

    it("should handle data input correctly", () => {
      const mockSetData = jest.fn();
      const { getByLabelText } = render(
        React.createElement(curlPlugin.component, {
          url: "https://api.example.com",
          method: "POST",
          headers: [],
          data: '{"key": "value"}',
          options: {
            silent: false,
            insecure: false,
            compressed: false,
            location: false,
          },
          setUrl: jest.fn(),
          setMethod: jest.fn(),
          setHeaders: jest.fn(),
          setData: mockSetData,
          setOptions: jest.fn(),
        })
      );

      const dataTextarea = getByLabelText("Data") as HTMLTextAreaElement;
      expect(dataTextarea.value).toBe('{"key": "value"}');

      fireEvent.change(dataTextarea, {
        target: { value: '{"newKey": "newValue"}' },
      });
      expect(mockSetData).toHaveBeenCalledWith('{"newKey": "newValue"}');
    });
  });
});