import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, WordNode, RedirectNode, CommandNode } from "../types";

interface HeadModuleType extends ModuleType {
  type: "head";
  lines: string;
}

interface HeadComponentProps extends HeadModuleType {
  setLines: (lines: string) => void;
}

const HeadComponent: React.FC<HeadComponentProps> = ({ lines, setLines }) => (
  <>
    <h2 className="text-lg font-semibold mb-2">head</h2>
    <div className="flex items-center">
      <label className="mr-2">Number of lines:</label>
      <input
        type="number"
        value={lines}
        onChange={(e) => setLines(e.target.value)}
        className="w-20 p-2 border rounded"
        min="1"
      />
    </div>
  </>
);

export const headPlugin: Plugin = {
  name: "head",
  command: "head",
  parse: (command: CommandNode): HeadModuleType => ({
    type: "head",
    lines: command.suffix
      ? command.suffix
          .find((arg: WordNode | RedirectNode) => arg.text?.startsWith("-n"))
          ?.text?.slice(2) || "10"
      : "10",
  }),
  component: HeadComponent,
  compile: (module: ModuleType): CommandNode => {
    const headModule = module as HeadModuleType;
    return {
      type: "Command",
      name: { text: "head", type: "Word" },
      suffix: [{ type: "Word", text: `-n${headModule.lines}` }],
    };
  },
};
