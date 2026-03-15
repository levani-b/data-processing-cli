import { state } from "../state.js";
import path from "node:path";

export const resolvePath = (inputPath) => {
  const basePath = state.cwd;

  return path.resolve(basePath, inputPath);
};
