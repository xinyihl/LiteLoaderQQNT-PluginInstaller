import { buildSync } from "esbuild";

buildSync({
    entryPoints: ["./src/main.js"],
    bundle: true,
    minify: true,
    outfile: "./dist/main.js",
    target: "node16",
    platform: "node",
    charset: "utf8",
    external: ["electron"],
  });