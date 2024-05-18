/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare const Netlify: {
  env: {
    get: (key: string) => string | undefined;
  };
};
