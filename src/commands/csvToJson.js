import { Transform } from "node:stream";
import { pipeline } from "stream/promises";
import fs from "node:fs";
import { resolvePath } from "../utils/pathResolver.js";

export const csvToJson = async (args) => {
  if (!args.input || !args.output) {
    console.log("Invalid input");
    return;
  }

  const inputPath = resolvePath(args.input);
  const outputPath = resolvePath(args.output);

  let headers = null;
  let leftover = "";
  let isFirst = true;

  const transform = new Transform({
    transform(chunk, encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split("\n");
      leftover = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;

        if (!headers) {
          headers = line.split(",");
          this.push("[\n");
        } else {
          const values = line.split(",");
          const obj = {};
          headers.forEach((header, i) => {
            obj[header.trim()] = values[i]?.trim();
          });

          const json = JSON.stringify(obj);
          if (!isFirst) {
            this.push(",\n" + json);
          } else {
            this.push(json);
            isFirst = false;
          }
        }
      }
      callback();
    },

    flush(callback) {
      if (leftover.trim() && headers) {
        const values = leftover.split(",");
        const obj = {};
        headers.forEach((header, i) => {
          obj[header.trim()] = values[i]?.trim();
        });
        const json = JSON.stringify(obj);
        if (!isFirst) {
          this.push(",\n" + json);
        } else {
          this.push(json);
        }
      }
      this.push("\n]");
      callback();
    },
  });

  try {
    await pipeline(
      fs.createReadStream(inputPath),
      transform,
      fs.createWriteStream(outputPath),
    );
    console.log(`File converted successfully`);
  } catch {
    console.log("Operation failed");
  }
};
