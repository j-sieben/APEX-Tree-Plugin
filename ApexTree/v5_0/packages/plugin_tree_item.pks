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
  function render(
    p_item in apex_plugin.t_page_item,
    p_plugin in apex_plugin.t_plugin,
    p_value in varchar2,
    p_is_readonly in boolean,
    p_is_printer_friendly in boolean)
    return apex_plugin.t_page_item_render_result;


  /** VALIDATE method for an item plugin
   * for documentation see APEX docu
   */
  function validate(
    p_item in apex_plugin.t_page_item,
    p_plugin in apex_plugin.t_plugin,
    p_value in varchar2)
    return apex_plugin.t_page_item_validation_result;
    

  /** RENDER method for an item plugin
   * for documentation see APEX docu
   */
  function refresh(
    p_item in apex_plugin.t_page_item,
    p_plugin in apex_plugin.t_plugin)
    return apex_plugin.t_page_item_ajax_result;

END plugin_tree_item;
/