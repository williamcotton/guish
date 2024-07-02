import React from "react";

export const genericPlugin = {
  name: "Generic Command",
  command: "",
  parse: (command) => ({
    type: "generic",
    command: command.name.text,
    args: command.suffix ? command.suffix.map((arg) => arg.text).join(" ") : "",
  }),
  containerClasses: "bg-white p-2 rounded shadow mx-2 relative pr-8 group",
  component: ({ command, args }) => (
    <>
      <div className="flex items-center">
        <span className="font-semibold mr-2">{command}</span>
        {args && (
          <span
            className="text-sm text-gray-600 truncate max-w-xs"
            title={args}
          >
            {args}
          </span>
        )}
      </div>
    </>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: module.command },
    suffix: module.args
      ? module.args.split(" ").map((arg) => ({ type: "Word", text: arg }))
      : [],
  }),
};
