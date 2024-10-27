/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare const Netlify: {
  env: {
    get: (key: string) => string | undefined;
  };
};

declare function plausible(event: string, args?: unknown): void;
