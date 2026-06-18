import fs from "fs";

const target = process.argv[2];

const file =
  target === "chrome"
    ? "manifest/manifest.chrome.json"
    : "manifest/manifest.firefox.json";

fs.copyFileSync(file, "dist/manifest.json");

console.log("manifest copied → dist/manifest.json");