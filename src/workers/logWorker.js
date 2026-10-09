import { workerData, parentPort } from "node:worker_threads";
import fs from "node:fs";

const { inputPath, start, end } = workerData;

const stats = {
  total: 0,
  levels: {},
  status: {},
  paths: {},
  responseTimeSum: 0,
};

let leftover = "";

const readStream = fs.createReadStream(inputPath, { start, end });

readStream.on("data", (chunk) => {
  const data = leftover + chunk.toString();
  const lines = data.split("\n");
  leftover = lines.pop();

  for (const line of lines) {
    if (!line.trim()) continue;

    const parts = line.split(" ");
    const level = parts[1];
    const statusCode = parseInt(parts[3]);
    const responseTime = parseFloat(parts[4]);
    const path = parts[6];

    stats.total++;

    stats.levels[level] = (stats.levels[level] || 0) + 1;

    if (statusCode >= 200 && statusCode < 300) {
      stats.status["2xx"] = (stats.status["2xx"] || 0) + 1;
    } else if (statusCode >= 300 && statusCode < 400) {
      stats.status["3xx"] = (stats.status["3xx"] || 0) + 1;
    } else if (statusCode >= 400 && statusCode < 500) {
      stats.status["4xx"] = (stats.status["4xx"] || 0) + 1;
    } else if (statusCode >= 500) {
      stats.status["5xx"] = (stats.status["5xx"] || 0) + 1;
    }

    if (path) {
      stats.paths[path] = (stats.paths[path] || 0) + 1;
    }

    if (!isNaN(responseTime)) {
      stats.responseTimeSum += responseTime;
    }
  }
});

readStream.on("end", () => {
  if (leftover.trim()) {
    const parts = leftover.split(" ");
    const level = parts[1];
    const statusCode = parseInt(parts[3]);
    const responseTime = parseFloat(parts[4]);
    const path = parts[6];

    stats.total++;
    stats.levels[level] = (stats.levels[level] || 0) + 1;

    if (statusCode >= 200 && statusCode < 300) {
      stats.status["2xx"] = (stats.status["2xx"] || 0) + 1;
    } else if (statusCode >= 300 && statusCode < 400) {
      stats.status["3xx"] = (stats.status["3xx"] || 0) + 1;
    } else if (statusCode >= 400 && statusCode < 500) {
      stats.status["4xx"] = (stats.status["4xx"] || 0) + 1;
    } else if (statusCode >= 500) {
      stats.status["5xx"] = (stats.status["5xx"] || 0) + 1;
    }

    if (path) {
      stats.paths[path] = (stats.paths[path] || 0) + 1;
    }

    if (!isNaN(responseTime)) {
      stats.responseTimeSum += responseTime;
    }
  }

  parentPort.postMessage(stats);
});

readStream.on("error", () => {
  parentPort.postMessage(null);
});
