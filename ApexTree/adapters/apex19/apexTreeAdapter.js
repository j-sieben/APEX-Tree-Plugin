/*global de*/
/**
 * Adapter registration for APEX 19.1 and later compatible treeView APIs.
 *
 * This adapter currently reuses the base adapter unchanged. A future adapter can
 * register a newer name and override only the changed native treeView contract.
 */
(function(treeItem){
  "use strict";

  treeItem.adapters.register({
    name: "apex19",
    minApexVersion: "19.1",
    create: function(options) {
      return treeItem.baseTreeAdapter.create(options);
    },
    CHECK_SELECTOR: treeItem.baseTreeAdapter.CHECK_SELECTOR
  });
})(de.condes.plugin.apexTreeItem);
