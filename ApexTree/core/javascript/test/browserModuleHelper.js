const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const jsRoot = path.join(__dirname, "..", "js");
const adapterRoot = path.join(__dirname, "..", "..", "..", "adapters");

function createContext(extraGlobals) {
  const context = {
    console,
    ...extraGlobals
  };

  context.globalThis = context;
  vm.createContext(context);
  return context;
}

function runScript(context, filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  vm.runInContext(source, context, {
    filename: filePath
  });
}

function loadBrowserModules(moduleNames, extraGlobals) {
  const context = createContext(extraGlobals);

  runScript(context, path.join(jsRoot, "namespace.js"));
  moduleNames.forEach((moduleName) => {
    runScript(context, path.join(jsRoot, moduleName));
  });

  return context.de.condes.plugin.apexTreeItem;
}

function loadAdapter(adapterName, moduleNames, extraGlobals) {
  const context = createContext(extraGlobals);

  runScript(context, path.join(jsRoot, "namespace.js"));
  moduleNames.forEach((moduleName) => {
    runScript(context, path.join(jsRoot, moduleName));
  });
  runScript(context, path.join(adapterRoot, adapterName, "apexTreeAdapter.js"));

  return context.de.condes.plugin.apexTreeItem;
}

module.exports = {
  loadBrowserModules,
  loadAdapter
};
