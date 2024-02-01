import type { TerminalContext } from "./context";
import { CompletionType } from "./suggestions";

export type TerminalCommand = {
  bin: string;
  description: string;
  completion?: CompletionType[];
  execute: (args: string[], context: TerminalContext) => void;
};

export const Commands: TerminalCommand[] = [
  {
    bin: "greet",
    description: "print a greeting",
    execute: (args, context) => {
      let name = args[0];
      context.writeOutput(`Hello, ${name ?? "unknown"}!`);
    },
  },
  {
    bin: "pwd",
    description: "print the current working directory",
    execute: (_args, context) => {
      context.writeOutput(context.wd);
    },
  },
  {
    bin: "cd",
    description: "change directory",
    completion: [CompletionType.Path],
    execute: (args, context) => {
      let path = args[0];
      if (!path) {
        context.wd = "/home";
        return;
      }
      path = context.fs.buildPath(context.wd, path);
      if (context.fs.hasPath(path)) {
        context.wd = path;
      } else {
        context.writeOutput(`${path}: no such file or directory`);
      }
    },
  },
  {
    bin: "ls",
    description: "list files and directories in current directory",
    completion: [CompletionType.Path],
    execute: (args, context) => {
      let path = context.fs.buildPath(context.wd, args[0] ?? ".");
      const dir = context.fs.getDir(path);
      if (dir) {
        for (const [key, value] of Object.entries(dir)) {
          if ("content" in value) {
            context.writeOutput(
              `  ${key}${value.executable ? " (executable)" : ""}`
            );
          } else {
            context.writeOutput(`  /${key}`);
          }
        }
      } else {
        context.writeOutput(`${path}: no such file or directory`);
      }
    },
  },
  {
    bin: "open",
    description: "list files and directories in current directory",
    completion: [CompletionType.Path],
    execute: (args, context) => {
      let path = context.fs.buildPath(context.wd, args[0] ?? ".");
      const file = context.fs.readFile(path);
      if (!file) {
        context.writeOutput(`${path}: no such file or directory`);
      } else if (file.executable) {
        context.writeOutput(`${path}: can't open executable`);
      } else if (!file.link) {
        context.writeOutput(...file.content.split("\n"));
      } else if (file.link.startsWith("http")) {
        context.writeOutput(`opening url: ${file.link}`);
        window.open(file.link, "externalTerminalWindow");
      } else {
        window.location.href = file.link;
      }
    },
  },
  {
    bin: "clear",
    description: "clear all lines of the terminal",
    execute: (_args, context) => {
      context.stdOut.splice(0, context.stdOut.length);
    },
  },
  {
    bin: "cat",
    description: "print the contents of a file",
    completion: [CompletionType.Path],
    execute: (args, context) => {
      let path = context.fs.buildPath(context.wd, args[0] ?? ".");
      const file = context.fs.readFile(path);
      if (!file) {
        context.writeOutput(`${path}: no such file`);
      } else if (file.executable) {
        context.writeOutput(`${path}: can't cat executable`);
      } else {
        context.writeOutput(...file.content.split("\n"));
      }
    },
  },
  {
    bin: "help",
    description: "list files and directories in current directory",
    execute: (_args, context) => {
      context.writeOutput("Hello World");
    },
  },
];
