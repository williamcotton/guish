import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  IpcMainEvent,
  IpcMainInvokeEvent,
} from "electron";
import path from "path";
import { fileURLToPath } from "url";
import isDev from "electron-is-dev";
// @ts-ignore
import parse from "bash-parser";
import { spawn } from "child_process";
import fs from "fs";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


interface Config {
  shell: string;
  preloadScript: string;
}

// Load configuration
const configPath = path.join(os.homedir(), ".guish");
let config: Config = {
  shell: "zsh",
  preloadScript: "", // Default to no preload script
};

try {
  const configFile = fs.readFileSync(configPath, "utf8");
  const userConfig = JSON.parse(configFile);
  config = { ...config, ...userConfig };
} catch (error) {
  console.warn(`Could not read config file: ${(error as Error).message}`);
  console.warn("Using default configuration");
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1500,
    height: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.resolve(app.getAppPath(), 'dist', 'preload.js'),
    },
  });

  // Set dock icon for macOS
  if (process.platform === "darwin") {
    try {
      const iconPath = path.join(__dirname, "..", "assets", "appIcon.png");
      if (fs.existsSync(iconPath)) {
        app.dock.setIcon(iconPath);
      } else {
        console.warn(`Icon file not found: ${iconPath}`);
      }
    } catch (error) {
      console.error("Failed to set dock icon:", error);
    }
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
  const template: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] =
    [
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
          { label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo" },
          { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
          { type: "separator" },
          { label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
          { label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
          {
            label: "Select All",
            accelerator: "CmdOrCtrl+A",
            role: "selectAll",
          },
        ],
      },
    ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  ipcMain.on("parse-command", (event: IpcMainEvent, args: string) => {
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
        event.reply("parse-command-result", {
          error: (error as Error).message,
        });
      }
    }
  });

  ipcMain.on("execute-command", (event: IpcMainEvent, args: string) => {
    const command = config.preloadScript
      ? `${config.preloadScript} && ${args}`
      : args;
    const shellProcess = spawn(config.shell, ["-c", command], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    shellProcess.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    shellProcess.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    shellProcess.on("close", (code: number | null) => {
      if (code !== 0) {
        event.reply("execute-command-result", { error: stderr });
      } else {
        event.reply("execute-command-result", { output: stdout || stderr });
      }
    });
  });

  ipcMain.handle(
    "show-save-dialog",
    async (event: IpcMainInvokeEvent, options: Electron.SaveDialogOptions) => {
      return dialog.showSaveDialog(mainWindow, options);
    }
  );

  ipcMain.handle(
    "show-save-script-dialog",
    async (event: IpcMainInvokeEvent, options: Electron.SaveDialogOptions) => {
      const defaultOptions: Electron.SaveDialogOptions = {
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
        return { canceled: true, error: (error as Error).message };
      }
    }
  );

  ipcMain.handle(
    "show-open-script-dialog",
    async (event: IpcMainInvokeEvent, options: Electron.OpenDialogOptions) => {
      const defaultOptions: Electron.OpenDialogOptions = {
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
        return {
          canceled: true,
          filePaths: [],
          error: (error as Error).message,
        };
      }
    }
  );

  ipcMain.handle(
    "save-script-file",
    async (
      event: IpcMainInvokeEvent,
      { content, filePath }: { content: string; filePath: string }
    ) => {
      try {
        await fs.promises.writeFile(filePath, content, "utf8");
        return { success: true };
      } catch (error) {
        console.error("Error saving script file:", error);
        return { success: false, error: (error as Error).message };
      }
    }
  );

  ipcMain.handle(
    "open-script-file",
    async (event: IpcMainInvokeEvent, filePath: string) => {
      try {
        const content = await fs.promises.readFile(filePath, "utf8");
        return { success: true, content };
      } catch (error) {
        console.error("Error opening script file:", error);
        return { success: false, error: (error as Error).message };
      }
    }
  );
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
