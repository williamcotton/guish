import React from "react";
import { render, act } from "@testing-library/react";
import { useFileOperations } from "./useFileOperations";
import { UseStoreType } from "./useStore";
import { ElectronAPI, ValidChannels } from "./types";

// Create an interface for our mock ipcRenderer
interface MockIpcRenderer {
  send: jest.Mock;
  receive: jest.Mock;
  removeAllListeners: jest.Mock;
  callbacks: Record<ValidChannels, (...args: unknown[]) => void>;
}

// Mock the ElectronAPI
const mockElectronApi: jest.Mocked<ElectronAPI> = {
  showSaveScriptDialog: jest.fn(),
  showOpenScriptDialog: jest.fn(),
  saveScriptFile: jest.fn(),
  openScriptFile: jest.fn(),
  executeAst: jest.fn(),
  ipcRenderer: {
    send: jest.fn(),
    receive: jest.fn(
      (channel: ValidChannels, func: (...args: unknown[]) => void) => {
        (mockElectronApi.ipcRenderer as MockIpcRenderer).callbacks[channel] =
          func;
      }
    ),
    removeAllListeners: jest.fn(),
    callbacks: {} as Record<ValidChannels, (...args: unknown[]) => void>,
  } as MockIpcRenderer,
  parseCommand: jest.fn(),
  showSaveDialog: jest.fn(),
  showDirectoryDialog: jest.fn(),
  chatCompletionsCreate: jest.fn(),
  getOpenAIStatus: jest.fn(),
};

// Mock the UseStoreType
const mockStore: jest.Mocked<UseStoreType> = {
  inputCommand: "",
  setInputCommand: jest.fn(),
  modules: [],
  compiledCommand: "",
  outputs: [],
  setOutputs: jest.fn(),
  updateModule: jest.fn(),
  removeModule: jest.fn(),
  executeAst: jest.fn(),
  currentFilePath: null,
  setCurrentFilePath: jest.fn(),
  hasUnsavedChanges: false,
  setFileContent: jest.fn(),
  loading: false,
  setLoading: jest.fn(),
  minimizedModules: [],
  setMinimizedModules: jest.fn(),
  isCopied: false,
  setIsCopied: jest.fn(),
  inputMessage: "",
  setInputMessage: jest.fn(),
  isLoading: false,
  setIsLoading: jest.fn(),
  chatHistory: [],
  setChatHistory: jest.fn(),
  isOpenAIEnabled: false,
  setIsOpenAIEnabled: jest.fn(),
};

// Helper component to test the hook
const TestComponent: React.FC = () => {
  useFileOperations(mockStore, mockElectronApi);
  return null;
};

describe("useFileOperations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle new pipeline", async () => {
    render(<TestComponent />);

    await act(async () => {
      (mockElectronApi.ipcRenderer as MockIpcRenderer).callbacks[
        "new-pipeline"
      ]();
    });

    expect(mockStore.setFileContent).toHaveBeenCalledWith("");
    expect(mockStore.setOutputs).toHaveBeenCalledWith([]);
    expect(mockStore.setCurrentFilePath).toHaveBeenCalledWith(null);
  });

  it("should handle open pipeline", async () => {
    mockElectronApi.showOpenScriptDialog.mockResolvedValue({
      canceled: false,
      filePaths: ["/path/to/file.sh"],
    });
    mockElectronApi.openScriptFile.mockResolvedValue({
      success: true,
      content: 'echo "Hello, World!"',
    });

    render(<TestComponent />);

    await act(async () => {
      (mockElectronApi.ipcRenderer as MockIpcRenderer).callbacks[
        "open-pipeline"
      ]();
    });

    expect(mockElectronApi.showOpenScriptDialog).toHaveBeenCalled();
    expect(mockElectronApi.openScriptFile).toHaveBeenCalledWith(
      "/path/to/file.sh"
    );
    expect(mockStore.setFileContent).toHaveBeenCalledWith(
      'echo "Hello, World!"'
    );
    expect(mockStore.setCurrentFilePath).toHaveBeenCalledWith(
      "/path/to/file.sh"
    );
    expect(mockStore.setOutputs).toHaveBeenCalledWith([]);
  });

  it("should handle save pipeline", async () => {
    mockStore.currentFilePath = "/path/to/existing/file.sh";
    mockStore.compiledCommand = 'echo "Hello, World!"';
    mockElectronApi.saveScriptFile.mockResolvedValue({ success: true });

    render(<TestComponent />);

    await act(async () => {
      (mockElectronApi.ipcRenderer as MockIpcRenderer).callbacks[
        "save-pipeline"
      ]();
    });

    expect(mockElectronApi.saveScriptFile).toHaveBeenCalledWith(
      'echo "Hello, World!"',
      "/path/to/existing/file.sh"
    );
    expect(mockStore.setCurrentFilePath).toHaveBeenCalledWith(
      "/path/to/existing/file.sh"
    );
    expect(mockStore.setFileContent).toHaveBeenCalledWith(
      'echo "Hello, World!"'
    );
  });

  it("should handle save pipeline as", async () => {
    mockStore.compiledCommand = 'echo "Hello, World!"';
    mockElectronApi.showSaveScriptDialog.mockResolvedValue({
      canceled: false,
      filePath: "/path/to/new/file.sh",
    });
    mockElectronApi.saveScriptFile.mockResolvedValue({ success: true });

    render(<TestComponent />);

    await act(async () => {
      (mockElectronApi.ipcRenderer as MockIpcRenderer).callbacks[
        "save-pipeline-as"
      ]();
    });

    expect(mockElectronApi.showSaveScriptDialog).toHaveBeenCalled();
    expect(mockElectronApi.saveScriptFile).toHaveBeenCalledWith(
      'echo "Hello, World!"',
      "/path/to/new/file.sh"
    );
    expect(mockStore.setCurrentFilePath).toHaveBeenCalledWith(
      "/path/to/new/file.sh"
    );
    expect(mockStore.setFileContent).toHaveBeenCalledWith(
      'echo "Hello, World!"'
    );
  });

  it("should handle errors when opening a file", async () => {
    mockElectronApi.showOpenScriptDialog.mockResolvedValue({
      canceled: false,
      filePaths: ["/path/to/file.sh"],
    });
    mockElectronApi.openScriptFile.mockResolvedValue({
      success: false,
      error: "File not found",
    });

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => null);

    render(<TestComponent />);

    await act(async () => {
      (mockElectronApi.ipcRenderer as MockIpcRenderer).callbacks[
        "open-pipeline"
      ]();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to open script file:",
      "File not found"
    );

    consoleErrorSpy.mockRestore();
  });

  it("should handle errors when saving a file", async () => {
    mockStore.compiledCommand = 'echo "Hello, World!"';
    mockElectronApi.showSaveScriptDialog.mockResolvedValue({
      canceled: false,
      filePath: "/path/to/new/file.sh",
    });
    mockElectronApi.saveScriptFile.mockResolvedValue({
      success: false,
      error: "Permission denied",
    });

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => null);

    render(<TestComponent />);

    await act(async () => {
      (mockElectronApi.ipcRenderer as MockIpcRenderer).callbacks[
        "save-pipeline-as"
      ]();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to save script file:",
      "Permission denied"
    );

    consoleErrorSpy.mockRestore();
  });
});
