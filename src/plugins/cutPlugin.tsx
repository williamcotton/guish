import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, CommandNode, WordNode, RedirectNode } from "../types";

export interface CutModuleType extends ModuleType {
  type: "cut";
  delimiter: string;
  fields: string;
}

interface CutComponentProps extends CutModuleType {
  setDelimiter: (delimiter: string) => void;
  setFields: (fields: string) => void;
}

const CutComponent: React.FC<CutComponentProps> = ({
  delimiter,
  fields,
  setDelimiter,
  setFields,
}) => (
  <>
    <h2 className="text-lg font-semibold mb-2">cut</h2>
    <div className="mb-2">
      <label
        htmlFor="cut-delimiter"
        className="block text-sm font-medium text-gray-700"
      >
        Delimiter
      </label>
      <input
        id="cut-delimiter"
        type="text"
        value={delimiter}
        onChange={(e) => setDelimiter(e.target.value)}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        placeholder="Enter delimiter (e.g., ,)"
      />
    </div>
    <div>
      <label
        htmlFor="cut-fields"
        className="block text-sm font-medium text-gray-700"
      >
        Fields
      </label>
      <input
        id="cut-fields"
        type="text"
        value={fields}
        onChange={(e) => setFields(e.target.value)}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        placeholder="Enter fields (e.g., 1,2,3 or 1-3)"
      />
    </div>
  </>
);

export const cutPlugin: Plugin = {
  name: "cut",
  command: "cut",
  parse: (command: CommandNode): CutModuleType => {
    let delimiter = "";
    let fields = "";
    if (command.suffix) {
      const dArg = command.suffix.find((arg: WordNode | RedirectNode) =>
        arg.text?.startsWith("-d")
      );
      if (dArg && dArg.text) {
        delimiter = dArg.text.slice(2);
      }
      const fArg = command.suffix.find((arg: WordNode | RedirectNode) =>
        arg.text?.startsWith("-f")
      );
      if (fArg && fArg.text) {
        fields = fArg.text.slice(2);
      }
    }
    return {
      type: "cut",
      delimiter,
      fields,
    };
  },
  component: CutComponent,
  compile: (module: ModuleType): CommandNode => {
    const cutModule = module as CutModuleType;
    return {
      type: "Command",
      name: { text: "cut", type: "Word" },
      suffix: [
        ...(cutModule.delimiter
          ? [{ type: "Word", text: `-d${cutModule.delimiter}` } as WordNode]
          : []),
        ...(cutModule.fields
          ? [{ type: "Word", text: `-f${cutModule.fields}` } as WordNode]
          : []),
      ],
    };
  },
};
