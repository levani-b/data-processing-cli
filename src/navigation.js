import path from "node:path";
import fs from "node:fs/promises";
import { state } from "./state.js";
import { resolvePath } from "./utils/pathResolver.js";

export const up = () => {
  const basePath = state.cwd;
  const baseParentPath = path.dirname(basePath);

  if (baseParentPath !== basePath) {
    state.cwd = baseParentPath;
  }

  console.log(`You are currently in ${state.cwd}`);
};

export const cd = async (targetPath) => {
  if (!targetPath) {
    console.log("Invalid input");
    return;
  }

  const resolvedPath = resolvePath(targetPath);

  try {
    const stat = await fs.stat(resolvedPath);
    if (!stat.isDirectory()) {
      console.log("Operation failed");
      return;
    }
    state.cwd = resolvedPath;
    console.log(`You are currently in ${state.cwd}`);
  } catch {
    console.log("Operation failed");
  }
};

export const ls = async () => {
  try {
    const entries = await fs.readdir(state.cwd, { withFileTypes: true });

    const folders = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();

    const files = entries
      .filter((e) => !e.isDirectory())
      .map((e) => e.name)
      .sort();

    for (const folder of folders) {
      console.log(`${folder}\t[folder]`);
    }
    for (const file of files) {
      console.log(`${file}\t[file]`);
    }
  } catch {
    console.log("Operation failed");
  }
};
