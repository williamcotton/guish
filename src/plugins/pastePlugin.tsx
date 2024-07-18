import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, CommandNode, WordNode, RedirectNode } from "../types";

interface PasteModuleType extends ModuleType {
  type: "paste";
  flags: string;
  delimiter: string;
  files: string[];
}

interface PasteComponentProps extends PasteModuleType {
  setFlags: (flags: string) => void;
  setDelimiter: (delimiter: string) => void;
  setFiles: (files: string[]) => void;
}

const PasteComponent: React.FC<PasteComponentProps> = ({
  flags,
  delimiter,
  files,
  setFlags,
  setDelimiter,
  setFiles,
}) => {
  const handleFlagChange = (flag: "s" | "d", checked: boolean) => {
    let newFlags = flags;
    if (checked) {
      newFlags = newFlags.includes(flag) ? newFlags : newFlags + flag;
    } else {
      newFlags = newFlags.replace(flag, "");
    }
    // Ensure 's' always comes before 'd'
    newFlags =
      (newFlags.includes("s") ? "s" : "") + (newFlags.includes("d") ? "d" : "");
    setFlags(newFlags);
  };

  return (
    <>
      <h2 className="text-lg font-semibold mb-2">paste</h2>
      <div className="flex flex-wrap mb-2">
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={flags.includes("s")}
            onChange={(e) => handleFlagChange("s", e.target.checked)}
          />{" "}
          -s (Serial mode)
        </label>
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={flags.includes("d")}
            onChange={(e) => handleFlagChange("d", e.target.checked)}
          />{" "}
          -d (Use delimiter)
        </label>
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Delimiter
        </label>
        <input
          type="text"
          value={delimiter}
          onChange={(e) => setDelimiter(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Enter delimiter"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Files</label>
        <textarea
          value={files.join("\n")}
          onChange={(e) =>
            setFiles(e.target.value.split("\n").filter((f) => f.trim() !== ""))
          }
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Enter files (one per line) or - for stdin"
          rows={3}
        />
      </div>
    </>
  );
};

export const pastePlugin: Plugin = {
  name: "paste",
  command: "paste",
  parse: (command: CommandNode): PasteModuleType => {
    let flags = "";
    let delimiter = "";
    const files: string[] = [];

    if (command.suffix) {
      command.suffix.forEach((arg: WordNode | RedirectNode) => {
        if (arg.text?.startsWith("-") && arg.text !== "-") {
          const argText = arg.text.slice(1);
          if (argText.includes("s")) flags += "s";
          if (argText.includes("d")) {
            flags += "d";
            delimiter = argText.slice(argText.indexOf("d") + 1) || delimiter;
          }
        } else {
          files.push(arg.text || "");
        }
      });
    }

    return {
      type: "paste",
      flags,
      delimiter,
      files,
    };
  },
  component: PasteComponent,
  compile: (module: ModuleType): CommandNode => {
    const pasteModule = module as PasteModuleType;
    const suffix: WordNode[] = [];

    if (pasteModule.flags) {
      let flagString = "-" + pasteModule.flags;
      if (pasteModule.flags.includes("d")) {
        flagString += pasteModule.delimiter;
      }
      suffix.push({ type: "Word", text: flagString });
    }

    pasteModule.files.forEach((file) => {
      suffix.push({ type: "Word", text: file });
    });

    return {
      type: "Command",
      name: { text: "paste", type: "Word" },
      suffix,
    };
  },
};
