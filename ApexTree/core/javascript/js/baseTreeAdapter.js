/*global apex, de*/
/**
 * Base adapter around the native APEX treeView widget.
 *
 * This module is the only core module that directly calls treeView APIs. Future
 * APEX-version-specific adapters should either reuse this implementation or
 * override only the methods whose native contract changed.
 */
(function(treeItem, factory){
  "use strict";

  treeItem.define("baseTreeAdapter", factory);
})(de.condes.plugin.apexTreeItem, function(apex, treeItem){
  "use strict";

  var CONTENT_SELECTOR = ".a-TreeView-content";

  /**
   * Creates a base tree adapter instance.
   *
   * @param {Object} options Adapter options supplied by the item controller.
   * @returns {BaseTreeAdapter} Adapter instance.
   */
  function create(options) {
    return new BaseTreeAdapter(options);
  }

  function BaseTreeAdapter(options) {
    this.options = options;
    this.tree$ = options.tree$;
    this.treeId = options.treeId;
    this.iconType = options.iconType || "fa";
    this.hasTooltips = options.hasTooltips !== false;
    this.getState = options.getState;
  }

  /**
   * Initializes the native treeView widget with plugin tree data.
   *
   * @param {Object} treeData Root node returned by the plugin AJAX call.
   * @returns {void}
   */
  BaseTreeAdapter.prototype.init = function(treeData) {
    var treeOptions = {
      multiple: false
    };

    ensureBaseIdExtension();

    apex.widget.tree.init(
      this.treeId,
      treeOptions,
      makeTreePayload(treeData),
      false,
      null,
      true,
      false,
      this.hasTooltips,
      this.iconType
    );

    this.tree$ = apex.jQuery("#" + apex.jQuery.escapeSelector(this.treeId));
    this.setRenderer();
    this.tree$.treeView("refresh");
  };

  /**
   * Destroys the native treeView instance and clears the tree container.
   *
   * @returns {void}
   */
  BaseTreeAdapter.prototype.destroy = function() {
    if (this.isInitialized()) {
      this.tree$.treeView("destroy");
    }
    this.tree$.empty();
  };

  /**
   * Tests whether the native treeView widget has already been initialized.
   *
   * @returns {boolean} True when treeView state exists on the container.
   */
  BaseTreeAdapter.prototype.isInitialized = function() {
    return !!(this.tree$ && this.tree$.data("apex-treeView"));
  };

  /**
   * Replaces tree data and refreshes the native widget.
   *
   * @param {Object} treeData Root node returned by the plugin AJAX call.
   * @returns {void}
   */
  BaseTreeAdapter.prototype.setData = function(treeData) {
    var adapter;

    if (!this.isInitialized()) {
      this.init(treeData);
      return;
    }

    adapter = this.tree$.treeView("getNodeAdapter");
    adapter.data = makeTreePayload(treeData).data;
    this.setRenderer();
    this.tree$.treeView("refresh");
  };

  /**
   * Refreshes the native treeView widget.
   *
   * @returns {void}
   */
  BaseTreeAdapter.prototype.refresh = function() {
    if (this.isInitialized()) {
      this.tree$.treeView("refresh");
    }
  };

  /**
   * Installs the custom node renderer that adds the tri-state checkbox.
   *
   * @returns {void}
   */
  BaseTreeAdapter.prototype.setRenderer = function() {
    var adapter = this.tree$.treeView("getNodeAdapter"),
        self = this;

    adapter.renderNodeContent = function(node, out, options, state) {
      renderNodeContent.call(this, node, out, options, state, self.getState);
    };
  };

  /**
   * Resolves the model node related to a checkbox click event.
   *
   * @param {Event} event Browser click event.
   * @returns {Object|null} Native tree node or null.
   */
  BaseTreeAdapter.prototype.getNodeFromCheckboxEvent = function(event) {
    var content$ = apex.jQuery(event.target).closest(CONTENT_SELECTOR),
        nodes;

    if (!content$.length || !this.isInitialized()) {
      return null;
    }

    nodes = this.tree$.treeView("getNodes", content$);
    return nodes && nodes.length ? nodes[0] : null;
  };

  /**
   * Applies all model states to rendered checkbox elements.
   *
   * @param {CheckStateModel} model Current check-state model.
   * @returns {void}
   */
  BaseTreeAdapter.prototype.applyStates = function(model) {
    var self = this;

    if (!this.isInitialized()) {
      return;
    }

    model.getNodeIds().forEach(function(id) {
      self.applyState(id, model.getState(id));
    });
  };

  /**
   * Applies a single node state to the corresponding rendered checkbox.
   *
   * @param {string} nodeId Node ID.
   * @param {string} state New tri-state value.
   * @returns {void}
   */
  BaseTreeAdapter.prototype.applyState = function(nodeId, state) {
    var node = this.options.getNode(nodeId),
        treeNode;

    if (!node || !this.isInitialized()) {
      return;
    }

    treeNode = this.tree$.treeView("getTreeNode", node);
    treeItem.checkboxRenderer.applyState(apex.jQuery(treeNode)
      .children(CONTENT_SELECTOR)
      .children(treeItem.checkboxRenderer.selector), state);
  };

  /**
   * Marks the tree interaction as enabled or disabled.
   *
   * @param {boolean} disabled Whether the tree should be disabled.
   * @returns {void}
   */
  BaseTreeAdapter.prototype.setDisabled = function(disabled) {
    this.tree$
      .toggleClass("is-disabled", disabled)
      .attr("aria-disabled", disabled ? "true" : "false");
  };

  function renderNodeContent(node, out, options, state, getState) {
    var icon,
        link,
        elementName,
        checkState = getState(node.id);

    treeItem.checkboxRenderer.render(out, checkState);

    if (this.getIcon) {
      icon = this.getIcon(node);
      if (icon !== null) {
        out.markup("<span ")
          .attr("class", options.iconType + " " + icon)
          .markup("></span>");
      }
    }

    link = options.useLinks && this.getLink && this.getLink(node);
    elementName = link ? "a" : "span";

    out.markup("<" + elementName + " tabIndex=\"-1\" role=\"treeitem\"")
      .attr("class", options.labelClass + " level" + state.level)
      .optionalAttr("href", link)
      .attr("aria-level", state.level)
      .attr("aria-selected", state.selected ? "true" : "false")
      .optionalAttr("aria-disabled", state.disabled ? "true" : null)
      .optionalAttr("aria-expanded", state.hasChildren === false ? null : state.expanded ? "true" : "false")
      .markup(">")
      .content(this.getLabel(node))
      .markup("</" + elementName + ">");
  }

  function makeTreePayload(treeData) {
    return {
      config: {
        hasIdentity: true,
        rootAdded: false
      },
      data: treeData
    };
  }

  function ensureBaseIdExtension() {
    if (!apex.jQuery.apex || !apex.jQuery.apex.treeView) {
      return;
    }

    apex.jQuery.widget("apex.treeView", apex.jQuery.apex.treeView, {
      getBaseId: function() {
        return this.baseId;
      }
    });
  }

  return {
    create: create,
    CHECK_SELECTOR: treeItem.checkboxRenderer.selector
  };
});
