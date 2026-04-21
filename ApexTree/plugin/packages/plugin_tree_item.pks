create or replace package plugin_tree_item
  authid definer
as
  /**
   * Package: plugin_tree_item
   *
   * Implements the server-side integration for the APEX Tree Item plugin.
   *
   * The package renders the hidden APEX item markup, emits the JavaScript
   * initialization call, serves AJAX refresh data as JSON and provides the
   * standard APEX item plugin callbacks.
   *
   * The JavaScript client owns checked-state handling. This package only
   * returns hierarchical LOV data and server-side configuration needed to
   * initialize the browser component.
   */

  /**
   * Procedure: render
   *
   * Renders the APEX item markup and emits the JavaScript initialization code.
   *
   * Parameters:
   *   p_item   - APEX item plugin definition and component attributes.
   *   p_plugin - APEX plugin definition.
   *   p_param  - Runtime render parameters, including the current item value.
   *   p_result - APEX render result. The procedure does not currently set
   *              custom result fields.
   *
   * Errors:
   *   Raises an application error if no compatible JavaScript adapter is
   *   available for the running APEX version.
   */
  procedure render (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_render_param,
    p_result in out nocopy apex_plugin.t_item_render_result);

  /**
   * Procedure: get_metadata
   *
   * Supplies item metadata to APEX.
   *
   * The current plugin implementation does not need additional metadata and
   * leaves the result unchanged.
   *
   * Parameters:
   *   p_item   - APEX item plugin definition.
   *   p_plugin - APEX plugin definition.
   *   p_param  - Metadata request parameters.
   *   p_result - Metadata result returned to APEX.
   */
  procedure get_metadata (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_meta_data_param,
    p_result in out nocopy apex_plugin.t_item_meta_data_result);

  /**
   * Procedure: validate
   *
   * Validates the submitted item value.
   *
   * The current plugin implementation performs no server-side validation and
   * leaves the result unchanged.
   *
   * Parameters:
   *   p_item   - APEX item plugin definition.
   *   p_plugin - APEX plugin definition.
   *   p_param  - Validation parameters, including the submitted item value.
   *   p_result - Validation result returned to APEX.
   */
  procedure validate (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_validation_param,
    p_result in out nocopy apex_plugin.t_item_validation_result);

  /**
   * Procedure: refresh
   *
   * Handles AJAX refresh requests from the JavaScript item.
   *
   * The procedure executes the item's LOV source and writes a JSON response to
   * the HTTP output stream. If the LOV returns no rows, the response contains a
   * message property instead of tree data.
   *
   * Parameters:
   *   p_item   - APEX item plugin definition, including the LOV source.
   *   p_plugin - APEX plugin definition.
   *   p_param  - AJAX request parameters.
   *   p_result - AJAX result returned to APEX. The procedure does not currently
   *              set custom result fields.
   *
   * Errors:
   *   NO_DATA_FOUND is handled internally and converted into a JSON message.
   *   Other LOV execution errors are allowed to propagate to APEX.
   */
  procedure refresh (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_ajax_param,
    p_result in out nocopy apex_plugin.t_item_ajax_result);
end plugin_tree_item;
/
