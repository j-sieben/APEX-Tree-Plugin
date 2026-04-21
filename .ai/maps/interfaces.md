# Interface Map

## PL/SQL to JavaScript Initialization

The package emits:

```js
de.condes.plugin.apexTreeItem.init("P_ITEM", {
  ajaxIdentifier: "...",
  itemsToSubmit: [...],
  noDataFoundMessage: "...",
  dependingOnSelector: "#P_PARENT",
  treeId: "P_ITEM_TREE",
  adapterName: "apex19"
});
```

Publicly configurable APEX plugin attribute:

- `No data found message`

Other values are internal or derived from APEX standard attributes:

- `ajaxIdentifier`
- `itemsToSubmit`
- `dependingOnSelector`
- `treeId`
- `adapterName`

## AJAX JSON Contract

Success:

```json
{
  "data": {
    "id": "ROOT",
    "label": "Root",
    "children": []
  }
}
```

No data:

```json
{
  "message": "No data found"
}
```

Node fields:

- `id`: required stable node ID
- `label`: required display text
- `children`: optional child node array
- `icon`: optional icon class, only emitted if non-null
- `tooltip`: optional tooltip text, only emitted if non-null

## LOV Source Format

The LOV SQL must return exactly six columns:

1. `status` - `0` for leaf, non-zero for parent
2. `level` - hierarchy level starting at `1`
3. `title` - label
4. `icon` - optional icon class
5. `value` - stable node ID
6. `tooltip` - optional tooltip text

## Item Value

The page item value stores checked leaf IDs only:

```text
A:B:C
```

Unknown IDs are ignored when state is reconstructed.
