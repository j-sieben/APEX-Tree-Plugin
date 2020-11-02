create or replace package body plugin_tree_item
as
  
  subtype sql_char is varchar2(4000 byte);
  subtype max_char is varchar2(32767 byte);

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
   * @param  p_stmt SQL statement to retrieve the hierachical values.
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
  
  
  /** Method to emit standard output if no data could be found */
  procedure print_no_data_found
  as
  begin
    apex_json.open_object;    
    apex_json.open_object('config');
    apex_json.write('hasIdentity', false);
    apex_json.write('rootAdded', false);  
    apex_json.close_object;  
    
    apex_json.open_object('data');
      apex_json.write('selectedNodes', to_char(null));
    apex_json.close_all;
  end print_no_data_found;
  
  
  /** Method to emit the retrieved data as a JSON data stream
   * @param [p_stmt] SQL statement to retrieve the hierachical values.
   * @usage  Is used to convert the result of GET_DATA to JSON and print it to the http stream
   */
  procedure print_json (
    p_stmt in varchar2,
    p_values in varchar2)
  as
    cursor value_cur(p_values in varchar2)
    is
    select column_value val
      from table(utl_text.string_to_table(p_values, ':'));
      
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
    
    apex_json.open_array('selectedNodes');  
    for v in value_cur(p_values) loop
      apex_json.write(v.val);
    end loop;
    apex_json.close_array;

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
  
  
  /* INTERFACE */
  procedure render_item (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_render_param,
    p_result in out nocopy apex_plugin.t_item_render_result)
  as
    C_ITEM_TEMPLATE constant sql_char := 
      q'^<div id="#ITEM_ID#_CONTAINER" class="apex-item-tree col col-12">
           <input id="#ITEM_ID#" name="#ITEM_NAME#" class="selectlist #ITEM_CLASSES#" type="text" size="30" maxlength="" style="display:none" value="#VALUE#"/>
           <div id="#ITEM_ID#_TREE"/>
         </div>^';

    C_JS_TEMPLATE constant sql_char := 
      q'^de.condes.plugin.widget.treeItem('##ITEM_ID#', {}, {
        ajaxIdentifier: '#AJAX_IDENTIFIER#',
        pageItemsToSubmit: [#CASCADING_LOV|'|'|##ITEMS_TO_SUBMIT|,'|'|#],
        noDataFoundMessage: '#NO_DATA_FOUND#',
        expandLevel: #EXPAND_LEVEL#,
        optimizeRefresh: #OPTIMIZE_REFRESH#,
        dependingOnSelector: '#CASCADING_LOV#',
        treeId: '#ITEM_ID#_TREE',
        nodeHasTooltip: true
      })^';
    l_js max_char;
    l_no_data_found_message p_item.attribute_01%type;
    l_expand_level p_item.attribute_02%type;
  begin
    apex_plugin_util.debug_page_item(
      p_plugin => p_plugin,
      p_page_item => p_item,
      p_value => p_param.value,
      p_is_readonly => p_param.is_readonly,
      p_is_printer_friendly => p_param.is_printer_friendly);
      
    -- Map attributes to local variables
    l_no_data_found_message := p_item.attribute_01;
    l_expand_level := p_item.attribute_02;
      
    -- write HTML code
    htp.p(utl_text.bulk_replace(C_ITEM_TEMPLATE, char_table(
            '#ITEM_ID#', p_item.name,
            '#ITEM_NAME#', apex_plugin.get_input_name_for_page_item(false),
            '#ITEM_CLASSES#', p_item.element_css_classes,
            '#VALUE#', p_param.value)));

    -- prepare and add JavaScript to instantiate the plugin
    l_js := utl_text.bulk_replace(C_JS_TEMPLATE, char_table(
              '#AJAX_IDENTIFIER#', apex_plugin.get_ajax_identifier,
              '#CASCADING_LOV#', case when p_item.lov_cascade_parent_items is not null then '#' || p_item.lov_cascade_parent_items end,
              '#NO_DATA_FOUND#', l_no_data_found_message,
              '#OPTIMIZE_REFRESH#', case when p_item.ajax_optimize_refresh then 'true' else 'false' end,
              '#EXPAND_LEVEL#', coalesce(l_expand_level, 2), 
              '#SHOW_ROOT#', case g_root_count when 1 then 'false' else 'true' end,
              '#ITEMS_TO_SUBMIT#', p_item.ajax_items_to_submit,
              '#ITEM_ID#', p_item.name));

    apex_javascript.add_onload_code(p_code => l_js);
  end render_item;
  
  
  procedure get_metadata_item (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_meta_data_param,
    p_result in out nocopy apex_plugin.t_item_meta_data_result)
  as
    l_result apex_plugin.t_page_item_validation_result;
  begin
    -- Stub
    null;
  end get_metadata_item;
  
  
  procedure validate_item (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_validation_param,
    p_result in out nocopy apex_plugin.t_item_validation_result)
  as
  begin
    -- Stub
    null;
  end validate_item;
  
  
  procedure refresh_item (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_ajax_param,
    p_result in out nocopy apex_plugin.t_item_ajax_result)
  as
  begin
    print_json(
      p_stmt => p_item.lov_definition,
      p_values => v(p_item.name));
  exception
    when NO_DATA_FOUND then
      print_no_data_found;
  end refresh_item;

end plugin_tree_item;