import { reactive } from "vue";
import { Commands } from "./commands";
import { getSuggestions, type Suggestion } from "./suggestions";
import { VirtualFS } from "./fs";

const TerminalStore = {
  rawInput: "",
  stdOut: [] as string[],
  history: [] as string[],
  activeHistoryItem: undefined as number | undefined,
  draftInput: "",
  suggestions: [] as Suggestion[],
  activeSuggestion: undefined as Suggestion | undefined,
  wd: "/home",
  fs: new VirtualFS(),

  writeOutput(...lines: string[]) {
    this.stdOut.push(...lines);
    if (this.stdOut.length >= 1000) {
      for (let i = 0; i < this.stdOut.length - 1000; i++) {
        this.stdOut.shift();
      }
    }
  },

  execute(rawCommand?: string): void {
    const input = rawCommand ?? this.rawInput;

    const [command, ...args] = input.split(" ");
    let exec = Commands.find((cmd) => cmd.bin === command);
    if (!exec) {
      const file = this.fs.readFile(this.fs.buildPath(this.wd, command ?? "."));
      if (file?.executable) {
        exec = Commands.find((cmd) => cmd.bin === file?.executable);
      }
    }
    if (!exec) {
      // try to apply an suggestion, if apply --> retry
      if (this.applySuggestion()) return this.execute();
    }

    // update history
    this.history.unshift(this.rawInput);
    this.activeHistoryItem = undefined;
    this.draftInput = "";

    // reset input
    this.writeOutput(" $ " + input);
    this.rawInput = "";

    if (!exec) {
      this.writeOutput(`${command}: command not found`);
      return;
    }
    exec.execute(args, this);
  },

  /**
   * compute suggestions based on the current user input
   */
  computeSuggestions() {
    const possibilities = getSuggestions(this.rawInput, this.wd, this.fs);
    this.suggestions = possibilities;
    this.activeSuggestion = possibilities.find(
      (s) => s.value === this.activeSuggestion?.value
    );
  },

  /**
   * highlight/select the next suggestion
   */
  nextSuggestion() {
    let idx = this.suggestions.findIndex((s) => s === this.activeSuggestion);
    // none active (idx = -1) will evaluate to idx = 0, showing the first entry
    const newIdx = idx < this.suggestions.length - 1 ? idx + 1 : idx;
    this.activeSuggestion = this.suggestions[newIdx];
  },

  /**
   * highlight/select the previous suggestion
   */
  previousSuggestion() {
    let idx = this.suggestions.findIndex((s) => s === this.activeSuggestion);
    if (idx === -1) idx = this.suggestions.length; // none active --> start from bottom
    this.activeSuggestion = this.suggestions[idx >= 1 ? idx - 1 : 0];
  },

  /**
   * @returns the suggestion that should be applied based on the current state
   */
  _getCurrentCompletion(): string {
    let idx = this.suggestions.findIndex((s) => s === this.activeSuggestion);
    if (idx === -1) idx = 0; // fallback to first
    return this.suggestions[idx]?.value ?? "";
  },

  /**
   * apply the currently selected suggestion to the terminal input
   *
   * @returns whether a suggestion was applied
   */
  applySuggestion(): boolean {
    const newValue = this._getCurrentCompletion();
    if (newValue) {
      const parts = this.rawInput.split(" ");
      parts[parts.length - 1] = newValue;
      this.rawInput = parts.join(" ");
      return true;
    }
    return false;
  },

  /**
   * hide all suggestions
   */
  hideSuggestions() {
    this.suggestions = [];
    this.activeSuggestion = undefined;
  },

  /**
   * populated the terminal with the previously typed command
   */
  applyPreviousHistoryEntry() {
    // currently in draft --> save & show first
    if (this.activeHistoryItem === undefined) {
      this.activeHistoryItem = 0;
      this.draftInput = this.rawInput;
      this.rawInput = this.history[0] ?? this.rawInput;
      return;
    }

    // increment index
    if (this.activeHistoryItem < this.history.length - 1) {
      this.activeHistoryItem++;
      this.rawInput = this.history[this.activeHistoryItem] ?? this.rawInput;
    }
  },

  /**
   * populate the terminal with the command typed after the current one shown
   */
  applyNextHistoryEntry() {
    // last history item --> jump to last written content
    if (this.activeHistoryItem === 0) {
      this.activeHistoryItem = undefined;
      this.rawInput = this.draftInput;
      return;
    }

    // index undefined --> currently in draft, no next entry
    if (!this.activeHistoryItem) {
      return;
    }

    this.activeHistoryItem--;
    this.rawInput = this.history[this.activeHistoryItem] ?? this.rawInput;
  },
};

const _reactive = reactive<typeof TerminalStore>(TerminalStore);

export const useTerminal = () => _reactive;
