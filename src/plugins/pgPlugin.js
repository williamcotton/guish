import React from "react";

// Modified plugin definitions
export const pgPlugin = {
  name: "PostgreSQL",
  command: "pg",
  parse: (command) => {
    let query = "";
    let database = "";
    if (command.suffix) {
      const dArgIndex = command.suffix.findIndex((arg) => arg.text === "-d");
      if (dArgIndex !== -1 && dArgIndex + 1 < command.suffix.length) {
        database = command.suffix[dArgIndex + 1].text;
      }
      const cArgIndex = command.suffix.findIndex((arg) => arg.text === "-c");
      if (cArgIndex !== -1 && cArgIndex + 1 < command.suffix.length) {
        query = command.suffix[cArgIndex + 1].text;
      }
    }
    return {
      type: "pg",
      database: database,
      query: query,
    };
  },
  component: ({ database, query, setDatabase, setQuery }) => (
    <div className="flex-1 bg-white p-4 rounded shadow mx-2">
      <h2 className="text-lg font-semibold mb-2">pg</h2>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Database
        </label>
        <input
          type="text"
          value={database}
          onChange={(e) => setDatabase(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Enter database name..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Query</label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mt-1 block w-full h-32 border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Enter PostgreSQL query..." />
      </div>
    </div>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: "pg" },
    suffix: [
      ...(module.database
        ? [
          { type: "Word", text: "-d" },
          { type: "Word", text: module.database },
        ]
        : []),
      ...(module.query
        ? [
          { type: "Word", text: "-c" },
          { type: "Word", text: module.query },
        ]
        : []),
    ],
  }),
};
