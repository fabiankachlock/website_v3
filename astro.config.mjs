import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: "https://fabiankachlock.github.io",
  base: "/website_v3",
  server: {
    port: 3000,
  },
});
