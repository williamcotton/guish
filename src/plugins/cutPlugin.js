import React from "react";

export const cutPlugin = {
  name: "cut",
  command: "cut",
  parse: (command) => ({
    type: "cut",
    delimiter: command.suffix
      ? command.suffix
          .find((arg) => arg.text.startsWith("-d"))
          ?.text.slice(2) || ""
      : "",
    fields: command.suffix
      ? command.suffix
          .find((arg) => arg.text.startsWith("-f"))
          ?.text.slice(2) || ""
      : "",
  }),
  component: ({ delimiter, fields, setDelimiter, setFields }) => (
    <div className="flex-1 bg-white p-4 rounded shadow mx-2">
      <h2 className="text-lg font-semibold mb-2">cut</h2>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Delimiter
        </label>
        <input
          type="text"
          value={delimiter}
          onChange={(e) => setDelimiter(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Enter delimiter (e.g., ,)"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Fields
        </label>
        <input
          type="text"
          value={fields}
          onChange={(e) => setFields(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Enter fields (e.g., 1,2,3 or 1-3)"
        />
      </div>
    </div>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: "cut" },
    suffix: [
      ...(module.delimiter
        ? [{ type: "Word", text: `-d${module.delimiter}` }]
        : []),
      ...(module.fields ? [{ type: "Word", text: `-f${module.fields}` }] : []),
    ],
  }),
};
