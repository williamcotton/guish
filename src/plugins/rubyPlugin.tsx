import React from "react";
import CodeEditor from "../codeEditor";
import { Plugin } from "../Plugins";
import { ModuleType, WordNode, RedirectNode, CommandNode } from "../types";

interface RubyModuleType extends ModuleType {
  type: "ruby";
  code: string;
}

interface RubyComponentProps extends RubyModuleType {
  setCode: (code: string) => void;
}

const RubyComponent: React.FC<RubyComponentProps> = ({ code, setCode }) => (
  <>
    <h2 className="text-lg font-semibold mb-2">ruby</h2>
    <CodeEditor value={code} onChange={setCode} language="ruby" />
  </>
);

export const rubyPlugin: Plugin = {
  name: "ruby",
  command: "ruby",
  parse: (command: CommandNode): RubyModuleType => {
    let code = "";
    if (command.suffix) {
      const eArgIndex = command.suffix.findIndex(
        (arg: WordNode | RedirectNode) => arg.text === "-e"
      );
      if (eArgIndex !== -1 && eArgIndex + 1 < command.suffix.length) {
        code = (command.suffix[eArgIndex + 1].text || "")
      }
    }
    return {
      type: "ruby",
      code: code,
    };
  },
  component: RubyComponent,
  compile: (module: ModuleType): CommandNode => {
    const rubyModule = module as RubyModuleType;
    return {
      type: "Command",
      name: { text: "ruby", type: "Word" },
      suffix: rubyModule.code
        ? [
            { type: "Word", text: "-e" },
            { type: "Word", text: `${rubyModule.code}` },
          ]
        : [],
    };
  },
};