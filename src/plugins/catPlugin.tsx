import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, CommandNode, WordNode } from "../types";

export interface CatModuleType extends ModuleType {
  type: "cat";
  file: string;
}

interface CatComponentProps extends CatModuleType {
  setFile: (file: string) => void;
}

const CatComponent: React.FC<CatComponentProps> = ({ file, setFile }) => {
  const handleFileSelect = async () => {
    try {
      const result = await window.electron.showOpenScriptDialog({});
      if (!result.canceled && result.filePaths.length > 0) {
        setFile(result.filePaths[0]);
      }
    } catch (error) {
      console.error("Error in file dialog:", error);
    }
  };

  return (
    <>
      <h2 className="text-lg font-semibold mb-2">cat</h2>
      <div className="flex items-center">
        <input
          type="text"
          value={file}
          onChange={(e) => setFile(e.target.value)}
          className="flex-grow p-2 border rounded mr-2"
          placeholder="Enter filename or select file"
        />
        <button
          onClick={handleFileSelect}
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Select File
        </button>
      </div>
    </>
  );
};

export const catPlugin: Plugin = {
  name: "cat",
  command: "cat",
  parse: (command: CommandNode): CatModuleType => ({
    type: "cat",
    file:
      command.suffix && command.suffix[0]
        ? (command.suffix[0] as WordNode).text
        : "",
  }),
  component: CatComponent,
  compile: (module: ModuleType): CommandNode => {
    const catModule = module as CatModuleType;
    return {
      type: "Command",
      name: { text: "cat", type: "Word" },
      suffix: catModule.file ? [{ type: "Word", text: catModule.file }] : [],
    };
  },
};
