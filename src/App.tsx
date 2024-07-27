import React, { useEffect, useCallback } from "react";
import {
  Terminal,
  X,
  CircleDot,
  Loader,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { Plugins } from "./Plugins";
import { genericPlugin } from "./plugins/genericPlugin";

import { useStore } from "./useStore";
import { useFileOperations } from "./useFileOperations";
import { ModuleType, ElectronAPI } from "./types";
import OutputView from "./outputView";

interface AppProps {
  electronApi: ElectronAPI;
}

const App: React.FC<AppProps> = (props) => {
  const store = useStore(props.electronApi);
  useFileOperations(store, props.electronApi);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    store.setOutputs([]);
    store.setInputCommand(e.target.value);
  };

  useEffect(() => {
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && e.altKey) {
        e.preventDefault();
        handleExecuteCommand();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyPress);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyPress);
    };
  }, [store]);

  const handleExecuteCommand = useCallback(() => {
    store.setOutputs([]);
    store.setLoading(true);
    store.executeAst();
  }, [store]);

  const handleCopyOutput = () => {
    const output = store.outputs && store.outputs[store.outputs.length - 1];
    if (output) {
      navigator.clipboard.writeText(output).then(() => {
        store.setIsCopied(true);
        setTimeout(() => store.setIsCopied(false), 2000);
      });
    }
  };

  const toggleMinimize = (index: number) => {
    store.setMinimizedModules((prev: boolean[]) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const renderModule = useCallback(
    (module: ModuleType, index: number) => {
      const plugin = Plugins.get(module.type) || genericPlugin;
      if (!plugin) return null;
      const output = store.outputs[index];
      const Component = plugin.component;
      const isMinimized = store.minimizedModules[index] || false;

      return (
        <div
          key={`${module.type}-${index}`}
          className={`
            mt-2 flex flex-col w-full min-w-[180px] max-h-[calc(100vh-2rem)] bg-white rounded shadow mx-2 relative group overflow-hidden
            ${plugin.containerClasses || ""}
            ${isMinimized && "max-w-[120px]"}
          `}
        >
          {isMinimized && (
            <p className="m-4">{module.command || plugin.name}</p>
          )}
          <div className="absolute top-2 right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {module.quoteChar && (
              <select
                value={module.quoteChar}
                onChange={(e) =>
                  store.updateModule(index, {
                    quoteChar: e.target.value as "'" | '"',
                  })
                }
                className="text-sm border rounded"
              >
                <option value="'">Single quotes</option>
                <option value='"'>Double quotes</option>
              </select>
            )}
            <button
              onClick={() => toggleMinimize(index)}
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={isMinimized ? "Expand module" : "Minimize module"}
            >
              {isMinimized ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </button>
            <button
              onClick={() => store.removeModule(index)}
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Close module"
            >
              <X size={16} />
            </button>
          </div>

          {!isMinimized && (
            <>
              <div className="flex-grow overflow-auto p-4">
                <Component
                  {...module}
                  {...Object.fromEntries(
                    Object.keys(module).map((key) => [
                      `set${key.charAt(0).toUpperCase() + key.slice(1)}`,
                      (value: unknown) =>
                        store.updateModule(index, { [key]: value }),
                    ])
                  )}
                />
              </div>

              <div className="h-40 min-h-[200px] bg-black p-2 rounded-b overflow-auto">
                <OutputView output={output} />
              </div>
            </>
          )}
        </div>
      );
    },
    [store]
  );

  const handleSendMessage = useCallback(async () => {
    if (!store.inputMessage.trim()) return;

    store.setIsLoading(true);

    const newMessage: ChatCompletionMessageParam = {
      role: "user",
      content: store.inputMessage,
    };
    const contextMessage: ChatCompletionMessageParam = {
      role: "system",
      content: `Current bash command: ${store.inputCommand}`,
    };
    const outputMessages: ChatCompletionMessageParam[] = store.outputs.map(
      (output, i) => ({
        role: "system",
        content: `Module ${i + 1} output: ${output.slice(0, 100)}...`,
      })
    );
    const updatedChatHistory = [...store.chatHistory, contextMessage, ...outputMessages, newMessage];

    try {
      const response = await props.electronApi.chatCompletionsCreate(
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
      store.setIsLoading(false);
      store.setInputMessage("");
    }
  }, [props.electronApi, store]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main content column */}
      <div className="flex flex-col w-3/4">
        <header className="flex justify-between items-center bg-gray-800 text-white pt-2 pb-2">
          <h1 className="text-2xl font-bold pl-2">guish</h1>
          {store.currentFilePath && (
            <div className="flex items-center text-sm text-gray-300 truncate max-w-[50%] pr-2">
              {store.hasUnsavedChanges && (
                <CircleDot size={12} className="text-yellow-400" />
              )}
              <p className="mr-2 ml-2">{store.currentFilePath}</p>
            </div>
          )}
        </header>
        <div className="flex m-4">
          <input
            type="text"
            value={store.inputMessage}
            onChange={(e) => store.setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-grow p-2 border rounded-l"
            placeholder="Type your message here and press Enter to send..."
          />
          <button
            onClick={handleSendMessage}
            className="p-2 ml-2 bg-blue-500 text-white rounded"
            disabled={store.isLoading}
          >
            {store.isLoading ? "Updating..." : "Update"}
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-auto p-2">
            {store.modules.map(renderModule)}
          </div>

          <div className="bg-gray-800 p-4 mt-4">
            <div className="flex items-center mb-2">
              <Terminal className="text-white mr-2" />
              <textarea
                value={store.inputCommand}
                onChange={handleInputChange}
                className="flex-1 pl-2 pr-2 bg-gray-700 text-white rounded border border-gray-600 font-mono text-sm"
                placeholder="Enter command..."
                rows={Math.min(store.inputCommand.split("\n").length, 3)}
              />
              <button
                onClick={handleExecuteCommand}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* HTML output column */}
      <div className="w-1/4 bg-white p-4 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">HTML Output</h2>
          <button
            onClick={handleCopyOutput}
            className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            disabled={!store.outputs || store.outputs.length === 0}
          >
            {store.isCopied ? (
              <>
                <Check size={16} className="mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} className="mr-1" />
                Copy
              </>
            )}
          </button>
        </div>
        {store.loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader className="animate-spin text-blue-500" size={48} />
          </div>
        ) : (
          <div
            dangerouslySetInnerHTML={{
              __html: store.outputs && store.outputs[store.outputs.length - 1],
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;
