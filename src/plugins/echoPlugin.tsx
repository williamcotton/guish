import React from "react";
import CodeEditor from "../codeEditor";
import { Plugin } from "../Plugins";
import { ModuleType, WordNode, RedirectNode, CommandNode } from "../types";

interface EchoModuleType extends ModuleType {
  type: "echo";
  text: string;
  enableEscapes: boolean;
}

interface EchoComponentProps extends EchoModuleType {
  setText: (text: string) => void;
  setEnableEscapes: (enable: boolean) => void;
}

const EchoComponent: React.FC<EchoComponentProps> = ({
  text,
  enableEscapes,
  setText,
  setEnableEscapes,
}) => (
  <>
    <h2 className="text-lg font-semibold mb-2">echo</h2>
    <div className="mb-2">
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={enableEscapes}
          onChange={(e) => setEnableEscapes(e.target.checked)}
          className="mr-2"
        />
        Enable escape sequences (-e)
      </label>
    </div>
    <CodeEditor value={text} onChange={setText} language="plaintext" />
  </>
);

export const echoPlugin: Plugin = {
  name: "echo",
  command: "echo",
  parse: (command: CommandNode): EchoModuleType => {
    let text = "";
    let enableEscapes = false;
    if (command.suffix) {
      const eArgIndex = command.suffix.findIndex(
        (arg: WordNode | RedirectNode) => arg.text === "-e"
      );
      if (eArgIndex !== -1) {
        enableEscapes = true;
        command.suffix.splice(eArgIndex, 1);
      }
      text = command.suffix
        .map((arg: WordNode | RedirectNode) => arg.text)
        .join(" ")
        .replace(/^['"]/, "")
        .replace(/['"]$/, "");
    }
    return {
      type: "echo",
      text,
      enableEscapes,
    };
  },
  component: EchoComponent,
  compile: (module: ModuleType): CommandNode => {
    const echoModule = module as EchoModuleType;
    const suffix: WordNode[] = [];
    if (echoModule.enableEscapes) {
      suffix.push({ type: "Word", text: "-e" });
    }
    suffix.push({ type: "Word", text: echoModule.text });
    return {
      type: "Command",
      name: { text: "echo", type: "Word" },
      suffix,
    };
  },
};
