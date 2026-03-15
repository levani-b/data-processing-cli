import { pipeline } from "stream/promises";
import { Transform } from "node:stream";
import fs from "node:fs";
import { resolvePath } from "../utils/pathResolver.js";

export const jsonToCsv = async (args) => {
  if (!args.input || !args.output) {
    console.log("Invalid input");
    return;
  }

  try {
    const inputPath = resolvePath(args.input);
    const outputPath = resolvePath(args.output);

    let rawData = "";

    const collectData = new Transform({
      transform(chunk, encoding, callback) {
        rawData += chunk.toString();
        callback();
      },
      flush(callback) {
        try {
          const data = JSON.parse(rawData);

          if (!Array.isArray(data) || data.length === 0) {
            callback(new Error("Invalid JSON"));
            return;
          }

          const headers = Object.keys(data[0]);
          this.push(headers.join(",") + "\n");

          for (const obj of data) {
            const row = headers.map((h) => obj[h] ?? "").join(",");
            this.push(row + "\n");
          }
          callback();
        } catch {
          callback(new Error("Invalid JSON"));
        }
      },
    });

    await pipeline(
      fs.createReadStream(inputPath),
      collectData,
      fs.createWriteStream(outputPath),
    );
    console.log("File converted successfully");
  } catch {
    console.log("Operation failed");
  }
};
