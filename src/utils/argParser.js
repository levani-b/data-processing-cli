export const parseArgs = (input) => {
  const parts = input.trim().split(/\s+/);
  const command = parts[0];
  const args = {};

  for (let i = 1; i < parts.length; i++) {
    if (parts[i].startsWith("--")) {
      const key = parts[i].slice(2);
      const next = parts[i + 1];

      if (next && !next.startsWith("--")) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }

  return { command, args };
};
