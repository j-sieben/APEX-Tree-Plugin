# Adapter Architecture

The plugin separates shared behavior from APEX-version-specific integration.

## Layers

```text
APEX treeView
  Native rendering, expand/collapse, focus and tree navigation

Adapter
  Version-specific calls into native treeView

Core
  Item lifecycle, value handling and tri-state state model

Renderer
  Checkbox markup, CSS classes and ARIA state
```

## Current Adapter

The current adapter is:

```text
adapters/apex19/apexTreeAdapter.js
```

It registers `apex19` with minimum APEX version `19.1` and uses the base adapter unchanged.

## Adapter Selection

The PL/SQL package chooses the newest compatible adapter:

```text
adapter minimum version <= running APEX version
```

If multiple adapters match, the newest minimum version wins.

## Adding a Future Adapter

Create a new folder, for example:

```text
ApexTree/adapters/apex25/apexTreeAdapter.js
```

Register the adapter with its minimum APEX version and override only behavior that differs from the base adapter.

Then add the adapter to:

- plugin file URLs
- `available_adapters` in `plugin_tree_item.pkb`
