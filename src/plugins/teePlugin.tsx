import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, RedirectNode, CommandNode, WordNode } from "../types";

interface TeeRedirect {
  type: "file" | "command";
  target: string;
}

interface TeeModuleType extends ModuleType {
  type: "tee";
  flags: string;
  redirect: TeeRedirect;
}

interface TeeComponentProps extends TeeModuleType {
  setFlags: (flags: string) => void;
  setRedirect: (redirect: TeeRedirect) => void;
}

const TeeComponent: React.FC<TeeComponentProps> = ({
  flags,
  redirect,
  setFlags,
  setRedirect,
}) => {
  const handleFileSelect = async () => {
    try {
      const result = await window.electron.showSaveDialog({
        title: "Select File to Save",
        buttonLabel: "Save",
        filters: [{ name: "All Files", extensions: ["*"] }],
      });
      if (!result.canceled && result.filePath) {
        setRedirect({ ...redirect, target: result.filePath });
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
              setFlags(e.target.checked ? "a" : "");
            }}
          />{" "}
          -a (Append to file)
        </label>
      </div>
      <div className="mb-2">
        <div className="flex items-center mb-2">
          <label htmlFor="tee-redirect-type" className="mr-2">
            Redirect type:
          </label>
          <select
            id="tee-redirect-type"
            value={redirect.type}
            onChange={(e) => {
              setRedirect({
                ...redirect,
                type: e.target.value as "file" | "command",
              });
            }}
            className="mr-2 p-2 border rounded"
          >
            <option value="file">File</option>
            <option value="command">Command</option>
          </select>
        </div>
        <div className="flex">
          <input
            type="text"
            value={redirect.target}
            onChange={(e) => {
              setRedirect({
                ...redirect,
                target: e.target.value,
              });
            }}
            className="flex-grow p-2 border rounded mr-2"
            placeholder={
              redirect.type === "file"
                ? "Enter filename or select file"
                : "Enter command"
            }
          />
          {redirect.type === "file" && (
            <button
              onClick={handleFileSelect}
              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Select File
            </button>
          )}
        </div>
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

    const redirectArg = command.suffix
      ? command.suffix.find(
          (arg: WordNode | RedirectNode) => !arg.text?.startsWith("-")
        )
      : undefined;

    const redirect: TeeRedirect = redirectArg
      ? redirectArg.text?.startsWith(">(")
        ? { type: "command", target: redirectArg.text.slice(2, -1) }
        : { type: "file", target: redirectArg.text || "" }
      : { type: "file", target: "" };

    return {
      type: "tee",
      flags,
      redirect,
    };
  },
  component: TeeComponent,
  compile: (module: ModuleType): CommandNode => {
    const teeModule = module as TeeModuleType;
    const suffix: Array<WordNode | RedirectNode> = [];

    if (teeModule.flags) {
      suffix.push({ type: "Word", text: `-${teeModule.flags}` } as WordNode);
    }

    if (teeModule.redirect.type === "file") {
      suffix.push({
        type: "Word",
        text: teeModule.redirect.target,
      } as WordNode);
    } else {
      suffix.push({
        type: "Word",
        text: `>(${teeModule.redirect.target})`,
        quoteChar: ''
      } as WordNode);
    }

    return {
      type: "Command",
      name: { text: "tee", type: "Word" },
      suffix: suffix,
    };
  },
};
