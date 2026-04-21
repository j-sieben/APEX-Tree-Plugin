/*global de*/
/**
 * Visual renderer for plugin-managed tri-state checkboxes.
 *
 * The renderer owns only markup, CSS classes and ARIA state. It does not decide
 * whether a node is checked; that state comes from `checkStateModel`.
 */
(function(treeItem, factory){
  "use strict";

  treeItem.define("checkboxRenderer", function(apex, plugin){
    return factory(plugin);
  });
})(de.condes.plugin.apexTreeItem, function(treeItem){
  "use strict";

  var CHECK_CLASS = "a-TreeView-checkBox",
      CHECK_SELECTOR = "." + CHECK_CLASS,
      CHECKED_CLASS = CHECK_CLASS + "--checked",
      PARTIAL_CLASS = CHECK_CLASS + "--partial",
      UNCHECKED_CLASS = CHECK_CLASS + "--unchecked",
      STATE_CLASS = CHECK_CLASS + "-state";

  /**
   * Writes the checkbox markup into the APEX treeView HTML builder.
   *
   * @param {Object} out APEX htmlBuilder-style output object.
   * @param {string} state Current tri-state value.
   * @returns {void}
   */
  function render(out, state) {
    out.markup("<span ")
      .attr("class", CHECK_CLASS + " " + classForState(state))
      .attr("role", "checkbox")
      .attr("aria-checked", ariaCheckedForState(state))
      .attr("tabindex", "-1")
      .markup(">")
      .markup("<span ")
      .attr("class", "fa fa-square-o " + STATE_CLASS + " " + STATE_CLASS + "--unchecked")
      .attr("aria-hidden", "true")
      .markup("></span>")
      .markup("<span ")
      .attr("class", "fa fa-minus-square-o " + STATE_CLASS + " " + STATE_CLASS + "--partial")
      .attr("aria-hidden", "true")
      .markup("></span>")
      .markup("<span ")
      .attr("class", "fa fa-check-square-o " + STATE_CLASS + " " + STATE_CLASS + "--checked")
      .attr("aria-hidden", "true")
      .markup("></span>")
      .markup("</span>");
  }

  /**
   * Applies a new tri-state value to an existing checkbox element.
   *
   * @param {jQuery} checkBox$ Checkbox jQuery object.
   * @param {string} state New tri-state value.
   * @returns {void}
   */
  function applyState(checkBox$, state) {
    checkBox$
      .removeClass(CHECKED_CLASS + " " + PARTIAL_CLASS + " " + UNCHECKED_CLASS)
      .addClass(classForState(state))
      .attr("aria-checked", ariaCheckedForState(state));
  }

  function classForState(state) {
    switch (state) {
      case treeItem.checkStateModel.STATE.CHECKED:
        return CHECKED_CLASS;
      case treeItem.checkStateModel.STATE.PARTIAL:
        return PARTIAL_CLASS;
      default:
        return UNCHECKED_CLASS;
    }
  }

  function ariaCheckedForState(state) {
    switch (state) {
      case treeItem.checkStateModel.STATE.CHECKED:
        return "true";
      case treeItem.checkStateModel.STATE.PARTIAL:
        return "mixed";
      default:
        return "false";
    }
  }

  return {
    render: render,
    applyState: applyState,
    selector: CHECK_SELECTOR
  };
});
