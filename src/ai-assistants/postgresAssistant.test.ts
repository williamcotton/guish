import { postgresAssistant } from "./postgresAssistant";
import { UseStoreType } from "../useStore";
import { ElectronAPI } from "../types";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Mock the UseStoreType
const mockStore: jest.Mocked<UseStoreType> = {
  modules: [],
  chatHistory: [],
  setChatHistory: jest.fn(),
} as any;

// Mock the ElectronAPI
const mockElectronApi: jest.Mocked<ElectronAPI> = {
  getPgSchema: jest.fn(),
} as any;

describe("postgresAssistant", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not add schema if already present in chat history", async () => {
    mockStore.chatHistory = [
      { role: "system", content: "Postgres schema: {...}" },
    ];
    const updatedChatHistory: ChatCompletionMessageParam[] = [
      ...mockStore.chatHistory,
    ];

    const result = await postgresAssistant(mockStore, mockElectronApi, updatedChatHistory);

    expect(mockElectronApi.getPgSchema).not.toHaveBeenCalled();
    expect(result).toEqual(mockStore.chatHistory);
  });

  it("should add schema for pg module if not present in chat history", async () => {
    mockStore.modules = [
      {
        type: "pg",
        database: "testdb",
        hostname: "localhost",
        user: "testuser",
        password: "testpass",
        port: "5432",
      },
    ];
    mockStore.chatHistory = [];
    const updatedChatHistory: ChatCompletionMessageParam[] = [];

    const mockSchema = [
      { table_name: "users", column_name: "id", data_type: "integer" },
    ];
    mockElectronApi.getPgSchema.mockResolvedValue({
      success: true,
      schema: mockSchema,
    });

    const result = await postgresAssistant(mockStore, mockElectronApi, updatedChatHistory);

    expect(mockElectronApi.getPgSchema).toHaveBeenCalledWith({
      database: "testdb",
      host: "localhost",
      user: "testuser",
      password: "testpass",
      port: 5432,
    });
    expect(result).toEqual([
      {
        role: "system",
        content: `Postgres schema: ${JSON.stringify(mockSchema)}`,
      },
    ]);
  });

  it("should handle multiple pg modules", async () => {
    mockStore.modules = [
      {
        type: "pg",
        database: "db1",
        hostname: "host1",
        user: "user1",
        password: "pass1",
        port: "5432",
      },
      {
        type: "pg",
        database: "db2",
        hostname: "host2",
        user: "user2",
        password: "pass2",
        port: "5433",
      },
    ];
    mockStore.chatHistory = [];
    const updatedChatHistory: ChatCompletionMessageParam[] = [];

    const mockSchema1 = [
      { table_name: "users", column_name: "id", data_type: "integer" },
    ];
    const mockSchema2 = [
      { table_name: "products", column_name: "name", data_type: "varchar" },
    ];
    mockElectronApi.getPgSchema
      .mockResolvedValueOnce({ success: true, schema: mockSchema1 })
      .mockResolvedValueOnce({ success: true, schema: mockSchema2 });

    const result = await postgresAssistant(mockStore, mockElectronApi, updatedChatHistory);

    expect(mockElectronApi.getPgSchema).toHaveBeenCalledTimes(2);
    expect(result).toEqual([
      {
        role: "system",
        content: `Postgres schema: ${JSON.stringify(
          mockSchema1
        )}, ${JSON.stringify(mockSchema2)}`,
      },
    ]);
  });

  it("should not add schema message if no pg modules are present", async () => {
    mockStore.modules = [{ type: "other" }];
    mockStore.chatHistory = [];
    const updatedChatHistory: ChatCompletionMessageParam[] = [];

    const result = await postgresAssistant(mockStore, mockElectronApi, updatedChatHistory);

    expect(mockElectronApi.getPgSchema).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("should handle errors when fetching schema", async () => {
    mockStore.modules = [
      {
        type: "pg",
        database: "testdb",
        hostname: "localhost",
        user: "testuser",
        password: "testpass",
        port: "5432",
      },
    ];
    mockStore.chatHistory = [];
    const updatedChatHistory: ChatCompletionMessageParam[] = [];

    mockElectronApi.getPgSchema.mockResolvedValue({
      success: false,
      error: "Database connection failed",
    });

    const result = await postgresAssistant(mockStore, mockElectronApi, updatedChatHistory);

    expect(mockElectronApi.getPgSchema).toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
