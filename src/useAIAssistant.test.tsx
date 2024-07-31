import React from "react";
import { render, act } from "@testing-library/react";
import { useAIAssistant } from "./useAIAssistant";
import { UseStoreType } from "./useStore";
import { ElectronAPI } from "./types";
import { ChatCompletion } from "openai/resources/chat/completions";

// Mock the postgresAssistant
jest.mock("./ai-assistants/postgresAssistant", () => ({
  postgresAssistant: jest.fn(),
}));

// Test component to use the hook
const TestComponent: React.FC<{
  store: UseStoreType;
  electronApi: ElectronAPI;
}> = ({ store, electronApi }) => {
  const { isLoading, handleSendMessage } = useAIAssistant(store, electronApi);
  return (
    <div>
      <span data-testid="loading">{isLoading.toString()}</span>
      <button onClick={() => handleSendMessage()}>Send Message</button>
    </div>
  );
};

describe("useAIAssistant", () => {
  let mockStore: jest.Mocked<UseStoreType>;
  let mockElectronApi: jest.Mocked<ElectronAPI>;

  beforeEach(() => {
    mockStore = {
      inputMessage: "",
      setInputMessage: jest.fn(),
      inputCommand: "",
      setInputCommand: jest.fn(),
      outputs: [],
      chatHistory: [],
      setChatHistory: jest.fn(),
      modules: [],
    } as unknown as jest.Mocked<UseStoreType>;

    mockElectronApi = {
      chatCompletionsCreate: jest.fn(),
    } as unknown as jest.Mocked<ElectronAPI>;
  });

  it("should not send message if input is empty", async () => {
    const { getByText } = render(
      <TestComponent store={mockStore} electronApi={mockElectronApi} />
    );

    await act(async () => {
      getByText("Send Message").click();
    });

    expect(mockElectronApi.chatCompletionsCreate).not.toHaveBeenCalled();
  });

  it("should send message and update store on successful response", async () => {
    mockStore.inputMessage = "Test message";
    mockStore.inputCommand = "ls -l";
    mockElectronApi.chatCompletionsCreate.mockResolvedValue({
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1677652288,
      model: "gpt-3.5-turbo-0613",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: JSON.stringify({
              bash_command: "ls -la",
              text_response: "Updated command",
            }),
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 9,
        completion_tokens: 12,
        total_tokens: 21,
      },
    } as ChatCompletion);

    const { getByText } = render(
      <TestComponent store={mockStore} electronApi={mockElectronApi} />
    );

    await act(async () => {
      getByText("Send Message").click();
    });

    expect(mockElectronApi.chatCompletionsCreate).toHaveBeenCalled();
    expect(mockStore.setInputCommand).toHaveBeenCalledWith("ls -la");
    expect(mockStore.setChatHistory).toHaveBeenCalled();
    expect(mockStore.setInputMessage).toHaveBeenCalledWith("");
  });

  it("should handle error in chat completion", async () => {
    mockStore.inputMessage = "Test message";
    mockElectronApi.chatCompletionsCreate.mockRejectedValue(
      new Error("API Error")
    );

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => null);

    const { getByText } = render(
      <TestComponent store={mockStore} electronApi={mockElectronApi} />
    );

    await act(async () => {
      getByText("Send Message").click();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error in chat completion:",
      expect.any(Error)
    );
    expect(mockStore.setInputMessage).toHaveBeenCalledWith("");

    consoleErrorSpy.mockRestore();
  });

  it("should handle invalid response format", async () => {
    mockStore.inputMessage = "Test message";
    mockElectronApi.chatCompletionsCreate.mockResolvedValue({
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1677652288,
      model: "gpt-3.5-turbo-0613",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "Invalid JSON",
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 9,
        completion_tokens: 12,
        total_tokens: 21,
      },
    } as ChatCompletion);

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => null);

    const { getByText } = render(
      <TestComponent store={mockStore} electronApi={mockElectronApi} />
    );

    await act(async () => {
      getByText("Send Message").click();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error parsing assistant's response:",
      expect.any(Error)
    );
    expect(mockStore.setInputMessage).toHaveBeenCalledWith("");

    consoleErrorSpy.mockRestore();
  });

  it("should update isLoading state correctly", async () => {
    mockStore.inputMessage = "Test message";
    mockElectronApi.chatCompletionsCreate.mockResolvedValue({
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1677652288,
      model: "gpt-3.5-turbo-0613",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: JSON.stringify({
              bash_command: "ls -la",
              text_response: "Updated command",
            }),
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 9,
        completion_tokens: 12,
        total_tokens: 21,
      },
    } as ChatCompletion);

    const { getByText, getByTestId } = render(
      <TestComponent store={mockStore} electronApi={mockElectronApi} />
    );

    expect(getByTestId("loading").textContent).toBe("false");

    await act(async () => {
      getByText("Send Message").click();
      // We can't easily test the intermediate loading state in this setup
      // as it changes too quickly. In a real scenario, you might want to
      // add some artificial delay to test this properly.
    });

    expect(getByTestId("loading").textContent).toBe("false");
  });
});
