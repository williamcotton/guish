import React from "react";
import CodeEditor from "../codeEditor";
import { Plugin } from "../Plugins";
import { ModuleType, CommandNode, WordNode, RedirectNode } from "../types";

interface AwkModuleType extends ModuleType {
  type: "awk";
  program: string;
  fieldSeparator: string;
}

interface AwkComponentProps extends AwkModuleType {
  setProgram: (value: string) => void;
  setFieldSeparator: (value: string) => void;
}

const AwkComponent: React.FC<AwkComponentProps> = ({
  program,
  setProgram,
  fieldSeparator,
  setFieldSeparator,
}) => (
  <>
    <h2 className="text-lg font-semibold mb-2">awk</h2>
    <div className="mb-2 flex items-center">
      <label htmlFor="field-separator" className="text-sm font-medium text-gray-700 mr-2">
        Field Separator:
      </label>
      <input
        id="field-separator"
        type="text"
        value={fieldSeparator}
        onChange={(e) => setFieldSeparator(e.target.value)}
        className="w-16 border border-gray-300 rounded-md shadow-sm p-1"
        placeholder="e.g., ','"
      />
    </div>
    <div className="h-full">
      <label className="block text-sm font-medium text-gray-700">Program</label>
      <CodeEditor value={program} onChange={setProgram} language="awk" />
    </div>
  </>
);

export const awkPlugin: Plugin = {
  name: "awk",
  command: "awk",
  parse: (command: CommandNode): AwkModuleType => {
    let program = "";
    let fieldSeparator = "";
    if (command.suffix) {
      const fArgIndex = command.suffix.findIndex((arg: WordNode | RedirectNode) =>
        arg.text?.startsWith("-F")
      );
      if (fArgIndex !== -1 && command.suffix[fArgIndex].text) {
        fieldSeparator = command.suffix[fArgIndex].text.slice(2);
      }
      program = command.suffix
        .filter((arg: WordNode | RedirectNode) => !arg.text?.startsWith("-F"))
        .map((arg: WordNode | RedirectNode) => arg.text)
        .filter(
          (text: string | undefined): text is string => text !== undefined
        )
        .join(" ")
        .replace(/^"/, "")
        .replace(/"$/, "");
    }
    return {
      type: "awk",
      program: program,
      fieldSeparator: fieldSeparator,
    };
  },
  component: AwkComponent,
  compile: (module: ModuleType): CommandNode => {
    const awkModule = module as AwkModuleType;
    return {
      type: "Command",
      name: { text: "awk", type: "Word" },
      suffix: [
        ...(awkModule.fieldSeparator
          ? [
              {
                type: "Word",
                text: `-F${awkModule.fieldSeparator}`,
              } as WordNode,
            ]
          : []),
        ...(awkModule.program
          ? [{ type: "Word", text: awkModule.program } as WordNode]
          : []),
      ],
    };
  },
};
