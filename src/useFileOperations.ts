import { useCallback, useEffect } from "react";

import { UseStoreType } from "./useStore";

export const useFileOperations = (store: UseStoreType) => {
  const savePipeline = useCallback(
    async (filePath: string | null = null): Promise<void> => {
      try {
        if (!filePath) {
          const result = await window.electron.showSaveScriptDialog();
          if (result.canceled || !result.filePath) {
            return;
          }
          filePath = result.filePath;
        }

        const saveResult = await window.electron.saveScriptFile(
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
    store.setOutput("");
    store.setCurrentFilePath(null);
  }, [store]);

  const handleOpenPipeline = useCallback(async (): Promise<void> => {
    try {
      const result = await window.electron.showOpenScriptDialog();
      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        const fileContent = await window.electron.openScriptFile(filePath);
        if (fileContent.success && fileContent.content !== undefined) {
          store.setFileContent(fileContent.content);
          store.setCurrentFilePath(filePath);
          store.setOutput(""); // Clear text output
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
    window.electron.ipcRenderer.receive("new-pipeline", handleNewPipeline);
    window.electron.ipcRenderer.receive("open-pipeline", handleOpenPipeline);
    window.electron.ipcRenderer.receive("save-pipeline", handleSavePipeline);
    window.electron.ipcRenderer.receive(
      "save-pipeline-as",
      handleSavePipelineAs
    );

    // Cleanup function
    return () => {
      window.electron.ipcRenderer.removeAllListeners("new-pipeline");
      window.electron.ipcRenderer.removeAllListeners("open-pipeline");
      window.electron.ipcRenderer.removeAllListeners("save-pipeline");
      window.electron.ipcRenderer.removeAllListeners("save-pipeline-as");
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
