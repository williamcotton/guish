import { useState, useEffect, useCallback } from "react";
import { genericPlugin } from "./plugins/genericPlugin";
import { astToCommand } from "./astToCommand";
import { defaultCommand } from "./App";
import { Plugins } from "./Plugins";
import {
  ModuleType,
  ScriptNode,
  CommandNode,
  LogicalExpressionNode,
  PipelineNode,
  ASTType,
} from "./types";

export interface EnhancedModuleType extends ModuleType {
  operator?: "and" | "pipe";
}

export interface UseStoreType {
  inputCommand: string;
  setInputCommand: (cmd: string) => void;
  modules: EnhancedModuleType[];
  setModules: (modules: EnhancedModuleType[]) => void;
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
  hasUnsavedChanges: boolean;
  setFileContent: (content: string) => void;
}

// App-level store
export const useStore = (): UseStoreType => {
  const [inputCommand, setInputCommand] = useState<string>(defaultCommand);
  const [modules, setModules] = useState<EnhancedModuleType[]>([]);
  const [compiledCommand, setCompiledCommand] =
    useState<string>(defaultCommand);
  const [output, setOutput] = useState<string>("");
  const [ast, setAst] = useState<ScriptNode | null>(null);
  const [updateSource, setUpdateSource] = useState<string | null>(null);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [lastSavedContent, setLastSavedContent] = 
    useState<string>(defaultCommand);

  const parseCommand = useCallback((cmd: string): void => {
    window.electron.parseCommand(cmd);
  }, []);

  const compileCommand = useCallback((): string => {
    const buildAst = (
      modules: EnhancedModuleType[]
    ): LogicalExpressionNode | PipelineNode | CommandNode => {
      if (modules.length === 0) {
        return { type: "Command", name: { text: "", type: "Word" } } as CommandNode;
      }
      if (modules.length === 1) {
        const plugin = Plugins.get(modules[0].type) || genericPlugin;
        return plugin.compile(modules[0]) as CommandNode;
      }

      let currentAst: ASTType = (
        Plugins.get(modules[0].type) || genericPlugin
      ).compile(modules[0]);

      for (let i = 1; i < modules.length; i++) {
        const plugin = Plugins.get(modules[i].type) || genericPlugin;
        const compiledModule = plugin.compile(modules[i]);

        if (modules[i - 1].operator === "and") {
          currentAst = {
            type: "LogicalExpression",
            op: "&&",
            left: currentAst,
            right: compiledModule,
          };
        } else {
          if (currentAst.type !== "Pipeline") {
            currentAst = { type: "Pipeline", commands: [currentAst] };
          }
          (currentAst as PipelineNode).commands.push(compiledModule);
        }
      }

      return currentAst as LogicalExpressionNode | PipelineNode | CommandNode;
    };

    const compiledAst: ScriptNode = {
      type: "Script",
      commands: [buildAst(modules)],
    };

    const cmd = astToCommand(compiledAst);
    setCompiledCommand(cmd);
    return cmd;
  }, [modules]);

  const hasUnsavedChanges = inputCommand !== lastSavedContent;

  useEffect(() => {
    parseCommand(inputCommand);
  }, [inputCommand, parseCommand]);

  useEffect(() => {
    const handleParseCommandResult = (
      result: ScriptNode | { error: string }
    ) => {
      if ("error" in result) {
        // console.error(result.error);
      } else {
        setAst(result);
        if (
          result.type === "Script" &&
          result.commands &&
          result.commands.length > 0
        ) {
          const firstCommand = result.commands[0];
          const newModules: EnhancedModuleType[] = [];

          const processCommand = (
            command: CommandNode | LogicalExpressionNode | PipelineNode,
            operator?: "and" | "pipe"
          ) => {
            if (command.type === "LogicalExpression") {
              processCommand(command.left as CommandNode, "and");
              processCommand(command.right as CommandNode);
            } else if (command.type === "Pipeline") {
              command.commands.forEach((cmd, index) => {
                processCommand(
                  cmd as CommandNode,
                  index < command.commands.length - 1
                    ? "pipe"
                    : undefined
                );
              });
            } else if (
              command.type === "Command" &&
              command.name &&
              command.name.text
            ) {
              const plugin =
                Plugins.get(command.name.text) || genericPlugin;
              newModules.push({ ...plugin.parse(command), operator });
            }
          };

          processCommand(firstCommand as CommandNode);

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

  const setFileContent = (content: string): void => {
    setCommand(content);
    setLastSavedContent(content);
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
    hasUnsavedChanges,
    setFileContent,
  };
};
