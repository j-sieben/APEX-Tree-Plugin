/*global apex, de*/
/**
 * APEX page item controller for the Tree Item plugin.
 *
 * The controller connects APEX item callbacks, AJAX refresh, cascading LOV
 * dependencies, the pure check-state model and the native treeView adapter.
 * Native tree selection is intentionally not used as the item value.
 */
(function(treeItem, factory){
  "use strict";

  treeItem.define("init", factory);
})(de.condes.plugin.apexTreeItem, function(apex, treeItem){
  "use strict";

  var EVENT_NAMESPACE = ".apexTreeItem",
      AFTER_REFRESH_EVENT = "apexafterrefresh",
      DEFAULT_OPTIONS = {
        adapterName: "apex19",
        itemsToSubmit: [],
        pageItemsToSubmit: [],
        noDataFoundMessage: "No data found"
      };

  /**
   * Initializes an APEX Tree Item instance.
   *
   * Called from the plugin render output. The returned instance is mainly useful
   * for diagnostics; the public APEX API is registered through `apex.item`.
   *
   * @param {string} itemId APEX page item name.
   * @param {Object} options Runtime options emitted by PL/SQL.
   * @returns {ApexTreeItem} Initialized item controller.
   */
  function init(itemId, options) {
    return new ApexTreeItem(itemId, options).init();
  }

  function ApexTreeItem(itemId, options) {
    this.itemId = itemId;
    this.options = apex.jQuery.extend({}, DEFAULT_OPTIONS, options || {});
    this.treeId = this.options.treeId || itemId + "_TREE";
    this.item$ = apex.jQuery("#" + apex.jQuery.escapeSelector(itemId), apex.gPageContext$);
    this.tree$ = apex.jQuery("#" + apex.jQuery.escapeSelector(this.treeId), apex.gPageContext$);
    this.container$ = apex.jQuery("#" + apex.jQuery.escapeSelector(itemId + "_CONTAINER"), apex.gPageContext$);
    this.disabled = false;
    this.model = treeItem.checkStateModel.create(null, []);
    this.adapter = null;
    this.adapterDefinition = treeItem.adapters.resolve(this.options.adapterName);
  }

  ApexTreeItem.prototype.init = function() {
    this.registerItem();
    this.bindEvents();
    this.refresh();
    return this;
  };

  /**
   * Registers the APEX item facade.
   *
   * APEX calls these methods through `apex.item(itemId)`. The implementation
   * keeps the hidden input value synchronized with checked leaf IDs.
   *
   * @returns {void}
   */
  ApexTreeItem.prototype.registerItem = function() {
    var self = this;

    apex.item.create(this.itemId, {
      enable: function() {
        self.enable();
      },
      disable: function() {
        self.disable();
      },
      isDisabled: function() {
        return self.isDisabled();
      },
      setValue: function(value, displayValue, suppressChangeEvent) {
        self.setValue(value, suppressChangeEvent);
      },
      getValue: function() {
        return self.getValue();
      },
      refresh: function() {
        self.refresh();
      },
      loadingIndicator: function(loadingIndicator$) {
        return loadingIndicator$.appendTo(self.container$);
      }
    });
  };

  /**
   * Binds delegated item events.
   *
   * Checkbox clicks are delegated to the tree container because treeView rerenders
   * nodes. Cascading LOV parents trigger a full item refresh.
   *
   * @returns {void}
   */
  ApexTreeItem.prototype.bindEvents = function() {
    var self = this,
        dependingOnSelector = this.options.dependingOnSelector;

    this.tree$
      .off("click" + EVENT_NAMESPACE, this.adapterDefinition.CHECK_SELECTOR)
      .on("click" + EVENT_NAMESPACE, this.adapterDefinition.CHECK_SELECTOR, function(event) {
        self.handleCheckboxClick(event);
      });

    this.item$
      .off("apexrefresh" + EVENT_NAMESPACE)
      .on("apexrefresh" + EVENT_NAMESPACE, function() {
        self.refresh();
      });

    if (dependingOnSelector) {
      apex.jQuery(dependingOnSelector, apex.gPageContext$)
        .off("change" + EVENT_NAMESPACE)
        .on("change" + EVENT_NAMESPACE, function() {
          self.refresh();
        });
    }
  };

  /**
   * Handles a checkbox click without changing native tree selection.
   *
   * @param {Event} event Browser click event.
   * @returns {boolean} Always false to suppress default click handling.
   */
  ApexTreeItem.prototype.handleCheckboxClick = function(event) {
    var node;

    event.preventDefault();
    event.stopPropagation();

    if (this.disabled || !this.adapter) {
      return false;
    }

    node = this.adapter.getNodeFromCheckboxEvent(event);
    if (!node) {
      return false;
    }

    this.model.toggleNode(node.id);
    this.writeValue(this.model.getCheckedLeafIds(), false);
    this.adapter.applyStates(this.model);

    return false;
  };

  /**
   * Returns the APEX item value.
   *
   * The value contains only checked leaf IDs serialized with colon separators.
   *
   * @returns {string} Colon separated checked leaf IDs.
   */
  ApexTreeItem.prototype.getValue = function() {
    if (!this.model.treeData) {
      return treeItem.valueCodec.format(this.item$.val());
    }
    return treeItem.valueCodec.format(this.model.getCheckedLeafIds());
  };

  /**
   * Sets the APEX item value.
   *
   * Unknown IDs are ignored by the model. When tree data has not been loaded yet,
   * the hidden input is normalized and the effective state is applied after the
   * next successful refresh.
   *
   * @param {string|string[]} value Colon separated value or ID array.
   * @param {boolean} suppressChangeEvent Whether to suppress the change event.
   * @returns {void}
   */
  ApexTreeItem.prototype.setValue = function(value, suppressChangeEvent) {
    if (!this.model.treeData) {
      this.writeValue(treeItem.valueCodec.parse(value), suppressChangeEvent === true);
      return;
    }

    this.model.setCheckedLeafIds(treeItem.valueCodec.parse(value));
    this.writeValue(this.model.getCheckedLeafIds(), suppressChangeEvent === true);

    if (this.adapter) {
      this.adapter.applyStates(this.model);
    }
  };

  /**
   * Refreshes tree data through the plugin AJAX callback.
   *
   * The current hidden input value is reapplied to the refreshed tree, so changed
   * tree structures automatically remove IDs that no longer exist.
   *
   * @returns {void}
   */
  ApexTreeItem.prototype.refresh = function() {
    var self = this,
        itemsToSubmit = this.options.itemsToSubmit || this.options.pageItemsToSubmit || [],
        promise;

    promise = apex.server.plugin(
      this.options.ajaxIdentifier,
      {
        pageItems: itemsToSubmit
      },
      {
        refreshObject: this.container$,
        loadingIndicator: this.container$,
        loadingIndicatorPosition: "centered"
      }
    );

    promise
      .done(function(data) {
        self.applyServerData(data || {});
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        self.showMessage(errorThrown || textStatus || self.options.noDataFoundMessage);
      })
      .always(function() {
        self.item$.trigger(AFTER_REFRESH_EVENT);
      });
  };

  /**
   * Applies normalized server JSON to the item.
   *
   * Expected format:
   * `{ data: <tree root> }` for data or `{ message: <text> }` for no-data/error
   * states that should be shown as text.
   *
   * @param {Object} data Server response from `apex.server.plugin`.
   * @returns {void}
   */
  ApexTreeItem.prototype.applyServerData = function(data) {
    var treeData = data.data,
        checkedLeafIds = treeItem.valueCodec.parse(this.item$.val());

    if (!treeData || data.message) {
      this.showMessage(data.message || this.options.noDataFoundMessage);
      this.model.setTreeData(null, []);
      this.writeValue([], true);
      return;
    }

    this.tree$.empty();
    this.model.setTreeData(treeData, checkedLeafIds);
    this.writeValue(this.model.getCheckedLeafIds(), true);

    this.adapter = this.adapterDefinition.create({
      tree$: this.tree$,
      treeId: this.treeId,
      getState: this.model.getState.bind(this.model),
      getNode: this.model.getNode.bind(this.model)
    });
    this.adapter.setData(treeData);
    this.adapter.setDisabled(this.disabled);
    this.adapter.applyStates(this.model);
  };

  /**
   * Shows a non-tree message in the tree container.
   *
   * @param {string} message Text to display.
   * @returns {void}
   */
  ApexTreeItem.prototype.showMessage = function(message) {
    if (this.adapter) {
      this.adapter.destroy();
      this.adapter = null;
    }

    this.tree$
      .empty()
      .append(apex.jQuery("<span></span>", {
        "class": "display_only apex-tree-item-message",
        text: message || this.options.noDataFoundMessage
      }));
  };

  /**
   * Writes the hidden APEX input value and optionally fires `change`.
   *
   * @param {string[]} leafIds Checked leaf IDs.
   * @param {boolean} suppressChangeEvent Whether to suppress the change event.
   * @returns {void}
   */
  ApexTreeItem.prototype.writeValue = function(leafIds, suppressChangeEvent) {
    var value = treeItem.valueCodec.format(leafIds);

    this.item$.val(value);
    if (!suppressChangeEvent) {
      this.item$.trigger("change");
    }
  };

  /**
   * Enables the APEX item and tree interaction.
   *
   * @returns {void}
   */
  ApexTreeItem.prototype.enable = function() {
    this.disabled = false;
    this.item$.prop("disabled", false);
    if (this.adapter) {
      this.adapter.setDisabled(false);
    }
  };

  /**
   * Disables the APEX item and tree interaction.
   *
   * @returns {void}
   */
  ApexTreeItem.prototype.disable = function() {
    this.disabled = true;
    this.item$.prop("disabled", true);
    if (this.adapter) {
      this.adapter.setDisabled(true);
    }
  };

  /**
   * Reports whether the item is disabled.
   *
   * @returns {boolean} True when disabled.
   */
  ApexTreeItem.prototype.isDisabled = function() {
    return this.disabled;
  };

  return init;
});
