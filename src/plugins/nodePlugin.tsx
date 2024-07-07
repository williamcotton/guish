import React from "react";
import CodeEditor from "../codeEditor";
import { Plugin } from "../Plugins";
import { ModuleType, WordNode, RedirectNode, CommandNode } from "../types";

interface NodeModuleType extends ModuleType {
  type: "node";
  code: string;
}

interface NodeComponentProps extends NodeModuleType {
  setCode: (code: string) => void;
}

const NodeComponent: React.FC<NodeComponentProps> = ({ code, setCode }) => (
  <>
    <h2 className="text-lg font-semibold mb-2">node</h2>
    <CodeEditor value={code} onChange={setCode} language="javascript" />
  </>
);

export const nodePlugin: Plugin = {
  name: "node",
  command: "node",
  parse: (command: CommandNode): NodeModuleType => {
    let code = "";
    if (command.suffix) {
      const eArgIndex = command.suffix.findIndex(
        (arg: WordNode | RedirectNode) => arg.text === "-e"
      );
      if (eArgIndex !== -1 && eArgIndex + 1 < command.suffix.length) {
        code = (command.suffix[eArgIndex + 1].text || "")
          .replace(/^'/, "")
          .replace(/'$/, "");
      }
    }
    return {
      type: "node",
      code: code,
    };
  },
  component: NodeComponent,
  compile: (module: ModuleType): CommandNode => {
    const nodeModule = module as NodeModuleType;
    return {
      type: "Command",
      name: { text: "node", type: "Word" },
      suffix: nodeModule.code
        ? [
            { type: "Word", text: "-e" },
            { type: "Word", text: `${nodeModule.code}` },
          ]
        : [],
    };
  },
};
