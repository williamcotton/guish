import React from "react";

export const teePlugin = {
  name: "tee",
  command: "tee",
  parse: (command) => ({
    type: "tee",
    flags: command.suffix
      ? command.suffix
          .filter((arg) => arg.text.startsWith("-"))
          .map((arg) => arg.text.slice(1))
          .join("")
      : "",
    file: command.suffix
      ? command.suffix.find((arg) => !arg.text.startsWith("-"))?.text || ""
      : "",
  }),
  component: ({ flags, file, setFlags, setFile }) => (
    <>
      <h2 className="text-lg font-semibold mb-2">tee</h2>
      <div className="flex flex-wrap mb-2">
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={flags.includes("a")}
            onChange={(e) => {
              if (e.target.checked) {
                setFlags(flags + "a");
              } else {
                setFlags(flags.replace("a", ""));
              }
            }}
          />{" "}
          -a (Append to file)
        </label>
      </div>
      <input
        type="text"
        value={file}
        onChange={(e) => setFile(e.target.value)}
        className="w-full p-2 border rounded"
        placeholder="Enter filename"
      />
    </>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: "tee" },
    suffix: [
      ...(module.flags ? [{ type: "Word", text: `-${module.flags}` }] : []),
      ...(module.file ? [{ type: "Word", text: module.file }] : []),
    ],
  }),
};
