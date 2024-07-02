import { useState, useEffect, useCallback } from "react";
import { genericPlugin } from "./plugins/genericPlugin.js";
import { astToCommand } from "./astToCommand.js";
import { defaultCommand } from "./App.js";
import { Plugins } from "./Plugins.js";

// App-level store
export const useStore = () => {
  const [inputCommand, setInputCommand] = useState(defaultCommand);
  const [modules, setModules] = useState([]);
  const [compiledCommand, setCompiledCommand] = useState(defaultCommand);
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
            const plugin = Plugins.get(module.type) || genericPlugin;
            return plugin.compile(module);
          }),
        },
      ],
    };
    const cmd = astToCommand(compiledAst);
    setCompiledCommand(cmd);
    return cmd;
  }, [modules]);

  useEffect(() => {
    parseCommand(inputCommand);
  }, [inputCommand, parseCommand]);

  useEffect(() => {
    const handleParseCommandResult = (result) => {
      if (result.error) {
        // console.error(result.error);
      } else {
        setAst(result);
        if (result.type === "Script" && result.commands) {
          const commandsToProcess =
            result.commands[0].type === "Pipeline"
              ? result.commands[0].commands
              : [result.commands[0]];

          const newModules = commandsToProcess
            .map((command) => {
              const plugin = Plugins.get(command.name.text) || genericPlugin;
              return plugin.parse(command);
            })
            .filter(Boolean);

          setUpdateSource("input");
          setModules(newModules);
        } else {
          console.error("Unexpected AST structure");
        }
      }
    };

    const handleExecuteCommandResult = (result) => {
      setOutput(result.error ? `Error: ${result.error}` : result.output);
    };

    window.electron.ipcRenderer.receive(
      "parse-command-result",
      handleParseCommandResult
    );
    window.electron.ipcRenderer.receive(
      "execute-command-result",
      handleExecuteCommandResult
    );
  }, []);

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

  const removeModule = (index) => {
    setUpdateSource("modules");
    setModules((prevModules) => prevModules.filter((_, i) => i !== index));
  };

  const executeCommand = async () => {
    console.log(compiledCommand);
    window.electron.executeCommand(compiledCommand);
  };

  const setCommand = (cmd) => {
    setUpdateSource("input");
    setInputCommand(cmd);
    setCompiledCommand(cmd);
  };

  return {
    inputCommand,
    setInputCommand: setCommand,
    modules,
    setModules,
    compiledCommand,
    setCompiledCommand,
    output,
    setOutput,
    parseCommand,
    compileCommand,
    updateModule,
    removeModule,
    executeCommand,
    ast,
    setAst,
  };
};
