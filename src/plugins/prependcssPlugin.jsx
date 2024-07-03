import React from "react";
import CodeEditor from "../codeEditor";

export const prependcssPlugin = {
  name: "prependcss",
  command: "prependcss",
  parse: (command) => {
    let css = "";
    if (command.suffix) {
      const cArgIndex = command.suffix.findIndex((arg) => arg.text === "-c");
      if (cArgIndex !== -1 && cArgIndex + 1 < command.suffix.length) {
        css = command.suffix[cArgIndex + 1].text;
      }
    }
    return {
      type: "prependcss",
      css: css,
    };
  },
  component: ({ css, setCss }) => (
    <>
      <h2 className="text-lg font-semibold mb-2">prependcss</h2>
      <CodeEditor value={css} onChange={setCss} language="css" />
    </>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: "prependcss" },
    suffix: module.css
      ? [
          { type: "Word", text: "-c" },
          { type: "Word", text: module.css },
        ]
      : [],
  }),
};
