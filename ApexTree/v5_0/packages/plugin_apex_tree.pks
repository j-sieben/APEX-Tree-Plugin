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
   * documentation see at APEX docu
   */
  function render_region(
    p_region in apex_plugin.t_region,
    p_plugin in apex_plugin.t_plugin,
    p_is_printer_friendly in boolean)
    return apex_plugin.t_region_render_result;

  /** RENDER method for an item plugin
   * documentation see at APEX docu
   */
  function render_item (
    p_item in apex_plugin.t_page_item,
    p_plugin in apex_plugin.t_plugin,
    p_value in varchar2,
    p_is_readonly in boolean,
    p_is_printer_friendly in boolean )
    return apex_plugin.t_page_item_render_result;

  /** VALIDATE method for an item plugin
   * documentation see at APEX docu
   */
  function validate_item (
    p_item   in apex_plugin.t_page_item,
    p_plugin in apex_plugin.t_plugin,
    p_value  in varchar2 )
    return apex_plugin.t_page_item_validation_result;

  /** REFRESH method for a region plugin
   * documentation see at APEX docu
   */
  function refresh_region (
    p_region in apex_plugin.t_region,
    p_plugin in apex_plugin.t_plugin )
    return apex_plugin.t_region_ajax_result;

  /** RENDER method for an item plugin
   * documentation see at APEX docu
   */
  function refresh_item (
    p_item   in apex_plugin.t_page_item,
    p_plugin in apex_plugin.t_plugin )
    return apex_plugin.t_page_item_ajax_result;

END plugin_apex_tree;
/