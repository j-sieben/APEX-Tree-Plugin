CREATE OR REPLACE PACKAGE BODY plugin_apex_tree
AS
  TYPE tree_rec IS RECORD (
    node_status NUMBER,
    node_level NUMBER,
    node_title utl_apex.sql_char,
    node_icon utl_apex.sql_char,
    node_value utl_apex.sql_char,
    node_tooltip utl_apex.sql_char,
    node_link utl_apex.sql_char);

  TYPE tree_tab IS TABLE OF tree_rec INDEX BY PLS_INTEGER;

  g_has_identity BOOLEAN DEFAULT TRUE;
  g_root_count NUMBER := 1;
  
  
  -------------------------------------------------------------------------------------------
  --  Function: get_data, Ermittelt die Daten der Region
  --
  --  Historie:
  --    18.07.2019 J. Sieben: Ersterstellung
  -------------------------------------------------------------------------------------------
  FUNCTION get_data (p_region_id IN NUMBER, 
                     p_stmt IN VARCHAR2)
  RETURN tree_tab
  AS
    l_query apex_application_page_trees.tree_query%TYPE;
    l_source_result apex_plugin_util.t_column_value_list2;
    l_tree_tab tree_tab;
    c_columns_count CONSTANT NUMBER := 7;
  BEGIN    
    -- Lese SQL-Abfrage aus Regions-Source
    IF p_region_id IS NOT NULL THEN
    SELECT tree_query 
      INTO l_query
      FROM apex_application_page_trees
     WHERE region_id = p_region_id;
    ELSE
      l_query := p_stmt;
    END IF;

    -- Abfrage ausfuehren
    l_source_result := apex_plugin_util.get_data2(
                         p_sql_statement => l_query,
                         p_min_columns => c_columns_count,
                         p_max_columns => c_columns_count,
                         p_component_name => NULL);

    -- Gefundene Daten in PL/SQL-Tabelle kopieren
    FOR idx IN 1..l_source_result(1).value_list.COUNT LOOP    
      l_tree_tab(idx).node_status := l_source_result(1).value_list(idx).number_value;
      l_tree_tab(idx).node_level := l_source_result(2).value_list(idx).number_value;
      l_tree_tab(idx).node_title := apex_plugin_util.get_value_as_varchar2(l_source_result(3).data_type, l_source_result(3).value_list(idx));
      l_tree_tab(idx).node_icon := apex_plugin_util.get_value_as_varchar2(l_source_result(4).data_type, l_source_result(4).value_list(idx));
      l_tree_tab(idx).node_value := apex_plugin_util.get_value_as_varchar2(l_source_result(5).data_type, l_source_result(5).value_list(idx));
      l_tree_tab(idx).node_tooltip := apex_plugin_util.get_value_as_varchar2(l_source_result(6).data_type, l_source_result(6).value_list(idx));
      l_tree_tab(idx).node_link := apex_plugin_util.get_value_as_varchar2(l_source_result(7).data_type, l_source_result(7).value_list(idx));

      IF l_tree_tab(idx).node_value IS NULL THEN
        g_has_identity := FALSE;
      END IF;

      IF l_tree_tab(idx).node_level = 1 THEN
        g_root_count := g_root_count + 1;
      END IF;    
    END LOOP;

    RETURN l_tree_tab;
  END get_data;
  -------------------------------------------------------------------------------------------
  
  
  -------------------------------------------------------------------------------------------
  --  Function: print_json, Schreibt die Daten als JSON in den http-Stream
  --
  --  Historie:
  --    18.07.2019 J. Sieben: Ersterstellung
  -------------------------------------------------------------------------------------------
  PROCEDURE print_json (p_region_id IN NUMBER DEFAULT NULL,
                        p_stmt      IN VARCHAR2 DEFAULT NULL)
  AS
    l_tree_tab tree_tab;
    l_prev_node_level NUMBER := 1;
  BEGIN
    l_tree_tab := get_data(p_region_id, p_stmt);

    apex_json.open_object;    
    apex_json.open_object('config');
    apex_json.WRITE('hasIdentity', g_has_identity);
    apex_json.WRITE('rootAdded', g_root_count > 1);  
    apex_json.close_object;    
    apex_json.open_object('data');

    IF g_root_count > 1 THEN    
      apex_json.WRITE('id', 'root0');
      apex_json.WRITE('label', 'root');
      apex_json.open_array('children');    
    END IF;

    FOR idx IN 1..l_tree_tab.COUNT LOOP    
      -- Schliesse geschachteltes Array
      IF l_tree_tab(idx).node_level < l_prev_node_level THEN      
        FOR nesting_idx IN 1..(l_prev_node_level - l_tree_tab(idx).node_level) LOOP          
          apex_json.close_array;
          apex_json.close_object;        
        END LOOP;      
      END IF;

      l_prev_node_level := l_tree_tab(idx).node_level;

      IF NOT (g_root_count = 1 AND l_tree_tab(idx).node_level = 1) THEN
        apex_json.open_object;
      END IF;

      apex_json.WRITE('id', l_tree_tab(idx).node_value);
      apex_json.WRITE('label', l_tree_tab(idx).node_title);
      apex_json.WRITE('icon', l_tree_tab(idx).node_icon);
      apex_json.WRITE('link', l_tree_tab(idx).node_link);
      apex_json.WRITE('tooltip', l_tree_tab(idx).node_tooltip);

      -- Datensatz ist Blatt, Objekt schliessen
      IF l_tree_tab(idx).node_status = 0 THEN      
        apex_json.close_object;    
      ELSE      
        apex_json.open_array('children');        
      END IF;    
    END LOOP;

    apex_json.close_all;
  END print_json;
  -------------------------------------------------------------------------------------------
  
  
  -------------------------------------------------------------------------------------------
  --  Function: render
  --
  --  Historie:
  --    18.07.2019 J. Sieben: Ersterstellung
  -------------------------------------------------------------------------------------------  
  FUNCTION render_region(p_region              IN apex_plugin.t_region,
                         p_plugin              IN apex_plugin.t_plugin,
                         p_is_printer_friendly IN BOOLEAN)
  RETURN apex_plugin.t_region_render_result
  AS
    c_item_template CONSTANT utl_apex.sql_char := q'^<div id="#REGION_STATIC_ID#"><div id="#REGION_STATIC_ID#_TREE"></div></div>^';

    c_js_template CONSTANT utl_apex.sql_char := 
      q'[de.condes.plugin.apexTree.Region('##REGION_STATIC_ID#', {
        ajaxIdentifier: '#AJAX_IDENTIFIER#',
        tree$: $('##REGION_STATIC_ID#_TREE'),
        treeId: '#REGION_STATIC_ID#_TREE',
        treeAction: '#TREE_ACTION#',
        itemsToSubmit: ['#ITEMS_TO_SUBMIT#'],
        iconType: '#ICON_TYPE#',
        data:{
          config:{
            hasIdentity:true,
            rootAdded:true
          },
          data:{}
        }
      })]';
    
    l_result apex_plugin.t_region_render_result;
    l_js utl_apex.max_char;
    l_action_type p_region.attribute_01%TYPE;
    l_icon_type p_region.attribute_02%TYPE;
  BEGIN
    pit.enter_mandatory;
  
    apex_plugin_util.debug_region(
      p_plugin => p_plugin,
      p_region => p_region,
      p_is_printer_friendly => p_is_printer_friendly);
      
    -- Map attributes to local variables
    l_action_type := p_region.attribute_01;
    l_icon_type := p_region.attribute_02;
      
    htp.p(utl_text.bulk_replace(c_item_template, char_table(
            '#REGION_STATIC_ID#', p_region.static_id)));

    -- prepare and add JavaScript to instantiate the plugin
    l_js := utl_text.bulk_replace(c_js_template, char_table(
              '#REGION_STATIC_ID#', p_region.static_id,
              '#AJAX_IDENTIFIER#', apex_plugin.get_ajax_identifier,
              '#TREE_ACTION#', l_action_type,
              '#ICON_TYPE#', l_icon_type,
              '#ITEMS_TO_SUBMIT#', p_region.ajax_items_to_submit));

    apex_javascript.add_onload_code(p_code => l_js);
    
    pit.leave_mandatory;
    return l_result;
  END render_region;
  -------------------------------------------------------------------------------------------
  
  
  -------------------------------------------------------------------------------------------
  --  Function: render
  --
  --  Historie:
  --    18.07.2019 J. Sieben: Ersterstellung
  -------------------------------------------------------------------------------------------  
  FUNCTION render_item(p_item                IN apex_plugin.t_page_item,
                       p_plugin              IN apex_plugin.t_plugin,
                       p_value               IN VARCHAR2,
                       p_is_readonly         IN BOOLEAN,
                       p_is_printer_friendly IN BOOLEAN)
  RETURN apex_plugin.t_page_item_render_result
  AS
    c_item_template CONSTANT utl_apex.sql_char := q'^
    <input id="#ITEM_ID#" name="#ITEM_NAME#" class="text_field apex-item-text #ITEM_CLASSES#" type="text" size="30" maxlength="" style="display:none" value="#VALUE#"/>
    <div id="#ITEM_ID#_TREE"></div>^';

    c_js_template CONSTANT utl_apex.sql_char := 
      q'[de.condes.plugin.apexTree.Item('##ITEM_ID#', {
        ajaxIdentifier: '#AJAX_IDENTIFIER#',
        tree$: $('##ITEM_ID#'),
        treeId: '#ITEM_ID#_TREE',
        treeAction: '#TREE_ACTION#',
        treeValueItem: '#ITEM_ID#',
        cascadingLovSelector:'##CASCADING_LOV#',
        itemsToSubmit: ['#CASCADING_LOV#', '#ITEMS_TO_SUBMIT#'],
        iconType: '#ICON_TYPE#',
        data:{
          config:{
            hasIdentity:true,
            rootAdded:true
          },
          data:{}
        }
      })]';
    
    l_result apex_plugin.t_page_item_render_result;
    l_js utl_apex.max_char;
    l_icon_type p_item.attribute_02%TYPE;
  BEGIN
    pit.enter_mandatory;
    
    apex_plugin_util.debug_page_item(
      p_plugin => p_plugin,
      p_page_item => p_item,
      p_value => p_value,
      p_is_readonly => p_is_readonly,
      p_is_printer_friendly => p_is_printer_friendly);
      
    -- Map attributes to local variables
    l_icon_type := p_item.attribute_02;
      
    -- write HTML code
    htp.p(utl_text.bulk_replace(c_item_template, char_table(
            '#ITEM_ID#', p_item.name,
            '#ITEM_NAME#', apex_plugin.get_input_name_for_page_item(FALSE),
            '#ITEM_CLASSES#', p_item.element_css_classes,
            '#VALUE#', p_value)));

    -- prepare and add JavaScript to instantiate the plugin
    l_js := utl_text.bulk_replace(c_js_template, char_table(
              '#AJAX_IDENTIFIER#', apex_plugin.get_ajax_identifier,
              '#CASCADING_LOV#', p_item.lov_cascade_parent_items,
              '#TREE_ACTION#', NULL,
              '#ICON_TYPE#', l_icon_type,
              '#ITEMS_TO_SUBMIT#', p_item.ajax_items_to_submit,
              '#ITEM_ID#', p_item.name));

    apex_javascript.add_onload_code(p_code => l_js);
    
    pit.leave_mandatory;
    RETURN l_result;
  END render_item;
  -------------------------------------------------------------------------------------------
  
  
  -------------------------------------------------------------------------------------------
  --  Function: render
  --
  --  Historie:
  --    18.07.2019 J. Sieben: Ersterstellung
  -------------------------------------------------------------------------------------------  
  FUNCTION validate_item (
    p_item   IN apex_plugin.t_page_item,
    p_plugin IN apex_plugin.t_plugin,
    p_value  IN VARCHAR2 )
    RETURN apex_plugin.t_page_item_validation_result
  AS
    l_result apex_plugin.t_page_item_validation_result;
  BEGIN
    pit.enter_mandatory;
    
    -- Stub, derzeit nicht genutzt
    
    pit.leave_mandatory;
    RETURN l_result;
  END validate_item;
  -------------------------------------------------------------------------------------------
  
  
  -------------------------------------------------------------------------------------------
  --  Function: render
  --
  --  Historie:
  --    18.07.2019 J. Sieben: Ersterstellung
  -------------------------------------------------------------------------------------------  
  FUNCTION refresh_region(p_region IN apex_plugin.t_region,
                          p_plugin IN apex_plugin.t_plugin )
  RETURN apex_plugin.t_region_ajax_result
  AS
    l_result apex_plugin.t_region_ajax_result;
  BEGIN
    pit.enter_mandatory;
    
    print_json(p_stmt => p_region.source);
    
    pit.leave_mandatory;
    RETURN l_result;
  END refresh_region;
  -------------------------------------------------------------------------------------------
  
  
  -------------------------------------------------------------------------------------------
  --  Function: render
  --
  --  Historie:
  --    18.07.2019 J. Sieben: Ersterstellung
  -------------------------------------------------------------------------------------------  
  FUNCTION refresh_item(p_item   IN apex_plugin.t_page_item,
                        p_plugin IN apex_plugin.t_plugin )
  RETURN apex_plugin.t_page_item_ajax_result
  AS
    l_result apex_plugin.t_page_item_ajax_result;
  BEGIN
    pit.enter_mandatory;
    
    print_json(p_stmt => p_item.lov_definition);
    
    pit.leave_mandatory;
    RETURN l_result;
  END refresh_item;
  -------------------------------------------------------------------------------------------

END plugin_apex_tree;
/