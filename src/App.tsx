import React, { useEffect, useCallback, useState } from "react";
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
import OpenAI from "openai";

import { Plugins } from "./Plugins";
import { genericPlugin } from "./plugins/genericPlugin";
import { useStore } from "./useStore";
import { useFileOperations } from "./useFileOperations";
import { ModuleType, ElectronAPI } from "./types";
import OutputView from "./outputView";
import ChatbotInterface from "./ChatbotInterface";

interface AppProps {
  electronApi: ElectronAPI;
}

const App: React.FC<AppProps> = ({ electronApi }) => {
  const store = useStore(electronApi);
  useFileOperations(store, electronApi);
  const [isCopied, setIsCopied] = useState(false);
  const [openai, setOpenai] = useState<OpenAI | null>(null);

  useEffect(() => {
    const apiKey = electronApi.getOpenAiApiKey();
    if (apiKey) {
      setOpenai(new OpenAI({ apiKey, dangerouslyAllowBrowser: true }));
    }
  }, [electronApi]);

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
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
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

  const handleBashCommandGenerated = (command: string) => {
    store.setInputCommand(command);
    electronApi.parseCommand(command);
  };

  const renderModule = useCallback(
    (module: ModuleType, index: number) => {
      const plugin = Plugins.get(module.type) || genericPlugin;
      if (!plugin) return null;
      const output = store.outputs[index];
      const Component = plugin.component;
      const isMinimized = store.minimizedModules[index];

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

  return (
    <div className="flex h-screen bg-gray-100">
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

        {openai && (
          <ChatbotInterface
            openAi={openai}
            onBashCommandGenerated={handleBashCommandGenerated}
          />
        )}

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

      <div className="w-1/4 bg-white p-4 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">HTML Output</h2>
          <button
            onClick={handleCopyOutput}
            className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            disabled={!store.outputs || store.outputs.length === 0}
          >
            {isCopied ? (
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
