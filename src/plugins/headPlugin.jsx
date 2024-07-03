import React from "react";

export const headPlugin = {
  name: "head",
  command: "head",
  parse: (command) => ({
    type: "head",
    lines: command.suffix
      ? command.suffix.find((arg) => arg.text.startsWith("-n"))?.text.slice(2) || "10"
      : "10",
  }),
  component: ({ lines, setLines }) => (
    <>
      <h2 className="text-lg font-semibold mb-2">head</h2>
      <div className="flex items-center">
        <label className="mr-2">Number of lines:</label>
        <input
          type="number"
          value={lines}
          onChange={(e) => setLines(e.target.value)}
          className="w-20 p-2 border rounded"
          min="1"
        />
      </div>
    </>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: "head" },
    suffix: [{ type: "Word", text: `-n${module.lines}` }],
  }),
};
