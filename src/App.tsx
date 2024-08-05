import React, { useEffect, useCallback, useState } from "react";
import {
  Terminal,
  CircleDot,
  Loader,
  Copy,
  Check,
  List,
  Layout,
  Maximize,
  Minimize,
} from "lucide-react";
import { Buffer } from "buffer";

import { useStore } from "./useStore";
import { useFileOperations } from "./useFileOperations";
import { useAIAssistant } from "./useAIAssistant";
import { ModuleType, ElectronAPI } from "./types";
import RenderModule from "./renderModule";
import { Plugins } from "./Plugins";
import { genericPlugin } from "./plugins/genericPlugin";

interface AppProps {
  electronApi: ElectronAPI;
}

const App: React.FC<AppProps> = (props) => {
  const store = useStore(props.electronApi);
  useFileOperations(store, props.electronApi);
  const { isLoading, handleSendMessage } = useAIAssistant(
    store,
    props.electronApi
  );

  const [viewMode, setViewMode] = useState<"all" | "single">("all");
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number>(0);
  const [isFullWidthOutput, setIsFullWidthOutput] = useState<boolean>(false);

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

  const lastOutput = store.outputs && store.outputs[store.outputs.length - 1];
  const lastOutputString = lastOutput
    ? Buffer.from(lastOutput).toString("utf-8")
    : "";

  const handleCopyOutput = () => {
    const output = store.outputs && store.outputs[store.outputs.length - 1];
    if (output) {
      navigator.clipboard.writeText(lastOutputString).then(() => {
        store.setIsCopied(true);
        setTimeout(() => store.setIsCopied(false), 2000);
      });
    }
  };

  const renderModule = useCallback(
    (module: ModuleType, index: number) => {
      return RenderModule(store, module, index);
    },
    [store]
  );

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleViewMode = () => {
    if (viewMode === "all" && store.modules.length === 0) {
      // Don't switch to single view if there are no modules
      return;
    }
    setViewMode(viewMode === "all" ? "single" : "all");
  };
  const toggleOutputWidth = () => {
    setIsFullWidthOutput(!isFullWidthOutput);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main content column */}
      <div className={`flex flex-col ${isFullWidthOutput ? "w-0" : "w-3/4"}`}>
        <header className="flex justify-between items-center bg-gray-800 text-white pt-2 pb-2">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold pl-2 mr-4 ml-2">guish</h1>
            <button
              onClick={toggleViewMode}
              className={`px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center ${
                store.modules.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={store.modules.length === 0}
            >
              {viewMode === "all" ? <List size={16} /> : <Layout size={16} />}
              <span className="ml-1">
                {viewMode === "all" ? "View Single" : "View All"}
              </span>
            </button>
          </div>
          {store.currentFilePath && (
            <div className="flex items-center text-sm text-gray-300 truncate max-w-[50%] pr-2">
              {store.hasUnsavedChanges && (
                <CircleDot size={12} className="text-yellow-400" />
              )}
              <p className="mr-2 ml-2">{store.currentFilePath}</p>
            </div>
          )}
        </header>
        {store.isOpenAIEnabled && (
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
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Module list (only shown in single view and when there are modules) */}
          {viewMode === "single" && store.modules.length > 0 && (
            <div className="w-1/4 overflow-y-auto ml-4 max-w-40">
              {store.modules.map((module, index) => {
                const plugin = Plugins.get(module.type) || genericPlugin;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedModuleIndex(index)}
                    className={`w-full text-left p-2 mb-2 rounded ${
                      selectedModuleIndex === index
                        ? "bg-blue-500 text-white"
                        : "bg-white"
                    }`}
                  >
                    {module.command || plugin.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Module view */}
          <div
            className={`flex-1 flex ${
              viewMode === "all" ? "flex-row" : "flex-col"
            } overflow-auto px-2`}
          >
            {store.modules.length === 0 ? (
              <div className="flex items-center justify-center w-full h-full text-gray-500">
                No modules available. Enter a command to get started.
              </div>
            ) : viewMode === "all" ? (
              store.modules.map(renderModule)
            ) : (
              renderModule(
                store.modules[selectedModuleIndex],
                selectedModuleIndex
              )
            )}
          </div>
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
      {/* HTML output column */}
      <div
        className={`bg-white p-4 overflow-auto ${
          isFullWidthOutput ? "w-full" : "w-1/4"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">HTML Output</h2>
          <div className="flex items-center">
            <button
              onClick={handleCopyOutput}
              className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-2"
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
            <button
              onClick={toggleOutputWidth}
              className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              {isFullWidthOutput ? (
                <>
                  <Minimize size={16} className="mr-1" />
                  Minimize
                </>
              ) : (
                <>
                  <Maximize size={16} className="mr-1" />
                  Maximize
                </>
              )}
            </button>
          </div>
        </div>
        {store.loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader className="animate-spin text-blue-500" size={48} />
          </div>
        ) : (
          <div
            dangerouslySetInnerHTML={{
              __html: lastOutputString,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;
