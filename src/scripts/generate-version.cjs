const { execSync } = require("child_process");
const fs = require("fs");
const pkg = require("../../package.json");

// @ts-ignore
const version = pkg["version"];
const build = execSync("git rev-list --count HEAD").toString().trim();

const versionString = `${version} (${build})`;
fs.writeFileSync("./public/version", versionString);

console.log("Generated version:", versionString);
