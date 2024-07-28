import React, { useEffect, useCallback } from "react";

import { Plugins } from "./Plugins";
import { genericPlugin } from "./plugins/genericPlugin";
import { ModuleType } from "./types";
import { UseStoreType } from "./useStore";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import OutputView from "./outputView";

const toggleMinimize = (store: UseStoreType, index: number) => {
  store.setMinimizedModules((prev: boolean[]) => {
    const newState = [...prev];
    newState[index] = !newState[index];
    return newState;
  });
};

export default (store: UseStoreType, module: ModuleType, index: number) => {
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
      {isMinimized && <p className="m-4">{module.command || plugin.name}</p>}
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
          onClick={() => toggleMinimize(store, index)}
          className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label={isMinimized ? "Expand module" : "Minimize module"}
        >
          {isMinimized ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
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
};
