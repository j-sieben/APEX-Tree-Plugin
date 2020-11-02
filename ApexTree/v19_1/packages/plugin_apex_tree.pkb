create or replace package body plugin_apex_tree
as
  subtype ora_name_type is varchar2(128 byte);
  subtype flag_type is varchar2(1 byte);
  subtype sql_char is varchar2(4000 byte);
  subtype max_char is varchar2(32767);

  type tree_rec is record (
    node_status number,
    node_level number,
    node_title sql_char,
    node_icon sql_char,
    node_value sql_char,
    node_tooltip sql_char,
    node_link sql_char);

  type tree_tab is table of tree_rec index by pls_integer;

  type number_list is table of pls_integer index by ora_name_type;
  
  g_has_identity boolean default true;
  g_root_count number := 1;
  
  C_COLUMN_COUNT constant number := 7;
  C_YES constant flag_type := 'Y';
  C_TRUE constant ora_name_type := 'true';
  C_FALSE constant ora_name_type := 'false';
  
  /* HELPER */
  /** Method to retrieve the data based on APEX_EXEC
   * @param  p_region  Instance of apex_plugin.t_region with column meta data
   * @return PL/SQL table of type TREE_REC with the hierarchical data
   * @usage  This method uses APEX_EXEC to retrieve the values of the region source
   */
  function get_data(
    p_region in apex_plugin.t_region)
    return tree_tab
  as
    l_tree_tab tree_tab;
    l_context apex_exec.t_context;
    l_col_idx number_list;
    l_idx pls_integer := 1;
  begin
    
    -- open context based on settings on the page for the region source
    l_context := apex_exec.open_query_context;
                   
    -- map column names from region attributes to column index numbers
    l_col_idx('LABEL') := apex_exec.get_column_position(l_context, p_region.attribute_01);
    l_col_idx('VALUE') := apex_exec.get_column_position(l_context, p_region.attribute_02);
    l_col_idx('STATUS') := apex_exec.get_column_position(l_context, p_region.attribute_03);
    l_col_idx('LEVEL') := apex_exec.get_column_position(l_context, p_region.attribute_04);
    l_col_idx('TOOLTIP') := apex_exec.get_column_position(l_context, p_region.attribute_05);
    l_col_idx('LINK') := apex_exec.get_column_position(l_context, p_region.attribute_06);
    l_col_idx('ICON') := apex_exec.get_column_position(l_context, p_region.attribute_08);
    
    -- copy result to PL/SQL table
    apex_debug.info('... Reading rows');
    while apex_exec.next_row(l_context) loop
      apex_debug.info('... Reading row ' || l_idx);
      l_tree_tab(l_idx).node_status := apex_exec.get_number(l_context, l_col_idx('STATUS'));
      l_tree_tab(l_idx).node_level := apex_exec.get_number(l_context, l_col_idx('LEVEL'));
      l_tree_tab(l_idx).node_title := apex_exec.get_varchar2(l_context, l_col_idx('LABEL'));
      l_tree_tab(l_idx).node_icon := apex_exec.get_varchar2(l_context, l_col_idx('ICON'));
      l_tree_tab(l_idx).node_value := apex_exec.get_varchar2(l_context, l_col_idx('VALUE'));
      l_tree_tab(l_idx).node_tooltip := apex_exec.get_varchar2(l_context, l_col_idx('TOOLTIP'));
      l_tree_tab(l_idx).node_link := apex_exec.get_varchar2(l_context, l_col_idx('LINK'));
      
      l_idx := l_idx + 1;
    end loop;
    
    apex_debug.info((l_idx - 1) || ' Zeilen gelesen');
    
    apex_exec.close(l_context);
    return l_tree_tab;
  exception
    when others then
      apex_exec.close(l_context);
      raise;
  end get_data;
  
  
  /** Method to emit the retrieved data as a JSON data stream
   * @param [p_stmt]      SQL statement to retrieve the hierachical values.
   * @usage  Is used to convert the result of GET_DATA to JSON and print it to the http stream
   */
  procedure print_json(
    p_region in apex_plugin.t_region)
  as
    l_tree_tab tree_tab;
    l_prev_node_level number := 1;
  begin
    -- retrieve data set
    l_tree_tab := get_data(p_region);
    
    if l_tree_tab.count = 0 then
      raise NO_DATA_FOUND;
    end if;

    apex_json.open_object;    
    apex_json.open_object('config');
    apex_json.write('hasIdentity', g_has_identity);
    apex_json.write('rootAdded', g_root_count > 1);  
    apex_json.close_object;    
    apex_json.open_object('data');

    if g_root_count > 1 then    
      apex_json.write('id', 'root0');
      apex_json.write('label', 'root');
      apex_json.open_array('children');    
    end if;

    for idx in 1..l_tree_tab.count loop    
      if l_tree_tab(idx).node_level < l_prev_node_level then  
        -- close nested array  
        for nesting_idx in 1..(l_prev_node_level - l_tree_tab(idx).node_level) loop          
          apex_json.close_array;
          apex_json.close_object;        
        end loop;      
      end if;

      l_prev_node_level := l_tree_tab(idx).node_level;

      if not (g_root_count = 1 and l_tree_tab(idx).node_level = 1) then
        apex_json.open_object;
      end if;

      apex_json.write('id', l_tree_tab(idx).node_value);
      apex_json.write('label', l_tree_tab(idx).node_title);
      apex_json.write('icon', l_tree_tab(idx).node_icon);
      apex_json.write('link', l_tree_tab(idx).node_link);
      apex_json.write('tooltip', l_tree_tab(idx).node_tooltip);

      if l_tree_tab(idx).node_status = 0 then
        -- node is a leaf, close object
        apex_json.close_object;    
      else      
        apex_json.open_array('children');        
      end if;    
    end loop;

    apex_json.close_all;
  end print_json;
  
  
  procedure print_no_data_found(
    p_message in varchar2)
  as
  begin
    apex_json.open_object;
    apex_json.write('message', p_message);  
    apex_json.close_object;    
  end print_no_data_found;
  
  
  /* INTERFACE */
  function render_region(
    p_region in apex_plugin.t_region,
    p_plugin in apex_plugin.t_plugin,
    p_is_printer_friendly in boolean)
  return apex_plugin.t_region_render_result
  as
    C_REGION_TEMPLATE constant sql_char := 
      q'^<div id="#REGION_STATIC_ID#"><div id="#REGION_STATIC_ID#_tree" role="tree"></div></div>^';

    C_JS_TEMPLATE constant sql_char := 
      q'^
      var options = {
            'hasIdentity':true,
            'rootAdded':#SHOW_ROOT#
          };
      de.condes.plugin.apexTree.Region('##REGION_STATIC_ID#', {
        'ajaxIdentifier': '#AJAX_IDENTIFIER#',
        'tree$': $('##REGION_STATIC_ID#_tree'),
        'treeId': '#REGION_STATIC_ID#_tree',
        'treeAction': #TREE_ACTION#,
        'itemsToSubmit': [#ITEMS_TO_SUBMIT|'|'|#],
        'iconType': '#ICON_TYPE#',
        'isEditable': #EDITABLE#,
        'config':#JAVASCRIPT_INIT|||options#,
        'data':{'FOO':''}
      })^';
    
    l_result apex_plugin.t_region_render_result;
    l_js max_char;
    l_action_type p_region.attribute_07%type;
    l_icon_type p_region.attribute_09%type;
    l_is_editable p_region.attribute_11%type;
  begin
  
    apex_plugin_util.debug_region(
      p_plugin => p_plugin,
      p_region => p_region,
      p_is_printer_friendly => p_is_printer_friendly);
      
    -- Map attributes to local variables
    l_action_type := p_region.attribute_07;
    l_icon_type := p_region.attribute_09;
    l_is_editable := case p_region.attribute_11 when C_YES then C_TRUE else C_FALSE end;
      
    htp.p(utl_text.bulk_replace(C_REGION_TEMPLATE, char_table(
            '#REGION_STATIC_ID#', p_region.static_id)));

    -- prepare and add JavaScript to instantiate the plugin
    l_js := utl_text.bulk_replace(C_JS_TEMPLATE, char_table(
              '#REGION_STATIC_ID#', p_region.static_id,
              '#AJAX_IDENTIFIER#', apex_plugin.get_ajax_identifier,
              '#TREE_ACTION#', case l_action_type when 'D' then '''activate''' else C_FALSE end,
              '#ICON_TYPE#', l_icon_type,
              '#SHOW_ROOT#', case g_root_count when 1 then C_FALSE else C_TRUE end,
              '#ITEMS_TO_SUBMIT#', p_region.ajax_items_to_submit,
              '#EDITABLE#', l_is_editable,
              '#JAVASCRIPT_INIT#', p_region.init_javascript_code));

    apex_javascript.add_onload_code(p_code => l_js);
    
    return l_result;
  end render_region;
  
  
  function refresh_region(
    p_region in apex_plugin.t_region,
    p_plugin in apex_plugin.t_plugin)
  return apex_plugin.t_region_ajax_result
  as
    l_result apex_plugin.t_region_ajax_result;
    l_operation apex_application.g_x01%type;
    l_id apex_application.g_x02%type;
    l_parent_id apex_application.g_x03%type;
  begin
    if apex_application.g_x01 is not null then
      l_operation := apex_application.g_x01;
      l_id := apex_application.g_x02;
      l_parent_id := apex_application.g_x03;
      htp.p('{operation:''' || l_operation || ' done''}');
    else
      print_json(p_region => p_region);
    end if;
    
    return l_result;
  exception
    when NO_DATA_FOUND then
      print_no_data_found(p_region.no_data_found_message);
      return l_result;
  end refresh_region;

end plugin_apex_tree;
/