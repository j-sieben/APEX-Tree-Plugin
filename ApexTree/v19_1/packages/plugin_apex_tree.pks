create or replace PACKAGE plugin_apex_tree
  authid definer
AS
  /** Package to implement database functionalty for ApexTree Region and Item plugin
   *  Features:
   *  - Allows to refresh an apex.treeView dynamically
   *  - Encapsulates the refreshable tree in a region plugin
   *  
   * This work is based on two blogs:
   * - mennooo (https://github.com/mennooo/orclapex-treeview-refresh)
   * - ezhik (https://github.com/mennooo/orclapex-treeview-refresh)
   */
   

  /** RENDER method for a region plugin
   * for documentation see APEX docu
   */
  function render(
    p_region in apex_plugin.t_region,
    p_plugin in apex_plugin.t_plugin,
    p_is_printer_friendly in boolean)
    return apex_plugin.t_region_render_result;
    

  /** REFRESH method for a region plugin
   * for documentation see APEX docu
   */
  function refresh (
    p_region in apex_plugin.t_region,
    p_plugin in apex_plugin.t_plugin )
    return apex_plugin.t_region_ajax_result;

END plugin_apex_tree;
/