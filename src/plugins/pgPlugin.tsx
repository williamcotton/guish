import React from "react";
import CodeEditor from "../codeEditor";
import { Plugin } from "../Plugins";
import { ModuleType, RedirectNode, CommandNode, WordNode } from "../types";

interface PgModuleType extends ModuleType {
  type: "pg";
  database: string;
  query: string;
}

interface PgComponentProps extends PgModuleType {
  setDatabase: (value: string) => void;
  setQuery: (value: string) => void;
}

const PgComponent: React.FC<PgComponentProps> = ({
  database,
  query,
  setDatabase,
  setQuery,
}) => (
  <>
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
        placeholder="Enter database name..."
      />
    </div>
    <div className="h-full">
      <label className="block text-sm font-medium text-gray-700">Query</label>
      <CodeEditor value={query} onChange={setQuery} language="sql" />
    </div>
  </>
);

export const pgPlugin: Plugin = {
  name: "PostgreSQL",
  command: "pg",
  parse: (command: CommandNode): PgModuleType => {
    let query = "";
    let database = "";
    if (command.suffix) {
      const dArgIndex = command.suffix.findIndex(
        (arg: WordNode | RedirectNode) => arg.text === "-d"
      );
      if (dArgIndex !== -1 && dArgIndex + 1 < command.suffix.length) {
        database = command.suffix[dArgIndex + 1].text || "";
      }
      const cArgIndex = command.suffix.findIndex(
        (arg: WordNode | RedirectNode) => arg.text === "-c"
      );
      if (cArgIndex !== -1 && cArgIndex + 1 < command.suffix.length) {
        query = command.suffix[cArgIndex + 1].text || "";
      }
    }
    return {
      type: "pg",
      database: database,
      query: query,
    };
  },
  component: PgComponent,
  compile: (module: ModuleType): CommandNode => {
    const pgModule = module as PgModuleType;
    return {
      type: "Command",
      name: { text: "pg", type: "Word" },
      suffix: [
        ...(pgModule.database
          ? [
              { type: "Word", text: "-d" } as WordNode,
              { type: "Word", text: pgModule.database } as WordNode,
            ]
          : []),
        ...(pgModule.query
          ? [
              { type: "Word", text: "-c" } as WordNode,
              { type: "Word", text: pgModule.query } as WordNode,
            ]
          : []),
      ],
    };
  },
};
