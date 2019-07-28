/*global de.condes.plugin*/
/*!
 de.condes.plugin.apexTreeItem.js
 */
 
// Namespace
var de = de ||{};
de.condes = de.condes ||{};
de.condes.plugin = de.condes.plugin ||{};
de.condes.plugin.apexTree = de.condes.plugin.apexTree ||{};

/**
 * @fileOverview
 * The{@link de.condes.plugin}.apexTreeItem is used to render an apex tree as a page item
 * Depends:
 *   de.condes.plugin.apexTree.treeViewWrapper
 **/

 /**
  * IIFE to instantiate an instance of apexTreeItem as an extension to apex.item
  * @param{Object} tree Namespace object de.condes.plugin.apexTree
  * @param{Object} $ apex.JQuery
  * @param{Object} treeView Instance of de.condes.plugin.apexTree.treeViewWrapper, Interface to apex.widget.treeView
  */
(function(tree, $, treeView){
"use strict";
/**
 *
 * @param{String} pSelector jQuery selector to identify APEX page item for this plugin.
 * @param{Object} [pOptions] Options object to configure the instance
 *
 * @function apexTreeItem
 * @memberOf de.condes.plugin.apexTree
 * */
  tree.Region = function(pSelector, pOptions){

    // Default our options
    var item = $(pSelector),
        options;
        
    options = $.extend({
                self$: item,
                withCheckboxes: false,
                setValueCallback: function(values){},
                getValueCallback: function(){}
              }, pOptions);
    
    // Register apex.item callbacks
    $(pSelector).each(function(){
      treeView.init(options);
      treeView.refresh(options.treeId);
    });  //  APEX item callbacks

    // Clears the existing options and executes an AJAX call to get new values based
    // on the depending on fields
    function refresh(pEvent){
      treeView.refresh(options.treeId);
    } // refresh
    
    // register the refresh event which is triggered by a manual refresh
    item.bind("apexrefresh", refresh);
    item.bind("apexafterclosedialog", refresh);
  }; // apexTreeItem
})(de.condes.plugin.apexTree, apex.jQuery, de.condes.plugin.apexTree.treeViewWrapper);
