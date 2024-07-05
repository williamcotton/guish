import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, ASTType } from "../types";

interface SortModuleType extends ModuleType {
  type: "sort";
  flags: string;
  options: string;
}

interface SortComponentProps extends SortModuleType {
  setFlags: (flags: string) => void;
  setOptions: (options: string) => void;
}

const SortComponent: React.FC<SortComponentProps> = ({
  flags,
  options,
  setFlags,
  setOptions,
}) => (
  <>
    <h2 className="text-lg font-semibold mb-2">sort</h2>
    <div className="flex flex-wrap mb-2">
      <label className="mr-4 mb-2">
        <input
          type="checkbox"
          checked={flags.includes("r")}
          onChange={(e) => {
            if (e.target.checked) {
              setFlags(flags + "r");
            } else {
              setFlags(flags.replace("r", ""));
            }
          }}
        />{" "}
        -r (Reverse)
      </label>
      <label className="mr-4 mb-2">
        <input
          type="checkbox"
          checked={flags.includes("n")}
          onChange={(e) => {
            if (e.target.checked) {
              setFlags(flags + "n");
            } else {
              setFlags(flags.replace("n", ""));
            }
          }}
        />{" "}
        -n (Numeric sort)
      </label>
    </div>
    <input
      type="text"
      value={options}
      onChange={(e) => setOptions(e.target.value)}
      className="w-full p-2 border rounded"
      placeholder="Additional options..."
    />
  </>
);

export const sortPlugin: Plugin = {
  name: "sort",
  command: "sort",
  parse: (command: ASTType): SortModuleType => ({
    type: "sort",
    flags: command.suffix
      ? command.suffix
          .filter((arg: ASTType) => arg.text?.startsWith("-"))
          .map((arg: ASTType) => arg.text?.slice(1) || "")
          .join("")
      : "",
    options: command.suffix
      ? command.suffix
          .filter((arg: ASTType) => !arg.text?.startsWith("-"))
          .map((arg: ASTType) => arg.text || "")
          .join(" ")
      : "",
  }),
  component: SortComponent,
  compile: (module: ModuleType): ASTType => {
    const sortModule = module as SortModuleType;
    return {
      type: "Command",
      name: { text: "sort" },
      suffix: [
        ...(sortModule.flags
          ? [{ type: "Word", text: `-${sortModule.flags}` }]
          : []),
        ...(sortModule.options
          ? sortModule.options
              .split(" ")
              .map((opt) => ({ type: "Word", text: opt }))
          : []),
      ],
    };
  },
};
