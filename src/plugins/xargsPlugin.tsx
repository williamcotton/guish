import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, ASTType } from "../types";

interface XargsModuleType extends ModuleType {
  type: "xargs";
  flags: string;
  command: string;
}

interface XargsComponentProps extends XargsModuleType {
  setFlags: (flags: string) => void;
  setCommand: (command: string) => void;
}

const XargsComponent: React.FC<XargsComponentProps> = ({
  flags,
  command,
  setFlags,
  setCommand,
}) => {
  const flagsArray = flags.split(" ");
  const nFlag = flagsArray.find((flag) => flag.startsWith("-n")) || "-n1";
  const iFlag = flagsArray.find((flag) => flag.startsWith("-I")) || "-I{}";

  return (
    <>
      <h2 className="text-lg font-semibold mb-2">xargs</h2>
      <div className="flex flex-wrap mb-2">
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={flagsArray.some((flag) => flag.startsWith("-n"))}
            onChange={(e) => {
              const newFlags = e.target.checked
                ? [...flagsArray.filter((f) => !f.startsWith("-n")), nFlag]
                : flagsArray.filter((f) => !f.startsWith("-n"));
              setFlags(newFlags.join(" "));
            }}
          />{" "}
          Use -n flag
        </label>
        <input
          type="text"
          value={nFlag.slice(2)}
          onChange={(e) => {
            const newFlags = flagsArray.map((f) =>
              f.startsWith("-n") ? `-n${e.target.value}` : f
            );
            setFlags(newFlags.join(" "));
          }}
          className="w-16 p-1 border rounded mr-4"
          placeholder="n value"
        />
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={flagsArray.some((flag) => flag.startsWith("-I"))}
            onChange={(e) => {
              const newFlags = e.target.checked
                ? [...flagsArray.filter((f) => !f.startsWith("-I")), iFlag]
                : flagsArray.filter((f) => !f.startsWith("-I"));
              setFlags(newFlags.join(" "));
            }}
          />{" "}
          Use -I flag
        </label>
        <input
          type="text"
          value={iFlag.slice(2)}
          onChange={(e) => {
            const newFlags = flagsArray.map((f) =>
              f.startsWith("-I") ? `-I${e.target.value}` : f
            );
            setFlags(newFlags.join(" "));
          }}
          className="w-16 p-1 border rounded"
          placeholder="I value"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Command
        </label>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Enter command to execute"
        />
      </div>
    </>
  );
};

export const xargsPlugin: Plugin = {
  name: "xargs",
  command: "xargs",
  parse: (command: ASTType): XargsModuleType => ({
    type: "xargs",
    flags: command.suffix
      ? command.suffix
          .filter((arg: ASTType) => arg.text?.startsWith("-"))
          .map((arg: ASTType) => arg.text || "")
          .join(" ")
      : "",
    command: command.suffix
      ? command.suffix
          .filter((arg: ASTType) => !arg.text?.startsWith("-"))
          .map((arg: ASTType) => arg.text || "")
          .join(" ")
      : "",
  }),
  component: XargsComponent,
  compile: (module: ModuleType): ASTType => {
    const xargsModule = module as XargsModuleType;
    return {
      type: "Command",
      name: { text: "xargs" },
      suffix: [
        ...(xargsModule.flags
          ? xargsModule.flags
              .split(" ")
              .map((flag) => ({ type: "Word", text: flag }))
          : []),
        ...(xargsModule.command
          ? xargsModule.command
              .split(" ")
              .map((word) => ({ type: "Word", text: word }))
          : []),
      ],
    };
  },
};
