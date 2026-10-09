import { Worker } from "node:worker_threads";
import { cpus } from "node:os";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import { resolvePath } from "../utils/pathResolver.js";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const adjustChunkEnd = (inputPath, position, fileSize) => {
  return new Promise((resolve) => {
    if (position >= fileSize - 1) {
      resolve(fileSize - 1);
      return;
    }

    const stream = fs.createReadStream(inputPath, {
      start: position,
      end: Math.min(position + 200, fileSize - 1),
    });

    let buffer = "";
    stream.on("data", (chunk) => (buffer += chunk.toString()));
    stream.on("end", () => {
      const newlineIndex = buffer.indexOf("\n");
      if (newlineIndex === -1) {
        resolve(position + buffer.length - 1);
      } else {
        resolve(position + newlineIndex);
      }
    });
  });
};

const runWorker = (inputPath, start, end) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, "../workers/logWorker.js"), {
      workerData: { inputPath, start, end },
    });
    worker.on("message", resolve);
    worker.on("error", reject);
  });
};

const mergeStats = (partialStats) => {
  const merged = {
    total: 0,
    levels: {},
    status: {},
    paths: {},
    responseTimeSum: 0,
  };

  for (const stats of partialStats) {
    if (!stats) continue;

    merged.total += stats.total;
    merged.responseTimeSum += stats.responseTimeSum;

    for (const [level, count] of Object.entries(stats.levels)) {
      merged.levels[level] = (merged.levels[level] || 0) + count;
    }

    for (const [statusClass, count] of Object.entries(stats.status)) {
      merged.status[statusClass] = (merged.status[statusClass] || 0) + count;
    }

    for (const [path, count] of Object.entries(stats.paths)) {
      merged.paths[path] = (merged.paths[path] || 0) + count;
    }
  }

  return merged;
};

export const logStats = async (args) => {
  if (!args.input || !args.output) {
    console.log("Invalid input");
    return;
  }

  try {
    const inputPath = resolvePath(args.input);
    const outputPath = resolvePath(args.output);

    const fileSize = (await fsPromises.stat(inputPath)).size;
    const numWorkers = cpus().length;
    const chunkSize = Math.floor(fileSize / numWorkers);

    const chunks = [];
    let start = 0;

    for (let i = 0; i < numWorkers; i++) {
      const roughEnd =
        i === numWorkers - 1 ? fileSize - 1 : start + chunkSize - 1;
      const end = await adjustChunkEnd(inputPath, roughEnd, fileSize);
      chunks.push({ start, end });
      start = end + 1;
    }

    const partialStats = await Promise.all(
      chunks.map(({ start, end }) => runWorker(inputPath, start, end)),
    );

    const merged = mergeStats(partialStats);

    const topPaths = Object.entries(merged.paths)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const result = {
      total: merged.total,
      levels: merged.levels,
      status: merged.status,
      topPaths,
      avgResponseTimeMs:
        merged.total > 0
          ? Math.round((merged.responseTimeSum / merged.total) * 100) / 100
          : 0,
    };

    await fsPromises.writeFile(outputPath, JSON.stringify(result, null, 2));
    console.log("Log stats written successfully");
  } catch (e) {
    console.log("Operation failed");
  }
};
