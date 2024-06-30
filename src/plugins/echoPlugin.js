import React from "react";

export const echoPlugin = {
  name: "echo",
  command: "echo",
  parse: (command) => ({
    type: "echo",
    text: command.suffix
      ? command.suffix
        .map((arg) => arg.text)
        .join(" ")
        .replace(/^"/, "")
        .replace(/"$/, "")
        .replace(/\\n/g, "\n")
      : "",
  }),
  component: ({ text, setText }) => (
    <div className="flex-1 bg-white p-4 rounded shadow mx-2">
      <h2 className="text-lg font-semibold mb-2">echo</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-32 p-2 border rounded"
        placeholder="Enter text to echo..." />
    </div>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: "echo" },
    suffix: module.text ? [{ type: "Word", text: module.text }] : [],
  }),
};
