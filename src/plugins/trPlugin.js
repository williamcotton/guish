import React from "react";

export const trPlugin = {
  name: "tr",
  command: "tr",
  parse: (command) => ({
    type: "tr",
    flags: command.suffix
      ? command.suffix
          .filter((arg) => arg.text.startsWith("-"))
          .map((arg) => arg.text.slice(1))
          .join("")
      : "",
    set1:
      command.suffix && command.suffix.length > 0 ? command.suffix[0].text : "",
    set2:
      command.suffix && command.suffix.length > 1 ? command.suffix[1].text : "",
  }),
  component: ({ flags, set1, set2, setFlags, setSet1, setSet2 }) => (
    <div className="flex-1 bg-white p-4 rounded shadow mx-2">
      <h2 className="text-lg font-semibold mb-2">tr (Translate)</h2>
      <div className="flex flex-wrap mb-2">
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
          -d (Delete characters)
        </label>
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={flags.includes("s")}
            onChange={(e) => {
              if (e.target.checked) {
                setFlags(flags + "s");
              } else {
                setFlags(flags.replace("s", ""));
              }
            }}
          />{" "}
          -s (Squeeze repeats)
        </label>
      </div>
      <input
        type="text"
        value={set1}
        onChange={(e) => setSet1(e.target.value)}
        className="w-full p-2 border rounded mb-2"
        placeholder="Set 1 (characters to translate from)"
      />
      <input
        type="text"
        value={set2}
        onChange={(e) => setSet2(e.target.value)}
        className="w-full p-2 border rounded"
        placeholder="Set 2 (characters to translate to)"
      />
    </div>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: "tr" },
    suffix: [
      ...(module.flags ? [{ type: "Word", text: `-${module.flags}` }] : []),
      { type: "Word", text: module.set1 },
      ...(module.set2 ? [{ type: "Word", text: module.set2 }] : []),
    ],
  }),
};
