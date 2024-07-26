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
// @ts-ignore
import parse from "bash-parser";
import OpenAI from "openai";
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions";
import dotenv from "dotenv";
import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import { astToCommand } from "./astToCommand";
import { PipelineNode, CommandNode, ScriptNode } from "./types";

dotenv.config();

const openai = new OpenAI();

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

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1500,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Set dock icon for macOS
  if (process.platform === "darwin") {
    try {
      const iconPath = path.join(__dirname, "..", "..", "assets", "appIcon.png");
      if (fs.existsSync(iconPath)) {
        app.dock.setIcon(iconPath);
      } else {
        console.warn(`Icon file not found: ${iconPath}`);
      }
    } catch (error) {
      console.error("Failed to set dock icon:", error);
    }
  }

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

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

  ipcMain.on("execute-ast", async (event: IpcMainEvent, ast: ScriptNode) => {
    try {
      let results: string[] = [];

      const executeCommand = (command: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const fullCommand = config.preloadScript
            ? `${config.preloadScript} && ${command}`
            : command;

          const shellProcess = spawn(config.shell, ["-c", fullCommand], {
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
              reject(stderr);
            } else {
              resolve(stdout || stderr);
            }
          });
        });
      };

      const executeCumulativePipeline = async (pipeline: PipelineNode) => {
        results = new Array(pipeline.commands.length).fill("");
        const pipelinePromisesExecuteAndReply = results.map(async (_, i) => {
          const partialPipeline: PipelineNode = {
            type: "Pipeline",
            commands: pipeline.commands.slice(0, i + 1),
          };
          const scriptNode: ScriptNode = {
            type: "Script",
            commands: [partialPipeline],
          };
          const commandString = astToCommand(scriptNode);
          const result = await executeCommand(commandString);
          results[i] = result;
          event.reply("execute-command-result", { output: results });
        });
        await Promise.all(pipelinePromisesExecuteAndReply);
      };

      if (ast.type === "Script") {
        for (const command of ast.commands) {
          if (command.type === "Pipeline") {
            await executeCumulativePipeline(command);
          } else {
            const commandString = astToCommand({
              type: "Script",
              commands: [command],
            });
            const result = await executeCommand(commandString);
            results.push(result);
          }
        }
      }

      event.reply("execute-command-result", { output: results });
    } catch (error) {
      event.reply("execute-command-result", {
        error: (error as Error).message,
      });
    }
  });

  ipcMain.handle(
    "show-save-dialog",
    async (_event: IpcMainInvokeEvent, options: Electron.SaveDialogOptions) => {
      return dialog.showSaveDialog(mainWindow, options);
    }
  );

  ipcMain.handle(
    "show-save-script-dialog",
    async (_event: IpcMainInvokeEvent, options: Electron.SaveDialogOptions) => {
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
    async (_event: IpcMainInvokeEvent, options: Electron.OpenDialogOptions) => {
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
    "show-directory-dialog",
    async (_event: IpcMainInvokeEvent, options: Electron.OpenDialogOptions) => {
      const defaultOptions: Electron.OpenDialogOptions = {
        properties: ["openDirectory"],
      };
      const mergedOptions = { ...defaultOptions, ...options };

      try {
        const result = await dialog.showOpenDialog(mainWindow, mergedOptions);
        return result;
      } catch (error) {
        console.error("Error in directory selection dialog:", error);
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
      _event: IpcMainInvokeEvent,
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
    async (_event: IpcMainInvokeEvent, filePath: string) => {
      try {
        const content = await fs.promises.readFile(filePath, "utf8");
        return { success: true, content };
      } catch (error) {
        console.error("Error opening script file:", error);
        return { success: false, error: (error as Error).message };
      }
    }
  );

  ipcMain.handle(
    "chat-completions-create",
    async (
      _event: IpcMainInvokeEvent,
      messages: ChatCompletionCreateParamsBase["messages"]
    ) => {
      try {
        const completion = await openai.chat.completions.create({
          messages,
          model: "gpt-4o-mini",
        });
        return completion;
      } catch (error) {
        console.error("Error creating chat completions:", error);
        return { error: (error as Error).message };
      }
    }
  );
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  // if (process.platform !== "darwin") {
    app.quit();
  // }
});

// app.on("activate", () => {
//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow();
//   }
// });

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
