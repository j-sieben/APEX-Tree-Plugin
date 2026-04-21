const test = require("node:test");
const assert = require("node:assert/strict");

const checkStateModel = require("../js/checkStateModel");

const treeData = {
  id: "root",
  label: "Root",
  children: [
    {
      id: "A",
      label: "A",
      children: [
        { id: "A1", label: "A1" },
        { id: "A2", label: "A2" }
      ]
    },
    { id: "B", label: "B" }
  ]
};

test("leaf value makes parents partial or checked", () => {
  const model = checkStateModel.fromValue(treeData, ["A1"]);

  assert.equal(model.getState("A1"), checkStateModel.STATE.CHECKED);
  assert.equal(model.getState("A2"), checkStateModel.STATE.UNCHECKED);
  assert.equal(model.getState("A"), checkStateModel.STATE.PARTIAL);
  assert.equal(model.getState("root"), checkStateModel.STATE.PARTIAL);
});

test("parent toggle checks all descendant leaves", () => {
  const model = checkStateModel.fromValue(treeData, []);

  model.toggleNode("A");

  assert.deepEqual(model.getCheckedLeafIds(), ["A1", "A2"]);
  assert.equal(model.getState("A"), checkStateModel.STATE.CHECKED);
  assert.equal(model.getState("root"), checkStateModel.STATE.PARTIAL);
});

test("checked parent toggle clears all descendant leaves", () => {
  const model = checkStateModel.fromValue(treeData, ["A1", "A2"]);

  model.toggleNode("A");

  assert.deepEqual(model.getCheckedLeafIds(), []);
  assert.equal(model.getState("A"), checkStateModel.STATE.UNCHECKED);
});

test("unknown ids are ignored", () => {
  const model = checkStateModel.fromValue(treeData, ["A1", "X"]);

  assert.deepEqual(model.getCheckedLeafIds(), ["A1"]);
});

test("empty value unchecks all nodes", () => {
  const model = checkStateModel.fromValue(treeData, ["A1", "A2", "B"]);

  model.setCheckedLeafIds([]);

  assert.deepEqual(model.getCheckedLeafIds(), []);
  assert.equal(model.getState("root"), checkStateModel.STATE.UNCHECKED);
});

test("refresh with changed tree removes obsolete ids", () => {
  const model = checkStateModel.fromValue(treeData, ["A1", "B"]);
  const changedTree = {
    id: "root",
    label: "Root",
    children: [
      {
        id: "A",
        label: "A",
        children: [
          { id: "A1", label: "A1" }
        ]
      }
    ]
  };

  model.setTreeData(changedTree, model.getCheckedLeafIds());

  assert.deepEqual(model.getCheckedLeafIds(), ["A1"]);
  assert.equal(model.getState("root"), checkStateModel.STATE.CHECKED);
});
