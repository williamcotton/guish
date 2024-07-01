import React from "react";
import CodeEditor from "../codeEditor.js";

export const awkPlugin = {
  name: "awk",
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
    <>
      <h2 className="text-lg font-semibold mb-2">awk</h2>
      <CodeEditor value={program} onChange={setProgram} language="awk" />
    </>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: "awk" },
    suffix: module.program ? [{ type: "Word", text: module.program }] : [],
  }),
};
