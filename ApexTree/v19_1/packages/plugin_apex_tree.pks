create or replace PACKAGE plugin_apex_tree
  authid definer
AS
  /** Package to implement database functionalty for ApexTree Region and Item plugin
   *  Features:
   *  - Allows to refresh an apex.treeView dynamically
   *  - Adds checkbox support
   *  - Encapsulates the refreshable tree in a region plugin
   *  - Encapsulates the refreshable checkbox tree in an item plugin with set/getValue, cascading lov support etc.
   *  
   * This work is based on two blogs:
   * - mennooo (https://github.com/mennooo/orclapex-treeview-refresh)
   * - ezhik (https://github.com/mennooo/orclapex-treeview-refresh)
   */
   

  /** RENDER method for a region plugin
   * for documentation see APEX docu
   */
  function render_region(
    p_region in apex_plugin.t_region,
    p_plugin in apex_plugin.t_plugin,
    p_is_printer_friendly in boolean)
    return apex_plugin.t_region_render_result;

  /** RENDER method for an item plugin
   * for documentation see APEX docu
   */
  procedure render_item (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_render_param,
    p_result in out nocopy apex_plugin.t_item_render_result);
    
  
  /* META_DATA method if used in an interactive grid
   * for documentation see APEX docu
   */
  procedure get_item_metadata (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_meta_data_param,
    p_result in out nocopy apex_plugin.t_item_meta_data_result);


  /** VALIDATE method for an item plugin
   * for documentation see APEX docu
   */
  procedure validate_item(
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_validation_param,
    p_result in out nocopy apex_plugin.t_item_validation_result);
    

  /** REFRESH method for a region plugin
   * for documentation see APEX docu
   */
  function refresh_region (
    p_region in apex_plugin.t_region,
    p_plugin in apex_plugin.t_plugin )
    return apex_plugin.t_region_ajax_result;

  /** RENDER method for an item plugin
   * for documentation see APEX docu
   */
  procedure refresh_item (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_ajax_param,
    p_result in out nocopy apex_plugin.t_item_ajax_result);

END plugin_apex_tree;
/