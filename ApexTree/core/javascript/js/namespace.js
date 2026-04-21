/*global de*/
/**
 * Runtime namespace for the APEX Tree Item plugin.
 *
 * APEX loads plugin files as plain browser scripts. This helper creates the
 * single shared namespace and provides a small registration function so the
 * individual files do not need to repeat the full namespace bootstrap.
 */
(function(root){
  "use strict";

  root.de = root.de || {};
  root.de.condes = root.de.condes || {};
  root.de.condes.plugin = root.de.condes.plugin || {};
  root.de.condes.plugin.apexTreeItem = root.de.condes.plugin.apexTreeItem || {};

  /**
   * Registers a browser module on the plugin namespace.
   *
   * @param {string} name Namespace property to assign.
   * @param {Function} factory Factory called with `apex` and the plugin namespace.
   * @returns {*} The exported module value.
   */
  root.de.condes.plugin.apexTreeItem.define = function(name, factory) {
    root.de.condes.plugin.apexTreeItem[name] = factory(
      root.apex,
      root.de.condes.plugin.apexTreeItem
    );
    return root.de.condes.plugin.apexTreeItem[name];
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
