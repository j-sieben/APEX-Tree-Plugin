/*global de*/
/**
 * Converts between APEX item values and JavaScript arrays.
 *
 * The persisted item value is a colon separated list of checked leaf node IDs.
 * Parsing normalizes values to strings, removes empty entries and keeps only the
 * first occurrence of duplicate IDs.
 */
(function(root, factory){
  "use strict";

  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.de.condes.plugin.apexTreeItem.define("valueCodec", function(){
      return factory();
    });
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function(){
  "use strict";

  function normalizeId(value) {
    if (value === null || typeof value === "undefined") {
      return "";
    }
    return String(value);
  }

  /**
   * Parses an APEX item value into unique node IDs.
   *
   * @param {string|string[]|null|undefined} value Colon separated value or array.
   * @returns {string[]} Unique non-empty IDs in input order.
   */
  function parse(value) {
    var seen = Object.create(null),
        result = [];

    if (Array.isArray(value)) {
      value.forEach(function(entry){
        add(entry, seen, result);
      });
      return result;
    }

    normalizeId(value).split(":").forEach(function(entry){
      add(entry, seen, result);
    });

    return result;
  }

  function add(entry, seen, result) {
    var id = normalizeId(entry).trim();

    if (id !== "" && !seen[id]) {
      seen[id] = true;
      result.push(id);
    }
  }

  /**
   * Formats IDs as a colon separated APEX item value.
   *
   * @param {string|string[]|null|undefined} values IDs to serialize.
   * @returns {string} Colon separated value.
   */
  function format(values) {
    return parse(values).join(":");
  }

  return {
    parse: parse,
    format: format
  };
});
