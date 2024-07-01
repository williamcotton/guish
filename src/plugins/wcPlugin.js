import React from "react";

export const wcPlugin = {
  name: "wc",
  command: "wc",
  parse: (command) => ({
    type: "wc",
    flags: command.suffix
      ? command.suffix
          .filter((arg) => arg.text.startsWith("-"))
          .map((arg) => arg.text.slice(1))
          .join("")
      : "",
  }),
  component: ({ flags, setFlags }) => (
    <div className="flex-1 bg-white p-4 rounded shadow mx-2">
      <h2 className="text-lg font-semibold mb-2">wc (Word Count)</h2>
      <div className="flex flex-wrap">
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={flags.includes("l")}
            onChange={(e) => {
              if (e.target.checked) {
                setFlags(flags + "l");
              } else {
                setFlags(flags.replace("l", ""));
              }
            }}
          />{" "}
          -l (Count lines)
        </label>
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={flags.includes("w")}
            onChange={(e) => {
              if (e.target.checked) {
                setFlags(flags + "w");
              } else {
                setFlags(flags.replace("w", ""));
              }
            }}
          />{" "}
          -w (Count words)
        </label>
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
          -c (Count bytes)
        </label>
      </div>
    </div>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: "wc" },
    suffix: module.flags ? [{ type: "Word", text: `-${module.flags}` }] : [],
  }),
};
