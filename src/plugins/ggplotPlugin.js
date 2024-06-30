import React from "react";

export const ggplotPlugin = {
  name: "ggplot",
  command: "ggplot",
  parse: (command) => ({
    type: "ggplot",
    code: command.suffix
      ? command.suffix
          .map((arg) => arg.text)
          .join(" ")
          .replace(/^"/, "")
          .replace(/"$/, "")
      : "",
  }),
  component: ({ code, setCode }) => (
    <div className="flex-1 bg-white p-4 rounded shadow mx-2">
      <h2 className="text-lg font-semibold mb-2">ggplot</h2>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-32 p-2 border rounded"
        placeholder="Enter ggplot code..." />
    </div>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: "ggplot" },
    suffix: module.code ? [{ type: "Word", text: `"${module.code}"` }] : [],
  }),
};