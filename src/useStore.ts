import { useState, useEffect, useCallback } from "react";
import { useAst } from "./useAst";
import {
  ModuleType,
  EnhancedModuleType,
  ScriptNode,
  ElectronAPI,
} from "./types";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { exemplars } from "./exemplars";

export interface UseStoreType {
  inputCommand: string;
  setInputCommand: (cmd: string) => void;
  modules: EnhancedModuleType[];
  compiledCommand: string;
  outputs: string[];
  setOutputs: (outputs: string[]) => void;
  updateModule: (index: number, updates: Partial<ModuleType>) => void;
  removeModule: (index: number) => void;
  executeAst: () => Promise<void>;
  currentFilePath: string | null;
  setCurrentFilePath: (path: string | null) => void;
  hasUnsavedChanges: boolean;
  setFileContent: (content: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  minimizedModules: boolean[];
  setMinimizedModules: React.Dispatch<React.SetStateAction<boolean[]>>;
  isCopied: boolean;
  setIsCopied: (isCopied: boolean) => void;
  inputMessage: string;
  setInputMessage: (message: string) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  chatHistory: ChatCompletionMessageParam[];
  setChatHistory: (history: ChatCompletionMessageParam[]) => void;
  isOpenAIEnabled: boolean;
  setIsOpenAIEnabled: (isOpenAIEnabled: boolean) => void;
}

export const useStore = (electronApi: ElectronAPI): UseStoreType => {
  const [inputCommand, setInputCommand] = useState<string>("");
  const [modules, setModulesState] = useState<EnhancedModuleType[]>([]);
  const [compiledCommand, setCompiledCommand] = useState<string>("");
  const [outputs, setOutputs] = useState<string[]>([]);
  const [updateSource, setUpdateSource] = useState<string | null>(null);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [lastSavedContent, setLastSavedContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [ast, setAst] = useState<ScriptNode | null>(null);
  const [minimizedModules, setMinimizedModules] = useState<boolean[]>([]);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatCompletionMessageParam[]>(exemplars);
  const [isOpenAIEnabled, setIsOpenAIEnabled] = useState<boolean>(false);

  const { astToModules, modulesToAst, compileCommand } = useAst();

  useEffect(() => {
    if (updateSource === "input") {
      electronApi.parseCommand(inputCommand);
    }
  }, [inputCommand, updateSource]);

  const executeAst = useCallback(async (): Promise<void> => {
    electronApi.executeAst(ast);
  }, [ast]);

  useEffect(() => {
    const fetchOpenAIStatus = async () => {
      const status = await electronApi.getOpenAIStatus();
      setIsOpenAIEnabled(status);
    };
    fetchOpenAIStatus();
  }, [electronApi]);

  useEffect(() => {
    electronApi.ipcRenderer.receive(
      "parse-command-result",
      (result: ScriptNode | { error: string }) => {
        if ("type" in result && result.type === "Script") {
          setUpdateSource("input");
          setModules(astToModules(result));
          setAst(result);
        }
      }
    );

    electronApi.ipcRenderer.receive(
      "execute-command-result",
      (result: {
        error?: string;
        output?: Array<{ stdout: string; stderr: string }>;
      }) => {
        setLoading(false);
        if (result.error) {
          setOutputs([`Error: ${result.error}`]);
        } else if (result.output && result.output.length > 0) {
          setOutputs(
            result.output.map((item) => {
              if (item.stderr && !item.stdout) {
                return `Error: ${item.stderr}\n${item.stdout}`;
              }
              return item.stdout;
            })
          );
        } else {
          setOutputs([]);
        }
      }
    );

    return () => {
      electronApi.ipcRenderer.removeAllListeners("parse-command-result");
      electronApi.ipcRenderer.removeAllListeners("execute-command-result");
    };
  }, [astToModules]);

  useEffect(() => {
    if (updateSource === "modules") {
      const cmd = compileCommand(modules);
      setAst(modulesToAst(modules));
      setInputCommand(cmd);
      setCompiledCommand(cmd);
    }
  }, [modules, compileCommand, updateSource]);

  const setModules = useCallback((newModules: EnhancedModuleType[]) => {
    setModulesState(newModules);
    setMinimizedModules(new Array(newModules.length).fill(false));
  }, []);

  const updateModule = useCallback(
    (index: number, updates: Partial<EnhancedModuleType>): void => {
      setUpdateSource("modules");
      setModulesState((prevModules) =>
        prevModules.map((module, i) =>
          i === index ? { ...module, ...updates } : module
        )
      );
    },
    []
  );

  const removeModule = useCallback((index: number): void => {
    setUpdateSource("modules");
    setModulesState((prevModules) => {
      const newModules = prevModules.filter((_, i) => i !== index);
      setMinimizedModules((prev) => prev.filter((_, i) => i !== index));
      return newModules;
    });
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
    outputs,
    setOutputs,
    updateModule,
    removeModule,
    executeAst,
    currentFilePath,
    setCurrentFilePath,
    hasUnsavedChanges,
    setFileContent,
    loading,
    setLoading,
    minimizedModules,
    setMinimizedModules,
    isCopied,
    setIsCopied,
    inputMessage,
    setInputMessage,
    isLoading,
    setIsLoading,
    chatHistory,
    setChatHistory,
    isOpenAIEnabled,
    setIsOpenAIEnabled,
  };
};
