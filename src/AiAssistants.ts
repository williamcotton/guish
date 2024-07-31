
import { ElectronAPI } from "./types";
import { UseStoreType } from "./useStore";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Import all AiAssistant types
import { postgresAssistant } from "./ai-assistants/postgresAssistant";

// Define the Assistant interface
export interface AiAssistant {
  (store: UseStoreType, electronApi: ElectronAPI, updatedChatHistory: ChatCompletionMessageParam[]): Promise<void>;
}

export class AiAssistants {
  private static plugins: AiAssistant[] = [];

  static register(plugin: AiAssistant): void {
    this.plugins.push(plugin);
  }

  static async run(store: UseStoreType, electronApi: ElectronAPI, updatedChatHistory: ChatCompletionMessageParam[]): Promise<void> {
    for (const plugin of this.plugins) {
      await plugin(store, electronApi, updatedChatHistory);
    }
  }
}

// Register Assistant
AiAssistants.register(postgresAssistant);