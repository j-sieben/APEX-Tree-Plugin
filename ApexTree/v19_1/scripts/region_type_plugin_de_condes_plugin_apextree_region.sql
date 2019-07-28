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
prompt --application/shared_components/plugins/region_type/de_condes_plugin_apextreeregion
begin
wwv_flow_api.create_plugin(
 p_id=>wwv_flow_api.id(14667037343534057)
,p_plugin_type=>'REGION TYPE'
,p_name=>'DE.CONDES.PLUGIN.APEXTREE.REGION'
,p_display_name=>'APEX Tree Region'
,p_supported_ui_types=>'DESKTOP'
,p_image_prefix=>'/de/condes/plugin/apexTree/v19_1/'
,p_javascript_file_urls=>wwv_flow_utilities.join(wwv_flow_t_varchar2(
'#PLUGIN_FILES#js/treeViewWrapper.js',
'#PLUGIN_FILES#js/Region.js',
'#IMAGE_PREFIX#libraries/apex/#MIN_DIRECTORY#widget.treeView#MIN#.js'))
,p_css_file_urls=>'#PLUGIN_FILES#css/apexTree.css'
,p_render_function=>'plugin_apex_tree.render_region'
,p_ajax_function=>'plugin_apex_tree.refresh_region'
,p_standard_attributes=>'SOURCE_SQL:SOURCE_REQUIRED:AJAX_ITEMS_TO_SUBMIT:NO_DATA_FOUND_MESSAGE'
,p_sql_min_column_count=>7
,p_sql_max_column_count=>7
,p_sql_examples=>wwv_flow_utilities.join(wwv_flow_t_varchar2(
' select case when connect_by_isleaf = 1 then 0 when level = 1 then 1 else -1 end as status,',
'        level,',
'        ename as title,',
'        ''icon-tree-folder'' as icon,',
'        empno as value,',
'        ename as tooltip,',
'        null  as link // If used to edit the entries, create the url with triggering item support',
'   from emp',
'  start with mgr is null',
'connect by prior empno = mgr',
'  order siblings by ename'))
,p_substitute_attributes=>true
,p_subscribe_plugin_settings=>true
,p_version_identifier=>'1.0'
);
wwv_flow_api.create_plugin_attribute(
 p_id=>wwv_flow_api.id(14667642213575028)
,p_plugin_id=>wwv_flow_api.id(14667037343534057)
,p_attribute_scope=>'COMPONENT'
,p_attribute_sequence=>1
,p_display_sequence=>10
,p_prompt=>'Activate Action with'
,p_attribute_type=>'SELECT LIST'
,p_is_required=>true
,p_default_value=>'S'
,p_is_translatable=>false
,p_lov_type=>'STATIC'
);
wwv_flow_api.create_plugin_attr_value(
 p_id=>wwv_flow_api.id(14667954752576192)
,p_plugin_attribute_id=>wwv_flow_api.id(14667642213575028)
,p_display_sequence=>10
,p_display_value=>'Single Click'
,p_return_value=>'S'
);
wwv_flow_api.create_plugin_attr_value(
 p_id=>wwv_flow_api.id(14668320174577107)
,p_plugin_attribute_id=>wwv_flow_api.id(14667642213575028)
,p_display_sequence=>20
,p_display_value=>'Double Click'
,p_return_value=>'D'
);
wwv_flow_api.create_plugin_attribute(
 p_id=>wwv_flow_api.id(14668900356581643)
,p_plugin_id=>wwv_flow_api.id(14667037343534057)
,p_attribute_scope=>'COMPONENT'
,p_attribute_sequence=>2
,p_display_sequence=>20
,p_prompt=>'Icon Type'
,p_attribute_type=>'TEXT'
,p_is_required=>false
,p_default_value=>'fa'
,p_is_translatable=>false
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
