import { pipeline } from "stream/promises";
import { scryptSync, createDecipheriv } from "node:crypto";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import { resolvePath } from "../utils/pathResolver.js";

export const decrypt = async (args) => {
  if (!args.input || !args.output || !args.password) {
    console.log("Invalid input");
    return;
  }

  try {
    const inputPath = resolvePath(args.input);
    const outputPath = resolvePath(args.output);

    const fileBuffer = await fsPromises.readFile(inputPath);

    const salt = fileBuffer.subarray(0, 16);
    const iv = fileBuffer.subarray(16, 28);
    const authTag = fileBuffer.subarray(fileBuffer.length - 16);
    const ciphertext = fileBuffer.subarray(28, fileBuffer.length - 16);

    const key = scryptSync(args.password, salt, 32);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    await pipeline(
      fs.createReadStream(inputPath, {
        start: 28,
        end: fileBuffer.length - 17,
      }),
      decipher,
      fs.createWriteStream(outputPath),
    );

    console.log("File decrypted successfully");
  } catch {
    console.log("Operation failed");
  }
};
