const test = require("node:test");
const assert = require("node:assert/strict");

const { loadBrowserModules } = require("./browserModuleHelper");

const treeData = {
  id: "root",
  label: "Root",
  children: [
    { id: "A", label: "A" }
  ]
};

function createTreeDouble(options = {}) {
  const calls = [];
  const nodeAdapter = {
    data: null,
    renderNodeContent: null
  };
  const tree$ = {
    length: 1,
    initialized: options.initialized !== false,
    calls,
    nodeAdapter,
    data(name) {
      calls.push({ method: "data", args: [name] });
      return name === "apex-treeView" && this.initialized ? {} : null;
    },
    treeView(method, arg) {
      calls.push({ method: "treeView", args: [method, arg] });
      if (method === "getNodeAdapter") {
        return nodeAdapter;
      }
      if (method === "getNodes") {
        return options.nodes || [];
      }
      if (method === "getTreeNode") {
        return options.treeNode || createElementDouble();
      }
      if (method === "destroy") {
        this.initialized = false;
      }
      return this;
    },
    empty() {
      calls.push({ method: "empty", args: [] });
      return this;
    },
    toggleClass(className, enabled) {
      calls.push({ method: "toggleClass", args: [className, enabled] });
      return this;
    },
    attr(name, value) {
      calls.push({ method: "attr", args: [name, value] });
      return this;
    }
  };

  return tree$;
}

function createElementDouble(options = {}) {
  const calls = [];

  return {
    length: options.length === undefined ? 1 : options.length,
    calls,
    closest(selector) {
      calls.push({ method: "closest", args: [selector] });
      return options.closestResult || this;
    },
    children(selector) {
      calls.push({ method: "children", args: [selector] });
      return options.childrenResult || this;
    }
  };
}

function createApexDouble(tree$) {
  const initCalls = [];

  function jQuery(target) {
    if (target === "#P1_TREE") {
      return tree$;
    }
    return target;
  }

  jQuery.escapeSelector = (value) => value;
  jQuery.widget = function(name, base, extension) {
    initCalls.push({ method: "widget", args: [name, base, extension] });
  };
  jQuery.apex = {
    treeView: {}
  };

  return {
    initCalls,
    apex: {
      jQuery,
      widget: {
        tree: {
          init(...args) {
            initCalls.push({ method: "tree.init", args });
            tree$.initialized = true;
          }
        }
      }
    }
  };
}

function loadBaseAdapter(tree$, renderer) {
  const apexDouble = createApexDouble(tree$);
  const treeItem = loadBrowserModules(
    ["baseTreeAdapter.js"],
    {
      apex: apexDouble.apex,
      de: {
        condes: {
          plugin: {
            apexTreeItem: {
              checkboxRenderer: renderer || {
                selector: ".a-TreeView-checkBox",
                render() {},
                applyState() {}
              }
            }
          }
        }
      }
    }
  );

  return {
    apexDouble,
    treeItem
  };
}

function createAdapter(treeItem, tree$, overrides = {}) {
  return treeItem.baseTreeAdapter.create({
    tree$,
    treeId: "P1_TREE",
    getState: overrides.getState || (() => "unchecked"),
    getNode: overrides.getNode || (() => null)
  });
}

test("base adapter initializes native treeView with normalized payload", () => {
  const tree$ = createTreeDouble({ initialized: false });
  const { apexDouble, treeItem } = loadBaseAdapter(tree$);
  const adapter = createAdapter(treeItem, tree$);

  adapter.init(treeData);

  const initCall = apexDouble.initCalls.find((call) => call.method === "tree.init");
  assert.ok(initCall);
  assert.equal(initCall.args[0], "P1_TREE");
  assert.equal(initCall.args[1].multiple, false);
  assert.equal(initCall.args[2].config.hasIdentity, true);
  assert.equal(initCall.args[2].config.rootAdded, false);
  assert.equal(initCall.args[2].data, treeData);
  assert.equal(initCall.args[7], true);
  assert.equal(initCall.args[8], "fa");
  assert.equal(typeof tree$.nodeAdapter.renderNodeContent, "function");
  assert.equal(
    tree$.calls.some((call) => call.method === "treeView" && call.args[0] === "refresh"),
    true
  );
});

test("setData initializes native treeView when it is not initialized", () => {
  const tree$ = createTreeDouble({ initialized: false });
  const { apexDouble, treeItem } = loadBaseAdapter(tree$);
  const adapter = createAdapter(treeItem, tree$);

  adapter.setData(treeData);

  assert.equal(
    apexDouble.initCalls.some((call) => call.method === "tree.init"),
    true
  );
});

test("setData updates native node adapter data and refreshes initialized treeView", () => {
  const tree$ = createTreeDouble();
  const { treeItem } = loadBaseAdapter(tree$);
  const adapter = createAdapter(treeItem, tree$);

  adapter.setData(treeData);

  assert.equal(tree$.nodeAdapter.data, treeData);
  assert.equal(typeof tree$.nodeAdapter.renderNodeContent, "function");
  assert.equal(
    tree$.calls.some((call) => call.method === "treeView" && call.args[0] === "refresh"),
    true
  );
});

test("refresh delegates to native treeView only when initialized", () => {
  const initializedTree$ = createTreeDouble();
  const { treeItem } = loadBaseAdapter(initializedTree$);
  const initializedAdapter = createAdapter(treeItem, initializedTree$);
  const plainTree$ = createTreeDouble({ initialized: false });
  const plainAdapter = createAdapter(treeItem, plainTree$);

  initializedAdapter.refresh();
  plainAdapter.refresh();

  assert.equal(
    initializedTree$.calls.some((call) => call.method === "treeView" && call.args[0] === "refresh"),
    true
  );
  assert.equal(
    plainTree$.calls.some((call) => call.method === "treeView" && call.args[0] === "refresh"),
    false
  );
});

test("destroy delegates to native treeView destroy and clears the container", () => {
  const tree$ = createTreeDouble();
  const { treeItem } = loadBaseAdapter(tree$);
  const adapter = createAdapter(treeItem, tree$);

  adapter.destroy();

  assert.equal(
    tree$.calls.some((call) => call.method === "treeView" && call.args[0] === "destroy"),
    true
  );
  assert.equal(tree$.calls.some((call) => call.method === "empty"), true);
});

test("getNodeFromCheckboxEvent resolves clicked content through native getNodes", () => {
  const node = { id: "A" };
  const content$ = createElementDouble();
  const eventTarget = createElementDouble({ closestResult: content$ });
  const tree$ = createTreeDouble({ nodes: [node] });
  const { treeItem } = loadBaseAdapter(tree$);
  const adapter = createAdapter(treeItem, tree$);

  const result = adapter.getNodeFromCheckboxEvent({ target: eventTarget });

  assert.equal(result, node);
  assert.deepEqual(eventTarget.calls[0], {
    method: "closest",
    args: [".a-TreeView-content"]
  });
  assert.equal(
    tree$.calls.some((call) => call.method === "treeView" && call.args[0] === "getNodes" && call.args[1] === content$),
    true
  );
});

test("applyState resolves tree node and delegates checkbox update to renderer", () => {
  const node = { id: "A" };
  const treeNode = createElementDouble();
  const applied = [];
  const renderer = {
    selector: ".a-TreeView-checkBox",
    render() {},
    applyState(checkBox$, state) {
      applied.push({ checkBox$, state });
    }
  };
  const tree$ = createTreeDouble({ treeNode });
  const { treeItem } = loadBaseAdapter(tree$, renderer);
  const adapter = createAdapter(treeItem, tree$, {
    getNode: (nodeId) => nodeId === "A" ? node : null
  });

  adapter.applyState("A", "checked");

  assert.equal(
    tree$.calls.some((call) => call.method === "treeView" && call.args[0] === "getTreeNode" && call.args[1] === node),
    true
  );
  assert.deepEqual(treeNode.calls.map((call) => call.args[0]), [
    ".a-TreeView-content",
    ".a-TreeView-checkBox"
  ]);
  assert.equal(applied.length, 1);
  assert.equal(applied[0].checkBox$, treeNode);
  assert.equal(applied[0].state, "checked");
});

test("setDisabled maps disabled state to class and aria attribute", () => {
  const tree$ = createTreeDouble();
  const { treeItem } = loadBaseAdapter(tree$);
  const adapter = createAdapter(treeItem, tree$);

  adapter.setDisabled(true);
  adapter.setDisabled(false);

  assert.deepEqual(
    tree$.calls.filter((call) => call.method === "toggleClass").map((call) => call.args),
    [
      ["is-disabled", true],
      ["is-disabled", false]
    ]
  );
  assert.deepEqual(
    tree$.calls.filter((call) => call.method === "attr").map((call) => call.args),
    [
      ["aria-disabled", "true"],
      ["aria-disabled", "false"]
    ]
  );
});
