prompt --application/set_environment
set define off verify off feedback off
whenever sqlerror exit sql.sqlcode rollback

begin
wwv_flow_api.import_begin (
 p_version_yyyy_mm_dd=>'2024.05.31'
,p_release=>'19.1.0'
,p_default_workspace_id=>100200
,p_default_application_id=>105
,p_default_id_offset=>0
,p_default_owner=>'ITCO'
);
end;
/

begin
  wwv_flow_api.g_mode := 'REPLACE';
end;
/

prompt --application/shared_components/plugins/item_type/de_condes_plugin_tree_item
begin
wwv_flow_api.create_plugin(
 p_id=>wwv_flow_api.id(240000000000001)
,p_plugin_type=>'ITEM TYPE'
,p_name=>'DE.CONDES.PLUGIN.TREE_ITEM'
,p_display_name=>'Tree Item'
,p_supported_ui_types=>'DESKTOP'
,p_supported_component_types=>'APEX_APPLICATION_PAGE_ITEMS'
,p_image_prefix=>'/de/condes/plugin/apexTree/'
,p_javascript_file_urls=>wwv_flow_string.join(wwv_flow_t_varchar2(
'#IMAGE_PREFIX#libraries/apex/#MIN_DIRECTORY#widget.treeView#MIN#.js',
'#PLUGIN_FILES#core/javascript/js/namespace.js',
'#PLUGIN_FILES#core/javascript/js/valueCodec.js',
'#PLUGIN_FILES#core/javascript/js/checkStateModel.js',
'#PLUGIN_FILES#core/javascript/js/checkboxRenderer.js',
'#PLUGIN_FILES#core/javascript/js/adapterRegistry.js',
'#PLUGIN_FILES#core/javascript/js/baseTreeAdapter.js',
'#PLUGIN_FILES#adapters/apex19/apexTreeAdapter.js',
'#PLUGIN_FILES#core/javascript/js/apexTreeItem.js'))
,p_css_file_urls=>'#PLUGIN_FILES#core/javascript/css/apexTreeItem.css'
,p_api_version=>2
,p_render_function=>'plugin_tree_item.render'
,p_meta_data_function=>'plugin_tree_item.get_metadata'
,p_ajax_function=>'plugin_tree_item.refresh'
,p_validation_function=>'plugin_tree_item.validate'
,p_standard_attributes=>'VISIBLE:SESSION_STATE:READONLY:SOURCE:ELEMENT:WIDTH:HEIGHT:LOV:CASCADING_LOV'
,p_substitute_attributes=>true
,p_subscribe_plugin_settings=>true
,p_help_text=>wwv_flow_string.join(wwv_flow_t_varchar2(
'<p>Renders hierarchical LOV data with the native APEX treeView widget and adds plugin-managed tri-state checkboxes.</p>',
'<p>The item value is a colon separated list of checked leaf node IDs. Parent checkbox states are calculated from checked leaf nodes.</p>',
'<p>Native tree selection is used only for tree interaction and focus. It is not used as the page item value.</p>'))
,p_version_identifier=>'2.0'
,p_files_version=>1
);

wwv_flow_api.create_plugin_attribute(
 p_id=>wwv_flow_api.id(240000000000002)
,p_plugin_id=>wwv_flow_api.id(240000000000001)
,p_attribute_scope=>'COMPONENT'
,p_attribute_sequence=>1
,p_display_sequence=>10
,p_prompt=>'No data found message'
,p_attribute_type=>'TEXT'
,p_is_required=>false
,p_default_value=>'No data found'
,p_supported_ui_types=>'DESKTOP'
,p_is_translatable=>true
,p_help_text=>'<p>Message shown in the item area when the LOV source returns no rows.</p>'
);

wwv_flow_api.create_plugin_std_attribute(
 p_id=>wwv_flow_api.id(240000000000005)
,p_plugin_id=>wwv_flow_api.id(240000000000001)
,p_name=>'LOV'
,p_sql_min_column_count=>6
,p_sql_max_column_count=>6
,p_examples=>wwv_flow_string.join(wwv_flow_t_varchar2(
'select case when connect_by_isleaf = 1 then 0 else 1 end as status,',
'       level,',
'       ename as title,',
'       ''fa-folder'' as icon,',
'       empno as value,',
'       ename as tooltip',
'  from emp',
' start with mgr is null',
'connect by prior empno = mgr',
' order siblings by ename'))
);
end;
/

begin
wwv_flow_api.import_end(p_auto_install_sup_obj => nvl(wwv_flow_application_install.get_auto_install_sup_obj, false));
commit;
end;
/

set verify on feedback on define on
prompt  ...done
