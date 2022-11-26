/**
 * Copyright (c) 2018, Douglas H. Summerville, Binghamton University
 * (see license.txt for attributions)
 */
Menus = function(editorUi)
{
	this.editorUi = editorUi;
	this.menus = new Object();
	this.init();
	
	
	if (!mxClient.IS_SVG)
	{
		new Image().src = this.checkmarkImage;
	}
};

Menus.prototype.defaultFont = 'Helvetica';

Menus.prototype.defaultFontSize = '12';

Menus.prototype.defaultMenuItems = ['file', 'edit', 'view', 'arrange', 'design', 'help'];

Menus.prototype.defaultFonts = ['Helvetica', 'Verdana', 'Times New Roman', 'Garamond', 'Comic Sans MS',
           		             'Courier New', 'Georgia', 'Lucida Console', 'Tahoma'];

Menus.prototype.init = function()
{
	var graph = this.editorUi.editor.graph;
	var isGraphEnabled = mxUtils.bind(graph, graph.isEnabled);

	this.customFonts = [];
	this.customFontSizes = [];

	this.put('fontFamily', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		var addItem = mxUtils.bind(this, function(fontname)
		{
			var tr = this.styleChange(menu, fontname, [mxConstants.STYLE_FONTFAMILY], [fontname], null, parent, function()
			{
				document.execCommand('fontname', false, fontname);
			}, function()
			{
				graph.updateLabelElements(graph.getSelectionCells(), function(elt)
				{
					elt.removeAttribute('face');
					elt.style.fontFamily = null;
					
					if (elt.nodeName == 'PRE')
					{
						graph.replaceElement(elt, 'div');
					}
				});
			});
			tr.firstChild.nextSibling.style.fontFamily = fontname;
		});
		
		for (var i = 0; i < this.defaultFonts.length; i++)
		{
			addItem(this.defaultFonts[i]);
		}

		menu.addSeparator(parent);
		
		if (this.customFonts.length > 0)
		{
			for (var i = 0; i < this.customFonts.length; i++)
			{
				addItem(this.customFonts[i]);
			}
			
			menu.addSeparator(parent);
			
			menu.addItem(mxResources.get('reset'), null, mxUtils.bind(this, function()
			{
				this.customFonts = [];
			}), parent);
			
			menu.addSeparator(parent);
		}
		
		this.promptChange(menu, mxResources.get('custom') + '...', '', mxConstants.DEFAULT_FONTFAMILY, mxConstants.STYLE_FONTFAMILY, parent, true, mxUtils.bind(this, function(newValue)
		{
			this.customFonts.push(newValue);
		}));
	})));
	this.put('align', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		menu.addItem(mxResources.get('leftAlign'), null, function() { graph.alignCells(mxConstants.ALIGN_LEFT); }, parent);
		menu.addItem(mxResources.get('center'), null, function() { graph.alignCells(mxConstants.ALIGN_CENTER); }, parent);
		menu.addItem(mxResources.get('rightAlign'), null, function() { graph.alignCells(mxConstants.ALIGN_RIGHT); }, parent);
		menu.addSeparator(parent);
		menu.addItem(mxResources.get('topAlign'), null, function() { graph.alignCells(mxConstants.ALIGN_TOP); }, parent);
		menu.addItem(mxResources.get('middle'), null, function() { graph.alignCells(mxConstants.ALIGN_MIDDLE); }, parent);
		menu.addItem(mxResources.get('bottomAlign'), null, function() { graph.alignCells(mxConstants.ALIGN_BOTTOM); }, parent);
	})));
	this.put('distribute', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		menu.addItem(mxResources.get('horizontal'), null, function() { graph.distributeCells(true); }, parent);
		menu.addItem(mxResources.get('vertical'), null, function() { graph.distributeCells(false); }, parent);
	})));
	this.put('arrange', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['toFront', 'toBack', '-'], parent);
		
		
		this.addSubmenu('align', menu, parent);
		this.addSubmenu('distribute', menu, parent);
		menu.addSeparator(parent);
		
		
		
		
	}))).isEnabled = isGraphEnabled;
	this.put('view', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ((this.editorUi.format != null) ? ['formatPanel'] : []).
			concat(['outline', 'layers', '-', 'pageView', 'pageScale', '-', 'scrollbars', 'tooltips', '-',
			        'grid', 'guides', '-', 'connectionArrows', 'connectionPoints', '-',
			        'resetView', 'zoomIn', 'zoomOut'], parent));
	})));
	
	this.put('viewPanels', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		if (this.editorUi.format != null)
		{
			this.addMenuItems(menu, ['formatPanel'], parent);
		}
		
		this.addMenuItems(menu, ['outline', 'layers'], parent);
	})));
	this.put('viewZoom', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['resetView', '-'], parent);
		var scales = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
		
		for (var i = 0; i < scales.length; i++)
		{
			(function(scale)
			{
				menu.addItem((scale * 100) + '%', null, function()
				{
					graph.zoomTo(scale);
				}, parent);
			})(scales[i]);
		}

		this.addMenuItems(menu, ['-', 'fitWindow', 'fitPageWidth', 'fitPage', 'fitTwoPages', '-', 'customZoom'], parent);
	})));
	this.put('file', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		
		this.addMenuItems(menu, ['new',  'import','open','-', 'save', 'saveAs', '-', 'pageSetup', 'print'], parent);
	})));
	this.put('edit', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['undo', 'redo', '-', 'cut', 'copy', 'paste', 'delete', '-', 'duplicate', '-',
		                         '-',
		                         'selectVertices', 'selectEdges', 'selectAll', 'selectNone', '-', 'lockUnlock']);
	})));
	this.put('design', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['designRulesCheck', 'exportVerilog', 'editDiagram', '-', 'simulate']);
	})));
	
	
		
	
	this.put('help', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['help', '-', 'about']);
	})));
};

Menus.prototype.put = function(name, menu)
{
	this.menus[name] = menu;
	
	return menu;
};

Menus.prototype.get = function(name)
{
	return this.menus[name];
};

Menus.prototype.addSubmenu = function(name, menu, parent, label)
{
	var entry = this.get(name);
	
	if (entry != null)
	{
		var enabled = entry.isEnabled();
	
		if (menu.showDisabled || enabled)
		{
			var submenu = menu.addItem(label || mxResources.get(name), null, null, parent, null, enabled);
			this.addMenu(name, menu, submenu);
		}
	}
};


Menus.prototype.addMenu = function(name, popupMenu, parent)
{
	var menu = this.get(name);
	
	if (menu != null && (popupMenu.showDisabled || menu.isEnabled()))
	{
		this.get(name).execute(popupMenu, parent);
	}
};


Menus.prototype.addMenuItem = function(menu, key, parent, trigger, sprite, label)
{
	var action = this.editorUi.actions.get(key);

	if (action != null && (menu.showDisabled || action.isEnabled()) && action.visible)
	{
		var item = menu.addItem(label || action.label, null, function()
		{
			action.funct(trigger);
		}, parent, sprite, action.isEnabled());
		
		
		if (action.toggleAction && action.isSelected())
		{
			menu.addCheckmark(item, Editor.checkmarkImage);
		}

		this.addShortcut(item, action);
		
		return item;
	}
	
	return null;
};

Menus.prototype.addShortcut = function(item, action)
{
	if (action.shortcut != null)
	{
		var td = item.firstChild.nextSibling.nextSibling;
		var span = document.createElement('span');
		span.style.color = 'gray';
		mxUtils.write(span, action.shortcut);
		td.appendChild(span);
	}
};

Menus.prototype.addMenuItems = function(menu, keys, parent, trigger, sprites)
{
	for (var i = 0; i < keys.length; i++)
	{
		if (keys[i] == '-')
		{
			menu.addSeparator(parent);
		}
		else
		{
			this.addMenuItem(menu, keys[i], parent, trigger, (sprites != null) ? sprites[i] : null);
		}
	}
};

Menus.prototype.createPopupMenu = function(menu, cell, evt)
{
	var graph = this.editorUi.editor.graph;
	menu.smartSeparators = true;
	
	if (graph.isSelectionEmpty())
	{
		this.addMenuItems(menu, ['undo', 'redo', 'pasteHere'], null, evt);
	}
	else
	{
		this.addMenuItems(menu, ['delete', '-', 'cut', 'copy', '-', 'duplicate'], null, evt);
	}

	if (!graph.isSelectionEmpty())
	{
		
		cell = graph.getSelectionCell();
		var state = graph.view.getState(cell);

		if (state != null)
		{
			var hasWaypoints = false;
			this.addMenuItems(menu, ['toFront', 'toBack', '-'], null, evt);

			if (graph.getModel().isEdge(cell) && mxUtils.getValue(state.style, mxConstants.STYLE_EDGE, null) != 'entityRelationEdgeStyle' &&
				mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null) != 'arrow')
			{
				var handler = graph.selectionCellsHandler.getHandler(cell);
				var isWaypoint = false;
				
				if (handler instanceof mxEdgeHandler && handler.bends != null && handler.bends.length > 2)
				{
					var index = handler.getHandleForEvent(graph.updateMouseEvent(new mxMouseEvent(evt)));
					
					
					
					var rmWaypointAction = this.editorUi.actions.get('removeWaypoint');
					rmWaypointAction.handler = handler;
					rmWaypointAction.index = index;

					isWaypoint = index > 0 && index < handler.bends.length - 1;
				}
				
				menu.addSeparator();
				
				this.addMenuItems(menu, [(isWaypoint) ? 'removeWaypoint' : 'addWaypoint'], null, evt);
				
				
				var geo = graph.getModel().getGeometry(cell);
				hasWaypoints = geo != null && geo.points != null && geo.points.length > 0;
			}

			if (graph.getSelectionCount() == 1 && (hasWaypoints || (graph.getModel().isVertex(cell) &&
				graph.getModel().getEdgeCount(cell) > 0)))
			{
				this.addMenuItems(menu, ['clearWaypoints'], null, evt);
			}
			
				
			
			
		}
	}
	else
	{
		this.addMenuItems(menu, ['-', 'selectVertices', 'selectEdges',
			'selectAll'], null, evt);
	}
};

Menus.prototype.createMenubar = function(container)
{
	var menubar = new Menubar(this.editorUi, container);
	var menus = this.defaultMenuItems;
	
	for (var i = 0; i < menus.length; i++)
	{
		(mxUtils.bind(this, function(menu)
		{
			var elt = menubar.addMenu(mxResources.get(menus[i]), mxUtils.bind(this, function()
			{
				
				menu.funct.apply(this, arguments);
			}));
			
			this.menuCreated(menu, elt);
		}))(this.get(menus[i]));
	}

	return menubar;
};

Menus.prototype.menuCreated = function(menu, elt, className)
{
	if (elt != null)
	{
		className = (className != null) ? className : 'geItem';
		
		menu.addListener('stateChanged', function()
		{
			elt.enabled = menu.enabled;
			
			if (!menu.enabled)
			{
				elt.className = className + ' mxDisabled';
				
				if (document.documentMode == 8)
				{
					elt.style.color = '#c3c3c3';
				}
			}
			else
			{
				elt.className = className;
				
				if (document.documentMode == 8)
				{
					elt.style.color = '';
				}
			}
		});
	}
};

function Menubar(editorUi, container)
{
	this.editorUi = editorUi;
	this.container = container;
};

Menubar.prototype.hideMenu = function()
{
	this.editorUi.hideCurrentMenu();
};

Menubar.prototype.addMenu = function(label, funct, before)
{
	var elt = document.createElement('a');
	elt.setAttribute('href', 'javascript:void(0);');
	elt.className = 'geItem';
	mxUtils.write(elt, label);
	this.addMenuHandler(elt, funct);
	
    if (before != null)
    {
    	this.container.insertBefore(elt, before);
    }
    else
    {
    	this.container.appendChild(elt);
    }
	
	return elt;
};

Menubar.prototype.addMenuHandler = function(elt, funct)
{
	if (funct != null)
	{
		var show = true;
		
		var clickHandler = mxUtils.bind(this, function(evt)
		{
			if (show && elt.enabled == null || elt.enabled)
			{
				this.editorUi.editor.graph.popupMenuHandler.hideMenu();
				var menu = new mxPopupMenu(funct);
				menu.div.className += ' geMenubarMenu';
				menu.smartSeparators = true;
				menu.showDisabled = true;
				menu.autoExpand = true;
				
				
				menu.hideMenu = mxUtils.bind(this, function()
				{
					mxPopupMenu.prototype.hideMenu.apply(menu, arguments);
					this.editorUi.resetCurrentMenu();
					menu.destroy();
				});

				var offset = mxUtils.getOffset(elt);
				menu.popup(offset.x, offset.y + elt.offsetHeight, null, evt);
				this.editorUi.setCurrentMenu(menu, elt);
			}
			
			mxEvent.consume(evt);
		});
		
		
		mxEvent.addListener(elt, 'mousemove', mxUtils.bind(this, function(evt)
		{
			if (this.editorUi.currentMenu != null && this.editorUi.currentMenuElt != elt)
			{
				this.editorUi.hideCurrentMenu();
				clickHandler(evt);
			}
		}));

		
		mxEvent.addListener(elt, 'mousedown', mxUtils.bind(this, function()
		{
			show = this.currentElt != elt;
		}));
		
		mxEvent.addListener(elt, 'click', mxUtils.bind(this, function(evt)
		{
			clickHandler(evt);
			show = true;
		}));
	}
};

Menubar.prototype.destroy = function()
{
	
};

function Menu(funct, enabled)
{
	mxEventSource.call(this);
	this.funct = funct;
	this.enabled = (enabled != null) ? enabled : true;
};


mxUtils.extend(Menu, mxEventSource);

Menu.prototype.isEnabled = function()
{
	return this.enabled;
};

Menu.prototype.setEnabled = function(value)
{
	if (this.enabled != value)
	{
		this.enabled = value;
		this.fireEvent(new mxEventObject('stateChanged'));
	}
};

Menu.prototype.execute = function(menu, parent)
{
	this.funct(menu, parent);
};

EditorUi.prototype.createMenus = function()
{
	return new Menus(this);
};
