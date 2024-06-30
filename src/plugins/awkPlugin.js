import React from "react";

export const awkPlugin = {
  name: "AWK",
  command: "awk",
  parse: (command) => ({
    type: "awk",
    program: command.suffix
      ? command.suffix
        .map((arg) => arg.text)
        .join(" ")
        .replace(/^"/, "")
        .replace(/"$/, "")
      : "",
  }),
  component: ({ program, setProgram }) => (
    <div className="flex-1 bg-white p-4 rounded shadow mx-2">
      <h2 className="text-lg font-semibold mb-2">AWK</h2>
      <textarea
        value={program}
        onChange={(e) => setProgram(e.target.value)}
        className="w-full h-32 p-2 border rounded"
        placeholder="Enter awk program..." />
    </div>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: "awk" },
    suffix: module.program ? [{ type: "Word", text: module.program }] : [],
  }),
};
