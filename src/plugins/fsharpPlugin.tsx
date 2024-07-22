import React from "react";
import CodeEditor from "../codeEditor";
import { Plugin } from "../Plugins";
import { ModuleType, WordNode, RedirectNode, CommandNode } from "../types";

interface FSharpModuleType extends ModuleType {
  type: "fsharp";
  code: string;
}

interface FSharpComponentProps extends FSharpModuleType {
  setCode: (code: string) => void;
}

const FSharpComponent: React.FC<FSharpComponentProps> = ({ code, setCode }) => (
  <>
    <h2 className="text-lg font-semibold mb-2">F#</h2>
    <CodeEditor value={code} onChange={setCode} language="fsharp" />
  </>
);

export const fsharpPlugin: Plugin = {
  name: "fsharp",
  command: "fsharp",
  parse: (command: CommandNode): FSharpModuleType => {
    let code = "";
    if (command.suffix) {
      code = command.suffix
        .map((arg: WordNode | RedirectNode) => arg.text || "")
        .join(" ")
        .replace(/^'/, "")
        .replace(/'$/, "");
    }
    return {
      type: "fsharp",
      code: code,
    };
  },
  component: FSharpComponent,
  compile: (module: ModuleType): CommandNode => {
    const fsharpModule = module as FSharpModuleType;
    return {
      type: "Command",
      name: { text: "fsharp", type: "Word" },
      suffix: fsharpModule.code
        ? [{ type: "Word", text: `${fsharpModule.code}` }]
        : [],
    };
  },
};