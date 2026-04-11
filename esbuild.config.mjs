import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";

const prod = process.argv[2] === "production";
const context = await esbuild.context({
  entryPoints: ["main.ts"], bundle: true,
  external: ["obsidian", "electron", "@codemirror/*", "@lezer/*", ...builtins],
  format: "cjs", target: "es2018", logLevel: "info",
  sourcemap: prod ? false : "inline", treeShaking: true,
  outfile: "/Users/apache/Documents/知识库/.obsidian/plugins/smart-vault-search/main.js",
});
if (prod) { await context.rebuild(); process.exit(0); }
else await context.watch();
