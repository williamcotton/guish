import React from "react";

export const uniqPlugin = {
  name: "uniq",
  command: "uniq",
  parse: (command) => ({
    type: "uniq",
    flags: command.suffix
      ? command.suffix
          .filter((arg) => arg.text.startsWith("-"))
          .map((arg) => arg.text.slice(1))
          .join("")
      : "",
  }),
  component: ({ flags, setFlags }) => (
    <>
      <h2 className="text-lg font-semibold mb-2">uniq</h2>
      <div className="flex flex-wrap">
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={flags.includes("c")}
            onChange={(e) => {
              if (e.target.checked) {
                setFlags(flags + "c");
              } else {
                setFlags(flags.replace("c", ""));
              }
            }}
          />{" "}
          -c (Count occurrences)
        </label>
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={flags.includes("d")}
            onChange={(e) => {
              if (e.target.checked) {
                setFlags(flags + "d");
              } else {
                setFlags(flags.replace("d", ""));
              }
            }}
          />{" "}
          -d (Only print duplicate lines)
        </label>
      </div>
    </>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: "uniq" },
    suffix: module.flags ? [{ type: "Word", text: `-${module.flags}` }] : [],
  }),
};
