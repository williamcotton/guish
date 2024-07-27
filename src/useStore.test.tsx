// useStore.test.tsx
import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useStore } from "./useStore";
import { ElectronAPI } from "./types";

// Mock the useAst hook
jest.mock("./useAst", () => ({
  useAst: () => ({
    astToModules: jest.fn().mockReturnValue([]),
    compileCommand: jest.fn().mockReturnValue("compiled command"),
  }),
}));

// Create a mock ElectronAPI
const mockElectronApi: jest.Mocked<ElectronAPI> = {
  parseCommand: jest.fn(),
  executeAst: jest.fn(),
  ipcRenderer: {
    send: jest.fn(),
    receive: jest.fn(),
    removeAllListeners: jest.fn(),
  },
  showSaveDialog: jest.fn(),
  showSaveScriptDialog: jest.fn(),
  showOpenScriptDialog: jest.fn(),
  showDirectoryDialog: jest.fn(),
  saveScriptFile: jest.fn(),
  openScriptFile: jest.fn(),
  chatCompletionsCreate: jest.fn(),
};

// Create a test component that uses the hook
const TestComponent: React.FC = () => {
  const store = useStore(mockElectronApi);
  return (
    <div>
      <input
        data-testid="input"
        value={store.inputCommand}
        onChange={(e) => store.setInputCommand(e.target.value)}
      />
      <button data-testid="execute" onClick={() => store.executeAst()}>
        Execute
      </button>
      <button
        data-testid="update-module"
        onClick={() => store.updateModule(0, { type: "updated" })}
      >
        Update Module
      </button>
      <button data-testid="remove-module" onClick={() => store.removeModule(0)}>
        Remove Module
      </button>
      <div data-testid="loading">
        {store.loading ? "Loading" : "Not Loading"}
      </div>
      <div data-testid="output">{store.outputs}</div>
      <div data-testid="modules">{JSON.stringify(store.modules)}</div>
    </div>
  );
};

describe("useStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with default values", () => {
    render(<TestComponent />);

    expect(screen.getByTestId("input")).toHaveValue("");
    expect(screen.getByTestId("output")).toHaveTextContent("");
  });

  it("should update input command and trigger parse", () => {
    render(<TestComponent />);

    const input = screen.getByTestId("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "echo 123" } });
    expect(input.value).toBe("echo 123");
    expect(mockElectronApi.parseCommand).toHaveBeenCalledWith("echo 123");
  });

  it("should execute command", () => {
    render(<TestComponent />);

    const input = screen.getByTestId("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "echo 123" } });

    const executeButton = screen.getByTestId("execute");
    fireEvent.click(executeButton);
    expect(mockElectronApi.executeAst).toHaveBeenCalledWith(null);
  });

  it("should set loading state when executing command", async () => {
    jest.useFakeTimers();

    render(<TestComponent />);

    const input = screen.getByTestId("input") as HTMLInputElement;
    const executeButton = screen.getByTestId("execute");
    const loadingIndicator = screen.getByTestId("loading");

    fireEvent.change(input, { target: { value: "echo 123" } });

    expect(loadingIndicator).toHaveTextContent("Not Loading");

    fireEvent.click(executeButton);

    expect(loadingIndicator).toHaveTextContent("Loading");

    // Simulate the passage of time
    jest.runAllTimers();

    // Check that loading state is reset after command execution
    await screen.findByText("Not Loading");

    expect(mockElectronApi.executeAst).toHaveBeenCalledWith(null);
  });
});
