# Installation

## Database Objects

Install the PL/SQL package files from:

```text
ApexTree/plugin/packages/
```

Install order:

1. `plugin_tree_item.pks`
2. `plugin_tree_item.pkb`

The package name is `plugin_tree_item`.

## APEX Plugin Export

Import the item plugin export from:

```text
ApexTree/plugin/scripts/item_type_plugin_de_condes_plugin_tree_item.sql
```

The plugin internal name is:

```text
DE.CONDES.PLUGIN.TREE_ITEM
```

## Static Files

The plugin export expects the plugin file prefix to resolve these paths:

```text
core/javascript/js/namespace.js
core/javascript/js/valueCodec.js
core/javascript/js/checkStateModel.js
core/javascript/js/checkboxRenderer.js
core/javascript/js/adapterRegistry.js
core/javascript/js/baseTreeAdapter.js
adapters/apex19/apexTreeAdapter.js
core/javascript/js/apexTreeItem.js
core/javascript/css/apexTreeItem.css
```

Make the `ApexTree/core` and `ApexTree/adapters` folders available as plugin files and set the plugin file prefix accordingly.

## Compatibility

The current adapter is `apex19`, with minimum APEX version 19.1.

The PL/SQL package chooses the newest compatible adapter from its internal adapter list. A new adapter only needs to be added when a newer APEX version changes relevant `treeView` behavior.
