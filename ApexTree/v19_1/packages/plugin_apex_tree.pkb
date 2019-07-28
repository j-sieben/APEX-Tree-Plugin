create or replace package body plugin_apex_tree
as
  
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

  g_has_identity boolean default true;
  g_root_count number := 1;
  
  C_COLUMN_COUNT constant number := 7;
  
  /* HELPER */
  /** Method to retrieve the data based on LOV source or region source
   * @param  p_stmt       SQL statement to retrieve the hierachical values.
   * @return PL/SQL table of type TREE_REC with the hierarchical data
   * @usage  This method uses APEX_PLUGIN_UTIL.GET_DATA2 to retrieve the values of the queries
   */
  function get_data ( 
    p_stmt in varchar2)
    return tree_tab
  as
    l_source_result apex_plugin_util.t_column_value_list2;
    l_tree_tab tree_tab;
  begin    
    -- get hierarchical data
    l_source_result := apex_plugin_util.get_data2(
                         p_sql_statement => p_stmt,
                         p_min_columns => C_COLUMN_COUNT,
                         p_max_columns => C_COLUMN_COUNT,
                         p_component_name => null);

    -- copy result to PL/SQL table
    for idx in 1..l_source_result(1).value_list.count loop    
      l_tree_tab(idx).node_status := l_source_result(1).value_list(idx).number_value;
      l_tree_tab(idx).node_level := l_source_result(2).value_list(idx).number_value;
      l_tree_tab(idx).node_title := apex_plugin_util.get_value_as_varchar2(l_source_result(3).data_type, l_source_result(3).value_list(idx));
      l_tree_tab(idx).node_icon := apex_plugin_util.get_value_as_varchar2(l_source_result(4).data_type, l_source_result(4).value_list(idx));
      l_tree_tab(idx).node_value := apex_plugin_util.get_value_as_varchar2(l_source_result(5).data_type, l_source_result(5).value_list(idx));
      l_tree_tab(idx).node_tooltip := apex_plugin_util.get_value_as_varchar2(l_source_result(6).data_type, l_source_result(6).value_list(idx));
      l_tree_tab(idx).node_link := apex_plugin_util.get_value_as_varchar2(l_source_result(7).data_type, l_source_result(7).value_list(idx));

      if l_tree_tab(idx).node_value is null then
        g_has_identity := false;
      end if;

      if l_tree_tab(idx).node_level = 1 then
        g_root_count := g_root_count + 1;
      end if;    
    end loop;

    return l_tree_tab;
  end get_data;
  
  
  /** Method to emit the retrieved data as a JSON data stream
   * @param [p_stmt]      SQL statement to retrieve the hierachical values.
   * @usage  Is used to convert the result of GET_DATA to JSON and print it to the http stream
   */
  procedure print_json (
    p_stmt in varchar2)
  as
    l_tree_tab tree_tab;
    l_prev_node_level number := 1;
  begin
    l_tree_tab := get_data(p_stmt);
    
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
      q'^<div id="#REGION_STATIC_ID#"><div id="#REGION_STATIC_ID#_TREE"></div></div>^';

    C_JS_TEMPLATE constant sql_char := 
      q'^de.condes.plugin.apexTree.Region('##REGION_STATIC_ID#', {
        ajaxIdentifier: '#AJAX_IDENTIFIER#',
        tree$: $('##REGION_STATIC_ID#_TREE'),
        treeId: '#REGION_STATIC_ID#_TREE',
        treeAction: #TREE_ACTION#,
        itemsToSubmit: [#ITEMS_TO_SUBMIT|'|'|#],
        iconType: '#ICON_TYPE#',
        data:{
          config:{
            hasIdentity:true,
            rootAdded:#SHOW_ROOT#
          },
          data:{}
        }
      })^';
    
    l_result apex_plugin.t_region_render_result;
    l_js max_char;
    l_action_type p_region.attribute_01%type;
    l_icon_type p_region.attribute_02%type;
  begin
  
    apex_plugin_util.debug_region(
      p_plugin => p_plugin,
      p_region => p_region,
      p_is_printer_friendly => p_is_printer_friendly);
      
    -- Map attributes to local variables
    l_action_type := p_region.attribute_01;
    l_icon_type := p_region.attribute_02;
      
    htp.p(utl_text.bulk_replace(C_REGION_TEMPLATE, char_table(
            '#REGION_STATIC_ID#', p_region.static_id)));

    -- prepare and add JavaScript to instantiate the plugin
    l_js := utl_text.bulk_replace(C_JS_TEMPLATE, char_table(
              '#REGION_STATIC_ID#', p_region.static_id,
              '#AJAX_IDENTIFIER#', apex_plugin.get_ajax_identifier,
              '#TREE_ACTION#', case l_action_type when 'D' then '''activate''' else 'false' end,
              '#ICON_TYPE#', l_icon_type,
              '#SHOW_ROOT#', case g_root_count when 1 then 'false' else 'true' end,
              '#ITEMS_TO_SUBMIT#', p_region.ajax_items_to_submit));

    apex_javascript.add_onload_code(p_code => l_js);
    
    return l_result;
  end render_region;
  
  
  procedure render_item (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_render_param,
    p_result in out nocopy apex_plugin.t_item_render_result)
  as
    C_ITEM_TEMPLATE constant sql_char := 
      q'^<div id="#ITEM_ID#_CONTAINER" class="apex-item-tree">
           <input id="#ITEM_ID#" name="#ITEM_NAME#" class="selectlist #ITEM_CLASSES#" type="text" size="30" maxlength="" style="display:none" value="#VALUE#"/>
           <div id="#ITEM_ID#_TREE" class="apex-item-tree--tree"/>
         </div>^';

    C_JS_TEMPLATE constant sql_char := 
      q'^de.condes.plugin.apexTree.Item('##ITEM_ID#', {
        ajaxIdentifier: '#AJAX_IDENTIFIER#',
        tree$: $('##ITEM_ID#'),
        treeId: '#ITEM_ID#_TREE',
        treeAction: false,
        treeValueItem: '#ITEM_ID#',
        cascadingLovSelector:'##CASCADING_LOV#',
        itemsToSubmit: [#CASCADING_LOV|'|'|##ITEMS_TO_SUBMIT|,'|'|#],
        iconType: '#ICON_TYPE#',
        data:{
          config:{
            hasIdentity:true,
            rootAdded:false
          },
          data:{}
        }
      })^';
    
    l_js max_char;
    l_icon_type p_item.attribute_02%type;
  begin
    apex_plugin_util.debug_page_item(
      p_plugin => p_plugin,
      p_page_item => p_item,
      p_value => p_param.value,
      p_is_readonly => p_param.is_readonly,
      p_is_printer_friendly => p_param.is_printer_friendly);
      
    -- Map attributes to local variables
    l_icon_type := p_item.attribute_01;
      
    -- write HTML code
    htp.p(utl_text.bulk_replace(C_ITEM_TEMPLATE, char_table(
            '#ITEM_ID#', p_item.name,
            '#ITEM_NAME#', apex_plugin.get_input_name_for_page_item(false),
            '#ITEM_CLASSES#', p_item.element_css_classes,
            '#VALUE#', p_param.value)));

    -- prepare and add JavaScript to instantiate the plugin
    l_js := utl_text.bulk_replace(C_JS_TEMPLATE, char_table(
              '#AJAX_IDENTIFIER#', apex_plugin.get_ajax_identifier,
              '#CASCADING_LOV#', p_item.lov_cascade_parent_items,
              '#ICON_TYPE#', l_icon_type,
              '#SHOW_ROOT#', case g_root_count when 1 then 'false' else 'true' end,
              '#ITEMS_TO_SUBMIT#', p_item.ajax_items_to_submit,
              '#ITEM_ID#', p_item.name));

    apex_javascript.add_onload_code(p_code => l_js);
  end render_item;
  
  
  procedure get_item_metadata (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_meta_data_param,
    p_result in out nocopy apex_plugin.t_item_meta_data_result)
  as
    l_result apex_plugin.t_page_item_validation_result;
  begin
    -- Stub
    null;
  end get_item_metadata;
  
  
  procedure validate_item(
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_validation_param,
    p_result in out nocopy apex_plugin.t_item_validation_result)
  as
  begin
    -- Stub
    null;
  end validate_item;
  
  
  function refresh_region(
    p_region in apex_plugin.t_region,
    p_plugin in apex_plugin.t_plugin)
  return apex_plugin.t_region_ajax_result
  as
    l_result apex_plugin.t_region_ajax_result;
  begin
    print_json(p_stmt => p_region.source);
    return l_result;
  exception
    when NO_DATA_FOUND then
      print_no_data_found(p_region.no_data_found_message);
      return l_result;
  end refresh_region;
  
  
  procedure refresh_item (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_ajax_param,
    p_result in out nocopy apex_plugin.t_item_ajax_result)
  as
    l_no_data_found_message sql_char;
  begin
    l_no_data_found_message := p_item.attribute_02;
    print_json(p_stmt => p_item.lov_definition);
  exception
    when NO_DATA_FOUND then
      print_no_data_found(l_no_data_found_message);
  end refresh_item;

end plugin_apex_tree;
/