prompt --application/set_environment
set define off verify off feedback off
whenever sqlerror exit sql.sqlcode rollback
--------------------------------------------------------------------------------
--
-- ORACLE Application Express (APEX) export file
--
-- You should run the script connected to SQL*Plus as the Oracle user
-- APEX_190200 or as the owner (parsing schema) of the application.
--
-- NOTE: Calls to apex_application_install override the defaults below.
--
--------------------------------------------------------------------------------
begin
wwv_flow_api.import_begin (
 p_version_yyyy_mm_dd=>'2019.10.04'
,p_release=>'19.2.0.00.18'
,p_default_workspace_id=>100200
,p_default_application_id=>105
,p_default_id_offset=>-13908121046328692
,p_default_owner=>'ITCO'
);
end;
/
 
prompt APPLICATION 105 - ITCO
--
-- Application Export:
--   Application:     105
--   Name:            ITCO
--   Date and Time:   11:26 Mittwoch Juni 3, 2020
--   Exported By:     EXT7101
--   Flashback:       0
--   Export Type:     Component Export
--   Manifest
--     PLUGIN: 913966434130314
--   Manifest End
--   Version:         19.2.0.00.18
--   Instance ID:     69326190028151
--

begin
  -- replace components
  wwv_flow_api.g_mode := 'REPLACE';
end;
/
prompt --application/shared_components/plugins/item_type/de_condes_plugin_tree_item
begin
wwv_flow_api.create_plugin(
 p_id=>wwv_flow_api.id(913966434130314)
,p_plugin_type=>'ITEM TYPE'
,p_name=>'DE.CONDES.PLUGIN.TREE_ITEM'
,p_display_name=>'Tree Item'
,p_supported_ui_types=>'DESKTOP'
,p_supported_component_types=>'APEX_APPLICATION_PAGE_ITEMS'
,p_image_prefix=>'/de/condes/plugin/apexTree/v19_1/'
,p_javascript_file_urls=>wwv_flow_string.join(wwv_flow_t_varchar2(
'#PLUGIN_FILES#js/widget.treeItem.js',
'#PLUGIN_FILES#js/treeItem.js'))
,p_css_file_urls=>'#PLUGIN_FILES#css/treeItem.css'
,p_api_version=>2
,p_render_function=>'plugin_tree_item.render'
,p_ajax_function=>'plugin_tree_item.refresh'
,p_validation_function=>'plugin_tree_item.validate'
,p_standard_attributes=>'VISIBLE:SESSION_STATE:READONLY:SOURCE:ELEMENT:WIDTH:HEIGHT:LOV:CASCADING_LOV'
,p_substitute_attributes=>true
,p_subscribe_plugin_settings=>true
,p_help_text=>wwv_flow_string.join(wwv_flow_t_varchar2(
'<p>This plugin encapsulates apex.treeView in a page item. By doing this, it is now easy and convenient, to get or set the value of the tree.</p>',
'<p>It extends apex.treeView with the following options:</p>',
'<ul><li>Refreshable</li><li>Tristate checkboxes to select entries</li><li>Possibility to get/set value<li></ul>',
'<p>It does not support some features of normale apex.treeView instances which are geared towards using them as a region for navigation:</p>',
'<ul><li>Does not support links</li><li>Does not support actions</li><li>To control width/height, it''s better to wrap the item in an invisible region</ul>'))
,p_version_identifier=>'1.0'
,p_files_version=>8
);
wwv_flow_api.create_plugin_attribute(
 p_id=>wwv_flow_api.id(914141191130315)
,p_plugin_id=>wwv_flow_api.id(913966434130314)
,p_attribute_scope=>'COMPONENT'
,p_attribute_sequence=>1
,p_display_sequence=>10
,p_prompt=>'No data found message'
,p_attribute_type=>'TEXT'
,p_is_required=>false
,p_default_value=>'Keine Daten gefunden'
,p_supported_ui_types=>'DESKTOP'
,p_is_translatable=>false
,p_help_text=>'<p>A CSS class used to specify the type of icons used for all nodes. This class is used in CSS rules to specify properties for all icons of that type. The icon type along with the value of the icon column of the region source determines the icon used'
||' for each node.</p>'
);
wwv_flow_api.create_plugin_attribute(
 p_id=>wwv_flow_api.id(914576846130317)
,p_plugin_id=>wwv_flow_api.id(913966434130314)
,p_attribute_scope=>'COMPONENT'
,p_attribute_sequence=>2
,p_display_sequence=>20
,p_prompt=>'Initially expand level'
,p_attribute_type=>'NUMBER'
,p_is_required=>false
,p_default_value=>'2'
,p_display_length=>1
,p_max_length=>1
,p_supported_ui_types=>'DESKTOP'
,p_is_translatable=>false
,p_help_text=>'<p>Defines a message that is shown if no data are found. Comparable to the respective attribute in region types.</p>'
);
wwv_flow_api.create_plugin_std_attribute(
 p_id=>wwv_flow_api.id(15409805019250350)
,p_plugin_id=>wwv_flow_api.id(913966434130314)
,p_name=>'LOV'
,p_sql_min_column_count=>7
,p_sql_max_column_count=>7
,p_examples=>wwv_flow_string.join(wwv_flow_t_varchar2(
' select case when connect_by_isleaf = 1 then 0 when level = 1 then 1 else -1 end as status,',
'        level,',
'        ename as title,',
'        ''icon-tree-folder'' as icon,',
'        empno as value,',
'        ename as tooltip,',
'        null  as link // Plugin does not support links. leave them NULL',
'   from emp',
'  start with mgr is null',
'connect by prior empno = mgr',
'  order siblings by ename'))
);
end;
/
prompt --application/end_environment
begin
wwv_flow_api.import_end(p_auto_install_sup_obj => nvl(wwv_flow_application_install.get_auto_install_sup_obj, false));
commit;
end;
/
set verify on feedback on define on
prompt  ...done
