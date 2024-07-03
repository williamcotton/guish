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
    <>
      <h2 className="text-lg font-semibold mb-2">sed</h2>
      <input
        type="text"
        value={script || ""}
        onChange={(e) => setScript(e.target.value)}
        className="w-full p-2 border rounded mb-2"
        placeholder="Enter sed script (e.g., s/foo/bar/)" />
    </>
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
