# Tri-State Model

The plugin owns the checked state. The native APEX treeView does not manage checked state.

## States

| State | Meaning | ARIA |
| --- | --- | --- |
| `unchecked` | No checked leaf below this node | `false` |
| `partial` | Some checked leaves below this node | `mixed` |
| `checked` | All leaves below this node are checked | `true` |

## Stored Value

The page item value stores checked leaf node IDs only:

```text
10:15:22
```

Parent states are derived from descendant leaf states and are not stored.

## Toggle Behavior

- Toggling an unchecked or partial parent checks all descendant leaves.
- Toggling a checked parent clears all descendant leaves.
- Toggling a leaf only changes that leaf and recalculates parent states.

## Selection Is Separate

Native tree selection represents focus and tree interaction. It is not the item value and is not used to determine checked nodes.
