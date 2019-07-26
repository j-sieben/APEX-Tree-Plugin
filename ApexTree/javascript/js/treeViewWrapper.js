/*global de.condes.plugin*/
/*!
 de.condes.plugin.apexTreeItem.treeViewWrapper.js
 */
 
// Namespace
var de = de || {};
de.condes = de.condes || {};
de.condes.plugin = de.condes.plugin || {};
de.condes.plugin.apexTree = de.condes.plugin.apexTree || {};
de.condes.plugin.apexTree.treeViewWrapper = de.condes.plugin.apexTree.treeViewWrapper || {};

/**
 * @fileOverview
 * The{@link de.condes.plugin}.treeViewWrapper wraps apex.widget.treeView
 **/

(function(tree, $, server){
"use strict";
/**
 *
 * @param{String} pSelector jQuery selector to identify APEX page item for this widget.
 * @param{Object} [pOptions]
 *
 * @function treeViewWrapper
 * @memberOf de.condes.plugin
 * */
  var 
    C_TREE_CLASS = '.a-TreeView', 
    C_TREE_CONTENT_CLASS = '.a-TreeView-content', 
    C_TREE_CHECK_CLASS = 'treeSelCheck',
    C_TREE_CHECK_SELECTOR = '.' + C_TREE_CHECK_CLASS,
    C_TREE_FULL_CHECK_CLASS = 'fullChecked',
    C_TREE_PART_CHECK_CLASS = 'partChecked',
    C_APEX_AFTER_REFRESH_EVENT = 'apexafterrefresh',
    C_EXPAND_SELECTED_NODES = true,
    C_UNCHECKED = 0,
    C_CHECKED = 1;

  var gOptions = [], // global container for configuration data
      options; // configuration object of the actual instance
  
  // We need to extend the treeView widget to return the baseId
  $.widget('apex.treeView', $.apex.treeView, {
    getBaseId: function () {
      return this.baseId
    }
  })

  /**
   * Method to initialize a tree
   * @param{Object} [pOptions]
   */
  tree.init = function(pOptions) {    
    setOptions(pOptions);    
    configureTreeInstance(pOptions.treeId);
  }; // tree.init
  

  /**
   * Refresh tree data
   * @param{Object} [pOptions]
   */
  tree.refresh = function(pTreeId) {
    var tree$,
        promise;
    
    getOptions(pTreeId);
    
    promise = server.plugin(
          options.ajaxIdentifier, 
          {
            pageItems: options.itemsToSubmit
          }, 
          {
            loadingIndicator: options.tree$, 
            loadingIndicatorPosition: 'centered'
          });

    promise.done(function(data){refreshCallback(data, pTreeId);});
  }; // tree.refresh
  
  
  /**
   * Set the checked items of the tree
   * @param{String} pTreeId ID of the tree. If used as an item, this is <ITEM_ID>_TREE, when used as a region it's the region static id
   * @param{String} pValue Colon separated list of TreeNode IDs
   */
  tree.setValue = function(pTreeId, pValue){
    var selection = [];
    getOptions(pTreeId);
    if (options.withCheckboxes){
      updateChecked(options.topLevel, selection, pValue);
      updateChildrenCheckboxes(options.topLevel, options.tree$, C_EXPAND_SELECTED_NODES);
      options.setValueCallback(pValue);
    };
  }; // tree.setValue
  
  
  /** 
   * Setter/Getter to persist the options in an array of options. Useful if mor than one instance is used on the page
   */
  function setOptions(pOptions){
    gOptions[pOptions.treeId.toString()] = pOptions;
    options = pOptions;
  }; // setOptions
  
  
  function getOptions(pTreeId){
    options = gOptions[pTreeId.toString()];
  }; // getOptions
  
  
  /**
   * Method to create or configure an apex.treeView instance
   */
  function configureTreeInstance(pTreeId){
    var treeOptions;
    getOptions(pTreeId);
    if (typeof options.tree$.treeView.data == 'undefined') {
      treeOptions = {
        multiple: options.withCheckboxes
      };
      
      apex.widget.tree.init(
        options.treeId, treeOptions, options.data, options.treeAction, options.treeValueItem, 
        options.data.config.hasIdentity, options.data.config.rootAdded, options.hasTooltips, options.iconType);
      options.tree$ = $(`#${options.treeId}`);
    }
    
    // Refresh-Methode an Region binden
    $('#' + options.treeId).on('apexrefresh', options.refresh);
    
    configureCheckboxes(pTreeId);
  }; // configureTreeInstance
  
  
  function configureCheckboxes(pTreeId){
    if(options.withCheckboxes){
      // user specific renderer to render check boxes
      options.tree$.treeView('getNodeAdapter').renderNodeContent = renderCheckBoxNode;
      
      // bind click event on the created checkboxes
      options.tree$
        .off('click', C_TREE_CHECK_SELECTOR)
        .on('click', C_TREE_CHECK_SELECTOR, function(event){checkSelectorCallback(event, pTreeId)});
    };
  }; // configureCheckboxes
  
  
  function getCheckedNodes(pNode, pTargetList, pSelectedNodes){
    if(pNode.children){
      // Knoten, Rufe rekursiv getCheckedNodes auf
      pNode.children.forEach(function(childNode){
        // Waehrend der Initialisierung muss ein Verweis auf den Elternknoten hinterlegt werden.
        getCheckedNodes(childNode, pTargetList, pSelectedNodes);
      });
    }
    else {
      if($.inArray(pNode.id, pTargetList) > -1){
        pSelectedNodes.push(pNode);
      };
    };
  }; // getCheckedNodes
  
  
  /* EVENT HANLDERS */
  function refreshCallback(pData, pTreeId){
    var nodeAdapter,
        state = {
          sessionState:[],
          selectedNodes:[],
          expandedNodes:[]
        };
        
    getOptions(pTreeId);
    
    // Keine Daten gefunden
    if ($.isEmptyObject(pData.data)) {
      options.tree$.treeView('destroy');
      options.setValueCallback([]);
      configureTreeInstance(options);
      options.tree$.trigger(C_APEX_AFTER_REFRESH_EVENT);
      return;
    };
    
    persistState(options.tree$, state);

    // Refresh tree data
    nodeAdapter = options.tree$.treeView('getNodeAdapter');
    nodeAdapter.data = pData.data;    
    options.tree$.treeView('refresh');
    // Persist root node
    options.topLevel = options.tree$.treeView('getNodes', $(`#${options.treeId}_0`))[0];

    restoreState(options.tree$, state);
    
    options.tree$.trigger(C_APEX_AFTER_REFRESH_EVENT);
  }; // refreshCallback


  function checkSelectorCallback(pEvent, pTreeId){    
    getOptions(pTreeId); 
    var nodeContent$ = $(pEvent.target).closest(C_TREE_CONTENT_CLASS), // HTML Node
        modelNode = options.tree$.treeView('getNodes', nodeContent$)[0],
        selection = [],
        checkMode;
    
    checkMode = modelNode.checkedStatus.checkedLeaves > 0 ? C_UNCHECKED : C_CHECKED;
    setSubTree(modelNode, checkMode);
    
    updateChecked(options.topLevel, selection);
    options.setValueCallback(selection);
    
    updateParentCheckboxes(modelNode, options.tree$);
    
    updateChildrenCheckboxes(modelNode, options.tree$);
    
    return false; // stop propagation and prevent default
  }; // checkSelectorCallback
  

  /* HELPER METHODS */
  function persistState(pTree, pState){
    pState.selectedNodes = pTree.treeView('getSelectedNodes');
    if(typeof pTree.treeView('getNodeAdapter').getExpandedNodeIds == 'function'){
      pState.expandedNodes = pTree.treeView('getNodeAdapter').getExpandedNodeIds(pTree.treeView('getBaseId'));
    };
    if (options.withCheckboxes){
      pState.sessionState = options.getValueCallback();
    };
  }; // persistState
  
  
  function restoreState(pTree, pState){
    var selection = [];
    
    // Expansion State
    pState.expandedNodes.forEach(function (id) {
      var node$ = pTree.treeView('find', {
        depth: -1, 
        findAll: false, 
        match: function (node) {
          return node.id === id;
        }
      });
      pTree.treeView('expand', node$);
    });
    
    // Selection
    pState.selectedNodes.map(function (node) {
      return pTree.treeView('find', {
        depth: -1, 
        findAll: false, 
        match: function (node) {
          return node.id === node.id
        }
      });
    });
    if (pState.selectedNodes.length > 0) {
      pTree.treeView('setSelectedNodes', pState.selectedNodes, true);
    };
    
    // Checkboxes
    if (options.withCheckboxes){
      updateChecked(options.topLevel, selection, pState.sessionState);
      updateChildrenCheckboxes(options.topLevel, pTree, C_EXPAND_SELECTED_NODES);
      
      options.setValueCallback(selection);
    };
    
  }; // restoreState
  
  
  /** Method to set the checked status
   *  This method only maintains the checked status, not the visualization of the check boxes
   * @param{treeNodeAdapter.node} pNode Actual noew the method is working on
   * @param{Array} pSelection Empty Array to collect all checked nodes
   * @param{Array} pSessionState Array with the pre selected nodes. If not empty, they will set nodes checked if they find it.
   *               After completion of the method, selection replaces sessionState to remove any non existing nodes from the sessionState
   */
  function updateChecked(pNode, pSelection, pSessionState) {
    var childStatus,
        result = {
          leaves: 0, 
          checkedLeaves: 0
        };
    
    if(pNode.children){
      // Node has children, call updateChecked recursively
      pNode.children.forEach(function(childNode, index, arrayOfChildren){
        // persist reference to parent node
        childNode._parent = pNode;
        childStatus = updateChecked(childNode, pSelection, pSessionState);
        result.leaves += childStatus.leaves;
        result.checkedLeaves += childStatus.checkedLeaves;
      });
    }
    else {
      // Blatt: isChecked: 0 => unchecked, 1 => checked
      if(typeof pNode.isChecked == 'undefined'){
        // Blatt initialisieren
        pNode.isChecked = C_UNCHECKED;
      };
      
      // Check node status
      if(pSessionState){
        // check whether actual node is in value list
        pNode.isChecked = (pSessionState.indexOf(pNode.id) == -1) ? C_UNCHECKED : C_CHECKED;
      }
      if(pNode.isChecked == C_CHECKED){
        pSelection.push(pNode.id);
      };
      
      // create result object
      result.leaves = 1;
      result.checkedLeaves = pNode.isChecked;
    };
    pNode.checkedStatus = result;
    return(result);
  };
  
  
  /** Render method for the apex.treeView
   * <p>This method is used to render the node content.
   * @method renderNodeContent
   * @instance
   * @memberof treeNodeAdapter
   * @param {treeNodeAdapter.node} pNode The node from which to get the disabled state.
   * @param {apex.util.htmlBuilder} pOut Call methods on this interface to render the node content.
   * @param {Object} pOptions View options.
   * @param {string} pOptions.iconType CSS class used in creating an icon. The {@link treeView#iconType} option value.
   * @param {string} pOptions.labelClass CSS classes to use for the content label. The {@link treeView#labelClass} option.
   * @param {boolean} pOptions.useLinks Used to determine how to render nodes that have a link. The {@link treeView#useLinks} option value.
   * @param {Object} pState Node state information.
   * @param {boolean} pState.selected If true the node is selected.
   * @param {integer} pState.level This is the level of the node. Used for the <code class="prettyprint">aria-level</code> attribute.
   * @param {boolean} pState.disabled This is true if the node is disabled.
   * @param {boolean} pState.hasChildren This is true if the node has children.
   * @param {boolean} pState.expanded This is true if the node is expanded.
   */
  function renderCheckBoxNode(pNode, pOut, pOptions, pState){
    var icon,
        link,
        elementName,
        cssClass = C_TREE_CHECK_CLASS + ' ';
    
    // extend node with attributes required to control check box state
    if(typeof pNode.checkedStatus == 'undefined'){
      pNode.checkedStatus = {
        leaves: 0, 
        checkedLeaves: 0
      };
    }
    
    // pNode.checkedLeaves gives the number of all checked nocdes
    switch(pNode.checkedStatus.checkedLeaves){
      case 0:
        break;
      case pNode.checkedStatus.leaves:
        cssClass += C_TREE_FULL_CHECK_CLASS;
        break;
      default:
        cssClass += C_TREE_PART_CHECK_CLASS;
    };
                           
    pOut.markup('<span ')
      .attr('class', cssClass)
      .markup('>')
      .markup('</span>'); // this is the checkbox - its not a real checkbox input
      
    // the rest of this code is essentially a copy of what is in widget.treeView.js function renderTreeNodeContent
    if (this.getIcon) {
      icon = this.getIcon(pNode);
      if (icon !== null) {
        pOut.markup(`<span class="${pOptions.iconType} ${icon}"></span>`);
      }
    }
    link = pOptions.useLinks && this.getLink && this.getLink(pNode);
    if (link) {
      elementName = 'a';
    } else {
      elementName = 'span';
    }
    pOut.markup('<' + elementName + ' tabIndex="-1" role="treeitem"')
      .attr('class', pOptions.labelClass + ' level' + pState.level)
      .optionalAttr('href', link)
      .attr('aria-level', pState.level)
      .attr('aria-selected', pState.selected ? 'true' : 'false')
      .optionalAttr('aria-disabled', pState.disabled ? 'true' : null)
      .optionalAttr('aria-expanded', pState.hasChildren === false ? null : pState.expanded ? 'true' : 'false')
      .markup('>')
      .content(this.getLabel(pNode))
      .markup('</' + elementName + '>');
  }; // renderCheckBoxNode
  
  
  // Methoden zur Pflege der Checkboxen
  function setSubTree(pNode, pCheckMode){
    if(pNode.children){
      pNode.children.forEach(function(childNode, index, arrayOfChildren){
        setSubTree(childNode, pCheckMode);
      });
    }
    else {
      pNode.isChecked = pCheckMode;
    };
  }; // setSubTree
  

  function updateChildrenCheckboxes(pNode, pTree, pExpandSelected){
    if(pNode.children){
      // recursively walk over all child nodes
      pNode.children.forEach(function(childNode){
        // expand any node to allow for expanding of deeply nested nodes. 
        // They would not expand if their parent is collapsed
        // Nodes under root with no checked nodes will be collapsed later
        if (pExpandSelected){
          pTree.treeView('expand', pTree.treeView('getTreeNode', pNode));
        };
        updateChildrenCheckboxes(childNode, pTree, pExpandSelected);
      })
    };
    setCheckBoxClass(pNode, pTree, pExpandSelected);
  }; // updateChildrenCheckboxes
  
  
  function updateParentCheckboxes(pNode, pTree){
    while(pNode != null){
      setCheckBoxClass(pNode, pTree);
      pNode = pNode._parent;
    };
  }; // updateParentCheckboxes
  
  
  function setCheckBoxClass(pNode, pTree){  
    var treeNode;
    
    // cast node to tree node
    treeNode = pTree.treeView('getTreeNode', pNode);
    $(treeNode)
      .children(C_TREE_CHECK_SELECTOR)
      .removeClass(C_TREE_FULL_CHECK_CLASS)
      .removeClass(C_TREE_PART_CHECK_CLASS);
      
    if(pNode.checkedStatus.checkedLeaves > 0){
      pTree.treeView('expand', treeNode);
      
      if(pNode.checkedStatus.leaves == pNode.checkedStatus.checkedLeaves) {
        $(treeNode)
          .children(C_TREE_CHECK_SELECTOR)
          .addClass(C_TREE_FULL_CHECK_CLASS);
      }
      else {
        $(treeNode)
          .children(C_TREE_CHECK_SELECTOR)
          .addClass(C_TREE_PART_CHECK_CLASS);
      };
    }
    else{
      // No checked child nodes, collapse if not root
      if(pNode._parent){
        pTree.treeView('collapse', treeNode);
      };
    };
  }; // setCheckBoxClass
  
})(de.condes.plugin.apexTree.treeViewWrapper, apex.jQuery, apex.server);