import { pipeline } from "stream/promises";
import { createHash } from "node:crypto";
import { Transform } from "node:stream";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import { resolvePath } from "../utils/pathResolver.js";

const SUPPORTED_ALGORITHMS = ["sha256", "md5", "sha512"];

export const hash = async (args) => {
  if (!args.input) {
    console.log("Invalid input");
    return;
  }

  const algorithm = args.algorithm || "sha256";

  if (!SUPPORTED_ALGORITHMS.includes(algorithm)) {
    console.log("Operation failed");
    return;
  }

  try {
    const inputPath = resolvePath(args.input);
    const hasher = createHash(algorithm);

    const hashTransform = new Transform({
      transform(chunk, encoding, callback) {
        hasher.update(chunk);
        callback();
      },
      flush(callback) {
        callback();
      },
    });

    await pipeline(
      fs.createReadStream(inputPath),
      hashTransform,
      new Transform({
        transform(chunk, encoding, callback) {
          callback();
        },
      }),
    );

    const result = hasher.digest("hex");
    console.log(`${algorithm}: ${result}`);

    if (args.save) {
      const savePath = inputPath + "." + algorithm;
      await fsPromises.writeFile(savePath, result);
    }
  } catch {
    console.log("Operation failed");
  }
};
