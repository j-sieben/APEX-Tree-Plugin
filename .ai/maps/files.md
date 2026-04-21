# File Map

## Core JavaScript

- `ApexTree/core/javascript/js/namespace.js`
  - Creates the shared plugin namespace and the `define` helper for browser module registration.
- `ApexTree/core/javascript/js/valueCodec.js`
  - Converts between colon separated item value and unique ID arrays.
- `ApexTree/core/javascript/js/checkStateModel.js`
  - Pure tri-state state model. No APEX or DOM dependency.
- `ApexTree/core/javascript/js/checkboxRenderer.js`
  - Renders and updates tri-state checkbox markup, classes and ARIA state.
- `ApexTree/core/javascript/js/adapterRegistry.js`
  - Registers and resolves adapter definitions.
- `ApexTree/core/javascript/js/baseTreeAdapter.js`
  - Default integration with native `apex.widget.treeView`.
- `ApexTree/core/javascript/js/apexTreeItem.js`
  - APEX item lifecycle, `apex.item.create`, refresh handling and value updates.

## Adapter

- `ApexTree/adapters/apex19/apexTreeAdapter.js`
  - Registers adapter `apex19`, minimum version `19.1`.
  - Uses `baseTreeAdapter` unchanged.

## PL/SQL and APEX Export

- `ApexTree/plugin/packages/plugin_tree_item.pks`
  - Package spec with public APEX callback signatures and NaturalDocs comments.
- `ApexTree/plugin/packages/plugin_tree_item.pkb`
  - Package body with adapter selection, LOV execution and JSON serialization.
- `ApexTree/plugin/scripts/item_type_plugin_de_condes_plugin_tree_item.sql`
  - APEX item plugin export.

## Documentation

- `README.md`
  - Short repository entry point.
- `docs/Home.md`
  - Obsidian start page.
- `docs/*.md`
  - Topic pages for installation, LOV format, architecture, JS API and development.

## Tests

- `ApexTree/core/javascript/test/valueCodec.test.js`
- `ApexTree/core/javascript/test/checkStateModel.test.js`
