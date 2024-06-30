import React from "react";

export const sedPlugin = {
  name: "sed",
  command: "sed",
  parse: (command) => ({
    type: "sed",
    flags: command.suffix
      ? command.suffix
        .filter((arg) => arg.text.startsWith("-"))
        .map((arg) => arg.text.slice(1))
        .join("")
      : "",
    script: command.suffix
      ? command.suffix
        .filter((arg) => !arg.text.startsWith("-"))
        .map((arg) => arg.text)
        .join(" ")
        .replace(/^'/, "")
        .replace(/'$/, "")
      : "",
  }),
  component: ({ script, setScript, flags, setFlags }) => (
    <div className="flex-1 bg-white p-4 rounded shadow mx-2">
      <h2 className="text-lg font-semibold mb-2">sed</h2>
      <input
        type="text"
        value={script || ""}
        onChange={(e) => setScript(e.target.value)}
        className="w-full p-2 border rounded mb-2"
        placeholder="Enter sed script (e.g., s/foo/bar/)" />
      <div className="flex flex-wrap">
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={flags.includes("g")}
            onChange={(e) => {
              if (e.target.checked) {
                setFlags(flags + "g");
              } else {
                setFlags(flags.replace("g", ""));
              }
            }} />{" "}
          -g (Global replacement)
        </label>
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
      </div>
    </div>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: "sed" },
    suffix: [
      ...(module.flags ? [{ type: "Word", text: `-${module.flags}` }] : []),
      ...(module.script ? [{ type: "Word", text: module.script }] : []),
    ],
  }),
};
