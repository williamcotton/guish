import React from "react";
import CodeEditor from "../codeEditor.js";

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
    <>
      <h2 className="text-lg font-semibold mb-2">ggplot</h2>
      <CodeEditor value={code} onChange={setCode} language="r" />
    </>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: "ggplot" },
    suffix: module.code ? [{ type: "Word", text: module.code }] : [],
  }),
};