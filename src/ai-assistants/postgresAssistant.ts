import { UseStoreType } from "../useStore";
import { PgModuleType } from "../plugins/pgPlugin";
import { ElectronAPI } from "../types";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";


export const postgresAssistant = async (
  store: UseStoreType,
  electronApi: ElectronAPI,
  updatedChatHistory: ChatCompletionMessageParam[]
) => {
  const schemaNotAdded = !store.chatHistory.some(
    (msg) => msg.role === "system" && msg.content.includes("Postgres schema")
  );

  if (schemaNotAdded) {
    const pgSchema = await Promise.all(
      store.modules.map(async (module) => {
        if (module.type === "pg") {
          const pgModule = module as PgModuleType;
          const response = await electronApi.getPgSchema({
            database: pgModule.database,
            host: pgModule.hostname,
            user: pgModule.user,
            password: pgModule.password,
            port: parseInt(pgModule.port, 10),
          });
          return JSON.stringify(response.schema);
        }
        return "";
      })
    );

    const pgSchemaContent = pgSchema
      .filter((schema) => schema !== "")
      .join(", ");
    if (pgSchemaContent) {
      const pgMessage: ChatCompletionMessageParam = {
        role: "system",
        content: `Postgres schema: ${pgSchemaContent}`,
      };
      updatedChatHistory.push(pgMessage);
    }
  }
};