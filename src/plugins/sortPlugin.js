import React from "react";

export const sortPlugin = {
  name: "sort",
  command: "sort",
  parse: (command) => ({
    type: "sort",
    flags: command.suffix
      ? command.suffix
          .filter((arg) => arg.text.startsWith("-"))
          .map((arg) => arg.text.slice(1))
          .join("")
      : "",
    options: command.suffix
      ? command.suffix
          .filter((arg) => !arg.text.startsWith("-"))
          .map((arg) => arg.text)
          .join(" ")
      : "",
  }),
  component: ({ flags, options, setFlags, setOptions }) => (
    <>
      <h2 className="text-lg font-semibold mb-2">sort</h2>
      <div className="flex flex-wrap mb-2">
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={flags.includes("r")}
            onChange={(e) => {
              if (e.target.checked) {
                setFlags(flags + "r");
              } else {
                setFlags(flags.replace("r", ""));
              }
            }}
          />{" "}
          -r (Reverse)
        </label>
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={flags.includes("n")}
            onChange={(e) => {
              if (e.target.checked) {
                setFlags(flags + "n");
              } else {
                setFlags(flags.replace("n", ""));
              }
            }}
          />{" "}
          -n (Numeric sort)
        </label>
      </div>
      <input
        type="text"
        value={options}
        onChange={(e) => setOptions(e.target.value)}
        className="w-full p-2 border rounded"
        placeholder="Additional options..."
      />
    </>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: "sort" },
    suffix: [
      ...(module.flags ? [{ type: "Word", text: `-${module.flags}` }] : []),
      ...(module.options
        ? module.options.split(" ").map((opt) => ({ type: "Word", text: opt }))
        : []),
    ],
  }),
};
