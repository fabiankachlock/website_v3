import { Commands } from "./commands";

export type FileDescriptor = {
  content: string;
  executable?: string;
  link?: string;
};

export type RecursiveFileTree = {
  [key: string]: RecursiveFileTree | FileDescriptor;
};

const data: RecursiveFileTree = {
  bin: {
    ...Commands.reduce(
      (all, cmd) => ({
        ...all,
        [cmd.bin]: {
          content: cmd.description,
          executable: cmd.bin,
        },
      }),
      {} as Record<string, FileDescriptor>
    ),
  },
  home: {
    skills: {
      test: {
        content: "Hello?",
      },
    },
    projects: {
      test: {
        content: "This is the project",
        link: "/projects/test",
      },
    },
    socials: {
      github: {
        content: "My github account",
        link: "https://github.com/",
      },
      instagram: {
        content: "My instagram account",
        link: "https://instagram.com/",
      },
    },
  },
};

export class VirtualFS {
  constructor(public readonly content: RecursiveFileTree = data) {}

  public hasPath(path: string): boolean {
    let current: RecursiveFileTree | FileDescriptor | undefined = this.content;
    const parts = path.split("/").filter((part) => part);
    for (const folder of parts) {
      if (!current || "content" in current) {
        return false;
      }
      current = current[folder];
    }
    return current !== undefined && !("content" in current);
  }

  public buildPath(wd: string, path: string): string {
    if (path.startsWith("/")) return path;
    let finalPath: string[] = [];
    wd.split("/")
      .concat(path.split("/"))
      .filter((path) => path)
      .forEach((part) => {
        if (part === ".") {
          return;
        } else if (part === "..") {
          finalPath.pop();
        } else {
          finalPath.push(part);
        }
      });

    return "/" + finalPath.join("/");
  }

  public getDir(path: string): RecursiveFileTree | undefined {
    let current: RecursiveFileTree | FileDescriptor | undefined = this.content;
    const parts = path.split("/").filter((part) => part);
    for (const folder of parts) {
      if (!current || "content" in current) {
        return undefined;
      }
      current = current[folder];
    }
    return current !== undefined && !("content" in current)
      ? current
      : undefined;
  }

  public readFile(path: string): FileDescriptor | undefined {
    let current: RecursiveFileTree | FileDescriptor | undefined = this.content;
    const parts = path.split("/").filter((part) => part);
    for (const folder of parts) {
      if (!current || "content" in current) {
        return undefined;
      }
      current = current[folder];
    }
    return current !== undefined && "content" in current
      ? (current as FileDescriptor)
      : undefined;
  }
}
