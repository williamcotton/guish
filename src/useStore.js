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
    setModules((prevModules) => prevModules.map((module, i) => i === index ? { ...module, ...updates } : module
    )
    );
  };

  const executeCommand = async () => {
    console.log(compiledCommand);
    window.electron.executeCommand(compiledCommand);
  };

  return {
    inputCommand,
    setInputCommand: (cmd) => {
      setUpdateSource("input");
      setInputCommand(cmd);
      setCompiledCommand(cmd);
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
