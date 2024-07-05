import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, RedirectNode, CommandNode, WordNode } from "../types";

interface TrModuleType extends ModuleType {
  type: "tr";
  flags: string;
  set1: string;
  set2: string;
}

interface TrComponentProps extends TrModuleType {
  setFlags: (flags: string) => void;
  setSet1: (set1: string) => void;
  setSet2: (set2: string) => void;
}

const TrComponent: React.FC<TrComponentProps> = ({
  flags,
  set1,
  set2,
  setFlags,
  setSet1,
  setSet2,
}) => (
  <>
    <h2 className="text-lg font-semibold mb-2">tr (Translate)</h2>
    <div className="flex flex-wrap mb-2">
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
        -d (Delete characters)
      </label>
      <label className="mr-4 mb-2">
        <input
          type="checkbox"
          checked={flags.includes("s")}
          onChange={(e) => {
            if (e.target.checked) {
              setFlags(flags + "s");
            } else {
              setFlags(flags.replace("s", ""));
            }
          }}
        />{" "}
        -s (Squeeze repeats)
      </label>
    </div>
    <input
      type="text"
      value={set1}
      onChange={(e) => setSet1(e.target.value)}
      className="w-full p-2 border rounded mb-2"
      placeholder="Set 1 (characters to translate from)"
    />
    <input
      type="text"
      value={set2}
      onChange={(e) => setSet2(e.target.value)}
      className="w-full p-2 border rounded"
      placeholder="Set 2 (characters to translate to)"
    />
  </>
);

export const trPlugin: Plugin = {
  name: "tr",
  command: "tr",
  parse: (command: CommandNode): TrModuleType => ({
    type: "tr",
    flags: command.suffix
      ? command.suffix
          .filter((arg: WordNode | RedirectNode) => arg.text?.startsWith("-"))
          .map((arg: WordNode | RedirectNode) => arg.text?.slice(1) || "")
          .join("")
      : "",
    set1:
      command.suffix && command.suffix.length > 0
        ? command.suffix[0].text || ""
        : "",
    set2:
      command.suffix && command.suffix.length > 1
        ? command.suffix[1].text || ""
        : "",
  }),
  component: TrComponent,
  compile: (module: ModuleType): CommandNode => {
    const trModule = module as TrModuleType;
    return {
      type: "Command",
      name: { text: "tr", type: "Word" },
      suffix: [
        ...(trModule.flags
          ? [{ type: "Word", text: `-${trModule.flags}` } as WordNode]
          : []),
        { type: "Word", text: trModule.set1 } as WordNode,
        ...(trModule.set2
          ? [{ type: "Word", text: trModule.set2 } as WordNode]
          : []),
      ],
    };
  },
};
