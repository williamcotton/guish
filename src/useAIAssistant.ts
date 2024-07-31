import { useState, useCallback } from 'react';
import { Buffer } from "buffer";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { ElectronAPI } from "./types";
import { UseStoreType } from "./useStore";
import { AiAssistants } from "./AiAssistants";

export const useAIAssistant = (store: UseStoreType, electronApi: ElectronAPI) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = useCallback(async () => {
    if (!store.inputMessage.trim()) return;

    setIsLoading(true);

    const newMessage: ChatCompletionMessageParam = {
      role: "user",
      content: store.inputMessage,
    };
    const contextMessage: ChatCompletionMessageParam = {
      role: "system",
      content: `Current bash command: ${store.inputCommand}`,
    };
    const outputMessages: ChatCompletionMessageParam[] = store.outputs.map(
      (output, i) => {
        const outputString = Buffer.from(output).toString("utf-8");
        return {
          role: "system",
          content: `Module ${i + 1} output: ${outputString.slice(0, 100)}...`,
        };
      }
    );
    const updatedChatHistory = [
      ...store.chatHistory,
      contextMessage,
      ...outputMessages,
      newMessage,
    ];

    await AiAssistants.run(store, electronApi, updatedChatHistory);

    try {
      const response = await electronApi.chatCompletionsCreate(
        updatedChatHistory
      );

      if (response.choices && response.choices.length > 0) {
        const assistantResponse = response.choices[0].message.content;
        try {
          const parsedResponse = JSON.parse(assistantResponse);
          if (parsedResponse.bash_command && parsedResponse.text_response) {
            store.setInputCommand(parsedResponse.bash_command);
            store.setChatHistory([
              ...updatedChatHistory,
              { role: "assistant", content: assistantResponse },
            ]);
            console.log("Assistant's response:", parsedResponse.text_response);
          } else {
            throw new Error("Invalid response format");
          }
        } catch (parseError) {
          console.error("Error parsing assistant's response:", parseError);
        }
      }
    } catch (error) {
      console.error("Error in chat completion:", error);
    } finally {
      setIsLoading(false);
      store.setInputMessage("");
    }
  }, [electronApi, store]);

  return {
    isLoading,
    handleSendMessage
  };
};
