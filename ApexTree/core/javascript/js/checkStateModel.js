/*global de*/
/**
 * Pure tri-state check model for hierarchical tree data.
 *
 * This module has no APEX or DOM dependency. It treats leaf IDs as the source of
 * the item value and derives parent states from the checked descendant leaves.
 */
(function(root, factory){
  "use strict";

  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.de.condes.plugin.apexTreeItem.define("checkStateModel", function(){
      return factory();
    });
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function(){
  "use strict";

  var STATE = {
    UNCHECKED: "unchecked",
    PARTIAL: "partial",
    CHECKED: "checked"
  };

  /**
   * Creates a check-state model for tree data and an initial leaf selection.
   *
   * @param {Object|null} treeData Root node returned by the plugin AJAX call.
   * @param {string[]} checkedLeafIds Leaf IDs that should start as checked.
   * @returns {CheckStateModel} New state model instance.
   */
  function create(treeData, checkedLeafIds) {
    return new CheckStateModel(treeData, checkedLeafIds);
  }

  function CheckStateModel(treeData, checkedLeafIds) {
    this.treeData = treeData || null;
    this.nodeById = Object.create(null);
    this.parentById = Object.create(null);
    this.leafIds = [];
    this.leafIdsByNodeId = Object.create(null);
    this.stateById = Object.create(null);
    this.checkedLeafIds = Object.create(null);

    this._index(this.treeData, null);
    this.setCheckedLeafIds(checkedLeafIds || []);
  }

  /**
   * Replaces the tree while applying a new checked leaf set.
   *
   * Unknown IDs are ignored, which also removes values that no longer exist
   * after a refresh with changed data.
   *
   * @param {Object|null} treeData Root node returned by the plugin AJAX call.
   * @param {string[]} checkedLeafIds Leaf IDs that should be checked.
   * @returns {void}
   */
  CheckStateModel.prototype.setTreeData = function(treeData, checkedLeafIds) {
    this.treeData = treeData || null;
    this.nodeById = Object.create(null);
    this.parentById = Object.create(null);
    this.leafIds = [];
    this.leafIdsByNodeId = Object.create(null);
    this.stateById = Object.create(null);
    this.checkedLeafIds = Object.create(null);

    this._index(this.treeData, null);
    this.setCheckedLeafIds(checkedLeafIds || []);
  };

  /**
   * Replaces the checked leaf set.
   *
   * @param {string[]} ids Leaf IDs that should be checked.
   * @returns {void}
   */
  CheckStateModel.prototype.setCheckedLeafIds = function(ids) {
    var self = this;

    this.checkedLeafIds = Object.create(null);
    (ids || []).forEach(function(id){
      id = String(id);
      if (self.leafIdsByNodeId[id]) {
        self.checkedLeafIds[id] = true;
      }
    });

    this._recompute();
  };

  /**
   * Toggles a node and all descendant leaves.
   *
   * A checked node becomes unchecked. Any other state, including partial, becomes
   * checked for all descendant leaves.
   *
   * @param {string} nodeId Node ID to toggle.
   * @returns {void}
   */
  CheckStateModel.prototype.toggleNode = function(nodeId) {
    var id = String(nodeId),
        leafIds = this.leafIdsByNodeId[id] || [],
        nextChecked = this.getState(id) !== STATE.CHECKED,
        self = this;

    leafIds.forEach(function(leafId){
      if (nextChecked) {
        self.checkedLeafIds[leafId] = true;
      } else {
        delete self.checkedLeafIds[leafId];
      }
    });

    this._recompute();
  };

  /**
   * Returns the effective item value as checked leaf IDs.
   *
   * @returns {string[]} Checked leaf IDs in tree order.
   */
  CheckStateModel.prototype.getCheckedLeafIds = function() {
    var self = this;
    return this.leafIds.filter(function(id){
      return self.checkedLeafIds[id] === true;
    });
  };

  /**
   * Returns the derived tri-state value for a node.
   *
   * @param {string} nodeId Node ID.
   * @returns {string} One of `unchecked`, `partial` or `checked`.
   */
  CheckStateModel.prototype.getState = function(nodeId) {
    return this.stateById[String(nodeId)] || STATE.UNCHECKED;
  };

  /**
   * Returns the indexed tree node for an ID.
   *
   * @param {string} nodeId Node ID.
   * @returns {Object|null} Tree node or null.
   */
  CheckStateModel.prototype.getNode = function(nodeId) {
    return this.nodeById[String(nodeId)] || null;
  };

  /**
   * Returns all known node IDs.
   *
   * @returns {string[]} Node IDs in object key order.
   */
  CheckStateModel.prototype.getNodeIds = function() {
    return Object.keys(this.nodeById);
  };

  CheckStateModel.prototype._index = function(node, parentId) {
    var id,
        self = this,
        leaves = [];

    if (!node || typeof node.id === "undefined" || node.id === null) {
      return leaves;
    }

    id = String(node.id);
    this.nodeById[id] = node;
    this.parentById[id] = parentId;

    if (hasChildren(node)) {
      node.children.forEach(function(child){
        leaves = leaves.concat(self._index(child, id));
      });
    } else {
      leaves.push(id);
      this.leafIds.push(id);
    }

    this.leafIdsByNodeId[id] = leaves;
    return leaves;
  };

  CheckStateModel.prototype._recompute = function() {
    if (!this.treeData) {
      return;
    }
    this._computeNode(this.treeData);
  };

  CheckStateModel.prototype._computeNode = function(node) {
    var id = String(node.id),
        self = this,
        childStates,
        checkedCount;

    if (!hasChildren(node)) {
      this.stateById[id] = this.checkedLeafIds[id] ? STATE.CHECKED : STATE.UNCHECKED;
      return this.stateById[id];
    }

    childStates = node.children.map(function(child){
      return self._computeNode(child);
    });
    checkedCount = childStates.filter(function(state){
      return state === STATE.CHECKED;
    }).length;

    if (checkedCount === childStates.length) {
      this.stateById[id] = STATE.CHECKED;
    } else if (checkedCount === 0 && childStates.indexOf(STATE.PARTIAL) === -1) {
      this.stateById[id] = STATE.UNCHECKED;
    } else {
      this.stateById[id] = STATE.PARTIAL;
    }

    return this.stateById[id];
  };

  function hasChildren(node) {
    return Array.isArray(node.children) && node.children.length > 0;
  }

  return {
    STATE: STATE,
    create: create,
    fromValue: create
  };
});
