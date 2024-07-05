import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, CommandNode, WordNode } from "../types";

interface CdModuleType extends ModuleType {
  type: "cd";
  path: string;
}

interface CdComponentProps extends CdModuleType {
  setPath: (path: string) => void;
}

const CdComponent: React.FC<CdComponentProps> = ({ path, setPath }) => {
  const handleDirectorySelect = async () => {
    try {
      const result = await window.electron.showDirectoryDialog({
        title: "Select Directory",
        properties: ["openDirectory"],
      });
      if (!result.canceled && result.filePaths.length > 0) {
        setPath(result.filePaths[0]);
      }
    } catch (error) {
      console.error("Error in directory dialog:", error);
    }
  };

  return (
    <>
      <h2 className="text-lg font-semibold mb-2">cd (Change Directory)</h2>
      <div className="flex items-center">
        <input
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="flex-grow p-2 border rounded mr-2"
          placeholder="Enter directory path or select directory"
        />
        <button
          onClick={handleDirectorySelect}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Select Directory
        </button>
      </div>
    </>
  );
};

export const cdPlugin: Plugin = {
  name: "cd",
  command: "cd",
  parse: (command: CommandNode): CdModuleType => ({
    type: "cd",
    path: command.suffix && command.suffix.length > 0 ? command.suffix[0].text || "" : "",
  }),
  component: CdComponent,
  compile: (module: ModuleType): CommandNode => {
    const cdModule = module as CdModuleType;
    return {
      type: "Command",
      name: { text: "cd", type: "Word" },
      suffix: cdModule.path ? [{ type: "Word", text: cdModule.path } as WordNode] : [],
    };
  },
};