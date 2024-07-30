import React, { useState } from "react";
import CodeEditor from "../codeEditor";
import { Plugin } from "../Plugins";
import { ModuleType, RedirectNode, CommandNode, WordNode } from "../types";

interface PgModuleType extends ModuleType {
  type: "pg";
  database: string;
  query: string;
  hostname: string;
  user: string;
  password: string;
  port: string;
}

interface PgComponentProps extends PgModuleType {
  setDatabase: (value: string) => void;
  setQuery: (value: string) => void;
  setHostname: (value: string) => void;
  setUser: (value: string) => void;
  setPassword: (value: string) => void;
  setPort: (value: string) => void;
}

const PgComponent: React.FC<PgComponentProps> = ({
  database,
  query,
  hostname,
  user,
  password,
  port,
  setDatabase,
  setQuery,
  setHostname,
  setUser,
  setPassword,
  setPort,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <h2 className="text-lg font-semibold mb-2">pg</h2>
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="mb-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {showSettings ? "Hide Settings" : "Show Settings"}
      </button>
      {showSettings && (
        <>
          <div className="mb-2">
            <label
              htmlFor="database-input"
              className="block text-sm font-medium text-gray-700"
            >
              Database
            </label>
            <input
              id="database-input"
              type="text"
              value={database}
              onChange={(e) => setDatabase(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter database name..."
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="hostname-input"
              className="block text-sm font-medium text-gray-700"
            >
              Hostname
            </label>
            <input
              id="hostname-input"
              type="text"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter hostname..."
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="user-input"
              className="block text-sm font-medium text-gray-700"
            >
              User
            </label>
            <input
              id="user-input"
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter user..."
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="password-input"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter password..."
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="port-input"
              className="block text-sm font-medium text-gray-700"
            >
              Port
            </label>
            <input
              id="port-input"
              type="text"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter port..."
            />
          </div>
        </>
      )}
      <div className="h-full">
        <label
          htmlFor="query-editor"
          className="block text-sm font-medium text-gray-700"
        >
          Query
        </label>
        <CodeEditor
          value={query}
          onChange={setQuery}
          language="sql"
        />
      </div>
    </>
  );
};

export const pgPlugin: Plugin = {
  name: "PostgreSQL",
  command: "pg",
  parse: (command: CommandNode): PgModuleType => {
    let query = "";
    let database = "";
    let hostname = "";
    let user = "";
    let password = "";
    let port = "";
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
      const hArgIndex = command.suffix.findIndex(
        (arg: WordNode | RedirectNode) => arg.text === "-h"
      );
      if (hArgIndex !== -1 && hArgIndex + 1 < command.suffix.length) {
        hostname = command.suffix[hArgIndex + 1].text || "";
      }
      const uArgIndex = command.suffix.findIndex(
        (arg: WordNode | RedirectNode) => arg.text === "-U"
      );
      if (uArgIndex !== -1 && uArgIndex + 1 < command.suffix.length) {
        user = command.suffix[uArgIndex + 1].text || "";
      }
      const pArgIndex = command.suffix.findIndex(
        (arg: WordNode | RedirectNode) => arg.text === "-W"
      );
      if (pArgIndex !== -1 && pArgIndex + 1 < command.suffix.length) {
        password = command.suffix[pArgIndex + 1].text || "";
      }
      const PArgIndex = command.suffix.findIndex(
        (arg: WordNode | RedirectNode) => arg.text === "-p"
      );
      if (PArgIndex !== -1 && PArgIndex + 1 < command.suffix.length) {
        port = command.suffix[PArgIndex + 1].text || "";
      }
    }
    return {
      type: "pg",
      database: database,
      query: query,
      hostname: hostname,
      user: user,
      password: password,
      port: port,
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
        ...(pgModule.hostname
          ? [
              { type: "Word", text: "-h" } as WordNode,
              { type: "Word", text: pgModule.hostname } as WordNode,
            ]
          : []),
        ...(pgModule.user
          ? [
              { type: "Word", text: "-U" } as WordNode,
              { type: "Word", text: pgModule.user } as WordNode,
            ]
          : []),
        ...(pgModule.password
          ? [
              { type: "Word", text: "-W" } as WordNode,
              { type: "Word", text: pgModule.password } as WordNode,
            ]
          : []),
        ...(pgModule.port
          ? [
              { type: "Word", text: "-p" } as WordNode,
              { type: "Word", text: pgModule.port } as WordNode,
            ]
          : []),
      ],
    };
  },
};
