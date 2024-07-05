import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, ASTType } from "../types";

interface GrepModuleType extends ModuleType {
  type: "grep";
  pattern: string;
  flags: string;
}

interface GrepComponentProps extends GrepModuleType {
  setPattern: (value: string) => void;
  setFlags: (value: string) => void;
}

const GrepComponent: React.FC<GrepComponentProps> = ({
  pattern,
  setPattern,
  flags,
  setFlags,
}) => (
  <>
    <h2 className="text-lg font-semibold mb-2">grep</h2>
    <input
      type="text"
      value={pattern}
      onChange={(e) => setPattern(e.target.value)}
      className="w-full p-2 border rounded mb-2"
      placeholder="Enter grep pattern..."
    />
    <div className="flex flex-wrap">
      <label className="mr-4 mb-2">
        <input
          type="checkbox"
          checked={flags.includes("i")}
          onChange={(e) => {
            if (e.target.checked) {
              setFlags(flags + "i");
            } else {
              setFlags(flags.replace("i", ""));
            }
          }}
        />{" "}
        -i (Case insensitive)
      </label>
      <label className="mr-4 mb-2">
        <input
          type="checkbox"
          checked={flags.includes("v")}
          onChange={(e) => {
            if (e.target.checked) {
              setFlags(flags + "v");
            } else {
              setFlags(flags.replace("v", ""));
            }
          }}
        />{" "}
        -v (Invert match)
      </label>
    </div>
  </>
);

export const grepPlugin: Plugin = {
  name: "grep",
  command: "grep",
  parse: (command: ASTType): GrepModuleType => {
    const flags = command.suffix
      ? command.suffix
          .filter((arg: ASTType) => arg.text?.startsWith("-"))
          .map((arg: ASTType) => arg.text?.slice(1) || "")
          .join("")
      : "";
    const pattern = command.suffix
      ? command.suffix
          .filter((arg: ASTType) => !arg.text?.startsWith("-"))
          .map((arg: ASTType) => arg.text || "")
          .join(" ")
          .replace(/^"/, "")
          .replace(/"$/, "")
      : "";
    return {
      type: "grep",
      flags: flags,
      pattern: pattern,
    };
  },
  component: GrepComponent,
  compile: (module: ModuleType): ASTType => {
    const grepModule = module as GrepModuleType;
    return {
      type: "Command",
      name: { text: "grep" },
      suffix: [
        ...(grepModule.flags
          ? [{ type: "Word", text: `-${grepModule.flags}` }]
          : []),
        ...(grepModule.pattern
          ? [{ type: "Word", text: grepModule.pattern }]
          : []),
      ],
    };
  },
};
