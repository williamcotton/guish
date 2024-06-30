import React, { useState, useEffect, useCallback } from "react";
import { Terminal } from "lucide-react";

import { genericPlugin } from "./plugins/genericPlugin.js";
import { pgPlugin } from "./plugins/pgPlugin.js";
import { grepPlugin } from "./plugins/grepPlugin.js";
import { awkPlugin } from "./plugins/awkPlugin.js";
import { sedPlugin } from "./plugins/sedPlugin.js";
import { catPlugin } from "./plugins/catPlugin.js";
import { echoPlugin } from "./plugins/echoPlugin.js";
import { ggplotPlugin } from "./plugins/ggplotPlugin.js";
import { astToCommand } from "./astToCommand.js";

// Plugin management system
class Plugins {
  static plugins = {};

  static register(plugin) {
    this.plugins[plugin.command] = plugin;
  }

  static get(command) {
    return this.plugins[command];
  }

  static getAll() {
    return Object.values(this.plugins);
  }
}

// Register plugins
Plugins.register(genericPlugin);
Plugins.register(pgPlugin);
Plugins.register(grepPlugin);
Plugins.register(awkPlugin);
Plugins.register(sedPlugin);
Plugins.register(catPlugin);
Plugins.register(echoPlugin);
Plugins.register(ggplotPlugin);

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
          commands: modules.map((module) => {
            const plugin = Plugins.get(module.type);
            if (plugin) {
              return plugin.compile(module);
            } else {
              // For generic commands, create a basic Command structure
              return {
                type: "Command",
                name: { text: module.command },
                suffix: module.args
                  ? module.args.split(" ").map((arg) => ({ type: "Word", text: arg }))
                  : [],
              };
            }
          }),
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
              const plugin = Plugins.get(command.name.text) || genericPlugin;
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
  const [showHtml, setShowHtml] = useState(false);

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
    const plugin = Plugins.get(module.type) || genericPlugin;
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
        <div className="flex mb-2">
          <button
            onClick={() => setShowHtml(false)}
            className={`px-4 py-2 rounded-l ${
              !showHtml ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"
            }`}
          >
            Plain Text
          </button>
          <button
            onClick={() => setShowHtml(true)}
            className={`px-4 py-2 rounded-r ${
              showHtml ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"
            }`}
          >
            HTML
          </button>
        </div>
        {!showHtml ? (
          <div className="bg-black text-green-400 p-2 rounded h-32 overflow-auto">
            <pre>{store.output}</pre>
          </div>
        ) : (
          <div className="bg-white p-2 rounded h-32 overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: store.output }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
