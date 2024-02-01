import { Commands } from './commands';
import type { VirtualFS } from './fs';

export type Suggestion = {
  value: string;
  description: string;
};

export enum CompletionType {
  Path,
}

const suggestPath = (path: string, wd: string, fs: VirtualFS): Suggestion[] => {
  const originalParts = path.split('/');
  const last = originalParts.pop(); // 'search term'
  // build absolute path, to read directory
  let absolutePath = fs.buildPath(wd, path);
  if (path.endsWith('/')) {
    absolutePath += '/'; // include trailing slash (stripped by buildPath)
  }
  const parts = absolutePath.split('/');
  parts.pop(); // remove 'search term'

  const dir = fs.getDir(parts.join('/')) ?? {};
  return Object.entries(dir)
    .filter(([name]) => name.startsWith(last ?? '')) // only include items, that start with search term
    .map<Suggestion>(([name, object]) => {
      if ('content' in object) {
        return {
          value: originalParts.concat(name).join('/'),
          description: '',
        };
      }
      return {
        value: originalParts.concat(name).join('/') + '/',
        description: '',
      };
    });
};

export const getSuggestions = (value: string, wd: string, fs: VirtualFS): Suggestion[] => {
  const parts = value.split(' ').filter(s => s);
  if (value.endsWith(' ')) {
    parts.push('');
  }
  const command = parts[0];
  const completedCommand = Commands.find(c => c.bin === command);
  if (completedCommand && parts.length < 3 && completedCommand.completion?.includes(CompletionType.Path)) {
    // path completion
    return suggestPath(parts[1] || './', wd, fs);
  } else if ((command?.startsWith('.') || command?.startsWith('/')) && parts.length < 2) {
    // path completion
    return suggestPath(command ?? '', wd, fs);
  } else if (parts.length <= 1 && command) {
    // basic command completion
    return Commands.filter(c => c.bin.startsWith(command ?? '') && c.bin.length >= (command?.length ?? 0)).map(c => ({
      value: c.bin + ' ',
      description: c.description,
    }));
  }
  return [];
};
