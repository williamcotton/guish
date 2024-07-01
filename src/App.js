import React, { useEffect } from "react";
import { Terminal } from "lucide-react";

import { useStore } from "./useStore.js";
import { Plugins } from "./Plugins.js";
import { genericPlugin } from "./plugins/genericPlugin.js";

export const defaultCommand =
  'echo "foo\\nbrick\\nbonk" | grep -i "foo" | awk "{print $1}" | sed "s/foo/bar/g"';

const App = () => {
  const store = useStore();

  const handleInputChange = (e) => {
    store.setInputCommand(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid line break
      store.executeCommand();
    }
  };

  useEffect(() => {
    const handleGlobalKeyPress = (e) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        store.executeCommand();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyPress);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyPress);
    };
  }, [store]);

  const renderModule = (module, index) => {
    const plugin = Plugins.get(module.type) || genericPlugin;
    if (!plugin) return null;

    const Component = plugin.component;
    return (
      <Component
        key={`${module.type}-${index}`}
        {...module}
        {...Object.fromEntries(
          Object.keys(module).map((key) => [
            `set${key.charAt(0).toUpperCase() + key.slice(1)}`,
            (value) => store.updateModule(index, { [key]: value }),
          ])
        )}
      />
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main content column */}
      <div className="flex flex-col w-3/4">
        <header className="bg-gray-800 text-white p-4">
          <h1 className="text-2xl font-bold">guish</h1>
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
                onKeyPress={handleKeyPress}
                className="flex-1 p-2 bg-gray-700 text-white rounded border border-gray-600"
                placeholder="Enter command..."
                rows={store.inputCommand.split("\n").length}
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
