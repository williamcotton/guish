import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, ASTType } from "../types";

interface EchoModuleType extends ModuleType {
  type: "echo";
  text: string;
}

interface EchoComponentProps extends EchoModuleType {
  setText: (text: string) => void;
}

const EchoComponent: React.FC<EchoComponentProps> = ({ text, setText }) => (
  <>
    <h2 className="text-lg font-semibold mb-2">echo</h2>
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      className="w-full h-32 p-2 border rounded"
      placeholder="Enter text to echo..."
    />
  </>
);

export const echoPlugin: Plugin = {
  name: "echo",
  command: "echo",
  parse: (command: ASTType): EchoModuleType => ({
    type: "echo",
    text: command.suffix
      ? command.suffix
          .map((arg: ASTType) => arg.text || "")
          .join(" ")
          .replace(/^"/, "")
          .replace(/"$/, "")
          .replace(/\\n/g, "\n")
      : "",
  }),
  component: EchoComponent,
  compile: (module: ModuleType): ASTType => {
    const echoModule = module as EchoModuleType;
    return {
      type: "Command",
      name: { text: "echo" },
      suffix: echoModule.text ? [{ type: "Word", text: echoModule.text }] : [],
    };
  },
};
