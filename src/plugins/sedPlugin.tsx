import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, RedirectNode, CommandNode, WordNode } from "../types";

interface SedModuleType extends ModuleType {
  type: "sed";
  script: string;
  flags: string;
}

interface SedComponentProps extends SedModuleType {
  setScript: (value: string) => void;
  setFlags: (value: string) => void;
}

const SedComponent: React.FC<SedComponentProps> = ({
  script,
  setScript,
}) => (
  <>
    <h2 className="text-lg font-semibold mb-2">sed</h2>
    <input
      type="text"
      value={script}
      onChange={(e) => setScript(e.target.value)}
      className="w-full p-2 border rounded mb-2"
      placeholder="Enter sed script (e.g., s/foo/bar/)"
    />
  </>
);

export const sedPlugin: Plugin = {
  name: "sed",
  command: "sed",
  parse: (command: CommandNode): SedModuleType => {
    const flags = command.suffix
      ? command.suffix
          .filter((arg: WordNode | RedirectNode) => arg.text?.startsWith("-"))
          .map((arg: WordNode | RedirectNode) => arg.text?.slice(1) || "")
          .join("")
      : "";
    const script = command.suffix
      ? command.suffix
          .filter((arg: WordNode | RedirectNode) => !arg.text?.startsWith("-"))
          .map((arg: WordNode | RedirectNode) => arg.text || "")
          .join(" ")
          .replace(/^'/, "")
          .replace(/'$/, "")
      : "";
    return {
      type: "sed",
      script: script,
      flags: flags,
    };
  },
  component: SedComponent,
  compile: (module: ModuleType): CommandNode => {
    const sedModule = module as SedModuleType;
    return {
      type: "Command",
      name: { text: "sed", type: "Word" },
      suffix: [
        ...(sedModule.flags
          ? [{ type: "Word", text: `-${sedModule.flags}` } as WordNode]
          : []),
        ...(sedModule.script
          ? [{ type: "Word", text: sedModule.script } as WordNode]
          : []),
      ],
    };
  },
};
