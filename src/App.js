import React, { useState, useEffect, useCallback } from "react";
import { Terminal } from "lucide-react";

function astToCommand(ast) {
  function handleNode(node) {
    switch (node.type) {
      case "Script":
        return node.commands.map(handleNode).join("; ");
      case "Pipeline":
        return node.commands.map(handleNode).join(" | ");
      case "Command":
        return [node.name.text, ...node.suffix.map(handleNode)].join(" ");
      case "Word":
        if (node.text.startsWith('"') && node.text.endsWith('"')) {
          return node.text;
        }
        if (node.text.includes("\n")) {
          return `"${node.text}"`;
        }
        if (
          node.text.includes(" ") ||
          node.text.includes('"') ||
          node.text.includes("'")
        ) {
          return `"${node.text}"`;
        }
        return node.text;
      case "AssignmentWord":
        return node.text;
      case "Redirect":
        const operator = node.op.text;
        const file = handleNode(node.file);
        return `${operator}${file}`;
      case "CommandExpansion":
        return `$(${handleNode(node.command)})`;
      case "ParameterExpansion":
        return `$${node.parameter}`;
      default:
        if (node.text) return node.text;
        console.warn(`Unhandled node type: ${node.type}`);
        return "";
    }
  }
  return handleNode(ast);
}

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

// Modified plugin definitions
const pgPlugin = {
  name: "PostgreSQL",
  command: "pg",
  parse: (command) => {
    let query = "";
    if (command.suffix) {
      const cArgIndex = command.suffix.findIndex((arg) => arg.text === "-c");
      if (cArgIndex !== -1 && cArgIndex + 1 < command.suffix.length) {
        query = command.suffix[cArgIndex + 1].text;
      }
    }
    return {
      type: "pg",
      query: query,
    };
  },
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
  compile: (module) => ({
    type: "Command",
    name: { text: "pg" },
    suffix: module.query
      ? [
          { type: "Word", text: "-c" },
          { type: "Word", text: module.query },
        ]
      : [],
  }),
};

const grepPlugin = {
  name: "GREP",
  command: "grep",
  parse: (command) => ({
    type: "grep",
    flags: command.suffix
      ? command.suffix
          .filter((arg) => arg.text.startsWith("-"))
          .map((arg) => arg.text.slice(1))
          .join("")
      : "",
    pattern: command.suffix
      ? command.suffix
          .filter((arg) => !arg.text.startsWith("-"))
          .map((arg) => arg.text)
          .join(" ")
          .replace(/^"/, "")
          .replace(/"$/, "")
      : "",
  }),
  component: ({ pattern, setPattern, flags, setFlags }) => (
    <div className="flex-1 bg-white p-4 rounded shadow mx-2">
      <h2 className="text-lg font-semibold mb-2">GREP</h2>
      <input
        type="text"
        value={pattern || ""}
        onChange={(e) => setPattern(e.target.value)}
        className="w-full p-2 border rounded mb-2"
        placeholder="Enter grep pattern..."
      />
      <div className="flex flex-wrap">
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
            }}
          />{" "}
          -i (Case insensitive)
        </label>
        <label className="mr-4 mb-2">
          <input
            type="checkbox"
            checked={flags.includes("v")}
            onChange={(e) => {
              if (e.target.checked) {
                setFlags(flags + "v");
              } else {
                setFlags(flags.replace("v", ""));
              }
            }}
          />{" "}
          -v (Invert match)
        </label>
      </div>
    </div>
  ),
  compile: (module) => ({
    type: "Command",
    name: { text: "grep" },
    suffix: [
      ...(module.flags ? [{ type: "Word", text: `-${module.flags}` }] : []),
      ...(module.pattern ? [{ type: "Word", text: module.pattern }] : []),
    ],
  }),
};

const awkPlugin = {
  name: "AWK",
  command: "awk",
  parse: (command) => ({
    type: "awk",
    program: command.suffix
      ? command.suffix
          .map((arg) => arg.text)
          .join(" ")
          .replace(/^"/, "")
          .replace(/"$/, "")
      : "",
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
  compile: (module) => ({
    type: "Command",
    name: { text: "awk" },
    suffix: module.program ? [{ type: "Word", text: module.program }] : [],
  }),
};

const sedPlugin = {
  name: "SED",
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
      <h2 className="text-lg font-semibold mb-2">SED</h2>
      <input
        type="text"
        value={script || ""}
        onChange={(e) => setScript(e.target.value)}
        className="w-full p-2 border rounded mb-2"
        placeholder="Enter sed script (e.g., s/foo/bar/)"
      />
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
            }}
          />{" "}
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
            }}
          />{" "}
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

const catPlugin = {
  name: "CAT",
  command: "cat",
  parse: (command) => ({
    type: "cat",
    files: command.suffix ? command.suffix.map((arg) => arg.text) : [],
  }),
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
  compile: (module) => ({
    type: "Command",
    name: { text: "cat" },
    suffix: module.files.map((file) => ({ type: "Word", text: file })),
  }),
};

const echoPlugin = {
  name: "ECHO",
  command: "echo",
  parse: (command) => ({
    type: "echo",
    text: command.suffix
      ? command.suffix
          .map((arg) => arg.text)
          .join(" ")
          .replace(/^"/, "")
          .replace(/"$/, "")
          .replace(/\\n/g, "\n")
      : "",
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
  compile: (module) => ({
    type: "Command",
    name: { text: "echo" },
    suffix: module.text ? [{ type: "Word", text: module.text }] : [],
  }),
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
    'echo "foo\\nbrick\\nbonk" | grep -i "foo" | awk "{print $1}" | sed "s/foo/bar/g"'
  );
  const [modules, setModules] = useState([]);
  const [compiledCommand, setCompiledCommand] = useState("");
  const [output, setOutput] = useState("");
  const [ast, setAst] = useState(null);
  const [updateSource, setUpdateSource] = useState(null);

  const parseCommand = useCallback((cmd) => {
    window.electron.parseCommand(cmd);
  }, []);

  const compileCommand = useCallback(() => {
    const compiledAst = {
      type: "Script",
      commands: [
        {
          type: "Pipeline",
          commands: modules
            .map((module) => {
              const plugin = Plugins.get(module.type);
              return plugin ? plugin.compile(module) : null;
            })
            .filter(Boolean),
        },
      ],
    };
    const cmd = astToCommand(compiledAst);
    setCompiledCommand(cmd);
    return cmd;
  }, [modules]);

  useEffect(() => {
    // Parse the initial command when the component mounts
    parseCommand(inputCommand);
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    window.electron.ipcRenderer.receive("parse-command-result", (result) => {
      if (result.error) {
        // console.error(result.error);
      } else {
        setAst(result);
        if (result.type === "Script" && result.commands) {
          let commandsToProcess = [];
          if (result.commands[0].type === "Pipeline") {
            commandsToProcess = result.commands[0].commands;
          } else if (result.commands[0].type === "Command") {
            commandsToProcess = [result.commands[0]];
          } else {
            console.error("Unexpected command structure in AST");
            return;
          }

          const newModules = commandsToProcess
            .map((command) => {
              const plugin = Plugins.get(command.name.text);
              if (plugin) {
                return plugin.parse(command);
              }
              return null;
            })
            .filter(Boolean);

          setUpdateSource("input");
          setModules(newModules);
        } else {
          console.error("Unexpected AST structure");
        }
      }
    });

    window.electron.ipcRenderer.receive("execute-command-result", (result) => {
      if (result.error) {
        setOutput(`Error: ${result.error}`);
      } else {
        setOutput(result.output);
      }
    });
  }, []);

  useEffect(() => {
    if (updateSource === "input") {
      parseCommand(inputCommand);
    }
  }, [inputCommand, parseCommand, updateSource]);

  useEffect(() => {
    if (updateSource === "modules") {
      const cmd = compileCommand();
      setInputCommand(cmd);
    }
  }, [modules, compileCommand, updateSource]);

  const updateModule = (index, updates) => {
    setUpdateSource("modules");
    setModules((prevModules) =>
      prevModules.map((module, i) =>
        i === index ? { ...module, ...updates } : module
      )
    );
  };

  const executeCommand = async () => {
    window.electron.executeCommand(inputCommand);
  };

  return {
    inputCommand,
    setInputCommand: (cmd) => {
      setUpdateSource("input");
      setInputCommand(cmd);
    },
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
    ast,
    setAst,
  };
};

const App = () => {
  const store = useStore();

  const handleInputChange = (e) => {
    store.setInputCommand(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid line break
      store.executeCommand();
    }
  };

  // Function to prepare the command for display
  const prepareCommandForDisplay = (cmd) => {
    return cmd.replace(/\\n/g, "\n").replace(/\n/g, "\\n");
  };

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
            value={prepareCommandForDisplay(store.inputCommand)}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="flex-1 p-2 bg-gray-700 text-white rounded border border-gray-600"
            placeholder="Enter command..."
            rows={3}
          />
          <button
            onClick={store.executeCommand}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Execute
          </button>
        </div>
        <div className="bg-black text-green-400 p-2 rounded h-32 overflow-auto">
          <pre>{store.output}</pre>
        </div>
      </div>
    </div>
  );
};

export default App;
