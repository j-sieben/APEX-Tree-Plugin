# APEX Integration

The plugin is an APEX item plugin. It registers item behavior through `apex.item.create`.

## Item Methods

The JavaScript item implementation provides:

- `getValue()`
- `setValue(value, displayValue, suppressChangeEvent)`
- `refresh()`
- `enable()`
- `disable()`
- `isDisabled()`

## Refresh

`refresh()` calls `apex.server.plugin`, reloads LOV data and rebuilds checked state from the current hidden item value.

When the server returns no data, the item displays the configured no-data message and clears the effective checked value.

## Cascading LOV

If the item has cascading LOV parent items, the plugin registers a namespaced change handler and refreshes the tree when a parent item changes.

## Events

After refresh, the item triggers:

```text
apexafterrefresh
```

The plugin triggers a normal `change` event when a user checkbox action changes the item value.
