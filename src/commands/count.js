import { Transform } from "node:stream";
import { pipeline } from "stream/promises";
import fs from "node:fs";
import { resolvePath } from "../utils/pathResolver.js";

export const count = async (args) => {
  if (!args.input) {
    console.log("Invalid input");
    return;
  }

  try {
    const inputPath = resolvePath(args.input);

    let lines = 0;
    let words = 0;
    let characters = 0;
    let leftover = "";

    const countTransform = new Transform({
      transform(chunk, encoding, callback) {
        const data = leftover + chunk.toString();
        const parts = data.split("\n");
        leftover = parts.pop();

        for (const part of parts) {
          lines++;
          words += part.split(/\s+/).filter((w) => w.length > 0).length;
          characters += part.length + 1;
        }
        callback();
      },

      flush(callback) {
        if (leftover.length > 0) {
          lines++;
          words += leftover.split(/\s+/).filter((w) => w.length > 0).length;
          characters += leftover.length;
        }
        callback();
      },
    });

    await pipeline(
      fs.createReadStream(inputPath),
      countTransform,
      new Transform({
        transform(chunk, encoding, callback) {
          callback();
        },
      }),
    );

    console.log(`Lines: ${lines}`);
    console.log(`Words: ${words}`);
    console.log(`Characters: ${characters}`);
  } catch {
    console.log("Operation failed");
  }
};
