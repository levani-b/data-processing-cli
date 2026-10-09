import { pipeline } from "stream/promises";
import { randomBytes, scryptSync, createCipheriv } from "node:crypto";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import { resolvePath } from "../utils/pathResolver.js";

export const encrypt = async (args) => {
  if (!args.input || !args.output || !args.password) {
    console.log("Invalid input");
    return;
  }

  try {
    const inputPath = resolvePath(args.input);
    const outputPath = resolvePath(args.output);

    const salt = randomBytes(16);
    const iv = randomBytes(12);
    const key = scryptSync(args.password, salt, 32);
    const cipher = createCipheriv("aes-256-gcm", key, iv);

    const writeStream = fs.createWriteStream(outputPath);

    await new Promise((resolve, reject) => {
      writeStream.write(Buffer.concat([salt, iv]), (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await pipeline(fs.createReadStream(inputPath), cipher, writeStream);

    await fsPromises.appendFile(outputPath, cipher.getAuthTag());

    console.log("File encrypted successfully");
  } catch {
    console.log("Operation failed");
  }
};
