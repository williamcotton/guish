import React from "react";

export const grepPlugin = {
  name: "grep",
  command: "grep",
  parse: (command) => ({
    type: "grep",
    flags: command.suffix
      ? command.suffix
        .filter((arg) => arg.text.startsWith("-"))
        .map((arg) => arg.text.slice(1))
        .join("")
      : "",
    pattern: command.suffix
      ? command.suffix
        .filter((arg) => !arg.text.startsWith("-"))
        .map((arg) => arg.text)
        .join(" ")
        .replace(/^"/, "")
        .replace(/"$/, "")
      : "",
  }),
  component: ({ pattern, setPattern, flags, setFlags }) => (
    <>
      <h2 className="text-lg font-semibold mb-2">grep</h2>
      <input
        type="text"
        value={pattern || ""}
        onChange={(e) => setPattern(e.target.value)}
        className="w-full p-2 border rounded mb-2"
        placeholder="Enter grep pattern..." />
      <div className="flex flex-wrap">
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={flags.includes("i")}
            onChange={(e) => {
              if (e.target.checked) {
                setFlags(flags + "i");
              } else {
                setFlags(flags.replace("i", ""));
              }
            }} />{" "}
          -i (Case insensitive)
        </label>
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={flags.includes("v")}
            onChange={(e) => {
              if (e.target.checked) {
                setFlags(flags + "v");
              } else {
                setFlags(flags.replace("v", ""));
              }
            }} />{" "}
          -v (Invert match)
        </label>
      </div>
    </>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: "grep" },
    suffix: [
      ...(module.flags ? [{ type: "Word", text: `-${module.flags}` }] : []),
      ...(module.pattern ? [{ type: "Word", text: module.pattern }] : []),
    ],
  }),
};
