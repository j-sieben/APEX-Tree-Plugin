create or replace package body plugin_tree_item
as
  /**
   * Package: plugin_tree_item body
   *
   * Body for the APEX Tree Item server-side plugin integration.
   *
   * See the package specification for the public APEX callback contract. This
   * body contains helper routines for adapter selection, LOV execution and JSON
   * serialization.
   */

  subtype sql_char is varchar2(4000 byte);
  subtype max_char is varchar2(32767 byte);

  type tree_rec is record (
    node_status number,
    node_level number,
    node_title sql_char,
    node_icon sql_char,
    node_value sql_char,
    node_tooltip sql_char);

  type tree_tab is table of tree_rec index by pls_integer;

  c_column_count constant number := 6;

  type adapter_rec is record (
    name varchar2(30),
    min_major pls_integer,
    min_minor pls_integer);

  type adapter_tab is table of adapter_rec index by pls_integer;

  /**
   * Function: available_adapters
   *
   * Returns the JavaScript adapters shipped with this plugin and the minimum
   * APEX version each adapter supports.
   *
   * Returns:
   *   adapter_tab - List of adapter names and minimum APEX major/minor
   *                 versions.
   */
  function available_adapters
    return adapter_tab
  as
    l_adapters adapter_tab;
  begin
    l_adapters(1).name := 'apex19';
    l_adapters(1).min_major := 19;
    l_adapters(1).min_minor := 1;

    return l_adapters;
  end available_adapters;

  /**
   * Function: version_part
   *
   * Extracts a numeric version component from a version string.
   *
   * Parameters:
   *   p_version  - Version string such as `19.1.0` or `24.2.1`.
   *   p_position - One-based numeric component position to extract.
   *
   * Returns:
   *   pls_integer - Extracted version component, or `0` if it cannot be parsed.
   */
  function version_part (
    p_version in varchar2,
    p_position in pls_integer)
    return pls_integer
  as
  begin
    return to_number(regexp_substr(p_version, '\d+', 1, p_position));
  exception
    when value_error then
      return 0;
  end version_part;

  /**
   * Function: get_adapter_name
   *
   * Selects the newest compatible JavaScript adapter for the running APEX
   * version.
   *
   * The chosen adapter is the adapter with the highest minimum version that is
   * still less than or equal to the current APEX version.
   *
   * Returns:
   *   varchar2 - Adapter name passed to the JavaScript initialization call.
   *
   * Errors:
   *   Raises ORA-20000 if no compatible adapter is available.
   */
  function get_adapter_name
    return varchar2
  as
    l_apex_version varchar2(30) := apex_release.version;
    l_apex_major pls_integer := version_part(l_apex_version, 1);
    l_apex_minor pls_integer := version_part(l_apex_version, 2);
    l_adapters adapter_tab := available_adapters;
    l_best_name varchar2(30);
    l_best_major pls_integer := -1;
    l_best_minor pls_integer := -1;
  begin
    for idx in 1..l_adapters.count loop
      if l_adapters(idx).min_major < l_apex_major
         or (l_adapters(idx).min_major = l_apex_major and l_adapters(idx).min_minor <= l_apex_minor) then
        if l_adapters(idx).min_major > l_best_major
           or (l_adapters(idx).min_major = l_best_major and l_adapters(idx).min_minor > l_best_minor) then
          l_best_name := l_adapters(idx).name;
          l_best_major := l_adapters(idx).min_major;
          l_best_minor := l_adapters(idx).min_minor;
        end if;
      end if;
    end loop;

    if l_best_name is null then
      raise_application_error(-20000, 'No compatible APEX Tree Item adapter found for APEX ' || l_apex_version);
    end if;

    return l_best_name;
  end get_adapter_name;

  /**
   * Function: get_data
   *
   * Executes the item LOV SQL and converts the result into an internal
   * hierarchical row table.
   *
   * The LOV source must return exactly six columns: status, level, title, icon,
   * value and tooltip.
   *
   * Parameters:
   *   p_stmt - LOV SQL statement configured on the APEX item.
   *
   * Returns:
   *   tree_tab - Rows read from the LOV source.
   *
   * Errors:
   *   Errors from `apex_plugin_util.get_data2` or datatype conversion are
   *   allowed to propagate to APEX.
   */
  function get_data (
    p_stmt in varchar2)
    return tree_tab
  as
    l_source_result apex_plugin_util.t_column_value_list2;
    l_tree_tab tree_tab;
  begin
    l_source_result := apex_plugin_util.get_data2(
      p_sql_statement => p_stmt,
      p_min_columns => c_column_count,
      p_max_columns => c_column_count,
      p_component_name => null);

    for idx in 1..l_source_result(1).value_list.count loop
      l_tree_tab(idx).node_status := l_source_result(1).value_list(idx).number_value;
      l_tree_tab(idx).node_level := l_source_result(2).value_list(idx).number_value;
      l_tree_tab(idx).node_title := apex_plugin_util.get_value_as_varchar2(l_source_result(3).data_type, l_source_result(3).value_list(idx));
      l_tree_tab(idx).node_icon := apex_plugin_util.get_value_as_varchar2(l_source_result(4).data_type, l_source_result(4).value_list(idx));
      l_tree_tab(idx).node_value := apex_plugin_util.get_value_as_varchar2(l_source_result(5).data_type, l_source_result(5).value_list(idx));
      l_tree_tab(idx).node_tooltip := apex_plugin_util.get_value_as_varchar2(l_source_result(6).data_type, l_source_result(6).value_list(idx));
    end loop;

    return l_tree_tab;
  end get_data;

  /**
   * Procedure: print_no_data_found
   *
   * Writes a JSON no-data response to the HTTP output stream.
   *
   * Parameters:
   *   p_message - Message shown by the JavaScript item when no data is
   *               available.
   */
  procedure print_no_data_found (
    p_message in varchar2)
  as
  begin
    apex_json.open_object;
    apex_json.write('message', p_message);
    apex_json.close_object;
  end print_no_data_found;

  /**
   * Procedure: print_json
   *
   * Executes the LOV source and writes the tree data JSON response.
   *
   * The response contains a root `data` object. If the LOV has multiple level-1
   * rows, a synthetic root node is added so the native treeView receives a
   * single root object.
   *
   * Parameters:
   *   p_stmt - LOV SQL statement configured on the APEX item.
   *
   * Errors:
   *   Raises NO_DATA_FOUND if the LOV returns no rows. The public `refresh`
   *   callback converts this situation into a JSON message response.
   */
  procedure print_json (
    p_stmt in varchar2)
  as
    l_tree_tab tree_tab;
    l_prev_node_level number := 1;
    l_root_count number := 0;
  begin
    l_tree_tab := get_data(p_stmt);

    if l_tree_tab.count = 0 then
      raise no_data_found;
    end if;

    for idx in 1..l_tree_tab.count loop
      if l_tree_tab(idx).node_level = 1 then
        l_root_count := l_root_count + 1;
      end if;
    end loop;

    apex_json.open_object;
    apex_json.open_object('data');

    if l_root_count > 1 then
      apex_json.write('id', 'root0');
      apex_json.write('label', 'root');
      apex_json.open_array('children');
    end if;

    for idx in 1..l_tree_tab.count loop
      if l_tree_tab(idx).node_level < l_prev_node_level then
        for nesting_idx in 1..(l_prev_node_level - l_tree_tab(idx).node_level) loop
          apex_json.close_array;
          apex_json.close_object;
        end loop;
      end if;

      l_prev_node_level := l_tree_tab(idx).node_level;

      if not (l_root_count = 1 and l_tree_tab(idx).node_level = 1) then
        apex_json.open_object;
      end if;

      apex_json.write('id', l_tree_tab(idx).node_value);
      apex_json.write('label', l_tree_tab(idx).node_title);
      if l_tree_tab(idx).node_icon is not null then
        apex_json.write('icon', l_tree_tab(idx).node_icon);
      end if;
      if l_tree_tab(idx).node_tooltip is not null then
        apex_json.write('tooltip', l_tree_tab(idx).node_tooltip);
      end if;

      if l_tree_tab(idx).node_status = 0 then
        apex_json.close_object;
      else
        apex_json.open_array('children');
      end if;
    end loop;

    apex_json.close_all;
  end print_json;

  /**
   * Procedure: render
   *
   * See: <plugin_tree_item.render>
   */
  procedure render (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_render_param,
    p_result in out nocopy apex_plugin.t_item_render_result)
  as
    c_item_template constant max_char :=
      q'^<div id="#ITEM_ID#_CONTAINER" class="apex-tree-item">
           <input id="#ITEM_ID#" name="#ITEM_NAME#" class="apex-tree-item-value #ITEM_CLASSES#" type="hidden" value="#VALUE#"/>
           <div id="#ITEM_ID#_TREE" class="apex-tree-item-tree" role="tree"></div>
         </div>^';

    c_js_template constant max_char :=
      q'^de.condes.plugin.apexTreeItem.init('##ITEM_ID#', {
        ajaxIdentifier: '#AJAX_IDENTIFIER#',
        itemsToSubmit: [#CASCADING_LOV|'|'|##ITEMS_TO_SUBMIT|,'|'|#],
        noDataFoundMessage: #NO_DATA_FOUND#,
        dependingOnSelector: '#CASCADING_LOV#',
        treeId: '#ITEM_ID#_TREE',
        adapterName: '#ADAPTER_NAME#'
      })^';

    l_js max_char;
    l_no_data_found_message p_item.attribute_01%type;
  begin
    apex_plugin_util.debug_page_item(
      p_plugin => p_plugin,
      p_page_item => p_item,
      p_value => p_param.value,
      p_is_readonly => p_param.is_readonly,
      p_is_printer_friendly => p_param.is_printer_friendly);

    l_no_data_found_message := nvl(p_item.attribute_01, 'No data found');

    htp.p(utl_text.bulk_replace(c_item_template, char_table(
      '#ITEM_ID#', p_item.name,
      '#ITEM_NAME#', apex_plugin.get_input_name_for_page_item(false),
      '#ITEM_CLASSES#', p_item.element_css_classes,
      '#VALUE#', apex_escape.html_attribute(p_param.value))));

    l_js := utl_text.bulk_replace(c_js_template, char_table(
      '#CASCADING_LOV#', case when p_item.lov_cascade_parent_items is not null then '#' || p_item.lov_cascade_parent_items end,
      '#NO_DATA_FOUND#', apex_escape.js_literal(l_no_data_found_message),
      '#ADAPTER_NAME#', get_adapter_name,
      '#ITEMS_TO_SUBMIT#', p_item.ajax_items_to_submit,
      '#ITEM_ID#', p_item.name));
    l_js := replace(l_js, '#AJAX_IDENTIFIER#', apex_plugin.get_ajax_identifier);

    apex_javascript.add_onload_code(p_code => l_js);
  end render;

  /**
   * Procedure: get_metadata
   *
   * See: <plugin_tree_item.get_metadata>
   */
  procedure get_metadata (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_meta_data_param,
    p_result in out nocopy apex_plugin.t_item_meta_data_result)
  as
  begin
    null;
  end get_metadata;

  /**
   * Procedure: validate
   *
   * See: <plugin_tree_item.validate>
   */
  procedure validate (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_validation_param,
    p_result in out nocopy apex_plugin.t_item_validation_result)
  as
  begin
    null;
  end validate;

  /**
   * Procedure: refresh
   *
   * See: <plugin_tree_item.refresh>
   */
  procedure refresh (
    p_item in apex_plugin.t_item,
    p_plugin in apex_plugin.t_plugin,
    p_param in apex_plugin.t_item_ajax_param,
    p_result in out nocopy apex_plugin.t_item_ajax_result)
  as
  begin
    print_json(p_stmt => p_item.lov_definition);
  exception
    when no_data_found then
      print_no_data_found(nvl(p_item.attribute_01, 'No data found'));
  end refresh;
end plugin_tree_item;
/
