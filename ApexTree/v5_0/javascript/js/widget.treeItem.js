
 
// Namespace
var de = de || {};
de.condes = de.condes || {};
de.condes.plugin = de.condes.plugin || {};
de.condes.plugin.widget = de.condes.plugin.widget || {};

var C_APEX_AFTER_REFRESH_EVENT = 'apexafterrefresh';

/**
 * The{@link apex.widget}.treeItem is used for APEX treeItem item widgets of Oracle Application Express.
 **/
/*global apex, $v, $s*/
(function(widget, $, util){

/**
 * @param{String} pSelector jQuery selector to identify APEX page item(s) for this widget.
 * @param{Object} [pOptions]
 *
 * @function treeItem
 * @memberOf apex.widget
 * */
widget.treeItem = function(pSelector, pStaticData, pOptions){

  
  // Default our options and store them with the "global" prefix, because it's
  // used by the different functions as closure
  var defaultTypeData = {
        "default": {
          operations: {}
        }
      },
      types = $.extend(true, {}, defaultTypeData),
      hasTooltip = pOptions.nodeHasTooltip,
      treeItem$ = $(pSelector, apex.gPageContext$),
      gOptions = $.extend({
                   getNodeAdapter: function() {
                     return (de.condes.plugin.treeItem.makeDefaultNodeAdapter)(pStaticData, types, true);
                   },
                   tooltip: hasTooltip ? {
                     show: apex.tooltipManager.defaultShowOption(),
                     content: function (callback, node){
                       if (!node) {
                         return null;
                       }
                       return node.tooltip;
                     }
                   } : null,
                   navigation: true
                 }, pOptions);
      tree$ = $('#' + pOptions.treeId, apex.gPageContext$);

  // Register apex.item callbacks
  $(pSelector, apex.gPageContext$).each(function(){
    var lFieldset = this,
        lItemImpl = {
          enable : function(){
            tree$.treeItem('enable');
          },
          disable : function(){
            tree$.treeItem('disable');
          },
          isDisabled : function(){
            return tree$.treeItem('isDisabled');
          },
          setValue : function(pValue, foo, pSuppressChangeEvent){
            tree$.treeItem('setSelectedNodes', pValue.split(':'));
            if (!pSuppressChangeEvent){
              $(this).trigger('change');
            };
          },
          getValue : function(){
            return tree$.treeItem('getValue');
          },
          nullValue : gOptions.nullValue,
          loadingIndicator : function(pLoadingIndicator$){
            return pLoadingIndicator$.appendTo(treeItem$);
          },
          displayValueFor: function(pValues){
            var display;
            return display;
          }
        };

    // If this is a cascading LOV, we need to define a reinit callback...
    if (gOptions.dependingOnSelector){

      lItemImpl.reinit = function(pValue){
        var i,
          self = this,
          lValueArray = ($.isArray(pValue) ? pValue : [ pValue ]);

        // clear all the values
        _clear();

        // return function for cascade: don't clear value, get new values, and set
        return function(){

          // get new values and set in the callback
          widget.util.cascadingLov(
            treeItem$,
            gOptions.ajaxIdentifier,
           {
              pageItems: $(gOptions.pageItemsToSubmit, apex.gPageContext$)
            },
           {
              optimizeRefresh: gOptions.optimizeRefresh,
              dependingOn: $(gOptions.dependingOnSelector, apex.gPageContext$),
              success: function(pData){
                _clear();
                _addResult(pData);

                // suppress change event because this is just reinstating the value that was already there
                self.setValue(pValue, null, true);
              },
              target: self.node
            }
          );
        }
      }
    }

    apex.widget.initPageItem(this.id, lItemImpl);
    tree$.treeItem(gOptions);

    // if it's a cascading treeItem we have to register change events for our masters
    if (gOptions.dependingOnSelector){
      $(gOptions.dependingOnSelector, apex.gPageContext$)
        .on("change", _triggerRefresh);
    }
    
    // register the refresh event which is triggered by triggerRefresh or a manual refresh
    treeItem$
      .on('apexrefresh', refresh);
    tree$
      .on('selectionChange', function() {
        $('#' + treeItem$.attr('id')).val(tree$.treeItem('getValue'));
      });

    _triggerRefresh();
  });
  // remove everything within the fieldset
  function _clear(){
    treeItem$.children(":not(legend)").remove();
  }

  // Triggers the "refresh" event of the checkbox/radiogroup fieldset which actually does the AJAX call
  function _triggerRefresh(){
    treeItem$.trigger("apexrefresh");
  } // triggerRefresh

  // Called by the AJAX success callback and adds the html snippet
  function _addResult(pData){
    // Refresh tree data
    tree$.treeItem('setData', pData);
    treeItem$.trigger(C_APEX_AFTER_REFRESH_EVENT);
  } // addResult
  

  // Clears the existing checkboxes/radiogroups and executes an AJAX call to get new values based
  // on the depending on fields
  function refresh(pEvent){

    apex.widget.util.cascadingLov(
      treeItem$,
      gOptions.ajaxIdentifier,
     {
        pageItems: $(gOptions.itemsToSubmit, apex.gPageContext$)
      },
     {
        optimizeRefresh: gOptions.optimizeRefresh,
        dependingOn: $(gOptions.dependingOnSelector, apex.gPageContext$),
        success: function(pData){
          _addResult(pData);

          // Set item default values if they have been passed to the Ajax call
          if (pData.hasOwnProperty("default")){
            $s(treeItem$[ 0 ], pData[ "default" ]);
          }
        },
        clear: _clear,
        target: pEvent.target
      });
  } // refresh

}; // treeItem

})(de.condes.plugin.widget, apex.jQuery, apex.util);
