# Project Map

## Purpose

This repository contains an Oracle APEX item plugin named `DE.CONDES.PLUGIN.TREE_ITEM`.

The plugin renders hierarchical LOV data with the native APEX `treeView` widget and adds plugin-managed tri-state checkboxes. The page item value is a colon separated list of checked leaf node IDs.

## Active Structure

```text
ApexTree/
  core/
    javascript/
      js/       Shared JavaScript modules
      css/      Shared CSS
      test/     Node unit tests
  adapters/
    apex19/     APEX 19.1+ adapter registration
  plugin/
    packages/  PL/SQL package spec/body
    scripts/   APEX plugin export script
docs/           Obsidian-compatible documentation vault
.ai/maps/       AI project maps
```

Legacy `ApexTree/v5_0` and `ApexTree/v19_1` were removed from the active tree.

## Compatibility

- Supported baseline: APEX 19.1+
- Current adapter: `apex19`
- Adapter rule: choose the newest adapter whose minimum APEX version is less than or equal to the running APEX version.

## Key Design Decisions

- The native APEX treeView owns hierarchy rendering, expand/collapse and tree focus/selection.
- The plugin owns checked state and tri-state propagation.
- Native tree selection is not the page item value.
- Only checked leaf node IDs are stored.
- Checkbox visualization is isolated in `checkboxRenderer.js`.
- APEX-version differences belong in `ApexTree/adapters/*`.
- PL/SQL emits only configuration and tree JSON; JavaScript owns state behavior.
