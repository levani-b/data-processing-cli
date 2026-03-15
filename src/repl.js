import readline from "node:readline";
import { state } from "./state.js";
import { parseArgs } from "./utils/argParser.js";

export const startRepl = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  console.log("Welcome to Data Processing CLI!");
  console.log(`You are currently in ${state.cwd}`);
  rl.prompt();

  rl.on("line", (line) => {
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
        break;
      case "cd":
        break;
      case "ls":
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
