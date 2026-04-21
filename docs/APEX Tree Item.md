# APEX Tree Item

APEX Tree Item is an Oracle APEX item plugin for selecting entries from hierarchical data.

It renders the hierarchy with the native APEX `treeView` widget and adds plugin-managed tri-state checkboxes. The checked state is independent from native tree selection. Native selection remains a tree interaction and focus concept; checked leaf nodes define the page item value.

## Core Behavior

- Hierarchical data is read from the item LOV source.
- Each tree node gets a simulated tri-state checkbox.
- Parent checkbox state is calculated from descendant leaf nodes.
- The stored item value contains checked leaf node IDs only.
- The value format is a colon separated string, for example `10:15:22`.
- `refresh()` reloads tree data and reconstructs checked state from the current item value.

## Entry Points

- [[Installation]]
- [[LOV Source Format]]
- [[Tri-State Model]]
- [[APEX Integration]]
- [[Adapter Architecture]]
- [[JavaScript API]]
- [[Development Notes]]

## Repository Structure

```text
ApexTree/
  core/       Shared item logic, state model, renderer, CSS and tests
  adapters/   APEX-version adapters
  plugin/     APEX plugin export and PL/SQL packages
```

The active baseline adapter is `apex19`, compatible with APEX 19.1 and newer until a newer APEX version requires a dedicated adapter.
