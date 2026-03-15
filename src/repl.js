import readline from "node:readline";
import os from "node:os";

export const startRepl = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  const cwd = os.homedir();
  console.log("Welcome to Data Processing CLI");
  console.log(`You are currently in ${cwd}`);
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
