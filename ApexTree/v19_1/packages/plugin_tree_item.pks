create or replace PACKAGE plugin_tree_item
  authid definer
AS
  /** Package to implement database functionalty for Tree Item plugin based on APEX widget.treeView
   *  Features:
   *  - Allows to refresh an apex.treeView dynamically
   *  - Adds checkbox support
   *  - Encapsulates the refreshable checkbox tree in an item plugin with set/getValue, cascading lov support etc.
   *  
   * This work is based on two blogs:
   * - mennooo (https://github.com/mennooo/orclapex-treeview-refresh)
   * - ezhik (https://github.com/mennooo/orclapex-treeview-refresh)
   */
   

  /** RENDER method for an item plugin
   * for documentation see APEX docu
   */
  procedure render (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_render_param,
    p_result in out nocopy apex_plugin.t_item_render_result);
    
  
  /* META_DATA method if used in an interactive grid
   * for documentation see APEX docu
   */
  procedure get_metadata (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_meta_data_param,
    p_result in out nocopy apex_plugin.t_item_meta_data_result);


  /** VALIDATE method for an item plugin
   * for documentation see APEX docu
   */
  procedure validate(
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_validation_param,
    p_result in out nocopy apex_plugin.t_item_validation_result);
    

  /** RENDER method for an item plugin
   * for documentation see APEX docu
   */
  procedure refresh (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_ajax_param,
    p_result in out nocopy apex_plugin.t_item_ajax_result);

END plugin_tree_item;
