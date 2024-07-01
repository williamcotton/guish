import React from "react";

export const catPlugin = {
  name: "cat",
  command: "cat",
  parse: (command) => ({
    type: "cat",
    files: command.suffix ? command.suffix.map((arg) => arg.text) : [],
  }),
  component: ({ files, setFiles }) => (
    <>
      <h2 className="text-lg font-semibold mb-2">cat</h2>
      <textarea
        value={files.join("\n")}
        onChange={(e) => setFiles(e.target.value.split("\n"))}
        className="w-full h-32 p-2 border rounded"
        placeholder="Enter filenames (one per line)..." />
    </>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: "cat" },
    suffix: module.files.map((file) => ({ type: "Word", text: file })),
  }),
};
