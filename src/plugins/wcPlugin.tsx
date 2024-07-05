import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, WordNode, RedirectNode, CommandNode } from "../types";

interface WcModuleType extends ModuleType {
  type: "wc";
  flags: string;
}

interface WcComponentProps extends WcModuleType {
  setFlags: (flags: string) => void;
}

const WcComponent: React.FC<WcComponentProps> = ({ flags, setFlags }) => (
  <>
    <h2 className="text-lg font-semibold mb-2">wc (Word Count)</h2>
    <div className="flex flex-wrap">
      <label className="mr-4 mb-2">
        <input
          type="checkbox"
          checked={flags.includes("l")}
          onChange={(e) => {
            if (e.target.checked) {
              setFlags(flags + "l");
            } else {
              setFlags(flags.replace("l", ""));
            }
          }}
        />{" "}
        -l (Count lines)
      </label>
      <label className="mr-4 mb-2">
        <input
          type="checkbox"
          checked={flags.includes("w")}
          onChange={(e) => {
            if (e.target.checked) {
              setFlags(flags + "w");
            } else {
              setFlags(flags.replace("w", ""));
            }
          }}
        />{" "}
        -w (Count words)
      </label>
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
        -c (Count bytes)
      </label>
    </div>
  </>
);

export const wcPlugin: Plugin = {
  name: "wc",
  command: "wc",
  parse: (command: CommandNode): WcModuleType => ({
    type: "wc",
    flags: command.suffix
      ? command.suffix
          .filter((arg: WordNode | RedirectNode) => arg.text?.startsWith("-"))
          .map((arg: WordNode | RedirectNode) => arg.text?.slice(1) || "")
          .join("")
      : "",
  }),
  component: WcComponent,
  compile: (module: ModuleType): CommandNode => {
    const wcModule = module as WcModuleType;
    return {
      type: "Command",
      name: { text: "wc", type: "Word" },
      suffix: wcModule.flags
        ? [{ type: "Word", text: `-${wcModule.flags}` }]
        : [],
    };
  },
};
