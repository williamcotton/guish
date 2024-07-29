import { contextBridge, ipcRenderer } from "electron";
import { ElectronAPI, ValidChannels } from "./types";

const validSendChannels: ValidChannels[] = ["parse-command", "execute-ast"];
const validReceiveChannels: ValidChannels[] = [
  "fromMain",
  "parse-command-result",
  "execute-command-result",
  "new-pipeline",
  "open-pipeline",
  "save-pipeline",
  "save-pipeline-as",
];

const electronApi: ElectronAPI = {
  ipcRenderer: {
    send: (channel, data) => {
      if (validSendChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func: (...args: unknown[]) => void) => {
      if (validReceiveChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(
          channel,
          (_event: Electron.IpcRendererEvent, ...args: unknown[]) =>
            func(...args)
        );
      }
    },
    removeAllListeners: (channel) => {
      if (validReceiveChannels.includes(channel)) {
        ipcRenderer.removeAllListeners(channel);
      }
    },
  },
  executeAst: (args) => ipcRenderer.send("execute-ast", args),
  parseCommand: (args) => ipcRenderer.send("parse-command", args),
  showSaveDialog: (options) => ipcRenderer.invoke("show-save-dialog", options),
  showSaveScriptDialog: (options) =>
    ipcRenderer.invoke("show-save-script-dialog", options),
  showOpenScriptDialog: (options) =>
    ipcRenderer.invoke("show-open-script-dialog", options),
  showDirectoryDialog: (options) =>
    ipcRenderer.invoke("show-directory-dialog", options),
  saveScriptFile: (content, filePath) =>
    ipcRenderer.invoke("save-script-file", { content, filePath }),
  openScriptFile: (filePath) =>
    ipcRenderer.invoke("open-script-file", filePath),
  chatCompletionsCreate: (messages) =>
    ipcRenderer.invoke("chat-completions-create", messages),
  getOpenAIStatus: () => ipcRenderer.invoke("get-openai-status"),
};

contextBridge.exposeInMainWorld("electron", electronApi);
