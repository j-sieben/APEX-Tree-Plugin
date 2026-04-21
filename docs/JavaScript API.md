# JavaScript API

The public browser entry point is:

```js
de.condes.plugin.apexTreeItem.init(itemId, options);
```

The APEX plugin package emits this call during item rendering.

The JavaScript source files contain JSDoc-style comments for the module
contracts and the methods intended to be called across module boundaries.

## Main Options

| Option | Meaning |
| --- | --- |
| `ajaxIdentifier` | APEX plugin AJAX identifier |
| `itemsToSubmit` | Page items submitted during refresh |
| `dependingOnSelector` | Cascading LOV parent selector |
| `treeId` | DOM ID of the native tree container |
| `adapterName` | Adapter selected by the PL/SQL package |
| `noDataFoundMessage` | Message shown for empty data |

## Core Modules

- `namespace.js`: creates the shared browser namespace and the `define` helper used by the plugin modules.
- `valueCodec.js`: converts between colon separated values and ID arrays.
- `checkStateModel.js`: manages tri-state state independently from APEX.
- `checkboxRenderer.js`: renders and updates checkbox visualization.
- `baseTreeAdapter.js`: default native treeView integration.
- `apexTreeItem.js`: APEX item lifecycle and public behavior.

## Renderer Contract

The checkbox renderer exposes:

```js
render(out, state)
applyState(checkBox$, state)
selector
```

This keeps visual customization separate from treeView adapter behavior.
