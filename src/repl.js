import readline from "node:readline";
import { state } from "./state.js";
import { parseArgs } from "./utils/argParser.js";
import { up, cd, ls } from "./navigation.js";
import { csvToJson } from "./commands/csvToJson.js";
import { jsonToCsv } from "./commands/jsonToCsv.js";
import { count } from "./commands/count.js";
import { hash } from "./commands/hash.js";
import { hashCompare } from "./commands/hashCompare.js";
import { encrypt } from "./commands/encrypt.js";

export const startRepl = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  console.log("Welcome to Data Processing CLI!");
  console.log(`You are currently in ${state.cwd}`);
  rl.prompt();

  rl.on("line", async (line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      rl.prompt();
      return;
    }

    if (trimmed == ".exit") {
      rl.close();
      return;
    }

    const { command, args } = parseArgs(trimmed);

    switch (command) {
      case "up":
        up();
        break;
      case "cd":
        const cdPath = trimmed.split(/\s+/)[1];
        await cd(cdPath);
        break;
      case "ls":
        await ls();
        break;
      case "csv-to-json":
        await csvToJson(args);
        break;
      case "json-to-csv":
        await jsonToCsv(args);
        break;
      case "count":
        await count(args);
        break;
      case "hash":
        await hash(args);
        break;
      case "hash-compare":
        await hashCompare(args);
        break;
      case "encrypt":
        await encrypt(args);
        break;
      default:
        console.log("Invalid input");
    }

    rl.prompt();
  }).on("close", () => {
    console.log("Thank you for using Data Processing CLI!");
    process.exit(0);
  });
};
