import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import isDev from "electron-is-dev";
import parse from "bash-parser";
import { spawn } from "child_process";
import fs from "fs";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configuration
const configPath = path.join(os.homedir(), ".guish");
let config = {
  shell: "zsh",
  preloadScript: "", // Default to no preload script
};

try {
  const configFile = fs.readFileSync(configPath, "utf8");
  const userConfig = JSON.parse(configFile);
  config = { ...config, ...userConfig };
} catch (error) {
  console.warn(`Could not read config file: ${error.message}`);
  console.warn("Using default configuration");
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false,
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
    const command = config.preloadScript
      ? `${config.preloadScript} && ${args}`
      : args;
    const shellProcess = spawn(config.shell, ["-c", command], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    shellProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    shellProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    shellProcess.on("close", (code) => {
      if (code !== 0) {
        event.reply("execute-command-result", { error: stderr });
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
