import React from "react";
import CodeEditor from "../codeEditor";
import { Plugin } from "../Plugins";
import { ModuleType, WordNode, RedirectNode, CommandNode } from "../types";

interface PythonModuleType extends ModuleType {
  type: "python";
  code: string;
}

interface PythonComponentProps extends PythonModuleType {
  setCode: (code: string) => void;
}

const PythonComponent: React.FC<PythonComponentProps> = ({ code, setCode }) => (
  <>
    <h2 className="text-lg font-semibold mb-2">python</h2>
    <CodeEditor value={code} onChange={setCode} language="python" />
  </>
);

export const pythonPlugin: Plugin = {
  name: "python",
  command: "python",
  parse: (command: CommandNode): PythonModuleType => {
    let code = "";
    if (command.suffix) {
      const cArgIndex = command.suffix.findIndex(
        (arg: WordNode | RedirectNode) => arg.text === "-c"
      );
      if (cArgIndex !== -1 && cArgIndex + 1 < command.suffix.length) {
        code = (command.suffix[cArgIndex + 1].text || "")
          .replace(/^'/, "")
          .replace(/'$/, "");
      }
    }
    return {
      type: "python",
      code: code,
    };
  },
  component: PythonComponent,
  compile: (module: ModuleType): CommandNode => {
    const pythonModule = module as PythonModuleType;
    return {
      type: "Command",
      name: { text: "python", type: "Word" },
      suffix: pythonModule.code
        ? [
            { type: "Word", text: "-c" },
            { type: "Word", text: `${pythonModule.code}` },
          ]
        : [],
    };
  },
};
