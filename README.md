# APEX Tree Item

APEX Tree Item is an Oracle APEX item plugin that renders hierarchical data with the native APEX `treeView` widget and stores checked leaf nodes as a normal page item value.

The plugin is built for APEX 19.1 and newer. It uses an adapter layer so future APEX-specific changes can be isolated without changing the item state model.

## Features

- Displays hierarchical LOV data as an APEX tree.
- Adds plugin-managed tri-state checkboxes.
- Keeps native tree selection separate from checked state.
- Stores checked leaf node IDs as a colon separated value.
- Implements APEX item behavior such as `getValue`, `setValue`, `refresh`, `enable` and `disable`.
- Supports cascading LOV refreshes.

## Structure

```text
ApexTree/
  core/       Shared JavaScript, CSS, tests and item logic
  adapters/   APEX-version adapters, currently apex19
  plugin/     APEX plugin export and PL/SQL package files
docs/         Local Obsidian-compatible documentation vault
```

## Documentation

The main documentation lives in the local Obsidian vault under [docs/Home.md](docs/Home.md).

Start there for installation, LOV source format, architecture notes, JavaScript API behavior and development guidance.

## Installation Summary

1. Install the PL/SQL package from `ApexTree/plugin/packages`.
2. Import the plugin export from `ApexTree/plugin/scripts`.
3. Make the files under `ApexTree/core` and `ApexTree/adapters` available as plugin files.
4. Set the plugin file prefix so the paths in the plugin export resolve correctly.

See [docs/Installation.md](docs/Installation.md) for details.
