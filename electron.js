import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import isDev from "electron-is-dev";
import parse from "bash-parser";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // It's better to disable nodeIntegration for security
      enableRemoteModule: false, // `remote` module is deprecated, use contextBridge and ipcRenderer instead
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  if (isDev) {
    win.webContents.openDevTools();
  }

  ipcMain.on("parse-command", (event, args) => {
    if (!args || args.trim() === "") {
      // Return an empty AST structure for empty input
      event.reply("parse-command-result", {
        type: "Script",
        commands: [
          {
            type: "Pipeline",
            commands: [],
          },
        ],
      });
    } else {
      try {
        const ast = parse(args);
        event.reply("parse-command-result", ast);
      } catch (error) {
        event.reply("parse-command-result", { error: error.message });
      }
    }
  });

  ipcMain.on("execute-command", (event, args) => {
    exec("source ~/dotfiles/.functions && " + args, (error, stdout, stderr) => {
      if (error) {
        event.reply("execute-command-result", { error: error.message });
      } else {
        event.reply("execute-command-result", { output: stdout || stderr });
      }
    });
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
