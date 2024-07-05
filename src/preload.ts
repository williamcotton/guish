const { contextBridge, ipcRenderer } = require("electron");

type ValidChannels =
  | "execute-command"
  | "parse-command"
  | "fromMain"
  | "parse-command-result"
  | "execute-command-result"
  | "new-pipeline"
  | "open-pipeline"
  | "save-pipeline"
  | "save-pipeline-as";

const validSendChannels: ValidChannels[] = ["execute-command", "parse-command"];
const validReceiveChannels: ValidChannels[] = [
  "fromMain",
  "parse-command-result",
  "execute-command-result",
  "new-pipeline",
  "open-pipeline",
  "save-pipeline",
  "save-pipeline-as",
];

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel: ValidChannels, data: unknown) => {
      if (validSendChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel: ValidChannels, func: (...args: unknown[]) => void) => {
      if (validReceiveChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(
          channel,
          (_event: Electron.IpcRendererEvent, ...args: unknown[]) =>
            func(...args)
        );
      }
    },
    removeAllListeners: (channel: ValidChannels) => {
      if (validReceiveChannels.includes(channel)) {
        ipcRenderer.removeAllListeners(channel);
      }
    },
  },
  executeCommand: (args: unknown) => ipcRenderer.send("execute-command", args),
  parseCommand: (args: unknown) => ipcRenderer.send("parse-command", args),
  showSaveDialog: (options: Electron.SaveDialogOptions) =>
    ipcRenderer.invoke("show-save-dialog", options),
  showSaveScriptDialog: (options: Electron.SaveDialogOptions) =>
    ipcRenderer.invoke("show-save-script-dialog", options),
  showOpenScriptDialog: (options: Electron.OpenDialogOptions) =>
    ipcRenderer.invoke("show-open-script-dialog", options),
  saveScriptFile: (content: string, filePath: string) =>
    ipcRenderer.invoke("save-script-file", { content, filePath }),
  openScriptFile: (filePath: string) =>
    ipcRenderer.invoke("open-script-file", filePath),
});
