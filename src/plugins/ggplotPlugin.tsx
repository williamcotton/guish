import React from "react";
import CodeEditor from "../codeEditor";
import { Plugin } from "../Plugins";
import { ModuleType, ASTType } from "../types";

interface GgplotModuleType extends ModuleType {
  type: "ggplot";
  code: string;
}

interface GgplotComponentProps extends GgplotModuleType {
  setCode: (code: string) => void;
}

const GgplotComponent: React.FC<GgplotComponentProps> = ({ code, setCode }) => (
  <>
    <h2 className="text-lg font-semibold mb-2">ggplot</h2>
    <CodeEditor value={code} onChange={setCode} language="r" />
  </>
);

export const ggplotPlugin: Plugin = {
  name: "ggplot",
  command: "ggplot",
  parse: (command: ASTType): GgplotModuleType => ({
    type: "ggplot",
    code: command.suffix
      ? command.suffix
          .map((arg: ASTType) => arg.text || "")
          .join(" ")
          .replace(/^"/, "")
          .replace(/"$/, "")
      : "",
  }),
  component: GgplotComponent,
  compile: (module: ModuleType): ASTType => {
    const ggplotModule = module as GgplotModuleType;
    return {
      type: "Command",
      name: { text: "ggplot" },
      suffix: ggplotModule.code
        ? [{ type: "Word", text: ggplotModule.code }]
        : [],
    };
  },
};
