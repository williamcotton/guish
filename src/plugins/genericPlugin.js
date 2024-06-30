import React from "react";

export const genericPlugin = {
  name: "Generic Command",
  command: "",
  parse: (command) => ({
    type: "generic",
    command: command.name.text,
    args: command.suffix ? command.suffix.map((arg) => arg.text).join(" ") : "",
  }),
  component: ({ command, args }) => (
    <div className="flex-1 bg-white p-4 rounded shadow mx-2">
      <h2 className="text-lg font-semibold mb-2">{command}</h2>
      {args && <p className="text-sm text-gray-600">Args: {args}</p>}
    </div>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: module.command },
    suffix: module.args
      ? module.args.split(" ").map((arg) => ({ type: "Word", text: arg }))
      : [],
  }),
};
