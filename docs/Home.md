# APEX Tree Item Documentation

APEX Tree Item is an Oracle APEX item plugin for selecting values from hierarchical data with tri-state checkboxes.

The plugin uses the native APEX `treeView` for hierarchy rendering and tree interaction. The checked state is managed by the plugin itself and stored as a normal APEX page item value.

## Quick Overview

- The item source is an APEX LOV query.
- The LOV returns hierarchy metadata, labels, IDs and optional visual fields.
- Only checked leaf node IDs are stored.
- Parent checkbox states are calculated from their descendant leaves.
- Native tree selection is separate from checked state.
- APEX-version-specific behavior is isolated in adapters.

## Main Concepts

- [[APEX Tree Item]] introduces the plugin and repository structure.
- [[Installation]] explains database package, plugin import and static file setup.
- [[LOV Source Format]] documents the required LOV columns.
- [[Tri-State Model]] explains checked, unchecked and mixed states.
- [[APEX Integration]] describes item methods, refresh and cascading LOV behavior.
- [[Adapter Architecture]] explains how APEX-version adapters are selected and extended.
- [[JavaScript API]] describes the browser-side modules and initialization options.
- [[Development Notes]] lists local checks, tests and manual APEX smoke tests.

## Further Reading

- [[APEX Tree Item]]
- [[Installation]]
- [[LOV Source Format]]
- [[Tri-State Model]]
- [[APEX Integration]]
- [[Adapter Architecture]]
- [[JavaScript API]]
- [[Development Notes]]
