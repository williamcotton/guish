import fs from "fs";
import path from "path";
import os from "os";
import { app } from "electron";

export function createTempFunctionScript(): string {
  const tmpDir = os.tmpdir();
  const tmpFile = path.join(tmpDir, `guish-functions-${Date.now()}.sh`);

  let functionsPath;
  if (app.isPackaged) {
    // In production, use the path relative to the app's root
    functionsPath = path.join(
      process.resourcesPath,
      "app.asar",
      ".vite",
      "build",
      "shell-functions.sh"
    );
  } else {
    // In development, use the path relative to the public directory
    functionsPath = path.join(__dirname, "..", "build", "shell-functions.sh");
  }

  if (!fs.existsSync(functionsPath)) {
    throw new Error(`Shell functions file not found: ${functionsPath}`);
  }

  const functionsContent = fs.readFileSync(functionsPath, "utf8");
  fs.writeFileSync(tmpFile, functionsContent);
  return tmpFile;
}

export function removeTempFunctionScript(filePath: string): void {
  fs.unlinkSync(filePath);
}
