import React, { useState, useEffect } from "react";
import { Terminal } from "lucide-react";

// Plugin management system
class Plugins {
  static plugins = {};

  static register(plugin) {
    if (!plugin.command) {
      throw new Error("Plugin must have a command property");
    }
    this.plugins[plugin.command] = plugin;
  }

  static get(command) {
    return this.plugins[command];
  }

  static getAll() {
    return Object.values(this.plugins);
  }
}

// Plugin definitions (these would typically be in separate files)
const pgPlugin = {
  name: "PostgreSQL",
  command: "pg",
  parse: (args) => ({
    type: "pg",
    args,
    query: args.find((arg) => arg.startsWith("-c"))?.slice(3) || "",
  }),
  component: ({ query, setQuery }) => (
    <div className="flex-1 bg-white p-4 rounded shadow mx-2">
      <h2 className="text-lg font-semibold mb-2">PostgreSQL Query (pg)</h2>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full h-64 p-2 border rounded"
        placeholder="Enter PostgreSQL query..."
      />
    </div>
  ),
  compile: (module) =>
    `pg ${module.args.join(" ")} ${
      module.query ? `-c "${module.query}"` : ""
    }`.trim(),
};

const grepPlugin = {
  name: "GREP",
  command: "grep",
  parse: (args) => ({
    type: "grep",
    pattern: args.join(" ").replace(/^"/, "").replace(/"$/, ""),
    flags: [],
  }),
  component: ({ pattern, setPattern, flags, setFlags }) => (
    <div className="flex-1 bg-white p-4 rounded shadow mx-2">
      <h2 className="text-lg font-semibold mb-2">GREP</h2>
      <input
        type="text"
        value={pattern}
        onChange={(e) => setPattern(e.target.value)}
        className="w-full p-2 border rounded mb-2"
        placeholder="Enter grep pattern..."
      />
      <div className="flex flex-wrap">
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={(flags || []).includes("i")}
            onChange={(e) =>
              setFlags((prev) =>
                e.target.checked
                  ? [...(prev || []), "i"]
                  : (prev || []).filter((f) => f !== "i")
              )
            }
          />{" "}
          -i (Case insensitive)
        </label>
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={(flags || []).includes("v")}
            onChange={(e) =>
              setFlags((prev) =>
                e.target.checked
                  ? [...(prev || []), "v"]
                  : (prev || []).filter((f) => f !== "v")
              )
            }
          />{" "}
          -v (Invert match)
        </label>
      </div>
    </div>
  ),
  compile: (module) =>
    `grep ${module.flags.map((f) => `-${f}`).join(" ")} "${module.pattern}"`,
};

const awkPlugin = {
  name: "AWK",
  command: "awk",
  parse: (args) => ({
    type: "awk",
    program: args.join(" ").replace(/^'/, "").replace(/'$/, ""),
  }),
  component: ({ program, setProgram }) => (
    <div className="flex-1 bg-white p-4 rounded shadow mx-2">
      <h2 className="text-lg font-semibold mb-2">AWK</h2>
      <textarea
        value={program}
        onChange={(e) => setProgram(e.target.value)}
        className="w-full h-32 p-2 border rounded"
        placeholder="Enter awk program..."
      />
    </div>
  ),
  compile: (module) => `awk '${module.program}'`,
};

const sedPlugin = {
  name: "SED",
  command: "sed",
  parse: (args) => ({
    type: "sed",
    script: args.join(" ").replace(/^'/, "").replace(/'$/, ""),
    flags: [],
  }),
  component: ({ script, setScript, flags, setFlags }) => (
    <div className="flex-1 bg-white p-4 rounded shadow mx-2">
      <h2 className="text-lg font-semibold mb-2">SED</h2>
      <textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        className="w-full h-32 p-2 border rounded mb-2"
        placeholder="Enter sed script..."
      />
      <div className="flex flex-wrap">
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={(flags || []).includes("g")}
            onChange={(e) =>
              setFlags((prev) =>
                e.target.checked
                  ? [...(prev || []), "g"]
                  : (prev || []).filter((f) => f !== "g")
              )
            }
          />{" "}
          -g (Global replacement)
        </label>
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={(flags || []).includes("i")}
            onChange={(e) =>
              setFlags((prev) =>
                e.target.checked
                  ? [...(prev || []), "i"]
                  : (prev || []).filter((f) => f !== "i")
              )
            }
          />{" "}
          -i (Case insensitive)
        </label>
      </div>
    </div>
  ),
  compile: (module) => `sed '${module.flags.includes("g") ? "g" : ""}${module.script}'`,
};

const catPlugin = {
  name: "CAT",
  command: "cat",
  parse: (args) => ({ type: "cat", files: args }),
  component: ({ files, setFiles }) => (
    <div className="flex-1 bg-white p-4 rounded shadow mx-2">
      <h2 className="text-lg font-semibold mb-2">CAT</h2>
      <textarea
        value={files.join("\n")}
        onChange={(e) => setFiles(e.target.value.split("\n"))}
        className="w-full h-32 p-2 border rounded"
        placeholder="Enter filenames (one per line)..."
      />
    </div>
  ),
  compile: (module) => `cat ${module.files.join(" ")}`,
};

const echoPlugin = {
  name: "ECHO",
  command: "echo",
  parse: (args) => ({
    type: "echo",
    text: args.join(" ").replace(/^'/, "").replace(/'$/, ""),
  }),
  component: ({ text, setText }) => (
    <div className="flex-1 bg-white p-4 rounded shadow mx-2">
      <h2 className="text-lg font-semibold mb-2">ECHO</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-32 p-2 border rounded"
        placeholder="Enter text to echo..."
      />
    </div>
  ),
  compile: (module) => `echo "${module.text}"`,
};

// Register plugins
Plugins.register(pgPlugin);
Plugins.register(grepPlugin);
Plugins.register(awkPlugin);
Plugins.register(sedPlugin);
Plugins.register(catPlugin);
Plugins.register(echoPlugin);

// App-level store
const useStore = () => {
  const [inputCommand, setInputCommand] = useState(
    'echo "foo\nbrick\nbonk" | grep "foo" | awk "{print $1}" | sed "s/foo/bar/g"'
  );
  const [modules, setModules] = useState([]);
  const [compiledCommand, setCompiledCommand] = useState("");
  const [output, setOutput] = useState("");

  const parseCommand = (cmd) => {
    const parts = cmd.split("|").map((part) => part.trim());
    const newModules = parts
      .map((part) => {
        const [command, ...args] = part.split(" ");
        const plugin = Plugins.get(command);
        return plugin ? plugin.parse(args) : null;
      })
      .filter(Boolean);
    setModules(newModules);
  };

  const compileCommand = () => {
    const cmd = modules
      .map((module) => {
        const plugin = Plugins.get(module.type);
        return plugin ? plugin.compile(module) : "";
      })
      .join(" | ");
    setCompiledCommand(cmd);
  };

  const updateModule = (index, updates) => {
    setModules((prevModules) =>
      prevModules.map((module, i) =>
        i === index ? { ...module, ...updates } : module
      )
    );
  };

  const executeCommand = async () => {
    // Mock execution for browser testing
    setOutput(
      `Executing command: ${compiledCommand}\n\nThis is a mock output for browser testing.`
    );
  };

  return {
    inputCommand,
    setInputCommand,
    modules,
    setModules,
    compiledCommand,
    setCompiledCommand,
    output,
    setOutput,
    parseCommand,
    compileCommand,
    updateModule,
    executeCommand,
  };
};

const App = () => {
  const store = useStore();

  useEffect(() => {
    store.parseCommand(store.inputCommand);
  }, [store.inputCommand]);

  useEffect(() => {
    store.compileCommand();
  }, [store.modules]);

  const renderModule = (module, index) => {
    const plugin = Plugins.get(module.type);
    if (!plugin) return null;

    const Component = plugin.component;
    return (
      <Component
        key={`${module.type}-${index}`}
        {...module}
        {...Object.fromEntries(
          Object.keys(module).map((key) => [
            `set${key.charAt(0).toUpperCase() + key.slice(1)}`,
            (value) => store.updateModule(index, { [key]: value }),
          ])
        )}
      />
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">Dynamic Data Pipeline UI</h1>
      </header>

      <div className="flex-1 flex overflow-hidden p-4">
        {store.modules.map(renderModule)}
      </div>

      <div className="bg-gray-800 p-4">
        <div className="flex items-center mb-2">
          <Terminal className="text-white mr-2" />
          <input
            type="text"
            value={store.inputCommand}
            onChange={(e) => store.setInputCommand(e.target.value)}
            className="flex-1 p-2 bg-gray-700 text-white rounded border border-gray-600"
            placeholder="Enter command..."
          />
          <button
            onClick={store.executeCommand}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Execute
          </button>
        </div>
        <div className="bg-gray-600 text-white p-2 rounded mb-2">
          Compiled Command:{" "}
          <span className="font-mono">{store.compiledCommand}</span>
        </div>
        <div className="bg-black text-green-400 p-2 rounded h-32 overflow-auto">
          <pre>{store.output}</pre>
        </div>
      </div>
    </div>
  );
};

export default App;
