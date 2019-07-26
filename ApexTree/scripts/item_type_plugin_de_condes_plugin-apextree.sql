set define off verify off feedback off
whenever sqlerror exit sql.sqlcode rollback
--------------------------------------------------------------------------------
--
-- ORACLE Application Express (APEX) export file
--
-- You should run the script connected to SQL*Plus as the Oracle user
-- APEX_050000 or as the owner (parsing schema) of the application.
--
-- NOTE: Calls to apex_application_install override the defaults below.
--
--------------------------------------------------------------------------------
begin
wwv_flow_api.import_begin (
 p_version_yyyy_mm_dd=>'2013.01.01'
,p_release=>'5.0.4.00.12'
,p_default_workspace_id=>2820680336516773
,p_default_application_id=>100
,p_default_owner=>'DRV'
);
end;
/
prompt --application/ui_types
begin
null;
end;
/
prompt --application/shared_components/plugins/item_type/de_condes_plugin_apextree
begin
wwv_flow_api.create_plugin(
 p_id=>wwv_flow_api.id(14626671305323684)
,p_plugin_type=>'ITEM TYPE'
,p_name=>'DE.CONDES.PLUGIN-APEXTREE'
,p_display_name=>'APEX Tree Item'
,p_supported_ui_types=>'DESKTOP'
,p_javascript_file_urls=>wwv_flow_utilities.join(wwv_flow_t_varchar2(
'/de/condes/plugin/apexTree/js/treeViewWrapper.js',
'/de/condes/plugin/apexTree/js/Item.js'))
,p_css_file_urls=>'/de/condes/plugin/apexTree/css/apexTree.css'
,p_render_function=>'plugin_apex_tree.render_item'
,p_ajax_function=>'plugin_apex_tree.refresh_item'
,p_validation_function=>'plugin_apex_tree.validate_item'
,p_standard_attributes=>'VISIBLE:SESSION_STATE:READONLY:SOURCE:ELEMENT:WIDTH:HEIGHT:LOV:LOV_REQUIRED:CASCADING_LOV'
,p_sql_min_column_count=>7
,p_sql_max_column_count=>7
,p_sql_examples=>wwv_flow_utilities.join(wwv_flow_t_varchar2(
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
,p_substitute_attributes=>true
,p_subscribe_plugin_settings=>true
,p_help_text=>wwv_flow_utilities.join(wwv_flow_t_varchar2(
'<p>This plugin encapsulates apex.treeView in a page item. By doing this, it is now easy and convenient, to get or set the value of the tree.</p>',
'<p>It extends apex.treeView with the following options:</p>',
'<ul><li>Refreshable</li><li>Tristate checkboxes to select entries</li><li>Possibility to get/set value<li></ul>',
'<p>It does not support some features of normale apex.treeView instances which are geared towards using them as a region for navigation:</p>',
'<ul><li>Does not support links</li><li>Does not support actions</li><li>To control width/height, it''s better to wrap the item in an invisible region</ul>'))
,p_version_identifier=>'1.0'
);
wwv_flow_api.create_plugin_attribute(
 p_id=>wwv_flow_api.id(14627241895369432)
,p_plugin_id=>wwv_flow_api.id(14626671305323684)
,p_attribute_scope=>'COMPONENT'
,p_attribute_sequence=>2
,p_display_sequence=>20
,p_prompt=>'Icon Type'
,p_attribute_type=>'TEXT'
,p_is_required=>false
,p_default_value=>'fa'
,p_supported_ui_types=>'DESKTOP'
,p_is_translatable=>false
,p_help_text=>'<p>A CSS class used to specify the type of icons used for all nodes. This class is used in CSS rules to specify properties for all icons of that type. The icon type along with the value of the icon column of the region source determines the icon used'
||' for each node.</p>'
);
end;
/
begin
wwv_flow_api.import_end(p_auto_install_sup_obj => nvl(wwv_flow_application_install.get_auto_install_sup_obj, false), p_is_component_import => true);
commit;
end;
/
set verify on feedback on define on
prompt  ...done
