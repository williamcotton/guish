import { ElectronAPI } from "./types";
import { UseStoreType } from "./useStore";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Import all AiAssistant types
import { postgresAssistant } from "./ai-assistants/postgresAssistant";

// Define the Assistant interface
export interface AiAssistant {
  (store: UseStoreType, electronApi: ElectronAPI, updatedChatHistory: ChatCompletionMessageParam[]): Promise<ChatCompletionMessageParam[]>;
}

export class AiAssistants {
  private static plugins: AiAssistant[] = [];

  static register(plugin: AiAssistant): void {
    this.plugins.push(plugin);
  }

  static async run(store: UseStoreType, electronApi: ElectronAPI, updatedChatHistory: ChatCompletionMessageParam[]): Promise<ChatCompletionMessageParam[]> {
    let modifiedChatHistory = [...updatedChatHistory];
    for (const plugin of this.plugins) {
      modifiedChatHistory = await plugin(store, electronApi, modifiedChatHistory);
    }
    return modifiedChatHistory;
  }
}

// Register Assistant
AiAssistants.register(postgresAssistant);
