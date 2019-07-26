create or replace PACKAGE plugin_apex_tree
  authid definer
AS

  -- Plugin macht APEX-Tree dynamisch aktualisierbar. Basiert auf Plugin orclapex-treeview-refresh
  -- von mennooo (https://github.com/mennooo/orclapex-treeview-refresh)

  ---------------------------------------------------------------------------------------------------------------
  --  Function:    render_region
  --
  --  Zweck:       Erzeugt einen APEX_TREE als Region auf der Seite. Tree ist erweitert um Refresh-Moeglichkeit
  --
  --  Returnwert:  NULL, derzeit noch nicht genutzt
  ---------------------------------------------------------------------------------------------------------------
  function render_region(
    p_region in apex_plugin.t_region,
    p_plugin in apex_plugin.t_plugin,
    p_is_printer_friendly in boolean)
    return apex_plugin.t_region_render_result;
  ---------------------------------------------------------------------------------------------------------------
    
    
  ---------------------------------------------------------------------------------------------------------------
  --  Function:    render_item
  --
  --  Zweck:       Erzeugt einen APEX_TREE als Element auf der Seite.
  --
  --  Returnwert:  NULL, derzeit noch nicht genutzt
  ---------------------------------------------------------------------------------------------------------------
  function render_item (
    p_item in apex_plugin.t_page_item,
    p_plugin in apex_plugin.t_plugin,
    p_value in varchar2,
    p_is_readonly in boolean,
    p_is_printer_friendly in boolean )
    return apex_plugin.t_page_item_render_result;
  ---------------------------------------------------------------------------------------------------------------
    
    
  ---------------------------------------------------------------------------------------------------------------
  --  Function:    validate_item
  --
  --  Zweck:       Validiert die Auswahl des APEX_TREE-Seitenelements
  --
  --  Returnwert:  RESULT-Objekt aus APEX_PLUGIN
  ---------------------------------------------------------------------------------------------------------------
  function validate_item (
    p_item   in apex_plugin.t_page_item,
    p_plugin in apex_plugin.t_plugin,
    p_value  in varchar2 )
    return apex_plugin.t_page_item_validation_result;
  ---------------------------------------------------------------------------------------------------------------


  ---------------------------------------------------------------------------------------------------------------
  --  Function:    refresh_region
  --
  --  Zweck:       Aktualisiert APEX_TREE-Region auf der Seite
  --
  --  Returnwert:  RESULT-Objekt aus APEX_PLUGIN
  ---------------------------------------------------------------------------------------------------------------
  function refresh_region (
    p_region in apex_plugin.t_region,
    p_plugin in apex_plugin.t_plugin )
    return apex_plugin.t_region_ajax_result;
  ---------------------------------------------------------------------------------------------------------------
    
    
  ---------------------------------------------------------------------------------------------------------------
  --  Function:    refresh_item
  --
  --  Zweck:       Aktualisiert APEX_TREE-Element auf der Seite
  --
  --  Returnwert:  RESULT-Objekt aus APEX_PLUGIN
  ---------------------------------------------------------------------------------------------------------------
  function refresh_item (
    p_item   in apex_plugin.t_page_item,
    p_plugin in apex_plugin.t_plugin )
    return apex_plugin.t_page_item_ajax_result;
  ---------------------------------------------------------------------------------------------------------------  

END plugin_apex_tree;
/