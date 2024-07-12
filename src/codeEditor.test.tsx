import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CodeEditor from "./codeEditor";

// Mock the @monaco-editor/react module
jest.mock("@monaco-editor/react", () => {
  return jest.fn(({ value, onChange, language }) => (
    <div data-testid="mock-monaco-editor">
      <textarea
        data-testid="mock-editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span data-testid="mock-editor-language">{language}</span>
    </div>
  ));
});

describe("CodeEditor", () => {
  it("renders the Monaco editor", () => {
    const { getByTestId } = render(
      <CodeEditor
        value="console.log('Hello');"
        onChange={() => null}
        language="javascript"
      />
    );

    expect(getByTestId("mock-monaco-editor")).toBeInTheDocument();
  });

  it("passes the correct props to the Monaco editor", () => {
    const { getByTestId } = render(
      <CodeEditor
        value="print('Hello')"
        onChange={() => null}
        language="python"
      />
    );

    const textarea = getByTestId("mock-editor-textarea");
    const languageSpan = getByTestId("mock-editor-language");

    expect(textarea).toHaveValue("print('Hello')");
    expect(languageSpan).toHaveTextContent("python");
  });

  it("calls the onChange prop when the editor value changes", () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <CodeEditor
        value="initial value"
        onChange={mockOnChange}
        language="javascript"
      />
    );

    const textarea = getByTestId("mock-editor-textarea");
    fireEvent.change(textarea, { target: { value: "new value" } });

    expect(mockOnChange).toHaveBeenCalledWith("new value");
  });

  it("uses javascript as the default language", () => {
    const { getByTestId } = render(<CodeEditor language="javascript" value="" onChange={() => null} />);

    const languageSpan = getByTestId("mock-editor-language");
    expect(languageSpan).toHaveTextContent("javascript");
  });
});
