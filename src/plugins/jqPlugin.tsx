import React from "react";
import CodeEditor from "../codeEditor";
import { Plugin } from "../Plugins";
import { ModuleType, CommandNode, WordNode, RedirectNode } from "../types";

interface JqModuleType extends ModuleType {
  type: "jq";
  filter: string;
  flags: {
    compact: boolean;
    raw: boolean;
    slurp: boolean;
  };
}

interface JqComponentProps extends JqModuleType {
  setFilter: (filter: string) => void;
  setFlags: (flags: JqModuleType['flags']) => void;
}

const JqComponent: React.FC<JqComponentProps> = ({
  filter,
  flags,
  setFilter,
  setFlags,
}) => (
  <>
    <h2 className="text-lg font-semibold mb-2">jq</h2>
    <div className="mb-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
      <div className="flex flex-wrap">
        <label className="inline-flex items-center mr-4 mb-2">
          <input
            type="checkbox"
            checked={flags.compact}
            onChange={(e) => setFlags({ ...flags, compact: e.target.checked })}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="ml-2">Compact (-c)</span>
        </label>
        <label className="inline-flex items-center mr-4 mb-2">
          <input
            type="checkbox"
            checked={flags.raw}
            onChange={(e) => setFlags({ ...flags, raw: e.target.checked })}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="ml-2">Raw output (-r)</span>
        </label>
        <label className="inline-flex items-center mr-4 mb-2">
          <input
            type="checkbox"
            checked={flags.slurp}
            onChange={(e) => setFlags({ ...flags, slurp: e.target.checked })}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="ml-2">Slurp (-s)</span>
        </label>
      </div>
    </div>
    <div className="h-64">
      <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
      <CodeEditor value={filter} onChange={setFilter} language="jq" />
    </div>
  </>
);

export const jqPlugin: Plugin = {
  name: "jq",
  command: "jq",
  parse: (command: CommandNode): JqModuleType => {
    let filter = "";
    const flags = {
      compact: false,
      raw: false,
      slurp: false,
    };
    if (command.suffix) {
      command.suffix.forEach((arg: WordNode | RedirectNode) => {
        if (arg.text === "-c") flags.compact = true;
        else if (arg.text === "-r") flags.raw = true;
        else if (arg.text === "-s") flags.slurp = true;
        else if (!arg.text?.startsWith("-")) {
          filter = (arg.text || "").replace(/^'/, "").replace(/'$/, "");
        }
      });
    }
    return {
      type: "jq",
      filter,
      flags,
    };
  },
  component: JqComponent,
  compile: (module: ModuleType): CommandNode => {
    const jqModule = module as JqModuleType;
    const flags: string[] = [];
    if (jqModule.flags.compact) flags.push("-c");
    if (jqModule.flags.raw) flags.push("-r");
    if (jqModule.flags.slurp) flags.push("-s");
    return {
      type: "Command",
      name: { text: "jq", type: "Word" },
      suffix: [
        ...flags.map((flag) => ({ type: "Word", text: flag } as WordNode)),
        ...(jqModule.filter
          ? [
              {
                type: "Word",
                text: `${jqModule.filter}`,
              } as WordNode,
            ]
          : []),
      ],
    };
  },
};
