const test = require("node:test");
const assert = require("node:assert/strict");

const { loadAdapter, loadBrowserModules } = require("./browserModuleHelper");

test("adapter registry registers and resolves adapters", () => {
  const treeItem = loadBrowserModules(["adapterRegistry.js"]);
  const adapter = {
    name: "test",
    create() {
      return { created: true };
    }
  };

  treeItem.adapters.register(adapter);

  assert.equal(treeItem.adapters.get("test"), adapter);
  assert.equal(treeItem.adapters.resolve("test"), adapter);
  assert.equal(treeItem.adapters.list().length, 1);
  assert.equal(treeItem.adapters.list()[0], adapter);
});

test("adapter registry rejects invalid registrations", () => {
  const treeItem = loadBrowserModules(["adapterRegistry.js"]);

  assert.throws(
    () => treeItem.adapters.register({ name: "invalid" }),
    /Invalid APEX Tree Item adapter registration/
  );
});

test("adapter registry fails for unloaded adapters", () => {
  const treeItem = loadBrowserModules(["adapterRegistry.js"]);

  assert.equal(treeItem.adapters.get("missing"), null);
  assert.throws(
    () => treeItem.adapters.resolve("missing"),
    /APEX Tree Item adapter not loaded: missing/
  );
});

test("apex19 adapter registers the base adapter contract", () => {
  const baseAdapter = {
    CHECK_SELECTOR: ".a-TreeView-checkBox",
    create(options) {
      return { options };
    }
  };
  const treeItem = loadAdapter(
    "apex19",
    ["adapterRegistry.js"],
    {
      de: {
        condes: {
          plugin: {
            apexTreeItem: {
              baseTreeAdapter: baseAdapter
            }
          }
        }
      }
    }
  );

  treeItem.baseTreeAdapter = baseAdapter;

  const adapter = treeItem.adapters.resolve("apex19");

  assert.equal(adapter.name, "apex19");
  assert.equal(adapter.minApexVersion, "19.1");
  assert.equal(adapter.CHECK_SELECTOR, ".a-TreeView-checkBox");
  assert.equal(adapter.create({ treeId: "P1_TREE" }).options.treeId, "P1_TREE");
});
