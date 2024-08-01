import React from "react";
import CodeEditor from "../codeEditor";
import { Plugin } from "../Plugins";
import { ModuleType, WordNode, RedirectNode, CommandNode } from "../types";

interface NodeJsxModuleType extends ModuleType {
  type: "nodejsx";
  code: string;
}

interface NodeJsxComponentProps extends NodeJsxModuleType {
  setCode: (code: string) => void;
}

const NodeJsxComponent: React.FC<NodeJsxComponentProps> = ({
  code,
  setCode,
}) => (
  <>
    <h2 className="text-lg font-semibold mb-2">Node JSX</h2>
    <CodeEditor value={code} onChange={setCode} language="javascript" />
  </>
);

export const nodejsxPlugin: Plugin = {
  name: "nodejsx",
  command: "nodejsx",
  parse: (command: CommandNode): NodeJsxModuleType => {
    let code = "";
    if (command.suffix) {
      code = command.suffix
        .map((arg: WordNode | RedirectNode) => arg.text || "")
        .join(" ")
        .replace(/^'/, "")
        .replace(/'$/, "");
    }
    return {
      type: "nodejsx",
      code: code,
    };
  },
  component: NodeJsxComponent,
  compile: (module: ModuleType): CommandNode => {
    const nodejsxModule = module as NodeJsxModuleType;
    return {
      type: "Command",
      name: { text: "nodejsx", type: "Word" },
      suffix: nodejsxModule.code
        ? [{ type: "Word", text: `${nodejsxModule.code}` }]
        : [],
    };
  },
};
