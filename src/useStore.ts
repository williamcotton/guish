import { useState, useEffect, useCallback } from "react";
import { useAst } from "./useAst";
import { ModuleType, EnhancedModuleType, ScriptNode, ElectronAPI } from "./types";

export interface UseStoreType {
  inputCommand: string;
  setInputCommand: (cmd: string) => void;
  modules: EnhancedModuleType[];
  compiledCommand: string;
  output: string;
  setOutput: (output: string) => void;
  updateModule: (index: number, updates: Partial<ModuleType>) => void;
  removeModule: (index: number) => void;
  executeCommand: () => Promise<void>;
  currentFilePath: string | null;
  setCurrentFilePath: (path: string | null) => void;
  hasUnsavedChanges: boolean;
  setFileContent: (content: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

// App-level store
export const useStore = (electronApi: ElectronAPI): UseStoreType => {
  const [inputCommand, setInputCommand] = useState<string>("");
  const [modules, setModules] = useState<EnhancedModuleType[]>([]);
  const [compiledCommand, setCompiledCommand] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [updateSource, setUpdateSource] = useState<string | null>(null);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [lastSavedContent, setLastSavedContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const {
    astToModules,
    compileCommand,
  } = useAst();

  useEffect(() => {
    if (updateSource === "input") {
      electronApi.parseCommand(inputCommand);
    }
  }, [inputCommand, updateSource]);

  const executeCommand = useCallback(async (): Promise<void> => {
    console.log(compiledCommand);
    electronApi.executeCommand(compiledCommand);
  }, [compiledCommand]);

  useEffect(() => {
    electronApi.ipcRenderer.receive(
      "parse-command-result",
      (result: ScriptNode | { error: string }) => {
        if ("type" in result && result.type === "Script") {
          setUpdateSource("input");
          setModules(astToModules(result));
        }
      }
    );

    electronApi.ipcRenderer.receive("execute-command-result", (result: { error?: string; output?: string}) => {
      setLoading(false);
      setOutput(result.error ? `Error: ${result.error}` : result.output || "");
    });

    return () => {
      electronApi.ipcRenderer.removeAllListeners("parse-command-result");
      electronApi.ipcRenderer.removeAllListeners("execute-command-result");
    };
  }, [astToModules]);

  useEffect(() => {
    if (updateSource === "modules") {
      const cmd = compileCommand(modules);
      setInputCommand(cmd);
      setCompiledCommand(cmd);
    }
  }, [modules, compileCommand, updateSource]);

  const updateModule = useCallback(
    (index: number, updates: Partial<EnhancedModuleType>): void => {
      setUpdateSource("modules");
      setModules((prevModules) =>
        prevModules.map((module, i) =>
          i === index ? { ...module, ...updates } : module
        )
      );
    },
    []
  );

  const removeModule = useCallback((index: number): void => {
    setUpdateSource("modules");
    setModules((prevModules) => prevModules.filter((_, i) => i !== index));
  }, []);

  const setCommand = useCallback((cmd: string): void => {
    setUpdateSource("input");
    setInputCommand(cmd);
    setCompiledCommand(cmd);
  }, []);

  const setFileContent = useCallback(
    (content: string): void => {
      setCommand(content);
      setLastSavedContent(content);
    },
    [setCommand]
  );

  const hasUnsavedChanges = inputCommand !== lastSavedContent;

  return {
    inputCommand,
    setInputCommand: setCommand,
    modules,
    compiledCommand,
    output,
    setOutput,
    updateModule,
    removeModule,
    executeCommand,
    currentFilePath,
    setCurrentFilePath,
    hasUnsavedChanges,
    setFileContent,
    loading,
    setLoading,
  };
};
