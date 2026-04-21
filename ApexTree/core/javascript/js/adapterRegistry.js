/*global de*/
/**
 * Registry for TreeView adapter definitions.
 *
 * The PL/SQL package chooses the adapter name for the current APEX version.
 * JavaScript resolves that name here and delegates all native treeView access to
 * the registered adapter.
 */
(function(treeItem, factory){
  "use strict";

  treeItem.define("adapters", function(){
    return factory();
  });
})(de.condes.plugin.apexTreeItem, function(){
  "use strict";

  var registry = Object.create(null);

  /**
   * Registers an adapter definition.
   *
   * @param {Object} adapter Adapter metadata and factory.
   * @param {string} adapter.name Stable adapter name.
   * @param {Function} adapter.create Creates an adapter instance.
   * @returns {void}
   * @throws {Error} If the adapter definition is incomplete.
   */
  function register(adapter) {
    if (!adapter || !adapter.name || typeof adapter.create !== "function") {
      throw new Error("Invalid APEX Tree Item adapter registration");
    }

    registry[adapter.name] = adapter;
  }

  /**
   * Looks up an adapter by name.
   *
   * @param {string} name Adapter name.
   * @returns {Object|null} Adapter definition or null.
   */
  function get(name) {
    return registry[name] || null;
  }

  /**
   * Looks up an adapter by name and fails if it is missing.
   *
   * @param {string} name Adapter name selected by PL/SQL.
   * @returns {Object} Adapter definition.
   * @throws {Error} If the adapter script was not loaded.
   */
  function resolve(name) {
    var adapter = get(name);

    if (!adapter) {
      throw new Error("APEX Tree Item adapter not loaded: " + name);
    }

    return adapter;
  }

  /**
   * Lists all registered adapters.
   *
   * @returns {Object[]} Adapter definitions.
   */
  function list() {
    return Object.keys(registry).map(function(name) {
      return registry[name];
    });
  }

  return {
    register: register,
    get: get,
    resolve: resolve,
    list: list
  };
});
