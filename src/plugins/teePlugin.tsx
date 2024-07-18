import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, RedirectNode, CommandNode, WordNode } from "../types";

interface TeeModuleType extends ModuleType {
  type: "tee";
  flags: string;
  file: string;
}

interface TeeComponentProps extends TeeModuleType {
  setFlags: (flags: string) => void;
  setFile: (file: string) => void;
}

const TeeComponent: React.FC<TeeComponentProps> = ({
  flags,
  file,
  setFlags,
  setFile,
}) => {
  const handleFileSelect = async () => {
    try {
      const result = await window.electron.showSaveDialog({
        title: "Select File to Save",
        buttonLabel: "Save",
        filters: [{ name: "All Files", extensions: ["*"] }],
      });
      if (!result.canceled && result.filePath) {
        setFile(result.filePath);
      }
    } catch (error) {
      console.error("Error in file dialog:", error);
    }
  };

  return (
    <>
      <h2 className="text-lg font-semibold mb-2">tee</h2>
      <div className="flex flex-wrap mb-2">
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={flags.includes("a")}
            onChange={(e) => {
              if (e.target.checked) {
                setFlags(flags + "a");
              } else {
                setFlags(flags.replace("a", ""));
              }
            }}
          />{" "}
          -a (Append to file)
        </label>
      </div>
      <div className="flex flex-col">
        <input
          type="text"
          value={file}
          onChange={(e) => setFile(e.target.value)}
          className="p-2 border rounded mb-2"
          placeholder="Enter filename or select file"
        />
        <button
          onClick={handleFileSelect}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Select File
        </button>
      </div>
    </>
  );
};

export const teePlugin: Plugin = {
  name: "tee",
  command: "tee",
  parse: (command: CommandNode): TeeModuleType => {
    const flags = command.suffix
      ? command.suffix
          .filter((arg: WordNode | RedirectNode) => arg.text?.startsWith("-"))
          .map((arg: WordNode | RedirectNode) => arg.text?.slice(1) || "")
          .join("")
      : "";
    const file = command.suffix
      ? command.suffix.find(
          (arg: WordNode | RedirectNode) => !arg.text?.startsWith("-")
        )?.text || ""
      : "";
    return {
      type: "tee",
      flags,
      file,
    };
  },
  component: TeeComponent,
  compile: (module: ModuleType): CommandNode => {
    const teeModule = module as TeeModuleType;
    return {
      type: "Command",
      name: { text: "tee", type: "Word" },
      suffix: [
        ...(teeModule.flags
          ? [{ type: "Word", text: `-${teeModule.flags}` } as WordNode]
          : []),
        ...(teeModule.file
          ? [{ type: "Word", text: teeModule.file } as WordNode]
          : []),
      ],
    };
  },
};
