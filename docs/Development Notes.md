# Development Notes

## Local Checks

Run JavaScript syntax checks:

```sh
for f in ApexTree/core/javascript/js/*.js ApexTree/adapters/apex19/*.js ApexTree/core/javascript/test/*.js; do node --check "$f"; done
```

Run unit tests:

```sh
node --test ApexTree/core/javascript/test/*.test.js
```

## Current Test Coverage

The current unit tests cover:

- value parsing and formatting
- parent/leaf tri-state propagation
- unknown values
- empty values
- refresh with changed tree data
- adapter registration, lookup and missing-adapter errors
- APEX 19 adapter registration contract
- checkbox renderer markup, ARIA state and CSS state updates
- base tree adapter calls to native `treeView` init, refresh, destroy, getNodes and getTreeNode
- base tree adapter data payload, renderer registration and disabled-state mapping

## APEX Smoke Tests

Manual APEX testing should cover:

- initial render with empty value
- initial render with preselected leaf values
- clicking leaf checkboxes
- clicking parent checkboxes
- Dynamic Action refresh
- Cascading LOV parent changes
- disabled and enabled item state
- no-data result

## Design Rules

- Checked state belongs to the plugin, not to native treeView.
- Native selection is never used as item value.
- CSS classes are display state, not source of truth.
- APEX-version-specific behavior belongs in adapters.
- Checkbox visualization belongs in `checkboxRenderer.js`.

## JavaScript Documentation

JavaScript source files use JSDoc-style comments for module boundaries and public
module methods. Keep comments focused on contracts, APEX integration points,
state ownership and error behavior rather than restating simple implementation
steps.
