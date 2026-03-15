# Data Processing CLI

An interactive command-line tool for file navigation and data processing operations. Built with Node.js using only built-in modules.

## Requirements

- Node.js 24.x.x

## Installation

```bash
npm install
```

## Usage

```bash
npm run start
```

## Commands

### Navigation

| Command     | Description                                 |
| ----------- | ------------------------------------------- |
| `up`        | Move up one directory level                 |
| `cd <path>` | Navigate to a directory                     |
| `ls`        | List files and folders in current directory |

### Data Processing

| Command                                                                           | Description                                  |
| --------------------------------------------------------------------------------- | -------------------------------------------- |
| `csv-to-json --input <file> --output <file>`                                      | Convert CSV file to JSON array               |
| `json-to-csv --input <file> --output <file>`                                      | Convert JSON array to CSV file               |
| `count --input <file>`                                                            | Count lines, words, and characters in a file |
| `hash --input <file> [--algorithm sha256\|md5\|sha512] [--save]`                  | Calculate file hash                          |
| `hash-compare --input <file> --hash <hashfile> [--algorithm sha256\|md5\|sha512]` | Compare file hash with expected hash         |
| `encrypt --input <file> --output <file> --password <password>`                    | Encrypt a file using AES-256-GCM             |
| `decrypt --input <file> --output <file> --password <password>`                    | Decrypt an encrypted file                    |
| `log-stats --input <file> --output <file>`                                        | Analyze a log file using worker threads      |

### Other

| Command  | Description          |
| -------- | -------------------- |
| `.exit`  | Exit the application |
| `Ctrl+C` | Exit the application |

## Generating Test Log Data

```bash
node scripts/generate-logs.js --output workspace/logs.txt --lines 500000
```
