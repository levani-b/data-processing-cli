import readline from "node:readline";
import { state } from "./state.js";

export const startRepl = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  console.log("Welcome to Data Processing CLI");
  console.log(`You are currently in ${state.cwd}`);
  rl.prompt();

  rl.on("line", (line) => {
    if (line.trim() == ".exit") {
      rl.close();
    } else {
      console.log("Invalid input");
      rl.prompt();
    }
  }).on("close", () => {
    console.log("Thank you for using Data Processing CLI!");
    process.exit(0);
  });
};
