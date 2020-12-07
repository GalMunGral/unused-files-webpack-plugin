const fs = require("fs");
const path = require("path");
const glob = require("glob");

const defaultIgnore = [
  "./public/**/*",
  "./node_modules/**/*",
  "**/package?(-lock).json",
  "**/*webpack*",
  "**/.md",
];

class UnusedFilesWebpackPlugin {
  constructor(options) {
    this.outputPath = options.outputPath;
    this.trackedFiles = glob.sync("./**/*", {
      realpath: true,
      nodir: true,
      ignore: defaultIgnore.concat(options.ignore || []),
    });
  }

  diff(deps) {
    const depSet = new Set(deps);
    const unusedFiles = this.trackedFiles.filter((file) => {
      return !depSet.has(file);
    });
    const outPath = path.join(this.outputPath, "unused-files.txt");
    fs.writeFile(outPath, unusedFiles.join("\n"), (err) => {
      console.log(err ? "Failed" : "Done");
    });
  }

  apply(compiler) {
    compiler.hooks.done.tap("UnusedFilesWebpackPlugin", (stats) => {
      this.diff(stats.compilation.fileDependencies);
    });
  }
}

module.exports = UnusedFilesWebpackPlugin;
