const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel, data) => {
      // whitelist channels
      let validChannels = ["execute-command", "parse-command"];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      let validChannels = [
        "fromMain",
        "parse-command-result",
        "execute-command-result",
        "new-pipeline",
        "open-pipeline",
        "save-pipeline",
        "save-pipeline-as",
      ];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    removeAllListeners: (channel) => {
      let validChannels = [
        "fromMain",
        "parse-command-result",
        "execute-command-result",
        "new-pipeline",
        "open-pipeline",
        "save-pipeline",
        "save-pipeline-as",
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeAllListeners(channel);
      }
    },
  },
  executeCommand: (args) => ipcRenderer.send("execute-command", args),
  parseCommand: (args) => ipcRenderer.send("parse-command", args),
  showSaveDialog: (options) => ipcRenderer.invoke("show-save-dialog", options),
  showSaveScriptDialog: (options) =>
    ipcRenderer.invoke("show-save-script-dialog", options),
  showOpenScriptDialog: (options) =>
    ipcRenderer.invoke("show-open-script-dialog", options),
  saveScriptFile: (content, filePath) =>
    ipcRenderer.invoke("save-script-file", { content, filePath }),
  openScriptFile: (filePath) =>
    ipcRenderer.invoke("open-script-file", filePath),
});
