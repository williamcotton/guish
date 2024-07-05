import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, ASTType } from "../types";

interface GenericCommandModule extends ModuleType {
  command: string;
  args: string;
}

interface GenericCommandProps {
  command: string;
  args: string;
}

const GenericCommandComponent: React.FC<GenericCommandProps> = ({
  command,
  args,
}) => (
  <>
    <div className="flex items-center">
      <span className="font-semibold mr-2">{command}</span>
      {args && (
        <span className="text-sm text-gray-600 truncate max-w-xs" title={args}>
          {args}
        </span>
      )}
    </div>
  </>
);

export const genericPlugin: Plugin = {
  name: "Generic Command",
  command: "",
  parse: (command: ASTType): GenericCommandModule => ({
    type: "generic",
    command: command.name?.text || "",
    args: command.suffix
      ? command.suffix.map((arg: ASTType) => arg.text).join(" ")
      : "",
  }),
  containerClasses: "bg-white p-2 rounded shadow mx-2 relative pr-8 group",
  component: GenericCommandComponent,
  compile: (module: ModuleType): ASTType => {
    const genericModule = module as GenericCommandModule;
    return {
      type: "Command",
      name: { text: genericModule.command },
      suffix: genericModule.args
        ? genericModule.args
            .split(" ")
            .map((arg) => ({ type: "Word", text: arg }))
        : [],
    };
  },
};
