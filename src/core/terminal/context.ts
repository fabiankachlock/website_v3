import type { VirtualFS } from "./fs";

export interface TerminalContext {
  wd: string;
  fs: VirtualFS;
  stdOut: string[];
  writeOutput(...line: string[]): void;
}
