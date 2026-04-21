# Architecture Map

## Layers

```text
APEX treeView
  Native hierarchy rendering, expand/collapse, focus and selection

Adapter
  Version-specific calls into native treeView

Core Item
  APEX item lifecycle, AJAX refresh, value handling

State Model
  Checked/partial/unchecked state independent from DOM and APEX

Checkbox Renderer
  Checkbox markup, visual classes and ARIA checked state
```

## State Ownership

The plugin owns checked state.

The native APEX treeView owns selection/focus. Selection must not be used as the item value.

## Tri-State Rules

- Leaf checked state is source of truth.
- Parent state is derived:
  - no checked descendant leaves: `unchecked`
  - some checked descendant leaves: `partial`
  - all descendant leaves checked: `checked`
- Toggling a parent sets all descendant leaves.
- Toggling a checked parent clears all descendant leaves.

## Adapter Selection

Server-side function:

- `plugin_tree_item.get_adapter_name`

Rule:

```text
select adapter with max(min_version) where min_version <= apex_release.version
```

Current list:

- `apex19`, min `19.1`

## Renderer Isolation

`baseTreeAdapter.js` delegates checkbox rendering to `checkboxRenderer.js`:

```js
treeItem.checkboxRenderer.render(out, checkState);
treeItem.checkboxRenderer.applyState(checkBox$, state);
```

To change the visual representation, edit or replace `checkboxRenderer.js`.
