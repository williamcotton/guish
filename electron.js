import { app, BrowserWindow, ipcMain, dialog, Menu } from "electron";
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
  const mainWindow = new BrowserWindow({
    width: 1500,
    height: 1000,
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Set dock icon for macOS
  if (process.platform === "darwin") {
    app.dock.setIcon(path.join(__dirname, "appIcon.png"));
  }

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Create the Application's main menu
  const template = [
    {
      label: "guish",
      submenu: [
        {
          label: "Exit",
          accelerator: "CmdOrCtrl+Q",
          click: () => app.quit(),
        },
      ],
    },
    {
      label: "File",
      submenu: [
        {
          label: "New",
          accelerator: "CmdOrCtrl+N",
          click: () => mainWindow.webContents.send("new-pipeline"),
        },
        {
          label: "Open",
          accelerator: "CmdOrCtrl+O",
          click: () => mainWindow.webContents.send("open-pipeline"),
        },
        {
          label: "Save",
          accelerator: "CmdOrCtrl+S",
          click: () => mainWindow.webContents.send("save-pipeline"),
        },
        {
          label: "Save As",
          accelerator: "CmdOrCtrl+Shift+S",
          click: () => mainWindow.webContents.send("save-pipeline-as"),
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        {
          label: "Select All",
          accelerator: "CmdOrCtrl+A",
          selector: "selectAll:",
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

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

  ipcMain.handle("show-save-dialog", async (event, options) => {
    return dialog.showSaveDialog(win, options);
  });

  ipcMain.handle("show-save-script-dialog", async (event, options) => {
    const defaultOptions = {
      title: "Save Pipeline Script",
      filters: [{ name: "Shell Scripts", extensions: ["sh"] }],
      properties: ["createDirectory", "showOverwriteConfirmation"],
    };
    const mergedOptions = { ...defaultOptions, ...options };

    try {
      const result = await dialog.showSaveDialog(mainWindow, mergedOptions);
      return result;
    } catch (error) {
      console.error("Error in save script dialog:", error);
      return { canceled: true, error: error.message };
    }
  });

  ipcMain.handle("show-open-script-dialog", async (event, options) => {
    const defaultOptions = {
      title: "Open Pipeline Script",
      filters: [{ name: "Shell Scripts", extensions: ["sh"] }],
      properties: ["openFile"],
    };
    const mergedOptions = { ...defaultOptions, ...options };

    try {
      const result = await dialog.showOpenDialog(mainWindow, mergedOptions);
      return result;
    } catch (error) {
      console.error("Error in open script dialog:", error);
      return { canceled: true, filePaths: [], error: error.message };
    }
  });

  ipcMain.handle("save-script-file", async (event, { content, filePath }) => {
    try {
      await fs.promises.writeFile(filePath, content, "utf8");
      return { success: true };
    } catch (error) {
      console.error("Error saving script file:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("open-script-file", async (event, filePath) => {
    try {
      const content = await fs.promises.readFile(filePath, "utf8");
      return { success: true, content };
    } catch (error) {
      console.error("Error opening script file:", error);
      return { success: false, error: error.message };
    }
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
