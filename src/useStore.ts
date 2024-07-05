import { useState, useEffect, useCallback } from "react";
import { genericPlugin } from "./plugins/genericPlugin";
import { astToCommand } from "./astToCommand";
import { defaultCommand } from "./App";
import { Plugins } from "./Plugins";
import { ModuleType, ScriptNode } from "./types";

export interface UseStoreType {
  inputCommand: string;
  setInputCommand: (cmd: string) => void;
  modules: ModuleType[];
  setModules: (modules: ModuleType[]) => void;
  compiledCommand: string;
  setCompiledCommand: (cmd: string) => void;
  output: string;
  setOutput: (output: string) => void;
  parseCommand: (cmd: string) => void;
  compileCommand: () => string;
  updateModule: (index: number, updates: Partial<ModuleType>) => void;
  removeModule: (index: number) => void;
  executeCommand: () => Promise<void>;
  ast: ScriptNode | null;
  setAst: (ast: ScriptNode | null) => void;
  currentFilePath: string | null;
  setCurrentFilePath: (path: string | null) => void;
}

// App-level store
export const useStore = (): UseStoreType => {
  const [inputCommand, setInputCommand] = useState<string>(defaultCommand);
  const [modules, setModules] = useState<ModuleType[]>([]);
  const [compiledCommand, setCompiledCommand] =
    useState<string>(defaultCommand);
  const [output, setOutput] = useState<string>("");
  const [ast, setAst] = useState<ScriptNode | null>(null);
  const [updateSource, setUpdateSource] = useState<string | null>(null);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);

  const parseCommand = useCallback((cmd: string): void => {
    window.electron.parseCommand(cmd);
  }, []);

  const compileCommand = useCallback((): string => {
    const compiledAst: ScriptNode = {
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
    const handleParseCommandResult = (
      result: ScriptNode | { error: string }
    ) => {
      if ("error" in result) {
        console.error(result.error);
      } else {
        setAst(result);
        if (
          result.type === "Script" &&
          result.commands &&
          result.commands.length > 0
        ) {
          const firstCommand = result.commands[0];
          const commandsToProcess =
            firstCommand.type === "Pipeline" && firstCommand.commands
              ? firstCommand.commands
              : [firstCommand];

          const newModules = commandsToProcess
            .map((command) => {
              if (command && command.name && command.name.text && command.type === "Command") {
                const plugin = Plugins.get(command.name.text) || genericPlugin;
                return plugin.parse(command);
              }
              return null;
            })
            .filter((module): module is ModuleType => module !== null);

          setUpdateSource("input");
          setModules(newModules);
        } else {
          console.error("Unexpected AST structure");
        }
      }
    };

    const handleExecuteCommandResult = (result: {
      error?: string;
      output?: string;
    }) => {
      setOutput(result.error ? `Error: ${result.error}` : result.output || "");
    };

    window.electron.ipcRenderer.receive(
      "parse-command-result",
      handleParseCommandResult
    );
    window.electron.ipcRenderer.receive(
      "execute-command-result",
      handleExecuteCommandResult
    );

    return () => {
      window.electron.ipcRenderer.removeAllListeners("parse-command-result");
      window.electron.ipcRenderer.removeAllListeners("execute-command-result");
    };
  }, []);

  useEffect(() => {
    if (updateSource === "modules") {
      const cmd = compileCommand();
      setInputCommand(cmd);
    }
  }, [modules, compileCommand, updateSource]);

  const updateModule = (index: number, updates: Partial<ModuleType>): void => {
    setUpdateSource("modules");
    setModules((prevModules) =>
      prevModules.map((module, i) =>
        i === index ? { ...module, ...updates } : module
      )
    );
  };

  const removeModule = (index: number): void => {
    setUpdateSource("modules");
    setModules((prevModules) => prevModules.filter((_, i) => i !== index));
  };

  const executeCommand = async (): Promise<void> => {
    console.log(compiledCommand);
    window.electron.executeCommand(compiledCommand);
  };

  const setCommand = (cmd: string): void => {
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
    currentFilePath,
    setCurrentFilePath,
  };
};
