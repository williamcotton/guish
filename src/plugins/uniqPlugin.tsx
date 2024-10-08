import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, WordNode, RedirectNode, CommandNode } from "../types";

interface UniqModuleType extends ModuleType {
  type: "uniq";
  flags: string;
}

interface UniqComponentProps extends UniqModuleType {
  setFlags: (flags: string) => void;
}

const UniqComponent: React.FC<UniqComponentProps> = ({ flags, setFlags }) => (
  <>
    <h2 className="text-lg font-semibold mb-2">uniq</h2>
    <div className="flex flex-wrap">
      <label className="mr-4 mb-2">
        <input
          type="checkbox"
          checked={flags.includes("c")}
          onChange={(e) => {
            if (e.target.checked) {
              setFlags(flags + "c");
            } else {
              setFlags(flags.replace("c", ""));
            }
          }}
        />{" "}
        -c (Count occurrences)
      </label>
      <label className="mr-4 mb-2">
        <input
          type="checkbox"
          checked={flags.includes("d")}
          onChange={(e) => {
            if (e.target.checked) {
              setFlags(flags + "d");
            } else {
              setFlags(flags.replace("d", ""));
            }
          }}
        />{" "}
        -d (Only print duplicate lines)
      </label>
    </div>
  </>
);

export const uniqPlugin: Plugin = {
  name: "uniq",
  command: "uniq",
  parse: (command: CommandNode): UniqModuleType => ({
    type: "uniq",
    flags: command.suffix
      ? command.suffix
          .filter((arg: WordNode | RedirectNode) => arg.text?.startsWith("-"))
          .map((arg: WordNode | RedirectNode) => arg.text?.slice(1) || "")
          .join("")
      : "",
  }),
  component: UniqComponent,
  compile: (module: ModuleType): CommandNode => {
    const uniqModule = module as UniqModuleType;
    return {
      type: "Command",
      name: { text: "uniq", type: "Word" },
      suffix: uniqModule.flags
        ? [{ type: "Word", text: `-${uniqModule.flags}` }]
        : [],
    };
  },
};
