// App.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";
import { ElectronAPI } from "./types";
import { Plugins } from "./Plugins";

// Mock the Plugins
jest.mock("./Plugins", () => ({
  Plugins: {
    get: jest.fn(),
  },
}));

const mockExecuteCommand = jest.fn();
const mockSetInputCommand = jest.fn();
const mockUpdateModule = jest.fn();
const mockRemoveModule = jest.fn();

// Mock the useStore hook
jest.mock("./useStore", () => ({
  useStore: () => ({
    inputCommand: "",
    setInputCommand: mockSetInputCommand,
    modules: [
      {
        type: "echo",
        text: "Hello, World!",
      },
    ],
    compiledCommand: "",
    output: "",
    setOutput: jest.fn(),
    updateModule: mockUpdateModule,
    removeModule: mockRemoveModule,
    executeCommand: mockExecuteCommand,
    currentFilePath: null,
    setCurrentFilePath: jest.fn(),
    hasUnsavedChanges: false,
    setFileContent: jest.fn(),
    loading: false,
    setLoading: jest.fn(),
  }),
}));

// Mock the useFileOperations hook
jest.mock("./useFileOperations", () => ({
  useFileOperations: () => ({
    handleNewPipeline: jest.fn(),
    handleOpenPipeline: jest.fn(),
    handleSavePipeline: jest.fn(),
    handleSavePipelineAs: jest.fn(),
  }),
}));

// Create a mock ElectronAPI
const mockElectronApi: jest.Mocked<ElectronAPI> = {
  parseCommand: jest.fn(),
  executeCommand: jest.fn(),
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
};

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<App electronApi={mockElectronApi} />);
    expect(screen.getByText("guish")).toBeInTheDocument();
  });

  it("displays the input command textarea", () => {
    render(<App electronApi={mockElectronApi} />);
    const textarea = screen.getByPlaceholderText("Enter command...");
    expect(textarea).toBeInTheDocument();
  });

  it("displays the execute button", () => {
    render(<App electronApi={mockElectronApi} />);
    const executeButton = screen.getByText("Execute");
    expect(executeButton).toBeInTheDocument();
  });

  it("displays the output area", () => {
    render(<App electronApi={mockElectronApi} />);
    const outputArea = screen.getByText("HTML Output");
    expect(outputArea).toBeInTheDocument();
  });

  it("handles execute button click", async () => {
    const { getByText } = render(<App electronApi={mockElectronApi} />);
    const executeButton = getByText("Execute");
    fireEvent.click(executeButton);
    await waitFor(() => {
      expect(mockExecuteCommand).toHaveBeenCalled();
    });
  });

  it("handles input command change", async () => {
    const { getByPlaceholderText } = render(
      <App electronApi={mockElectronApi} />
    );
    const textarea = getByPlaceholderText("Enter command...");
    fireEvent.change(textarea, { target: { value: "new command" } });
    await waitFor(() => {
      expect(mockSetInputCommand).toHaveBeenCalledWith("new command");
    });
  });

  it("renders modules correctly", () => {
    const mockEchoPlugin = {
      component: () => <div data-testid="echo-module">Echo Module</div>,
      containerClasses: "custom-echo-class",
    };
    (Plugins.get as jest.Mock).mockReturnValue(mockEchoPlugin);

    const { getByTestId } = render(<App electronApi={mockElectronApi} />);

    expect(getByTestId("echo-module")).toBeInTheDocument();
    expect(getByTestId("echo-module").parentElement).toHaveClass(
      "custom-echo-class"
    );
  });

  it("calls updateModule when a module is updated", () => {
    const mockEchoPlugin = {
      component: ({ setText }: { setText: (text: string) => void}) => (
        <button onClick={() => setText("Updated text")}>Update Echo</button>
      ),
    };
    (Plugins.get as jest.Mock).mockReturnValue(mockEchoPlugin);

    const { getByText } = render(<App electronApi={mockElectronApi} />);
    const updateButton = getByText("Update Echo");
    fireEvent.click(updateButton);

    expect(mockUpdateModule).toHaveBeenCalledWith(0, { text: "Updated text" });
  });

  it("calls removeModule when a module is removed", () => {
    const mockEchoPlugin = {
      component: () => <div data-testid="echo-module">Echo Module</div>,
      containerClasses: "custom-echo-class",
    };
    (Plugins.get as jest.Mock).mockReturnValue(mockEchoPlugin);

    const { getByLabelText } = render(<App electronApi={mockElectronApi} />);
    const closeButton = getByLabelText("Close module");
    fireEvent.click(closeButton);

    expect(mockRemoveModule).toHaveBeenCalledWith(0);
  });
});
