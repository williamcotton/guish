import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, ASTType } from "../types";

interface CutModuleType extends ModuleType {
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
      <label className="block text-sm font-medium text-gray-700">
        Delimiter
      </label>
      <input
        type="text"
        value={delimiter}
        onChange={(e) => setDelimiter(e.target.value)}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        placeholder="Enter delimiter (e.g., ,)"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Fields</label>
      <input
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
  parse: (command: ASTType): CutModuleType => {
    let delimiter = "";
    let fields = "";
    if (command.suffix) {
      const dArg = command.suffix.find((arg: ASTType) =>
        arg.text?.startsWith("-d")
      );
      if (dArg && dArg.text) {
        delimiter = dArg.text.slice(2);
      }
      const fArg = command.suffix.find((arg: ASTType) =>
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
  compile: (module: ModuleType): ASTType => {
    const cutModule = module as CutModuleType;
    return {
      type: "Command",
      name: { text: "cut" },
      suffix: [
        ...(cutModule.delimiter
          ? [{ type: "Word", text: `-d${cutModule.delimiter}` }]
          : []),
        ...(cutModule.fields
          ? [{ type: "Word", text: `-f${cutModule.fields}` }]
          : []),
      ],
    };
  },
};
