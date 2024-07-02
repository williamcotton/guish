import React from "react";
import CodeEditor from "../codeEditor.js";

export const awkPlugin = {
  name: "awk",
  command: "awk",
  parse: (command) => {
    let program = "";
    let fieldSeparator = "";
    if (command.suffix) {
      const fArgIndex = command.suffix.findIndex((arg) =>
        arg.text.startsWith("-F")
      );
      if (fArgIndex !== -1) {
        fieldSeparator = command.suffix[fArgIndex].text.slice(2);
      }
      program = command.suffix
        .filter((arg) => !arg.text.startsWith("-F"))
        .map((arg) => arg.text)
        .join(" ")
        .replace(/^"/, "")
        .replace(/"$/, "");
    }
    return {
      type: "awk",
      program: program,
      fieldSeparator: fieldSeparator,
    };
  },
  component: ({ program, setProgram, fieldSeparator, setFieldSeparator }) => (
    <>
      <h2 className="text-lg font-semibold mb-2">awk</h2>
      <div className="mb-2 flex items-center">
        <label className="text-sm font-medium text-gray-700 mr-2">
          Field Separator:
        </label>
        <input
          type="text"
          value={fieldSeparator}
          onChange={(e) => setFieldSeparator(e.target.value)}
          className="w-16 border border-gray-300 rounded-md shadow-sm p-1"
          placeholder="e.g., ','"
        />
      </div>
      <div className="h-full">
        <label className="block text-sm font-medium text-gray-700">
          Program
        </label>
        <CodeEditor value={program} onChange={setProgram} language="awk" />
      </div>
    </>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: "awk" },
    suffix: [
      ...(module.fieldSeparator
        ? [{ type: "Word", text: `-F${module.fieldSeparator}` }]
        : []),
      ...(module.program ? [{ type: "Word", text: module.program }] : []),
    ],
  }),
};
