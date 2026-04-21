const test = require("node:test");
const assert = require("node:assert/strict");

const { loadBrowserModules } = require("./browserModuleHelper");

function createHtmlBuilder() {
  const parts = [];

  return {
    markup(value) {
      parts.push(value);
      return this;
    },
    attr(name, value) {
      parts.push(` ${name}="${String(value)}"`);
      return this;
    },
    toString() {
      return parts.join("");
    }
  };
}

function createCheckBoxStub() {
  const classNames = new Set([
    "a-TreeView-checkBox",
    "a-TreeView-checkBox--unchecked"
  ]);
  const attributes = {
    "aria-checked": "false"
  };

  return {
    removeClass(value) {
      value.split(/\s+/).forEach((className) => classNames.delete(className));
      return this;
    },
    addClass(value) {
      value.split(/\s+/).forEach((className) => classNames.add(className));
      return this;
    },
    attr(name, value) {
      attributes[name] = value;
      return this;
    },
    hasClass(className) {
      return classNames.has(className);
    },
    getAttr(name) {
      return attributes[name];
    }
  };
}

test("checkbox renderer writes accessible unchecked markup", () => {
  const treeItem = loadBrowserModules([
    "checkStateModel.js",
    "checkboxRenderer.js"
  ]);
  const out = createHtmlBuilder();

  treeItem.checkboxRenderer.render(out, treeItem.checkStateModel.STATE.UNCHECKED);

  const markup = out.toString();
  assert.match(markup, /class="a-TreeView-checkBox a-TreeView-checkBox--unchecked"/);
  assert.match(markup, /role="checkbox"/);
  assert.match(markup, /aria-checked="false"/);
  assert.match(markup, /fa-square-o/);
  assert.match(markup, /fa-minus-square-o/);
  assert.match(markup, /fa-check-square-o/);
});

test("checkbox renderer maps partial state to mixed aria state", () => {
  const treeItem = loadBrowserModules([
    "checkStateModel.js",
    "checkboxRenderer.js"
  ]);
  const out = createHtmlBuilder();

  treeItem.checkboxRenderer.render(out, treeItem.checkStateModel.STATE.PARTIAL);

  const markup = out.toString();
  assert.match(markup, /a-TreeView-checkBox--partial/);
  assert.match(markup, /aria-checked="mixed"/);
});

test("checkbox renderer applies checked state to existing elements", () => {
  const treeItem = loadBrowserModules([
    "checkStateModel.js",
    "checkboxRenderer.js"
  ]);
  const checkBox$ = createCheckBoxStub();

  treeItem.checkboxRenderer.applyState(
    checkBox$,
    treeItem.checkStateModel.STATE.CHECKED
  );

  assert.equal(checkBox$.hasClass("a-TreeView-checkBox--checked"), true);
  assert.equal(checkBox$.hasClass("a-TreeView-checkBox--partial"), false);
  assert.equal(checkBox$.hasClass("a-TreeView-checkBox--unchecked"), false);
  assert.equal(checkBox$.getAttr("aria-checked"), "true");
});

test("checkbox renderer exposes the delegated click selector", () => {
  const treeItem = loadBrowserModules([
    "checkStateModel.js",
    "checkboxRenderer.js"
  ]);

  assert.equal(treeItem.checkboxRenderer.selector, ".a-TreeView-checkBox");
});
