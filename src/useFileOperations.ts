import { useCallback, useEffect } from "react";

import { UseStoreType } from "./useStore";
import { ElectronAPI } from "./types";

export const useFileOperations = (store: UseStoreType, electronApi: ElectronAPI) => {
  const savePipeline = useCallback(
    async (filePath: string | null = null): Promise<void> => {
      try {
        if (!filePath) {
          const result = await electronApi.showSaveScriptDialog({});
          if (result.canceled || !result.filePath) {
            return;
          }
          filePath = result.filePath;
        }

        const saveResult = await electronApi.saveScriptFile(
          store.compiledCommand,
          filePath
        );
        if (saveResult.success) {
          store.setCurrentFilePath(filePath);
          store.setFileContent(store.compiledCommand);
        } else {
          console.error("Failed to save script file:", saveResult.error);
          // Here you might want to show an error message to the user
        }
      } catch (error) {
        console.error("Error in save pipeline:", error);
        // Here you might want to show an error message to the user
      }
    },
    [store]
  );

  const handleNewPipeline = useCallback((): void => {
    store.setFileContent("");
    store.setOutputs([]);
    store.setCurrentFilePath(null);
  }, [store]);

  const handleOpenPipeline = useCallback(async (): Promise<void> => {
    try {
      const result = await electronApi.showOpenScriptDialog({});
      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        const fileContent = await electronApi.openScriptFile(filePath);
        if (fileContent.success && fileContent.content !== undefined) {
          store.setFileContent(fileContent.content);
          store.setCurrentFilePath(filePath);
          store.setOutputs([]); // Clear text output
        } else {
          console.error("Failed to open script file:", fileContent.error);
          // Here you might want to show an error message to the user
        }
      }
    } catch (error) {
      console.error("Error in open pipeline:", error);
      // Here you might want to show an error message to the user
    }
  }, [store]);

  const handleSavePipeline = useCallback((): void => {
    savePipeline(store.currentFilePath);
  }, [savePipeline, store.currentFilePath]);

  const handleSavePipelineAs = useCallback((): void => {
    savePipeline();
  }, [savePipeline]);

  useEffect(() => {
    // Set up IPC listeners
    electronApi.ipcRenderer.receive("new-pipeline", handleNewPipeline);
    electronApi.ipcRenderer.receive("open-pipeline", handleOpenPipeline);
    electronApi.ipcRenderer.receive("save-pipeline", handleSavePipeline);
    electronApi.ipcRenderer.receive(
      "save-pipeline-as",
      handleSavePipelineAs
    );

    // Cleanup function
    return () => {
      electronApi.ipcRenderer.removeAllListeners("new-pipeline");
      electronApi.ipcRenderer.removeAllListeners("open-pipeline");
      electronApi.ipcRenderer.removeAllListeners("save-pipeline");
      electronApi.ipcRenderer.removeAllListeners("save-pipeline-as");
    };
  }, [
    handleNewPipeline,
    handleOpenPipeline,
    handleSavePipeline,
    handleSavePipelineAs,
  ]);

  return {
    handleNewPipeline,
    handleOpenPipeline,
    handleSavePipeline,
    handleSavePipelineAs,
  };
};
