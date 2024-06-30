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
      let validChannels = ["fromMain", "parse-command-result"];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
  },
  executeCommand: (args) => {
    ipcRenderer.send("execute-command", args);
  },
  parseCommand: (args) => {
    ipcRenderer.send("parse-command", args);
  },
});
