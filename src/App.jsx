import React, { useEffect, useCallback } from "react";
import { Terminal, X } from "lucide-react";

import { Plugins } from "./Plugins";
import { genericPlugin } from "./plugins/genericPlugin";

import { useStore } from "./useStore";
import { useFileOperations } from "./useFileOperations";

export const defaultCommand =
  'echo "fad foo\\nbrick bro\\nbonk nonk" | grep -i "f" | awk \'{print $2}\' | sed "s/foo/bar/g"';

const App = () => {
  const store = useStore();
  const fileOperations = useFileOperations(store);

  const handleInputChange = (e) => {
    store.setInputCommand(e.target.value);
  };

  useEffect(() => {
    const handleGlobalKeyPress = (e) => {
      if (e.key === "Enter" && e.altKey) {
        e.preventDefault();
        store.executeCommand();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyPress);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyPress);
    };
  }, [store]);

  const renderModule = (module, index) => {
    const plugin = Plugins.get(module.type) || genericPlugin;
    if (!plugin) return null;

    const Component = plugin.component;
    return (
      <div
        key={`${module.type}-${index}`}
        className={plugin.containerClasses || "flex-1 min-w-[200px] bg-white p-4 rounded shadow mx-2 overflow-auto relative group"}
        style={{ resize: "vertical" }}
      >
        <button
          onClick={() => store.removeModule(index)}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Close module"
        >
          <X size={16} />
        </button>
        <Component
          {...module}
          {...Object.fromEntries(
            Object.keys(module).map((key) => [
              `set${key.charAt(0).toUpperCase() + key.slice(1)}`,
              (value) => store.updateModule(index, { [key]: value }),
            ])
          )}
        />
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main content column */}
      <div className="flex flex-col w-3/4">
        <header className="bg-gray-800 text-white p-4">
          <h1 className="text-2xl font-bold pl-2">guish</h1>
        </header>

        <div className="flex-1 flex flex-col overflow-hidden p-4">
          <div className="flex-1 flex overflow-auto">
            {store.modules.map(renderModule)}
          </div>

          <div className="bg-gray-800 p-4 mt-4">
            <div className="flex items-center mb-2">
              <Terminal className="text-white mr-2" />
              <textarea
                value={store.inputCommand}
                onChange={handleInputChange}
                className="flex-1 p-2 bg-gray-700 text-white rounded border border-gray-600 font-mono text-sm"
                placeholder="Enter command..."
                rows={Math.min(store.inputCommand.split("\n").length, 10)}
              />
              <button
                onClick={store.executeCommand}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Execute
              </button>
            </div>
            <div className="bg-black text-green-400 p-2 rounded h-32 overflow-auto">
              <pre>{store.output}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* HTML output column */}
      <div className="w-1/4 bg-white p-4 overflow-auto">
        <h2 className="text-xl font-bold mb-4">HTML Output</h2>
        <div dangerouslySetInnerHTML={{ __html: store.output }} />
      </div>
    </div>
  );
};

export default App;
