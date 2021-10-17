
/*!
 de.condes.plugin.treeItem.js
 */

// Namespace
var de = de ||{};
de.condes = de.condes ||{};
de.condes.plugin = de.condes.plugin ||{};
de.condes.plugin.treeItem = de.condes.plugin.treeItem ||{};


(function(tree, $, server){
'use strict';
    var C_TREEVIEW = 'a-TreeView',
        SEL_TREE = '.' + C_TREEVIEW,
        C_NODE = C_TREEVIEW + '-node',
        C_ICON = C_TREEVIEW + '-icon',
        C_NO_COLLAPSE = C_TREEVIEW + '--noCollapse',
        SEL_NODE = '.' + C_NODE,
        C_TOP_NODE = C_TREEVIEW + '-node--topLevel',
        C_ROW = C_TREEVIEW + '-row',
        SEL_ROW = '.' + C_ROW,
        C_CONTENT = C_TREEVIEW + '-content',
        SEL_CONTENT = '.' + C_CONTENT,
        SEL_ROW_CONTENT = SEL_CONTENT + ', ' + SEL_ROW,
        C_LABEL = C_TREEVIEW + '-label',
        SEL_LABEL = '.' + C_LABEL,
        C_TOGGLE = C_TREEVIEW + '-toggle',
        SEL_TOGGLE = '.' + C_TOGGLE,
        C_SELECTED = 'is-selected',
        SEL_SELECTED = '.' + C_SELECTED,
        C_DISABLED = 'is-disabled',
        SEL_DISABLED = '.' + C_DISABLED,
        C_FOCUSED = 'is-focused',
        C_HOVER = 'is-hover',
        C_EXPANDABLE = 'is-expandable',
        C_COLLAPSIBLE = 'is-collapsible',
        C_LEAF = C_TREEVIEW + '-node--leaf',
        C_DEFAULT_ICON_TYPE= 'fa',
        C_RTL = 'u-RTL',
        // Attribute constants
        A_EXPANDED = 'aria-expanded',
        A_SELECTED = 'aria-selected',
        A_DISABLED = 'aria-disabled',
        A_MULTISELECTABLE = 'aria-multiselectable',
        A_LEVEL = 'aria-level',
        A_ROLE = 'role',
        A_CLASS = 'class',
        // Markup contants
        M_BEGIN_CHILDREN = '<ul role="group">',
        M_END_CHILDREN = '</ul>',
        TRUE = 'true',
        FALSE = 'false',
        // Checkbox constants
        C_TREE_CHECK_CLASS = C_TREEVIEW + '-checkBox',
        C_TREE_CHECK_SELECTOR = '.' + C_TREE_CHECK_CLASS,
        C_TREE_FULL_CHECK_CLASS = C_TREE_CHECK_CLASS + '--fullChecked',
        C_TREE_FULL_CHECK_SELECTOR = '.' + C_TREE_FULL_CHECK_CLASS,
        C_TREE_PART_CHECK_CLASS = C_TREE_CHECK_CLASS + '--partChecked',
        C_TREE_PART_CHECK_SELECTOR = '.' + C_TREE_PART_CHECK_CLASS,
        C_UNCHECKED = 0,
        C_CHECKED = 1,
        C_DIRECT_CALL = true;

    var EVENT_SELECTION_CHANGE = 'selectionChange',
        EVENT_EXPANSION_STATE_CHANGE = 'expansionStateChange';

    var keys = $.ui.keyCode;

    function getIdFromNode(node$){
        var id = node$.get(0).id;
        return id.substring(id.lastIndexOf('_') + 1);
    }

    function getLevelFromNode(node$, labelSel){
        return parseInt(node$.children(SEL_CONTENT).find(labelSel).attr(A_LEVEL), 10);
    }

    function getLevel(nodeContent$, labelSel){
        return parseInt(nodeContent$.find(labelSel).attr(A_LEVEL), 10);
    }

$.widget('condes.treeItem', $.extend(true,
  /**
   * @lends treeItem.prototype
   */
{
    version: '19.1',
    widgetEventPrefix: 'treeitem',
    options:{
      /**
       * <p>A no argument function returning an object that implements the{@link treeNodeAdapter} interface.
       * The node adapter provides access to the data behind the treeView. This option is required unless
       * the tree data is supplied by markup.</p>
       *
       * @variation 1
       * @memberof treeItem
       * @instance
       * @type{function}
       * @default null
       * @example function(){ return myAdapter; }
       */
      getNodeAdapter: null,

      /**
       * <p>Determines if the tree is shown with a single root or with multiple 'roots' which are really the
       * first level nodes in the data model.
       * iffalse the tree appears like a forest (multi-rooted). iftrue there is a single root node.</p>
       *
       * @memberof treeItem
       * @instance
       * @type{boolean}
       * @default true
       * @example false
       * @example false
       */
      showRoot: false,

      /**
       * <p>iftrue the root node is initially expanded otherwise it is collapsed.
       * Option expandRoot cannot be false when{@link treeView#collapsibleRoot} is false</p>
       *
       * @memberof treeItem
       * @instance
       * @type{boolean}
       * @default true
       * @example false
       * @example false
       */
      expandRoot: true,

      /**
       * <p>iffalse the root node cannot be collapsed (has no toggle area) otherwise the root can be collapsed.
       * Can only be set at initialization time.</p>
       *
       * @memberof treeItem
       * @instance
       * @type{boolean}
       * @default true
       * @example false
       */
      collapsibleRoot: true,

      /**
       * <p>Icon type CSS class name. The iconType along with the value returned by
       *{@link treeNodeAdapter#getIcon} make up the classes used for the tree node icon.</p>
       *
       * @memberof treeItem
       * @instance
       * @type{string}
       * @default 'a-Icon'
       * @example 'fa'
       * @example 'fa'
       */
      iconType: C_DEFAULT_ICON_TYPE,

      /**
       * <p>The CSS class name to use on the focusable node content element.
       * This should only be changed if the node adapter implements{@link treeNodeAdapter#renderNodeContent}.</p>
       *
       * @memberof treeItem
       * @instance
       * @type{string}
       * @default 'a-TreeView-label'
       */
      labelClass: C_LABEL,

      /**
       * <p>A tooltip options object suitable for the jQuery UI tooltip widget except that the items property
       * is not needed (it is supplied by the treeView) and the content callback function receives a
       * second argument that is the{@link treeNodeAdapter.node} the tooltip applies toptions. if not given there
       * is no tooltip.</p>
       * <p>See the jQuery UI documentation for details on the tooltip widget.</p>
       *
       * @memberof treeItem
       * @instance
       * @type{Object}
       * @default null
       * @example{
       *         show:{ delay: 1000, effect: 'show', duration: 500 },
       *         content: function (callback, node){
       *             if(!node){
       *                 return null;
       *             }
       *             return node.tooltip;
       *         }
       *     }
       */
      tooltip: null,

      /**
       * <p>Triggered when the selection state changes. It has no additional data. When the selection changes
       * the handler will generally want to get the current selection using the{@link treeView#getSelection}
       * or{@link treeView#getSelectedNodes} methods.</p>
       *
       * @event
       * @name selectionChange
       * @memberof treeItem
       * @instance
       * @property{Event} event <code class='prettyprint'>jQuery</code> event object.
       *
       * @example <caption>Initialize the treeView with the <code class='prettyprint'>selectionChange</code> callback specified:</caption>
       * $('.selector').treeView({
       *     selectionChange: function(event){}
       * });
       *
       * @example <caption>Bind an event listener to the <code class='prettyprint'>treeviewselectionchange</code> event:</caption>
       * $('.selector').on('treeviewselectionchange', function(event){});
       */
      selectionChange: null,

      /**
       * <p>Triggered when nodes are expanded or collapsed.</p>
       *
       * @event
       * @name expansionStateChange
       * @memberof treeItem
       * @instance
       * @property{Event} event <code class='prettyprint'>jQuery</code> event object.
       * @property{Object} ui
       * @property{treeNodeAdapter.node} ui.node The node that is expanded or collapsed.
       * @property{jQuery} ui.nodeContent$ The node content jQuery object.
       * @property{boolean} ui.expanded true if the node is now expanded and false otherwise.
       *
       * @example <caption>Initialize the treeView with the <code class='prettyprint'>expansionStateChange</code> callback specified:</caption>
       * $('.selector').treeView({
       *     expansionStateChange: function(event, ui){}
       * });
       *
       * @example <caption>Bind an event listener to the <code class='prettyprint'>treeviewexpansionstatechange</code> event:</caption>
       * $('.selector').on('treeviewexpansionstatechange', function(event, ui){});
       */
      expansionStateChange: null, // expansionStateChange(event,{ node: <node>, nodeContent$: <node-element>, expanded: <bool> })
      },
    scrollTimerId: null, // timer used for scrolling
    delayExpandTimer: null, // timer used to expand nodes
    tooltipOptions: null,
    triggerTimerId: null,
    forwardKey: keys.RIGHT,
    backwardKey: keys.LEFT,
    scrollParent: null, // set to the tree widget scroll parent if there is one
    _create: function (){
      var self = this,
          treeElement$ = this.element,
          options = this.options;

      this.nodeAdapter = options.getNodeAdapter();

      if(options.collapsibleRoot === false){
          options.expandRoot = true;
      }

      treeElement$
        .addClass(C_TREEVIEW)
        .attr(A_ROLE, 'tree')
        .attr(A_MULTISELECTABLE, TRUE);
      this.baseId = options.treeId + '_';
      this.labelSelector = '.' + options.labelClass;

      this.rtlFactor = 1;
      if(treeElement$.css('direction') === 'rtl'){
        treeElement$.addClass(C_RTL);
        this.forwardKey = keys.LEFT;
        this.backwardKey = keys.RIGHT;
        this.rtlFactor = -1;
      }

      if(options.disabled){
        treeElement$.attr(A_DISABLED, TRUE);
      }

      if(options.tooltip){
        this._initTooltips(options.tooltip);
      }

      // keep track of the tree scroll parent
      this.scrollParent = treeElement$.scrollParent();

      // determine the parent's offset
      this.offset = this.element.offset();

      this._on(treeElement$, this._eventHandlers);

      // process disabled option and other common option setting behavior
      this._setOption(treeElement$, 'disabled', options.disabled);

      this.rerender();

    }, // _create

    _eventHandlers:{
      click: function(event){
          var node$,
              self = this,
              target$ = $(event.target);

          if(target$.hasClass(C_TREE_CHECK_CLASS)){
              node$ = target$.closest(SEL_CONTENT); // HTML Node
              this._select(node$);
              event.preventDefault();
          } else if (target$.hasClass(C_TOGGLE)){
              this._toggleNode( target$.parent() );
              event.preventDefault();
          }
          else{
              event.preventDefault();
          }
      }, // click

      keydown: function(event){
        var node$, nodeContent$, nh, scrollHeight, page,
            self = this,
            options = this.options,
            treeElement$ = this.element,
            kc = event.which;

        if(kc === keys.PAGE_UP || kc === keys.PAGE_DOWN){
            if(this.scrollParent){
              nh = treeElement$.find(SEL_ROW).filter(':visible').first().outerHeight() || 24;
              node$ = treeElement$.find('li').filter(':visible').first();
              nh += parseInt(node$.css('margin-top'), 10) + parseInt(node$.css('margin-bottom'), 10);
              if(this.scrollParent[0] === document){
                  scrollHeight = $(window).height();
              } else{
                  scrollHeight = this.scrollParent[0].clientHeight;
              }
              page = Math.floor(scrollHeight / nh) - 1;
            } else{
              page = 10;
            }
        }
        if(kc === keys.HOME){
            treeElement$.find(SEL_CONTENT).filter(':visible').first().each(function (){ // at most once
                self._select($(this), event, true, true);
            });
            event.preventDefault();
        } else if(kc === keys.END){
            treeElement$.find(SEL_CONTENT).filter(':visible').last().each(function (){ // at most once
                self._select($(this), event, true, true);
            });
            event.preventDefault();
        } else if(kc === keys.SPACE){
            if(this.lastFocused){
                this._select($(this.lastFocused).closest(SEL_CONTENT), this.nodeAdapter);
                // TODO Toggle selected
            }
            event.preventDefault();
        } else if(kc === keys.DOWN){
            this._traverseDown(event, 1);
            event.preventDefault();
        } else if(kc === keys.UP){
            this._traverseUp(event, 1);
            event.preventDefault();
            event.stopPropagation(); // Don't let a containing tab or accordion act on Ctrl+Up
        } else if(kc === keys.PAGE_DOWN){
            this._traverseDown(event, page);
            event.preventDefault();
        } else if(kc === keys.PAGE_UP){
            this._traverseUp(event, page);
            event.preventDefault();
        } else if(kc === this.backwardKey){
            // if the focused node is collapsible, collapse it.
            if(this.lastFocused){
                node$ = $(this.lastFocused).closest(SEL_NODE);
                if(node$.hasClass(C_COLLAPSIBLE)){
                    this._collapseNode(node$);
                } else{
                    // if it is not collapsible, focus parent.
                    node$.parent().prevAll(SEL_CONTENT).each(function (){ // at most once
                        self._select($(this), event, true, true);
                    });
                }
            }
            event.preventDefault();
        } else if(kc === this.forwardKey){
            // if the focused node is not a leaf, expand or move to descendant
            if(this.lastFocused){
                node$ = $(this.lastFocused).closest(SEL_NODE);
                if(node$.hasClass(C_EXPANDABLE)){
                    this._expandNode(node$);
                } else if(node$.hasClass(C_COLLAPSIBLE)){
                    node$.children('ul').children('li').first().children(SEL_CONTENT).each(function (){ // at most once
                        self._select($(this), event, true, true);
                    });
                }
            }
            event.preventDefault();
        } else if(kc === keys.ENTER){

        }
      }, // keydown

      keypress: function(event){
        var ch, next$,
            self = this;

        function findNode(search){
          var startNode$, nextNode$, label$,
              slen = search.length;

          function next(){
            nextNode$ = nextNode(nextNode$);
            if(nextNode$.length === 0){
              nextNode$ = this.element.find(SEL_NODE).filter(':visible').first();
            }
          }

          nextNode$ = startNode$ = $(this.lastFocused).closest(SEL_NODE);
          if(slen === 1){
            next();
          }

          while (true){
            label$ = nextNode$.children(SEL_CONTENT).find(this.labelSelector).first();
            if(label$.text().substring(0, slen).toLowerCase() === search){
              return label$.closest(SEL_CONTENT);
            }
            next();
            if(nextNode$[0] === startNode$[0]){
              break;
            }
          }
          return null;
        }

        ch = String.fromCharCode(event.which).toLowerCase();
        if(this.searchTimerId){
            // a character was typed recently
            // if it is the same character just look for the next item that starts with the letter
            if(ch !== this.searchString){
                // otherwise add to the search string
                this.searchString += ch;
            }
            clearTimeout(this.searchTimerId);
            this.searchTimerId = null;
        } else{
            // a character hasn't been typed in a while so search from the beginning
            if(ch === ' '){
                return;
            }
            this.searchString = ch;
        }
        this.searchTimerId = setTimeout(function (){
            this.searchTimerId = null;
        }, 500);

        next$ = findNode(this.searchString);
        if(next$){
            this._focus(next$, event, true, true);
        }

      }, // keypress

      focusin: function(event){
        var label$ = $(event.target).closest(this.labelSelector);
        if(label$.length){
            label$.addClass(C_FOCUSED).closest(SEL_NODE).children(SEL_ROW).addClass(C_FOCUSED);
            this._setFocusable(label$);
        }
      }, // focusin

      focusout: function(event){
        var label$ = $(event.target).closest(this.labelSelector);
        label$.removeClass(C_FOCUSED).closest(SEL_NODE).children(SEL_ROW).removeClass(C_FOCUSED);
      }, // focusout

      mousemove: function(event){
        var node$;
        node$= $(event.target).closest(SEL_NODE);
        if(node$.length && this.lastHover !== node$[0]){
          $(this.lastHover).children(SEL_ROW_CONTENT).removeClass(C_HOVER);
          node$.children(SEL_ROW_CONTENT).addClass(C_HOVER);
          this.lastHover = node$[0];
        }
      }, // mousemove

      mouseleave: function(event){
        if(this.lastHover){
          $(this.lastHover).children(SEL_ROW_CONTENT).removeClass(C_HOVER);
          this.lastHover = null;
        }
      } // mouseleave
    }, // _eventHandlers

    _setOption: function(key, value){
        var startLabel,
            options = this.options;

        if (key === 'disabled'){
            // Don't call widget base _setOption for disable as it adds ui-state-disabled class
            options[key] = value;

            if (value){
                this.element.attr(A_DISABLED , TRUE);
                if (this.lastFocused){
                    this.lastFocused.tabIndex = -1;
                }
                this.lastFocused = null;
            } else{
                this.element.removeAttr(A_DISABLED);
                startLabel = this.getSelection().first().find(this.labelSelector);
                if (!startLabel.length){
                    startLabel = this.element.find(this.labelSelector).first();
                }
                this._setFocusable(startLabel);
            }
        } else{
            this._super(key, value);
        }

        options = this.options;

        this.renderNodeOptions = {
            iconType: options.iconType,
            labelClass: options.labelClass,
            nodeSelector: 2
        };

        if (key === 'showRoot'){
            this.rerender();
        } else if (key === 'getNodeAdapter'){
            this.nodeAdapter = options.getNodeAdapter();
            this.rerender();
        } else if (key === 'expandRoot' && value === false){
            if (options.collapsibleRoot === false){
                options.expandRoot = true;
                debug.warn('ExpandRoot option cannot be false when collapsibleRoot is false');
            }
        } else if (key === 'tooltip'){
            this._initTooltips(value);
        }

    }, // _setOption

    _initTooltips: function(options){
        var ttOptions,
            self = this;

        if(!$.ui.tooltip){
            debug.warn('tooltip option ignored because missing tooltip widget dependency');
            return;
        }
        if(this.tooltipOptions){
            // tooltip widget already initialized so destroy it
            this.element.tooltip('destroy');
            this.tooltipOptions = null;
        }
        if(options){
            ttOptions = this.tooltipOptions = $.extend(true,{}, options); // deep copy
            ttOptions.items = this.labelSelector;
            if(ttOptions.content && $.isFunction(ttOptions.content)){
                ttOptions._originalContent = ttOptions.content;
                ttOptions.content = function(callback){
                    var node = self.getNodes($(this).closest(SEL_CONTENT))[0];
                    return ttOptions._originalContent.call(this, callback, node);
                };
            }
            this.element.tooltip(ttOptions);
        }
    }, // _initTooltips

    _destroy: function(){
        var treeElement$ = this.element;

        treeElement$.empty()
            .removeClass(C_TREEVIEW + ' ' + C_RTL)
            .removeAttr(A_ROLE)
            .removeAttr(A_MULTISELECTABLE);

        apex.clipboard.removeHandler(treeElement$[0]); // no problem ifhad not been added

        if(this.options.tooltip && $.ui.tooltip){
            treeElement$.tooltip('destroy');
        }
        this._mouseDestroy();
    }, // _destroy

    //
    // Public methods
    //


    /**
     * <p>Call to reset the data of the tree.</p>
     */
    setData: function(pData){
      var nodeAdapter = this.nodeAdapter;

      nodeAdapter.data = pData.data;

      this.rerender();
    }, // setData

    setTreeMap: function(){
      var nodeAdapter = this.nodeAdapter,
          node, nodeId, elementId, selectedNodes;

      this.treeMap ={};
      node = nodeAdapter.data; // Root node
      selectedNodes = nodeAdapter.data.selectedNodes;



    },

    /**
     * <p>Call to render the whole tree or sub trees whenever the adapter's data model changes.</p>
     *
     * @example <caption>This example rerenderes (renders) the whole tree.</caption>
     * $('.selector').treeView('rerender');
     */
    rerender: function(){
      var rootNode, root$, sel$,
          self = this,
          options = this.options,
          nodeAdapter = this.nodeAdapter,
          selectedNodes = null,
          treeElement$ = this.element,
          out = apex.util.htmlBuilder(),
          initiallyOpenedSelector, i;

      // Select pre-selected values from session state
      if(nodeAdapter.getViewId){
          selectedNodes = nodeAdapter.data.selectedNodes;
      }

      if(nodeAdapter.clearViewId){
          nodeAdapter.clearViewId(this.baseId);
      }

      this.treeMap = {};
      this.nextNodeId = 0;
      rootNode = nodeAdapter.root(); //get the single root node
      if(rootNode){
        if(nodeAdapter.hasChildren(rootNode)){
          out.markup(M_BEGIN_CHILDREN);
          if(options.showRoot){
            this._renderNode(rootNode, 1, out); // level 1
          }
          else{
            this._renderChildren(rootNode, 1, out); // level 1
          }
          out.markup(M_END_CHILDREN);
        }
        else{
          // Query did not retrieve any values. Show message according to a report region
          out.markup('<div>' + options.noDataFoundMessage + '</div>');
        };
        treeElement$.html(out.toString());
      } else{
        // There really should be a root node
        // The cases where the tree root doesn't exist should be very rare.
        // if the tree data model doesn't have a root the treeView should not be created and a message shown in its place
        out.markup(M_BEGIN_CHILDREN);
        out.markup(M_END_CHILDREN);
        treeElement$.html(out.toString());
      }

      // all nodes are expanded by default, collapse anything above initially expanded level
      for(i = 9; i >= options.expandLevel; i--){
        initiallyOpenedSelector = '.level' + i;
        treeElement$.find(initiallyOpenedSelector).closest('li').each(function(){
          self._collapseNode($(this));
        });
      }

      if(this.hasCurrent){
        sel$ = this.find({
            depth: -1,
            match: function(n){
                return n.current === true;
            }
        });
        this.hasCurrent = false;
        this.setSelection(sel$);
      } else if(selectedNodes && selectedNodes.length > 0){
        this.setSelectedNodes(selectedNodes, false, true); // don't notify because the selection should be the same
      } else{
        // Set initial focus to first node
        this.selectAnchor = this.lastFocused;
        this._setFocusable(treeElement$.find(this.labelSelector).first());
      }
    }, // rerender

    /**
     * <p>Returns the{@link treeNodeAdapter} that the treeView is using.</p>
     * @variation 2
     * @return{treeNodeAdapter}
     * @example <caption>This example logs to the console the node label of each child of the first
     *   selected node.</caption>
     * var i, count,
     *     selectedNode = $('.selector').treeView('getSelectedNodes')[0],
     *     adapter = $('.selector').treeView('getNodeAdapter');
     * if(selectedNode){
     *     count = adapter.childCount(selectedNode);
     *     for (i = 0; i < count; i++){
     *         console.log('Label: ' + adapter.child(selectedNode, i).label);
     *     }
     * }
     */
    getNodeAdapter: function(){
        return this.nodeAdapter;
    }, // getNodeAdapter

    /**
     * <p>Set focus to the tree node that last had focus.</p>
     * @example <caption>Focus the treeView.</caption>
     * $('.selector').treeView('focus');
     */
    focus: function(){
        if(this.lastFocused){
            this.lastFocused.focus();
        }
    }, // focus

    /**
     * <p>Expand the given tree node(s) or if no node is given expand the root node(s). Expanding a node makes all
     * of its children visible. See also{@link treeView#expandAll} and{@link treeView#collapse}.</p>
     *
     * @param{jQuery} [pNodeContent$] One or more tree nodes to expand or null or omit to expand the root(s).
     * @example <caption>This example will expand the currently selected node(s) if collapsed and has children.</caption>
     * var tree$ = $('.selector');
     * tree$.treeView('expand', tree$.treeView('getSelection'));
     */
    expand: function(pNodeContent$){
        var self = this;

        if(!pNodeContent$){
            pNodeContent$ = this._getRoots().children(SEL_CONTENT);
        }
        pNodeContent$.each(function(){
            var node$ = $(this).closest(SEL_NODE);
            if(node$.hasClass(C_EXPANDABLE)){
                self._expandNode(node$);
            }
        });
    }, // expand

    /**
     * <p>Collapse the given tree node(s) or if no node is given collapse the root node(s). Collapsing a node makes all
     * of its children hidden. See also{@link treeView#collapseAll} and{@link treeView#expand}.</p>
     *
     * @param{jQuery} [pNodeContent$] One or more tree nodes to collapse or null or omit to collapse the root(s).
     * @example <caption>This example will collapse the currently selected node(s) ifexpanded.</caption>
     * var tree$ = $('.selector');
     * tree$.treeView('collapse', tree$.treeView('getSelection'));
     */
    collapse: function(pNodeContent$){
        var self = this;

        if(!pNodeContent$){
            pNodeContent$ = this._getRoots().children(SEL_CONTENT);
        }
        pNodeContent$.each(function(){
            var node$ = $(this).closest(SEL_NODE);
            if(node$.hasClass(C_COLLAPSIBLE)){
                self._collapseNode(node$);
            }
        });
    }, // collapse

    /**
     * <p>Enable editing of the tree selection. This means that the checkboxes are selectable and the value of the plugin changes.
     *    See also{@link treeView#disable}.</p>
     * @example <cpation>This example will set the tree to enabled state</caption>
     * var tree$ = $('.selector');
     * tree$.treeView('enable');
     */
    enable: function(){
      this._setOption('disabled', false);
    }, // enable

    /**
     * <p>Disables editing of the tree selection. This means that the checkboxes are not selectable but they are able to have a value, i.e. show a selection status.
     *    See also{@link treeView#enable}.</p>
     * @example <cpation>This example will set the tree to disabled state</caption>
     * var tree$ = $('.selector');
     * tree$.treeView('disable');
     */
    disable: function(){
      this._setOption('disabled', true);
    }, // disable

    /**
     * <p>Returns true if the status of the tree is set to disabled and false otherwise.
     *    See also {@link treeView#enable} and {@link treeView#disable}.</p>
     * @example <cpation>This example will set the tree to disabled state</caption>
     * var tree$ = $('.selector');
     * tree$.treeView('disable');
     */
    isDisabled: function(){
      return this.options['disabled'];
    }, // enable

    /**
     * <p>Returns the set of treeView nodes currently selected. If there is no selection the empty set is returned.
     * The elements returned have the class <code class='prettyprint'>a-TreeView-content</code>.</p>
     *
     * @return{jQuery} jQuery object with the set of selected tree nodes.
     * @example <caption>This example gets current selected treeView node elements as a jQuery set.</caption>
     * var selection$ = $('.selector').treeView('getSelection');
     */
    getSelection: function(){
        return this.element.find(SEL_CONTENT + SEL_SELECTED);
    }, // getSelection

    /**
     * <p>Given a jQuery object with a set of treeView nodes return an array of adapter data model nodes that
     * corresponds to each treeView node in the set.
     * The tree nodes passed in must be the ones this treeView instance rendered
     * with class <code class='prettyprint'>a-TreeView-content</code>.</p>
     *
     * <p>This is for mapping from DOM elements to model node objects.</p>
     *
     * @param{jQuery} pNodeContent$ jQuery Object holding a set of tree nodes.
     * @return{treeNodeAdapter.node[]} array of data model nodes.
     * @example <caption>This example replaces the labels of all the selected nodes with a lowercase label.</caption>
     * var tree$ = $('.selector'),
     *     selection$ = tree$.treeView('getSelection'),
     *     nodes = tree$.treeView('getNodes', selection$);
     * nodes.forEach(function(n, i){
     *     n.label = n.label.toLowerCase();
     *     tree$.treeView('update', selection$.eq(i))
     * });
     */
    getNodes: function(pNodeContent$){
      var self = this,
          nodes = [];

      pNodeContent$.each(function (){
        var id = getIdFromNode($(this).closest('li'));
        // never include the fake node for adding a new node
        if (id !== 'new'){
          nodes.push(self.treeMap[id]);
        }
      });
      return nodes;
    }, // getNodes

    /**
     * <p>This is for mapping from model node objects to DOM elements.</p>
     *
     */
    getHtmlNode: function(pNode){
      var nodeId = this.nodeAdapter.getViewId(this.baseId, pNode)
      return $('#' + nodeId);
    }, // getHtmlNode

    /** <p>Method returns the selecte node ids as a colon separated string</p>
     *
     * @return{treeNodeAdapter.node[]} Array of data model nodes selected.
     * @example <caption>This example gets the nodes for the current selection.</caption>
     * var selectedNodes = $('.selector').treeView('getSelectedNodes');
     */
    getValue: function(){
      var nodeList = this.getSelectedNodes(),
          nodeIdList = $.map(nodeList, function(n, i){return n.id});

      return nodeIdList.join(':');
    }, // getValue

    /**
     * <p>Returns the adapter's data model nodes corresponding to the currently selected treeView nodes.
     * See also{@link treeView#getSelection} and{@link treeView#getNodes}.</p>
     *
     * @return{treeNodeAdapter.node[]} Array of data model nodes selected.
     * @example <caption>This example gets the nodes for the current selection.</caption>
     * var selectedNodes = $('.selector').treeView('getSelectedNodes');
     */
    getSelectedNodes: function(){
        return this.getNodes(this.getSelection());
    }, // getSelectedNodes

    /**
     * <p>Sets the adapter's data model nodes corresponding to the node ids passed in.
     * See also{@link treeView#getSelection} and{@link treeView#getNodes}.</p>
     *
     * @example <caption>This example sets the nodes for the node ids passed in.</caption>
     * var selectedNodes = $('.selector').treeView('setSelectedNodes', [123,234]);
     */
    setSelectedNodes: function(pNodeIdList){
      var self = this,
          adapter = this.getNodeAdapter(),
          node;
      self._clearSelection();
      $.each(pNodeIdList, function(){
        node = self._getNodeById(adapter.data, this);
        if(node){
          self._select($(`#${node.elementId}`));
        };
      });
    }, // setSelectedNodes

    _clearSelection: function(){
      var self = this;
      this.getSelection().each(function(){
        self._select($(this));
      });
    }, // _clearSelection

    _toggleNode: function(node$){
        if(node$.hasClass(C_EXPANDABLE)){
            this._expandNode(node$);
        } else{
            this._collapseNode(node$);
        }
    }, // _toggleNode

    _renderNode: function(node, level, out){
      var hasChildren, nextId, nodeClass, contentClass, noCollapse, expanded, rowClass, nc,
          disabled = false,
          options = this.options,
          nodeAdapter = this.nodeAdapter,
          nodeId;

      nextId = this.nextNodeId;

      this.treeMap[nextId] = node;
      if(nodeAdapter.setViewId){
        nodeAdapter.setViewId(this.baseId, node, nextId);
      };

      nodeId = this.baseId + nextId;
      node.elementId = nodeId;
      this.nextNodeId += 1;

      nodeClass = C_NODE + ' ';
      hasChildren = nodeAdapter.hasChildren(node);
      if(hasChildren === null){
        hasChildren = true; // null means not sure but we have to assume there could be children
      }
      if(hasChildren){
        expanded = false;
        if(nodeAdapter.isExpanded){
          expanded = nodeAdapter.isExpanded(this.baseId, node);
        }
        nodeClass += expanded ? C_COLLAPSIBLE : C_EXPANDABLE;
      } else{
        nodeClass += C_LEAF;
      }

      noCollapse = nextId === 0 && options.showRoot && !options.collapsibleRoot;
      if(noCollapse){
        nodeClass += ' ' + C_NO_COLLAPSE;
      }
      if(level === 1){
        nodeClass += ' ' + C_TOP_NODE;
      }

      contentClass = C_CONTENT;
      if(nodeAdapter.isDisabled && nodeAdapter.isDisabled(node)){
        contentClass += ' ' + C_DISABLED;
        disabled = true;
      }

      rowClass = C_ROW;

      out.markup('<li').attr('id', nodeId)
         .attr(A_CLASS, nodeClass)
         .markup('>');

      if(nodeAdapter.getClasses){
        nc = nodeAdapter.getClasses(node);
        if(nc){
          contentClass += ' ' + nc;
          rowClass += ' ' + nc;
        }
      }

      out.markup('<div').attr(A_CLASS, rowClass).markup('></div>');

      // for nodes with children show the disclose (expand/collapse) control
      if(hasChildren &&
        !noCollapse){ // suppress the toggle on the root if it is not collapsible
        out.markup('<span class="' + C_TOGGLE + '"></span>');
      }

      out.markup('<div').attr(A_CLASS, contentClass).markup('>');
      renderTreeNodeContent(out, node, nodeAdapter, this.renderNodeOptions, {
        level: level,
        selected: false,
        disabled: disabled,
        hasChildren: hasChildren,
        expanded: true,
        leaves: 0,
        checkedNodes: 0
      });
      out.markup('</div>');

      // No lazy rendering to enable selection of any node by setSelectedNodes
	  out.markup(M_BEGIN_CHILDREN);
	  this._renderChildren(node, level + 1, out);
	  out.markup(M_END_CHILDREN);

      out.markup('</li>');
    }, // _renderNode

    _renderChildren: function(node, level, out, fn, node$){
        var len,
            self = this,
            nodeAdapter = this.nodeAdapter,
            childNode;

            function doit() {
              var i;
              for ( i = 0; i < len; i++ ) {
                childNode = nodeAdapter.child(node, i);
                childNode.parentNode = node;
                self._renderNode(childNode, level, out);
              }
              if(fn){
                fn(true);
              }
            }

        len = nodeAdapter.childCount(node);

        if(len > 0){
          doit();
        }
        else{
          if (fn) {
            fn(0); // no children were rendered
          }
        }
    }, // _renderChildren

    _getRoots: function(){
        return this.element.children('ul').children('li');
    }, // _getRoots

    _getNodeById: function(pData, pId){
      var self = this,
          node;
      if(pData.id == pId){
        node = pData;
      }
      else if(typeof(node) == 'undefined' && pData.children){
        $.each(pData.children, function(){
          node = self._getNodeById(this, pId);
          if(typeof(node) != 'undefined'){return false;}
        });
      };
      return node;
    }, // _getNodeById

    _persistExpansionState: function(node, node$, state){
        var nodeAdapter = this.nodeAdapter;

        if(nodeAdapter.setExpanded){
            nodeAdapter.setExpanded(this.baseId, node, state);
        }
        this._trigger(EVENT_EXPANSION_STATE_CHANGE,{},{
            node: node,
            nodeContent$: node$.children(SEL_CONTENT),
            expanded: state
        });
    }, // _persistExpansionState

    _expandNode: function(node$, fn){
        var ul$, out,
            self = this,
            nodeAdapter = this.nodeAdapter,
            node = this.treeMap[getIdFromNode(node$)];

        if(this.options.autoCollapse){
            node$.parent().children('.' + C_COLLAPSIBLE).each(function(){
                self._collapseNode($(this));
            });
        }
        node$.removeClass(C_EXPANDABLE);
        ul$ = node$.children('ul');
        if(ul$.length > 0 && nodeAdapter.childCount(node) !== null){
            ul$.show(); // already rendered so show it
            node$.addClass(C_COLLAPSIBLE).children(SEL_CONTENT).find(this.labelSelector).attr(A_EXPANDED, TRUE);
            this._persistExpansionState(node, node$, true);
            if(fn){
                fn();
            }
        } else{
            ul$.remove(); // remove ifany
            out = apex.util.htmlBuilder();
            out.markup(M_BEGIN_CHILDREN);
            this._renderChildren(node, getLevelFromNode(node$, this.labelSelector) + 1, out, function (status){
                if(status){
                    node$.addClass(C_COLLAPSIBLE).children(SEL_CONTENT).find(self.labelSelector).attr(A_EXPANDED, TRUE);
                    out.markup(M_END_CHILDREN);
                    node$.append(out.toString());
                    self._persistExpansionState(node, node$, true);
                } else if(status === 0){
                    node$.children(SEL_TOGGLE).remove();
                    node$.addClass(C_LEAF).children(SEL_CONTENT).find(self.labelSelector).removeAttr(A_EXPANDED);
                };
                if(fn){
                  fn();
                }
            }, node$);
        }
    }, // _expandNode

    _collapseNode: function(node$){
        var options = this.options;

        if(options.showRoot && !options.collapsibleRoot && node$.parent().parent().hasClass(C_TREEVIEW)){
            return; // can't collapse root
        }
        node$.removeClass(C_COLLAPSIBLE).addClass(C_EXPANDABLE).children(SEL_CONTENT).find(this.labelSelector).attr(A_EXPANDED, FALSE);
        node$.children('ul').hide();
        this._persistExpansionState(this.treeMap[getIdFromNode(node$)], node$, false);
    }, // _collapseNode

    _traverseDown: function(event, count){
        var node$, next$, i;

        if(!this.lastFocused){
            return;
        }
        node$ = $(this.lastFocused).closest(SEL_NODE);
        for (i = 0; i < count; i++){
            next$ = nextNode(node$);
            if(next$.length === 0){
                break;
            }
            node$ = next$;
        };
        if ( node$.length > 0 ) {
            this._focus( node$.children( SEL_CONTENT ), event, true, true );
        };
     }, // _traverseDown

    _traverseUp: function(event, count){
        var node$, prev$, i;

        if(!this.lastFocused){
            return;
        }
        node$ = $(this.lastFocused).closest(SEL_NODE);
        for (i = 0; i < count; i++){
            prev$ = prevNode(node$);
            if(prev$.length === 0){
                break;
            }
            node$ = prev$;
        };
        if ( node$.length > 0 ) {
            this._focus( node$.children( SEL_CONTENT ), event, true, true );
        };
     }, // _traverseUp

    _select: function(pNode$){
      var modelNode,
          isSelectable = pNode$.not(SEL_DISABLED);

      if(isSelectable){
        modelNode = this.getNodes(pNode$)[0];
        setSubTree(modelNode, this);
        this.element.trigger(EVENT_SELECTION_CHANGE);
      };
    },

    _focus: function(pNode$){
      var focusLabel$, sp, offset, treeOffset, spOffset,
          ctrl$ = this.element;

      focusLabel$ = pNode$.eq(0).find(this.labelSelector);

      // focus if needed
      if (focusLabel$.length){
        if (focus){
          setFocus(focusLabel$[0]);
        } else{
          this._setFocusable(focusLabel$);
        }
        if(this.scrollParent){
          sp = this.scrollParent[0];
          // scroll into view if needed
          // Don't use scrollIntoView because it applies to all potentially scrollable ancestors, we only
          // want to scroll within the immediate scroll parent.
          // Chrome scrolls parents other than the immediate scroll parent even though it seems that it shouldn't
          offset = focusLabel$.parent().offset();
          // in some cases while editing the node label the offset can be undefined
          if(offset){
            treeOffset = ctrl$.offset();
            if (sp === document){
              spOffset ={top: $(document).scrollTop(), left: $(document).scrollLeft()};
              if ((offset.top < spOffset.top) || (offset.top > spOffset.top + $(window).height())){
                  $(document).scrollTop(offset.top - treeOffset.top);
              }
              if ((offset.left + focusLabel$.parent()[0].offsetWidth < spOffset.left) || (offset.left > spOffset.left + $(window).width())) {
                  $(document).scrollLeft(offset.left - treeOffset.left);
              }
            } else{
              spOffset = this.scrollParent.offset();
              treeOffset = ctrl$.offset(); // xxx needed?
              if ((offset.top < spOffset.top) || (offset.top > spOffset.top + sp.offsetHeight)){
                  sp.scrollTop = offset.top - treeOffset.top;
              }
              if ((offset.left + focusLabel$.parent()[0].offsetWidth < spOffset.left) || (offset.left > spOffset.left + sp.offsetWidth)) {
                  sp.scrollLeft = offset.left - treeOffset.left;
              }
            }
          }
        }
      }
    }, // _focus

    _setFocusable: function(label$){
      var label = label$[0];

      if (label){
        if (this.lastFocused && this.lastFocused !== label){
            this.lastFocused.tabIndex = -1;
        }
        label.tabIndex = 0;
        this.lastFocused = label;
      }
    } // _setFocusable
  })
);

  /**
   * @lends treeNodeAdapter.prototype
   */
  var defaultNodeAdapter = {
    /**
     * <p>Returns the root node of the tree. All trees must have a single root node even if it is not
     * shown/used.</p>
     * @return{treeNodeAdapter.node} The root node.
     */
    root: function(){
        return this.data;
    },

    /**
     * <p>Returns the label of the given node. The label is used for node content rendering (if
     *{@link treeNodeAdapter#renderNodeContent} not implemented) and for editing during rename.</p>
     *
     * @param{treeNodeAdapter.node} pNode The node from which to get the label.
     * @return{string} The node's label.
     */
    getLabel: function(pNode){
        return pNode.label;
    },

    /**
     * <p>Returns the icon of the node or null if none. The icon is a CSS class name.
     * The icon is used by node content rendering. This is an optional method.
     * if the method doesn't exist then no nodes will have icons.</p>
     *
     * @param{treeNodeAdapter.node} pNode The node from which to get the icon.
     * @return{string} The node's icon.
     */
    getIcon: function(pNode){
        var icon = null;

        if(pNode.icon || pNode.icon === null){
            icon = pNode.icon;
        }
        return icon;
    },

    /**
     * <p>Returns one or more CSS classes to add to the node content container or null if none. Multiple
     * classes are separated by a space. This is an optional method.
     * if the method doesn't exist then no nodes will have classes added to the node content container.</p>
     *
     * @param{treeNodeAdapter.node} pNode The node from which to get the CSS classes.
     * @return{string} The node's CSS Classes.
     */
    getClasses: function(pNode){
        var classes = null;

        if(pNode.classes){
            if(classes){
                classes += ' ' + pNode.classes;
            } else{
                classes = pNode.classes;
            }
        }
        return classes;
    },

    /**
     * <p>Returns the disabled state of a node.
     * A disabled node cannot be selected but it can be focused.
     * This is an optional method. if not defined no nodes are ever disabled.</p>
     *
     * @param{treeNodeAdapter.node} pNode The node from which to get the disabled state.
     * @return{boolean} true if the node is disabled and false otherwise.
     */
    isDisabled: function(pNode){
        var disabled = false;

        if(pNode.isDisabled !== undefined){
            disabled = pNode.isDisabled;
        }

        return disabled;
    },

    /**
     * <p>Return the i<sup>th</sup> child of the given node.</p>
     *
     * @param{treeNodeAdapter.node} pNode The node from which to get the child node.
     * @param{integer} pIndex The index of the child to return.
     * @return{treeNodeAdapter.node} The child node. if the node has no children or no child at index i then
     *   undefined is returned.
     */
    child: function(pNode, pIndex){
        if(pNode.children){
            return pNode.children[pIndex];
        }
        // undefined
    },

    /**
     * <p>Returns the number of children that the given node has or null if the answer is not yet known, which
     * can happen for lazy loaded nodes.</p>
     *
     * @param{treeNodeAdapter.node} pNode The node from which to get the number of children.
     * @return{?number} The number of children or null ifunknown.
     */
    childCount: function(pNode){
        return pNode.children ? pNode.children.length : 0;
    },

    /**
     * <p>Returns true if the node has children, false if it does not and null if not yet known, which
     * can happen for lazy loaded nodes.</p>
     *
     * @param{treeNodeAdapter.node} pNode The node for which to determine if it has children.
     * @return{?boolean} true if the node has children, false if it does not and null if not yet known.
     */
    hasChildren: function(pNode){
        return pNode.children ? pNode.children.length > 0 : false;
    }
  };

  tree.makeDefaultNodeAdapter = function(pData, pTypes, pHasIdentity, pInitialExpandedNodeIds){
    var that = Object.create(defaultNodeAdapter);

    that._getIdentity = $.isFunction('id') ? 'id' : function(node){return node['id'];};

    if($.isArray(pHasIdentity)){
      pInitialExpandedNodeIds = pHasIdentity;
      pHasIdentity = true;
    };

    if(pHasIdentity === null || pHasIdentity === undefined){
      pHasIdentity = true;
    };

    if(pHasIdentity){
      that._state = {};
      /**
       * <p>Return true if the given node is or should be expanded and false otherwise.</p>
       *
       * @param{string} pTreeId This is a unique opaque identifier supplied by the treeView.
       * @param{treeNodeAdapter.node} pNode The node to check if it is expanded.
       * @returns{boolean}
       */
      that.isExpanded = function(pTreeId, pNode){
        var expandedNodes = this._getExpandedNodes(pTreeId);
        return (expandedNodes[this._getIdentity(pNode)]) || false;
      }; //isExpanded

      /**
       * <p>Called when the expansion state of the tree node changes.</p>
       *
       * @param{string} pTreeId This is a unique opaque identifier supplied by the treeView.
       * @param{treeNodeAdapter.node} pNode The node that has been expanded or collapsed.
       * @param{boolean} pExpanded true if the node is expanded and false if it is collapsed.
       */
      that.setExpanded = function(pTreeId, pNode, pExpanded){
        var expandedNodes = this._getExpandedNodes(pTreeId);
        expandedNodes[this._getIdentity(pNode)] = pExpanded;
      }; //setExpanded

      /**
       * Returns an array of each of the expanded node's id. Can be used to persist the expansion state.
       * See{@link treeView#getExpandedNodeIds}.
       *
       * @param{string} pTreeId This is a unique opaque identifier supplied by the treeView.
       * @returns{Array}
       */
      that.getExpandedNodeIds = function(pTreeId){
        var n,
            nodes = [],
            expandedNodes = this._getExpandedNodes(pTreeId);

        for (n in expandedNodes){
          if(expandedNodes.hasOwnProperty(n) && expandedNodes[n] === true){
            nodes.push(n);
          }
        }
        return nodes;
      }; //getExpandedNodeIds

      that._getExpandedNodes = function(pTreeId){
        var i,
            expandedNodes = this._state[pTreeId] && this._state[pTreeId].expandedNodes;

        if (!expandedNodes){
            if (! this._state[pTreeId]){
              this._state[pTreeId] ={};
            }
            expandedNodes ={};
            this._state[pTreeId].expandedNodes = expandedNodes;
            if (pInitialExpandedNodeIds){
              for (i = 0; i < pInitialExpandedNodeIds.length; i++){
                expandedNodes[pInitialExpandedNodeIds[i]] = true;
              }
            }
        }
        return expandedNodes;
      }; //_getExpandedNodes

      /**
       * Returns map of node id to expansion state. See{@link treeView#getExpandedState}.
       *
       * @param{string} pTreeId This is a unique opaque identifier supplied by the treeView.
       */
      that.getExpandedState = function(pTreeId){
        var expandedNodes = this._getExpandedNodes(pTreeId);

        // return a copy
        return $.extend({}, expandedNodes);
      }; //getExpandedState

      /**
       * Return the view id for the given <code class='prettyprint'>pTreeId</code>
       * and <code class='prettyprint'>pNode</code>.
       * This is used by the treeView to map from nodes to DOM elements.
       * See also{@link treeNodeAdapter#setViewId}.
       *
       * @param{string} pTreeId This is a unique opaque identifier supplied by the treeView.
       * @param{treeNodeAdapter.node} pNode The node to get the view id for.
       * @returns{string} The view id for this node that was assigned with{@link treeNodeAdapter#setViewId}.
       */
      that.getViewId = function(pTreeId, pNode){
        var nodeMap = this._state[pTreeId] && this._state[pTreeId].nodeMap;
        return pTreeId + nodeMap[this._getIdentity(pNode)];
      }; //getViewId

      /**
       * Set the view id for the given <code class='prettyprint'>pTreeId</code>
       * and <code class='prettyprint'>pNode</code>.
       * This is used by the treeView to map from nodes to DOM elements.
       *
       * @param{string} pTreeId This is a unique opaque identifier supplied by the treeView.
       * @param{treeNodeAdapter.node} pNode The node to set the view id for.
       * @param{string} pViewId The view id to associate with the given node.
       */
      that.setViewId = function(pTreeId, pNode, pViewId){
        var nodeMap = this._state[pTreeId] && this._state[pTreeId].nodeMap;
        if(!nodeMap){
          nodeMap ={};
          if(! this._state[pTreeId]){
            this._state[pTreeId] ={};
          }
          this._state[pTreeId].nodeMap = nodeMap;
        }
        nodeMap[this._getIdentity(pNode)] = pViewId;
      }; //setViewId

      /**
       * Remove the view id mapping for node <code class='prettyprint'>pNode</code>.
       * if the node is null then all previous view id mappings should be removed.
       * See also{@link treeNodeAdapter#setViewId}.
       *
       * @param{string} pTreeId This is a unique opaque identifier supplied by the treeView.
       * @param{treeNodeAdapter.node} [pNode] The node to clear the view id for.
       */
      that.clearViewId = function(pTreeId, pNode){
        var nodeMap = this._state[pTreeId] && this._state[pTreeId].nodeMap,
            expandedNodes = this._state[pTreeId] && this._state[pTreeId].expandedNodes;

        if(nodeMap){
          if(pNode){
            delete nodeMap[this._getIdentity(pNode)];
            if(expandedNodes){
              delete expandedNodes[this._getIdentity(pNode)];
            }
          } else{
            this._state[pTreeId].nodeMap ={};
            delete this._state[pTreeId].expandedNodes;
          }
        }
      }; //clearViewId

      that._nextId = 1;
    }; // end if pHasIdentity

    that.data = pData;

    that.types = $.extend(true,{},{
        'default' :{
            isDisabled: false,
            validChildren: true, // any children are allowed
            operations:{}
        }
    }, pTypes); // types

    return that;
  }; //makeDefaultNodeAdapter

  /** <p>Render method for the apex.treeView</p>
   * <p>This method is used to render the node content.</p>
   * @method renderNodeContent
   * @instance
   * @memberof treeNodeAdapter
   * @param{treeNodeAdapter.node} pNode The node from which to get the disabled state.
   * @param{apex.util.htmlBuilder} pOut Call methods on this interface to render the node content.
   * @param{Object} pOptions View options.
   * @param{string} pOptions.iconType CSS class used in creating an icon. The{@link treeView#iconType} option value.
   * @param{string} pOptions.labelClass CSS classes to use for the content label. The{@link treeView#labelClass} option.
   * @param{Object} pState Node state information.
   * @param{boolean} pState.selected iftrue the node is selected.
   * @param{integer} pState.level This is the level of the node. Used for the <code class='prettyprint'>aria-level</code> attribute.
   * @param{boolean} pState.disabled This is true if the node is disabled.
   * @param{boolean} pState.hasChildren This is true if the node has children.
   * @param{boolean} pState.expanded This is true if the node is expanded.
   */
  function renderTreeNodeContent(pOut, pNode, pAdapter, pOptions, pState){
    var icon,
        elementName,
        cssClass = C_TREE_CHECK_CLASS + ' ',
        isSelected = pState.hasChildren === false && pNode.checkedNodes > 0;

    // this is the checkbox - its not a real checkbox input
    pOut.markup('<a ')
      .attr(A_CLASS, cssClass)
      .markup('>')
      .markup('</a>');

    // the rest of this code is essentially a copy of what is in widget.treeView.js function renderTreeNodeContent
    if(pAdapter.getIcon){
      icon = pAdapter.getIcon(pNode);
      if(icon !== null){
        pOut.markup(`<span class='${pOptions.iconType} ${icon} ${C_ICON}'></span>`);
      }
    }
    pOut.markup('<span tabIndex="-1" role="treeitem"')
      .attr(A_CLASS, pOptions.labelClass + ' level' + pState.level)
      .attr(A_LEVEL, pState.level)
      .attr(A_SELECTED, isSelected ? 'true' : 'false')
      .optionalAttr(A_DISABLED, pState.disabled ? 'true' : null)
      .optionalAttr(A_EXPANDED, pState.hasChildren === false ? null : pState.expanded ? 'true' : 'false')
      .markup('>')
      .content(pAdapter.getLabel(pNode))
      .markup('</span>');
  }; // renderTreeNodeContent


  /** <p>Method to set the focus to a node in the tree</p>
   */
  function setFocus(elem){
      elem.tabIndex = 0;
      elem.focus();
  }; // focus


  /** <p>Method to find the next node in the tree</p>
   */
  function nextNode(node$){
      var next$;

      // First try the child li, then sibling li, finally parent's sibling if any.
      if (node$.hasClass(C_COLLAPSIBLE)){
          next$ = node$.children('ul').children('li').first();
      } else{
          // Look for next sibling, if not found, move up and find next sibling.
          next$ = node$.next();
          if (next$.length === 0){
              next$ = node$.parent().parents('li').next('li').first();
          }
      }
      return next$;
  }; // nextNode

  /** <p>Method to find the previous node in the tree</p>
   */
  function prevNode(node$){
      var prev$;

      // First try previous last child, then previous, finally parent if any
      prev$ = node$.prev();
      if (prev$.length > 0){
          if (prev$.hasClass(C_COLLAPSIBLE)){
              prev$ = prev$.find('li').filter(':visible').last();
          }
      } else{
          prev$ = node$.parent().parent('li');
      }
      return prev$;
  }; //prevNode


  /** p>Method travesres down the tree and sets or resets the select status</p>
   */
  function setSubTree(pNode, tree, pCheckMode){
    var node$ = $('#' + pNode.elementId),
        selector, isDirectCall;

    // switch off if recursively called
    isDirectCall = typeof(pCheckMode) == 'undefined';
    if(isDirectCall){
      // CheckMode is set to uncheck if clicked node is either full or partially checked
      selector = C_TREE_PART_CHECK_SELECTOR + ', ' + C_TREE_FULL_CHECK_SELECTOR;
      pCheckMode = node$.children('div').children(selector).length > 0 ? C_UNCHECKED : C_CHECKED;
    };

    if(pNode.children){
      // Node has children, call setSubTree recursively
      pNode.children.forEach(function(childNode, index, arrayOfChildren){
        setSubTree(childNode, tree, pCheckMode);
      });
      // propagate changes after all children have been processed
      setParentCheckboxes(node$, tree);
    }
    else{
      setCheckbox(node$, pCheckMode);
      if (isDirectCall){
        // leaf was directly clicked, propagate changes to parent node
        setParentCheckboxes($('#' + pNode.parentNode.elementId), tree);
      };
    };
  }; //setSubTree


  /** <p>Method to control the visibility and selection status of the checkbox nodes</p>
   */
  function setCheckbox(pNode$, pCheckMode){
    // Leaf node, set to check mode and select if necessary
    pNode$.find(C_TREE_CHECK_SELECTOR).removeClass(C_TREE_FULL_CHECK_CLASS);
    pNode$.find(SEL_CONTENT).removeClass(C_SELECTED);
    pNode$.find(SEL_LABEL).attr(A_SELECTED, false);
    if(pCheckMode == C_CHECKED){
      pNode$.find(C_TREE_CHECK_SELECTOR).addClass(C_TREE_FULL_CHECK_CLASS);
      pNode$.find(SEL_CONTENT).addClass(C_SELECTED);
      pNode$.find(SEL_LABEL).attr(A_SELECTED, true);
    };
  }; //setCheckbox

  /** <p>Method to propagate the state of the checkboxes up the tree</p>
   */
  function setParentCheckboxes(pNode$, tree){
    var childrenCount, checkedCount, actualNode;

    pNode$.children().parents(SEL_NODE).each(function(){
      var node$ = $(this);
      // propagate changes on child nodes up the tree
      actualNode = node$.children('div').children(C_TREE_CHECK_SELECTOR);
      actualNode
        .removeClass(C_TREE_FULL_CHECK_CLASS)
        .removeClass(C_TREE_PART_CHECK_CLASS);
      childrenCount = node$.find(C_TREE_CHECK_SELECTOR).length - 1; // exclude actual node
      checkedCount = node$.find(C_TREE_FULL_CHECK_SELECTOR).length;
      switch(checkedCount){
        case 0:
          tree._collapseNode(node$);
          break;
        case childrenCount:
          actualNode.addClass(C_TREE_FULL_CHECK_CLASS);
          tree._expandNode(node$);
          break;
        default:
          actualNode.addClass(C_TREE_PART_CHECK_CLASS);
          tree._expandNode(node$);
      };
    });
  }; //setParentCheckboxes

})(de.condes.plugin.treeItem, apex.jQuery, apex.server);
