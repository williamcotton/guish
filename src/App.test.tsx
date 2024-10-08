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

const mockExecuteAst = jest.fn();
const mockSetInputCommand = jest.fn();
const mockUpdateModule = jest.fn();
const mockRemoveModule = jest.fn();
const mockSetOutputs = jest.fn();
const mockSetIsCopied = jest.fn();
const mockSetInputMessage = jest.fn();
const mockHandleSendMessage = jest.fn();

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
    outputs: [Buffer.from("Test output")],
    setOutputs: mockSetOutputs,
    updateModule: mockUpdateModule,
    removeModule: mockRemoveModule,
    executeAst: mockExecuteAst,
    currentFilePath: null,
    setCurrentFilePath: jest.fn(),
    hasUnsavedChanges: false,
    setFileContent: jest.fn(),
    loading: false,
    setLoading: jest.fn(),
    minimizedModules: [], // Add this line
    setMinimizedModules: jest.fn(), // Add this line
    isCopied: false,
    setIsCopied: mockSetIsCopied,
    inputMessage: "",
    setInputMessage: mockSetInputMessage,
    isOpenAIEnabled: true,
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
  ipcRenderer: {
    send: jest.fn(),
    receive: jest.fn(),
    removeAllListeners: jest.fn(),
  },
  showSaveDialog: jest.fn(),
  executeAst: mockExecuteAst,
  showSaveScriptDialog: jest.fn(),
  showOpenScriptDialog: jest.fn(),
  showDirectoryDialog: jest.fn(),
  saveScriptFile: jest.fn(),
  openScriptFile: jest.fn(),
  chatCompletionsCreate: jest.fn(),
  getOpenAIStatus: jest.fn(),
  getPgSchema: jest.fn(),
};

// Mock the useAIAssistant hook
jest.mock("./useAIAssistant", () => ({
  useAIAssistant: () => ({
    isLoading: false,
    handleSendMessage: mockHandleSendMessage,
  }),
}));

// Mock navigator.clipboard
const mockClipboard = {
  writeText: jest.fn(() => Promise.resolve()),
};
Object.assign(navigator, {
  clipboard: mockClipboard,
});

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
      expect(mockExecuteAst).toHaveBeenCalled();
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
  });

  it("calls updateModule when a module is updated", () => {
    const mockEchoPlugin = {
      component: ({ setText }: { setText: (text: string) => void }) => (
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

  it("handles global key press event", () => {
    render(<App electronApi={mockElectronApi} />);
    const event = new KeyboardEvent("keydown", { key: "Enter", altKey: true });
    fireEvent(window, event);
    expect(mockExecuteAst).toHaveBeenCalled();
  });

  it("handles copy output button click", async () => {
    render(<App electronApi={mockElectronApi} />);
    const copyButton = screen.getByText("Copy");
    fireEvent.click(copyButton);
    await waitFor(() => {
      expect(mockSetIsCopied).toHaveBeenCalledWith(true);
    });
  });

  it("handles key press event and calls handleSendMessage", async () => {
    render(<App electronApi={mockElectronApi} />);

    const input = screen.getByPlaceholderText(
      "Type your message here and press Enter to send..."
    );
    expect(input).toBeInTheDocument();

    fireEvent.keyPress(input, { key: "Enter", code: "Enter", charCode: 13 });

    expect(mockHandleSendMessage).toHaveBeenCalled();
  });

  it("does not call handleSendMessage when Shift+Enter is pressed", async () => {
    render(<App electronApi={mockElectronApi} />);

    const input = screen.getByPlaceholderText(
      "Type your message here and press Enter to send..."
    );
    expect(input).toBeInTheDocument();

    fireEvent.keyPress(input, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
      shiftKey: true,
    });

    expect(mockHandleSendMessage).not.toHaveBeenCalled();
  });
});
