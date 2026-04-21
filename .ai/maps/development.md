# Development Map

## Commands

JavaScript syntax check:

```sh
for f in ApexTree/core/javascript/js/*.js ApexTree/adapters/apex19/*.js ApexTree/core/javascript/test/*.js; do node --check "$f"; done
```

Unit tests:

```sh
node --test ApexTree/core/javascript/test/*.test.js
```

## Current Test Coverage

- `valueCodec.parse`
- `valueCodec.format`
- leaf checked state
- parent tri-state propagation
- parent toggle
- unknown IDs
- empty values
- refresh with changed tree data
- adapter registry registration, lookup and error handling
- APEX 19 adapter registration contract
- checkbox renderer markup, ARIA mapping and CSS class updates
- base tree adapter communication with native `treeView` calls
- base tree adapter data payload, renderer registration and disabled-state mapping

## JavaScript Documentation

- Source modules use JSDoc-style comments.
- Comments document module purpose, public method contracts, parameters, return
  values and relevant APEX integration behavior.
- Avoid comments that only repeat simple implementation details.

## Manual APEX Smoke Tests

Run in a real APEX application:

- Install package spec/body.
- Import plugin export.
- Configure plugin file prefix.
- Create item using hierarchical LOV source.
- Verify initial render.
- Verify `setValue` and `getValue`.
- Verify leaf and parent checkbox clicks.
- Verify dynamic action refresh.
- Verify cascading LOV refresh.
- Verify no-data response.
- Verify disabled/enabled item state.

## Known Verification Gap

PL/SQL has not been compiled in this local environment. It must be compiled in a target Oracle/APEX schema.
