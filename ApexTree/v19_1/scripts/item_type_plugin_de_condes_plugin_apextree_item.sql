prompt --application/set_environment
set define off verify off feedback off
whenever sqlerror exit sql.sqlcode rollback
--------------------------------------------------------------------------------
--
-- ORACLE Application Express (APEX) export file
--
-- You should run the script connected to SQL*Plus as the Oracle user
-- APEX_190100 or as the owner (parsing schema) of the application.
--
-- NOTE: Calls to apex_application_install override the defaults below.
--
--------------------------------------------------------------------------------
begin
wwv_flow_api.import_begin (
 p_version_yyyy_mm_dd=>'2019.03.31'
,p_release=>'19.1.0.00.15'
,p_default_workspace_id=>2155262533268468
,p_default_application_id=>104
,p_default_owner=>'APEX_BUCH'
);
end;
/
prompt --application/shared_components/plugins/item_type/de_condes_plugin_apextree_item
begin
wwv_flow_api.create_plugin(
 p_id=>wwv_flow_api.id(31688910991280037)
,p_plugin_type=>'ITEM TYPE'
,p_name=>'DE.CONDES.PLUGIN.APEXTREE.ITEM'
,p_display_name=>'APEX Tree Item'
,p_supported_ui_types=>'DESKTOP'
,p_supported_component_types=>'APEX_APPLICATION_PAGE_ITEMS:APEX_APPL_PAGE_IG_COLUMNS'
,p_image_prefix=>'/de/condes/plugin/apexTree/v19_1/'
,p_javascript_file_urls=>wwv_flow_string.join(wwv_flow_t_varchar2(
'#PLUGIN_FILES#js/treeViewWrapper.js',
'#PLUGIN_FILES#js/Item.js',
'#IMAGE_PREFIX#libraries/apex/#MIN_DIRECTORY#widget.treeView#MIN#.js'))
,p_css_file_urls=>'#PLUGIN_FILES#css/apexTree.css'
,p_api_version=>2
,p_render_function=>'plugin_apex_tree.render_item'
,p_meta_data_function=>'plugin_apex_tree.get_item_metadata'
,p_ajax_function=>'plugin_apex_tree.refresh_item'
,p_validation_function=>'plugin_apex_tree.validate_item'
,p_standard_attributes=>'VISIBLE:SESSION_STATE:READONLY:SOURCE:ELEMENT:LOV:CASCADING_LOV:INIT_JAVASCRIPT_CODE'
,p_substitute_attributes=>true
,p_subscribe_plugin_settings=>true
,p_help_text=>wwv_flow_string.join(wwv_flow_t_varchar2(
'<p>This plugin encapsulates apex.treeView in a page item to quickly select multiple entries in a hierarchical data set.</p>',
'<p>As it encapsulates <pre>apex.treeView</pre>, the requirement is to provide it with a LOV query that adheres to the standards of <pre>apex.treeView</pre>.</p>',
'<p>Here is a sample query to provide the element with data:</p>',
'<pre> select case when connect_by_isleaf = 1 then 0 when level = 1 then 1 else -1 end as status,',
'        level,',
'        ename as title,',
'        ''icon-tree-folder'' as icon,',
'        empno as value,',
'        ename as tooltip,',
'        null  as link',
'   from emp',
'  start with mgr is null',
'connect by prior empno = mgr',
'  order siblings by ename</pre>',
'<p>When using this plugin, you cannot specifiy a link, as we don''t want to navigate away from the plugin but select multiple values only.</p>'))
,p_version_identifier=>'1.0'
);
wwv_flow_api.create_plugin_attribute(
 p_id=>wwv_flow_api.id(31689481581325785)
,p_plugin_id=>wwv_flow_api.id(31688910991280037)
,p_attribute_scope=>'COMPONENT'
,p_attribute_sequence=>1
,p_display_sequence=>10
,p_prompt=>'Icon Type'
,p_attribute_type=>'TEXT'
,p_is_required=>false
,p_default_value=>'fa'
,p_supported_ui_types=>'DESKTOP'
,p_is_translatable=>false
,p_help_text=>'<p>A CSS class used to specify the type of icons used for all nodes. This class is used in CSS rules to specify properties for all icons of that type. The icon type along with the value of the icon column of the region source determines the icon used'
||' for each node.</p>'
);
wwv_flow_api.create_plugin_attribute(
 p_id=>wwv_flow_api.id(17108881124940804)
,p_plugin_id=>wwv_flow_api.id(31688910991280037)
,p_attribute_scope=>'COMPONENT'
,p_attribute_sequence=>2
,p_display_sequence=>20
,p_prompt=>'No data found message'
,p_attribute_type=>'TEXT'
,p_is_required=>false
,p_default_value=>'No data found.'
,p_supported_component_types=>'APEX_APPLICATION_PAGE_ITEMS:APEX_APPL_PAGE_IG_COLUMNS'
,p_is_translatable=>true
,p_help_text=>'Defines a message that is shown if no data are found. Comparable to the respective attribute in region types.'
);
wwv_flow_api.create_plugin_std_attribute(
 p_id=>wwv_flow_api.id(17076044924162771)
,p_plugin_id=>wwv_flow_api.id(31688910991280037)
,p_name=>'INIT_JAVASCRIPT_CODE'
,p_is_required=>false
,p_supported_ui_types=>'DESKTOP'
,p_depending_on_has_to_exist=>true
,p_help_text=>'<p>The options you can specify here are the same as with an <pre>apex.treeView</pre> region. Be aware though that some options may not work as expected, as the item plugin overrides some of the default behaviours.</p>'
);
wwv_flow_api.create_plugin_std_attribute(
 p_id=>wwv_flow_api.id(17096513449655520)
,p_plugin_id=>wwv_flow_api.id(31688910991280037)
,p_name=>'LOV'
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
