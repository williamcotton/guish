import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, ASTType } from "../types";

interface CatModuleType extends ModuleType {
  type: "cat";
  files: string[];
}

interface CatComponentProps extends CatModuleType {
  setFiles: (files: string[]) => void;
}

const CatComponent: React.FC<CatComponentProps> = ({ files, setFiles }) => (
  <>
    <h2 className="text-lg font-semibold mb-2">cat</h2>
    <textarea
      value={files.join("\n")}
      onChange={(e) => setFiles(e.target.value.split("\n"))}
      className="w-full h-32 p-2 border rounded"
      placeholder="Enter filenames (one per line)..."
    />
  </>
);

export const catPlugin: Plugin = {
  name: "cat",
  command: "cat",
  parse: (command: ASTType): CatModuleType => ({
    type: "cat",
    files: command.suffix
      ? command.suffix.map((arg: ASTType) => arg.text || "").filter(Boolean)
      : [],
  }),
  component: CatComponent,
  compile: (module: ModuleType): ASTType => {
    const catModule = module as CatModuleType;
    return {
      type: "Command",
      name: { text: "cat" },
      suffix: catModule.files.map((file) => ({ type: "Word", text: file })),
    };
  },
};
