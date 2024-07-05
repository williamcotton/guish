import React from "react";
import CodeEditor from "../codeEditor";
import { Plugin } from "../Plugins";
import { ModuleType, WordNode, RedirectNode, CommandNode } from "../types";

interface PrependcssModuleType extends ModuleType {
  type: "prependcss";
  css: string;
}

interface PrependcssComponentProps extends PrependcssModuleType {
  setCss: (css: string) => void;
}

const PrependcssComponent: React.FC<PrependcssComponentProps> = ({
  css,
  setCss,
}) => (
  <>
    <h2 className="text-lg font-semibold mb-2">prependcss</h2>
    <CodeEditor value={css} onChange={setCss} language="css" />
  </>
);

export const prependcssPlugin: Plugin = {
  name: "prependcss",
  command: "prependcss",
  parse: (command: CommandNode): PrependcssModuleType => {
    let css = "";
    if (command.suffix) {
      const cArgIndex = command.suffix.findIndex(
        (arg: WordNode | RedirectNode) => arg.text === "-c"
      );
      if (cArgIndex !== -1 && cArgIndex + 1 < command.suffix.length) {
        css = command.suffix[cArgIndex + 1].text || "";
      }
    }
    return {
      type: "prependcss",
      css: css,
    };
  },
  component: PrependcssComponent,
  compile: (module: ModuleType): CommandNode => {
    const prependcssModule = module as PrependcssModuleType;
    return {
      type: "Command",
      name: { text: "prependcss", type: "Word" },
      suffix: prependcssModule.css
        ? [
            { type: "Word", text: "-c" },
            { type: "Word", text: prependcssModule.css },
          ]
        : [],
    };
  },
};
