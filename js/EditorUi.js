/**
 * Copyright (c) 2018-2023, Douglas H. Summerville, Binghamton University
 * (see license.txt for attributions)
 */

alwaysDeleteEdges=true;
mxCell.prototype.getLinks=function(id,isoutput){ var node=this; if( isoutput ) links=node.linksOutOf().filter( function(link,index,array){ return link.style.includes('sourcePort='+id); } ); else links=node.linksInto().filter( function(link,index,array){ return link.style.includes('targetPort='+id); } ); return links ? links : null; };

mxCell.prototype.getLink=function(id,isoutput){ var links=this.getLinks(id,isoutput); return links?links[0]:null; };

mxCell.prototype.linksOutOf=function(){ try{var node=this; return  (node.edges.length) ? node.edges.filter( function(value,index,array){return value.source.id == node.id;}) : node.edges;} catch {return [];} };

mxCell.prototype.linksInto=function(){ try{var node=this; return  (node.edges.length) ? node.edges.filter( function(value,index,array){return value.target.id == node.id;}) : node.edges;}catch {return [];} };

mxCell.prototype.numLinksOutOf=function(){ try{return this.linksOutOf().length;}catch{return 0;} };
mxCell.prototype.numLinksInto=function() { try{return this.linksInto().length;} catch{return 0;}}
EditorUi = function(editor, container, lightbox)
{
	mxEventSource.call(this);
	
	this.destroyFunctions = [];
	this.editor = editor || new Editor();
	this.container = container || document.body;
	var graph = this.editor.graph;
	mxCellOverlay.prototype.graph=graph;
	this.isInSimulationMode=false;
	this.circuit=new schematic(graph);

	mxConnectionHandler.prototype.select = false;
	mxGraph.prototype.enterStopsCellEditing = true;
	function deleteEdge( edge ){
		edge.source.removeEdge(edge,true);
		edge.target.removeEdge(edge,false);
		edge.removeFromParent();
	}

    graph.connectionHandler.addListener(mxEvent.CONNECT, function(sender, evt)
    {
	var edge = evt.getProperty('cell');

	
	var style = graph.getCellStyle(edge);
	var srcPortId = style[mxConstants.STYLE_SOURCE_PORT];
	var trgPortId = style[mxConstants.STYLE_TARGET_PORT];
	if( edge.source == edge.target )
	{
		deleteEdge(edge);
		return;
	}
	if( srcPortId.startsWith("out") && trgPortId.startsWith("out") ||
	    srcPortId.startsWith("in")  && trgPortId.startsWith("in") )
	{
		deleteEdge(edge);
		return;
	}
	
	if( srcPortId.startsWith("in") && trgPortId.startsWith("out") )
	{
		var temp=edge.target;
		edge.setTerminal(edge.source, false);
		edge.setTerminal(temp, true);
		graph.setCellStyles(mxConstants.STYLE_SOURCE_PORT, trgPortId, new Array(edge)); 
		graph.setCellStyles(mxConstants.STYLE_TARGET_PORT, srcPortId, new Array(edge));
	}

	
        style = graph.getCellStyle(edge);
	var trgPortId=style[mxConstants.STYLE_TARGET_PORT]; 
	var truecount=0;
	edge.target.linksInto().forEach(function(link) { 
		var x=graph.getCellStyle(link)[mxConstants.STYLE_TARGET_PORT]; 
		if( x == trgPortId )
			truecount++
	});
	if( truecount != 1 )
		deleteEdge(edge);

    });


//graph.addListener(mxEvent.CLICK, function(sender, evt)
//{
	//var cell = evt.getProperty('cell');
	//
	//if (cell != null )
	//{
		;//
	//}
//});


	graph.setPortsEnabled(false);
	graph.setAllowDanglingEdges(false);
	mxEdgeHandler.prototype.snapToTerminals = true;
	graph.setCellsDisconnectable(false) ;
	graph.pointImages=new Array();	
	graph.pointImages['i0_w'] = new mxImage('images/bullseye_i0_w.png', 60, 60);
	graph.pointImages['default'] = new mxImage('images/bullseye.png', 7, 7);

	graph.connectionHandler.constraintHandler.getImageForConstraint=function(state,constraint,point)
	{
		return this.graph.pointImages['default'];
	} 
//custom ports
	function portShape(bounds,text,orientation)
	{
		mxShape.call(this);
		this.text=text;	
		this.orientation=orientation;
		this.bounds=bounds;
	};
	mxUtils.extend(portShape, mxShape);
	portShape.prototype.paintBackground = function(c, x, y, w, h)
	{
		c.setStrokeColor('black');
		c.setFontSize(Math.round(.75*h));
		c.translate(x, y);
		c.begin();
		c.moveTo(w / 2, h / 2);
		switch(this.orientation)
		{
			case 'n': 
				c.lineTo(w/2, 0);
				c.text(w/2,3*h/4,w/2,h/2,' '+this.text,'center','top');
				break;
			case 'e': 
				c.lineTo(w, h / 2);
				c.text(w/4,h/2,w/2,h/2,' '+this.text,'right','middle');
				break;
			case 's': 
				c.lineTo(w/2, h );
				c.text(w/2,h/4,w/2,h/2,' '+this.text,'center','bottom');
				break;
			default:
				c.lineTo(0, h / 2);
				c.text(3*w/4,h/2,w/2,h/2,' '+this.text,'left','middle');
				break;
		}
		c.end();
		c.stroke();
				
	};
	graph.connectionHandler.constraintHandler.setFocus = function(me, state, source)
	{
	this.constraints = (state != null && !this.isStateIgnored(state, source) &&
	this.graph.isCellConnectable(state.cell)) ? ((this.isEnabled()) ?
	(this.graph.getAllConnectionConstraints(state, source) || []) : []) : null;

	// Only uses cells which have constraints
	if (this.constraints != null)
	{
	this.currentFocus = state;
	this.currentFocusArea = new mxRectangle(state.x, state.y, state.width, state.height);

	if (this.focusIcons != null)
	{
	for (var i = 0; i < this.focusIcons.length; i++)
	{
	this.focusIcons[i].destroy();
	}

	this.focusIcons = null;
	this.focusPoints = null;
	}

	this.focusPoints = [];
	this.focusIcons = [];
	var scale=this.graph.view.scale;
	for (var i = 0; i < this.constraints.length; i++)
	{
				var cp = this.graph.getConnectionPoint(state, this.constraints[i]);
				var img = this.getImageForConstraint(state, this.constraints[i], cp);

				//var src = img.src;
				var bounds = new mxRectangle(Math.round(cp.x - scale*13 / 2),
					Math.round(cp.y - scale*13 / 2), Math.round(scale*13), Math.round(scale*13));
				//var icon = new mxImageShape(bounds, src);
				//icon=new mxText('s0',bounds);
				//icon=new mxLine(bounds,'black',1);
				var constraintName=this.constraints[i].id;
				icon=new portShape(bounds,constraintName.split('_')[1],constraintName.split('_')[2]);
				icon.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ?
						mxConstants.DIALECT_MIXEDHTML : mxConstants.DIALECT_SVG;
				icon.preserveImageAspect = false;
				icon.init(this.graph.getView().getDecoratorPane());
				
				// Fixes lost event tracking for images in quirks / IE8 standards
				if (mxClient.IS_QUIRKS || document.documentMode == 8)
				{
					mxEvent.addListener(icon.node, 'dragstart', function(evt)
					{
						mxEvent.consume(evt);
						
						return false;
					});
				}
				
				// Move the icon behind all other overlays
				if (icon.node.previousSibling != null)
				{
					icon.node.parentNode.insertBefore(icon.node, icon.node.parentNode.firstChild);
				}

				var getState = mxUtils.bind(this, function()
				{
					return (this.currentFocus != null) ? this.currentFocus : state;
				});
				
				icon.redraw();

				mxEvent.redirectMouseEvents(icon.node, this.graph, getState);
				this.currentFocusArea.add(icon.bounds);
				this.focusIcons.push(icon);
				this.focusPoints.push(cp);
			}
			
			this.currentFocusArea.grow(this.getTolerance(me));
		}
		else
		{
			this.destroyIcons();
			this.destroyFocusHighlight();
		}
	};

	graph.connectionHandler.isConnectableCell = function(cell)
	{
	   return false;
	};
	mxEdgeHandler.prototype.isConnectableCell = function(cell)
	{
		return graph.connectionHandler.isConnectableCell(cell);
	};
	graph.view.getTerminalPort = function(state, terminal, source)
	{
		return terminal;
	};
	graph.getAllConnectionConstraints = function(terminal, source)
	{
		if (terminal != null && terminal.shape != null &&
			terminal.shape.stencil != null)
		{
			if (terminal.shape.stencil != null)
			{
				return terminal.shape.stencil.constraints;
			}
		}
		else if (terminal != null && this.model.isVertex(terminal.cell))
		{
			if (terminal.shape != null)
			{
				var ports = terminal.shape.getPorts();
				var cstrs = new Array();
				
				for (var id in ports)
				{
					var port = ports[id];
					
					var cstr = new mxConnectionConstraint(new mxPoint(port.x, port.y), port.perimeter);
					cstr.id = id;
					cstrs.push(cstr);
				}
				
				return cstrs;
			}
		}
		
		return null;
	};
			
	
	graph.setConnectionConstraint = function(edge, terminal, source, constraint)
	{
		if (constraint != null)
		{
			var key = (source) ? mxConstants.STYLE_SOURCE_PORT : mxConstants.STYLE_TARGET_PORT;
			
			if (constraint == null || constraint.id == null)
			{
				this.setCellStyles(key, null, [edge]);
			}
			else if (constraint.id != null)
			{
				this.setCellStyles(key, constraint.id, [edge]);
			}
		}
	};
			
	
	graph.getConnectionConstraint = function(edge, terminal, source)
	{
		var key = (source) ? mxConstants.STYLE_SOURCE_PORT : mxConstants.STYLE_TARGET_PORT;
		var id = edge.style[key];
		
		if (id != null)
		{
			var c =  new mxConnectionConstraint(null, null);
			c.id = id;
			
			return c;
		}
		
		return null;
	};

	
	graphGetConnectionPoint = graph.getConnectionPoint;
	graph.getConnectionPoint = function(vertex, constraint)
	{
		if (constraint.id != null && vertex != null && vertex.shape != null)
		{
			var port = vertex.shape.getPorts()[constraint.id];
			
			if (port != null)
			{
				constraint = new mxConnectionConstraint(new mxPoint(port.x, port.y), port.perimeter);
			}
		}
		
		return graphGetConnectionPoint.apply(this, arguments);
	};



	graph.lightbox = lightbox;

	
	if (graph.useCssTransforms)
	{
		this.lazyZoomDelay = 0;
	}
	
	/*
	if (mxClient.IS_SVG)
	{
		mxPopupMenu.prototype.submenuImage = 'data:image/gif;base64,R0lGODlhCQAJAIAAAP///zMzMyH5BAEAAAAALAAAAAAJAAkAAAIPhI8WebHsHopSOVgb26AAADs=';
	}
	else
	{
		new Image().src = mxPopupMenu.prototype.submenuImage;
	}

	
	if (!mxClient.IS_SVG && mxConnectionHandler.prototype.connectImage != null)
	{
		new Image().src = mxConnectionHandler.prototype.connectImage.src;
	}
	*/
	
	if (this.editor.chromeless && !this.editor.editable)
	{
		this.footerHeight = 0;
		graph.isEnabled = function() { return false; };
		graph.panningHandler.isForcePanningEvent = function(me)
		{
			return !mxEvent.isPopupTrigger(me.getEvent());
		};
	}
	
    
	this.actions = new Actions(this);
	this.menus = this.createMenus();
	this.createDivs();
	this.createUi();
	this.refresh();
	
	
	var textEditing =  mxUtils.bind(this, function(evt)
	{
		if (evt == null)
		{
			evt = window.event;
		}
		
		return (this.isSelectionAllowed(evt) || graph.isEditing());
	});

	
	if (this.container == document.body)
	{
		this.menubarContainer.onselectstart = textEditing;
		this.menubarContainer.onmousedown = textEditing;
		this.toolbarContainer.onselectstart = textEditing;
		this.toolbarContainer.onmousedown = textEditing;
		this.diagramContainer.onselectstart = textEditing;
		this.diagramContainer.onmousedown = textEditing;
		this.sidebarContainer.onselectstart = textEditing;
		this.sidebarContainer.onmousedown = textEditing;
		this.formatContainer.onselectstart = textEditing;
		this.formatContainer.onmousedown = textEditing;
		this.footerContainer.onselectstart = textEditing;
		this.footerContainer.onmousedown = textEditing;
		
		if (this.tabContainer != null)
		{
			
			this.tabContainer.onselectstart = textEditing;
		}
	}
	
	
	if (!this.editor.chromeless || this.editor.editable)
	{
		
		var linkHandler = function(evt)
		{
			var source = mxEvent.getSource(evt);
			
			if (source.nodeName == 'A')
			{
				while (source != null)
				{
					if (source.className == 'geHint')
					{
						return true;
					}
					
					source = source.parentNode;
				}
			}
			
			return textEditing(evt);
		};
		
		if (mxClient.IS_IE && (typeof(document.documentMode) === 'undefined' || document.documentMode < 9))
		{
			mxEvent.addListener(this.diagramContainer, 'contextmenu', linkHandler);
		}
		else
		{
			
			this.diagramContainer.oncontextmenu = linkHandler;
		}
	}
	else
	{
		graph.panningHandler.usePopupTrigger = false;
	}

	
	graph.init(this.diagramContainer);

    
    if (mxClient.IS_SVG && graph.view.getDrawPane() != null)
    {
        var root = graph.view.getDrawPane().ownerSVGElement;
        
        if (root != null)
        {
            root.style.position = 'absolute';
        }
    }
    
	
	
	
	mxEvent.addListener(this.diagramContainer, 'mousemove', mxUtils.bind(this, function(evt)
	{
		var off = mxUtils.getOffset(this.diagramContainer);
		
		if (mxEvent.getClientX(evt) - off.x - this.diagramContainer.clientWidth > 0 ||
			mxEvent.getClientY(evt) - off.y - this.diagramContainer.clientHeight > 0)
		{
			this.diagramContainer.setAttribute('title', mxResources.get('panTooltip'));
		}
		else
		{
			this.diagramContainer.removeAttribute('title');
		}
	}));

   	
	var spaceKeyPressed = false;
	
	
	this.keydownHandler = mxUtils.bind(this, function(evt)
	{
		if (evt.which == 32 )
		{
			spaceKeyPressed = true;
			graph.container.style.cursor = 'move';
			
			
			if (!graph.isEditing() && mxEvent.getSource(evt) == graph.container)
			{
				mxEvent.consume(evt);
			}
		}
		else if (!mxEvent.isConsumed(evt) && evt.keyCode == 27 )
		{
			this.hideDialog();
		}
	});
   	
	mxEvent.addListener(document, 'keydown', this.keydownHandler);
	
	this.keyupHandler = mxUtils.bind(this, function(evt)
	{
		graph.container.style.cursor = '';
		spaceKeyPressed = false;
	});

	mxEvent.addListener(document, 'keyup', this.keyupHandler);
    
    
	var panningHandlerIsForcePanningEvent = graph.panningHandler.isForcePanningEvent;
	graph.panningHandler.isForcePanningEvent = function(me)
	{
		
		return panningHandlerIsForcePanningEvent.apply(this, arguments) ||
			spaceKeyPressed || (mxEvent.isMouseEvent(me.getEvent()) &&
			(this.usePopupTrigger || !mxEvent.isPopupTrigger(me.getEvent())) &&
			((!mxEvent.isControlDown(me.getEvent()) &&
			mxEvent.isRightMouseButton(me.getEvent())) ||
			mxEvent.isMiddleMouseButton(me.getEvent())));
	};

	
	
	var cellEditorIsStopEditingEvent = graph.cellEditor.isStopEditingEvent;
	graph.cellEditor.isStopEditingEvent = function(evt)
	{
		return cellEditorIsStopEditingEvent.apply(this, arguments) ||
			(evt.keyCode == 13 && ((!mxClient.IS_SF && mxEvent.isControlDown(evt)) ||
			(mxClient.IS_MAC && mxEvent.isMetaDown(evt)) ||
			(mxClient.IS_SF && mxEvent.isShiftDown(evt))));
	};
	
    
	graph.container.setAttribute('tabindex', '0');
   	graph.container.style.cursor = 'default';
    
	
	if (window.self === window.top && graph.container.parentNode != null)
	{
		try
		{
			graph.container.focus();
		}
		catch (e)
		{
			
		}
	}

   	
   	var graphFireMouseEvent = graph.fireMouseEvent;
   	graph.fireMouseEvent = function(evtName, me, sender)
   	{
   		if (evtName == mxEvent.MOUSE_DOWN)
   		{
   			this.container.focus();
   		}
   		
   		graphFireMouseEvent.apply(this, arguments);
   	};

   	
	graph.popupMenuHandler.autoExpand = true;

    
	if (this.menus != null)
	{
		graph.popupMenuHandler.factoryMethod = mxUtils.bind(this, function(menu, cell, evt)
		{
			this.menus.createPopupMenu(menu, cell, evt);
		});
	}
	
	
	mxEvent.addGestureListeners(document, mxUtils.bind(this, function(evt)
	{
		graph.popupMenuHandler.hideMenu();
	}));

    
	this.keyHandler = this.createKeyHandler(editor);
    
	
	this.getKeyHandler = function()
	{
		return keyHandler;
	};
	
	
	var styles = ['rounded', 'shadow', 'glass', 'dashed', 'dashPattern', 'comic', 'labelBackgroundColor'];
	var connectStyles = ['shape', 'edgeStyle', 'curved', 'rounded', 'elbow', 'comic', 'jumpStyle', 'jumpSize'];
	
	
	this.setDefaultStyle = function(cell)
	{
		var state = graph.view.getState(cell);
		
		if (state != null)
		{
			
			var clone = cell.clone();
			clone.style = ''
			var defaultStyle = graph.getCellStyle(clone);
			var values = [];
			var keys = [];

			for (var key in state.style)
			{
				if (defaultStyle[key] != state.style[key])
				{
					values.push(state.style[key]);
					keys.push(key);
				}
			}
			
			
			var cellStyle = graph.getModel().getStyle(state.cell);
			var tokens = (cellStyle != null) ? cellStyle.split(';') : [];
			
			for (var i = 0; i < tokens.length; i++)
			{
				var tmp = tokens[i];
		 		var pos = tmp.indexOf('=');
		 					 		
		 		if (pos >= 0)
		 		{
		 			var key = tmp.substring(0, pos);
		 			var value = tmp.substring(pos + 1);
		 			
		 			if (defaultStyle[key] != null && value == 'none')
		 			{
		 				values.push(value);
		 				keys.push(key);
		 			}
		 		}
			}

			
			if (graph.getModel().isEdge(state.cell))
			{
				graph.currentEdgeStyle = {};
			}
			else
			{
				graph.currentVertexStyle = {}
			}

			this.fireEvent(new mxEventObject('styleChanged', 'keys', keys, 'values', values, 'cells', [state.cell]));
		}
	};
	
	this.clearDefaultStyle = function()
	{
		graph.currentEdgeStyle = mxUtils.clone(graph.defaultEdgeStyle);
		graph.currentVertexStyle = mxUtils.clone(graph.defaultVertexStyle);
		
		
		this.fireEvent(new mxEventObject('styleChanged', 'keys', [], 'values', [], 'cells', []));
	};

	
    
	var valueStyles = ['fontFamily', 'fontSize', 'fontColor'];
	
	
	var alwaysEdgeStyles = ['edgeStyle', 'startArrow', 'startFill', 'startSize', 'endArrow',
		'endFill', 'endSize', 'jettySize', 'orthogonalLoop'];
	
	
	var keyGroups = [['startArrow', 'startFill', 'startSize', 'endArrow', 'endFill', 'endSize', 'jettySize', 'orthogonalLoop'],
	                 ['strokeColor', 'strokeWidth'],
	                 ['fillColor', 'gradientColor'],
	                 valueStyles,
	                 ['opacity'],
	                 ['align'],
	                 ['html']];
	
	
	for (var i = 0; i < keyGroups.length; i++)
	{
		for (var j = 0; j < keyGroups[i].length; j++)
		{
			styles.push(keyGroups[i][j]);
		}
	}
	
	for (var i = 0; i < connectStyles.length; i++)
	{
		if (mxUtils.indexOf(styles, connectStyles[i]) < 0)
		{
			styles.push(connectStyles[i]);
		}
	}

	
	var insertHandler = function(cells, asText)
	{
		var model = graph.getModel();
		
		model.beginUpdate();
		try
		{
			
			if (asText)
			{
				var edge = model.isEdge(cell);
				var current = (edge) ? graph.currentEdgeStyle : graph.currentVertexStyle;
				var textStyles = ['fontSize', 'fontFamily', 'fontColor'];
				
				for (var j = 0; j < textStyles.length; j++)
				{
					var value = current[textStyles[j]];
					
					if (value != null)
					{
						graph.setCellStyles(textStyles[j], value, cells);
					}
				}
			}
			else
			{
				for (var i = 0; i < cells.length; i++)
				{
					var cell = cells[i];

					
					var cellStyle = model.getStyle(cell);
					var tokens = (cellStyle != null) ? cellStyle.split(';') : [];
					var appliedStyles = styles.slice();
					
					for (var j = 0; j < tokens.length; j++)
					{
						var tmp = tokens[j];
				 		var pos = tmp.indexOf('=');
				 					 		
				 		if (pos >= 0)
				 		{
				 			var key = tmp.substring(0, pos);
				 			var index = mxUtils.indexOf(appliedStyles, key);
				 			
				 			if (index >= 0)
				 			{
				 				appliedStyles.splice(index, 1);
				 			}
				 			
				 			
				 			for (var k = 0; k < keyGroups.length; k++)
				 			{
				 				var group = keyGroups[k];
				 				
				 				if (mxUtils.indexOf(group, key) >= 0)
				 				{
				 					for (var l = 0; l < group.length; l++)
				 					{
							 			var index2 = mxUtils.indexOf(appliedStyles, group[l]);
							 			
							 			if (index2 >= 0)
							 			{
							 				appliedStyles.splice(index2, 1);
							 			}
				 					}
				 				}
				 			}
				 		}
					}
	
					
					var edge = model.isEdge(cell);
					var current = (edge) ? graph.currentEdgeStyle : graph.currentVertexStyle;
					var newStyle = model.getStyle(cell);
					
					for (var j = 0; j < appliedStyles.length; j++)
					{
						var key = appliedStyles[j];
						var styleValue = current[key];
	
						if (styleValue != null && (key != 'shape' || edge))
						{
							
							if (!edge || mxUtils.indexOf(connectStyles, key) < 0)
							{
								newStyle = mxUtils.setStyle(newStyle, key, styleValue);
							}
						}
					}
					
					model.setStyle(cell, newStyle);
				}
			}
		}
		finally
		{
			model.endUpdate();
		}
	};

	graph.addListener('cellsInserted', function(sender, evt)
	{
		insertHandler(evt.getProperty('cells'));
	});
	
	graph.addListener('textInserted', function(sender, evt)
	{
		insertHandler(evt.getProperty('cells'), true);
	});
	
	graph.connectionHandler.addListener(mxEvent.CONNECT, function(sender, evt)
	{
		var cells = [evt.getProperty('cell')];
		
		if (evt.getProperty('terminalInserted'))
		{
			cells.push(evt.getProperty('terminal'));
		}
		
		insertHandler(cells);
	});

	this.addListener('styleChanged', mxUtils.bind(this, function(sender, evt)
	{
		
		var cells = evt.getProperty('cells');
		var vertex = false;
		var edge = false;
		
		if (cells.length > 0)
		{
			for (var i = 0; i < cells.length; i++)
			{
				vertex = graph.getModel().isVertex(cells[i]) || vertex;
				edge = graph.getModel().isEdge(cells[i]) || edge;
				
				if (edge && vertex)
				{
					break;
				}
			}
		}
		else
		{
			vertex = true;
			edge = true;
		}
		
		var keys = evt.getProperty('keys');
		var values = evt.getProperty('values');

		for (var i = 0; i < keys.length; i++)
		{
			var common = mxUtils.indexOf(valueStyles, keys[i]) >= 0;
			
			
			if (keys[i] != 'strokeColor' || (values[i] != null && values[i] != 'none'))
			{
				
				if (mxUtils.indexOf(connectStyles, keys[i]) >= 0)
				{
					if (edge || mxUtils.indexOf(alwaysEdgeStyles, keys[i]) >= 0)
					{
						if (values[i] == null)
						{
							delete graph.currentEdgeStyle[keys[i]];
						}
						else
						{
							graph.currentEdgeStyle[keys[i]] = values[i];
						}
					}
					
					else if (vertex && mxUtils.indexOf(styles, keys[i]) >= 0)
					{
						if (values[i] == null)
						{
							delete graph.currentVertexStyle[keys[i]];
						}
						else
						{
							graph.currentVertexStyle[keys[i]] = values[i];
						}
					}
				}
				else if (mxUtils.indexOf(styles, keys[i]) >= 0)
				{
					if (vertex || common)
					{
						if (values[i] == null)
						{
							delete graph.currentVertexStyle[keys[i]];
						}
						else
						{
							graph.currentVertexStyle[keys[i]] = values[i];
						}
					}
					
					if (edge || common || mxUtils.indexOf(alwaysEdgeStyles, keys[i]) >= 0)
					{
						if (values[i] == null)
						{
							delete graph.currentEdgeStyle[keys[i]];
						}
						else
						{
							graph.currentEdgeStyle[keys[i]] = values[i];
						}
					}
				}
			}
		}
		
		if (this.toolbar != null)
		{
			
			
			
			if (this.toolbar.edgeStyleMenu != null)
			{
				
				var edgeStyleDiv = this.toolbar.edgeStyleMenu.getElementsByTagName('div')[0];

				if (graph.currentEdgeStyle['edgeStyle'] == 'orthogonalEdgeStyle' && graph.currentEdgeStyle['curved'] == '1')
				{
					edgeStyleDiv.className = 'geSprite geSprite-curved';
				}
				else if (graph.currentEdgeStyle['edgeStyle'] == 'straight' || graph.currentEdgeStyle['edgeStyle'] == 'none' ||
						graph.currentEdgeStyle['edgeStyle'] == null)
				{
					edgeStyleDiv.className = 'geSprite geSprite-straight';
				}
				else if (graph.currentEdgeStyle['edgeStyle'] == 'entityRelationEdgeStyle')
				{
					edgeStyleDiv.className = 'geSprite geSprite-entity';
				}
				else if (graph.currentEdgeStyle['edgeStyle'] == 'elbowEdgeStyle')
				{
					edgeStyleDiv.className = 'geSprite geSprite-' + ((graph.currentEdgeStyle['elbow'] == 'vertical') ?
						'verticalelbow' : 'horizontalelbow');
				}
				else if (graph.currentEdgeStyle['edgeStyle'] == 'isometricEdgeStyle')
				{
					edgeStyleDiv.className = 'geSprite geSprite-' + ((graph.currentEdgeStyle['elbow'] == 'vertical') ?
						'verticalisometric' : 'horizontalisometric');
				}
				else
				{
					edgeStyleDiv.className = 'geSprite geSprite-orthogonal';
				}
			}
			
			if (this.toolbar.edgeShapeMenu != null)
			{
				
				var edgeShapeDiv = this.toolbar.edgeShapeMenu.getElementsByTagName('div')[0];
				
				if (graph.currentEdgeStyle['shape'] == 'link')
				{
					edgeShapeDiv.className = 'geSprite geSprite-linkedge';
				}
				else if (graph.currentEdgeStyle['shape'] == 'flexArrow')
				{
					edgeShapeDiv.className = 'geSprite geSprite-arrow';
				}
				else if (graph.currentEdgeStyle['shape'] == 'arrow')
				{
					edgeShapeDiv.className = 'geSprite geSprite-simplearrow';
				}
				else
				{
					edgeShapeDiv.className = 'geSprite geSprite-connection';
				}
			}
			
			
/*
			if (this.toolbar.lineStartMenu != null)
			{
				var lineStartDiv = this.toolbar.lineStartMenu.getElementsByTagName('div')[0];
				
				lineStartDiv.className = this.getCssClassForMarker('start',
						graph.currentEdgeStyle['shape'], graph.currentEdgeStyle[mxConstants.STYLE_STARTARROW],
						mxUtils.getValue(graph.currentEdgeStyle, 'startFill', '1'));
			}

			
			if (this.toolbar.lineEndMenu != null)
			{
				var lineEndDiv = this.toolbar.lineEndMenu.getElementsByTagName('div')[0];
				
				lineEndDiv.className = this.getCssClassForMarker('end',
						graph.currentEdgeStyle['shape'], graph.currentEdgeStyle[mxConstants.STYLE_ENDARROW],
						mxUtils.getValue(graph.currentEdgeStyle, 'endFill', '1'));
			}
*/
		}
	}));
	
	
	
	
	graph.addListener(mxEvent.CELLS_ADDED, function(sender, evt)
	{
		var cells = evt.getProperty('cells');
		var parent = evt.getProperty('parent');
		
		if (graph.getModel().isLayer(parent) && !graph.isCellVisible(parent) && cells != null && cells.length > 0)
		{
			graph.getModel().setVisible(parent, true);
		}
	});
	
	
	this.gestureHandler = mxUtils.bind(this, function(evt)
	{
		if (this.currentMenu != null && mxEvent.getSource(evt) != this.currentMenu.div)
		{
			this.hideCurrentMenu();
		}
	});
	
	mxEvent.addGestureListeners(document, this.gestureHandler);

	
	
	
	this.resizeHandler = mxUtils.bind(this, function()
   	{
   		window.setTimeout(mxUtils.bind(this, function()
   		{
   			if (this.editor.graph != null)
   			{
   				this.refresh();
   			}
   		}), 0);
   	});
	
   	mxEvent.addListener(window, 'resize', this.resizeHandler);
   	
   	this.orientationChangeHandler = mxUtils.bind(this, function()
   	{
   		this.refresh();
   	});
   	
   	mxEvent.addListener(window, 'orientationchange', this.orientationChangeHandler);
   	
	
	
	if (mxClient.IS_IOS && !window.navigator.standalone)
	{
		this.scrollHandler = mxUtils.bind(this, function()
	   	{
	   		window.scrollTo(0, 0);
	   	});
		
	   	mxEvent.addListener(window, 'scroll', this.scrollHandler);
	}

	this.editor.addListener('resetGraphView', mxUtils.bind(this, function()
	{
		this.resetScrollbars();
	}));
	
	this.addListener('gridEnabledChanged', mxUtils.bind(this, function()
	{
		graph.view.validateBackground();
	}));
	
	this.addListener('backgroundColorChanged', mxUtils.bind(this, function()
	{
		graph.view.validateBackground();
	}));

	graph.addListener('gridSizeChanged', mxUtils.bind(this, function()
	{
		if (graph.isGridEnabled())
		{
			graph.view.validateBackground();
		}
	}));
	
	this.setSimulationMode= function(turnModeOn){
		var ui=this;
		if( turnModeOn && ui.isInSimulationMode==false)
		{
			graph.clearSelection();
			
			
			graph.setEnabled(false);
			
			ui.sidebarContainer.hidden=true;
			
			nodes=graph.getChildVertices(graph.getDefaultParent());
			nodes.forEach(function(item){
				var style=graph.getCellStyle(item); 
				switch( style["shape"] )
				{
				case "inputport":
					graph.addCellOverlay(item, ui.circuit.overlay_sw_off);
					break;
				}
			});
			ui.isInSimulationMode=true;
			ui.startSimulationLoop();
		}
		else if( turnModeOn==false && ui.isInSimulationMode==true) 
		{
			ui.isInSimulationMode=false;
	
		setTimeout(function() { 
			graph.clearCellOverlays();		
			
			
			graph.setEnabled(true);
			ui.sidebarContainer.hidden=false;
			graph.setCellStyles(mxConstants.STYLE_STROKECOLOR,'black',graph.getChildCells(graph.getDefaultParent()));
		}, 250+25);
		}
	
	};
	this.startSimulationLoop=function() 
	{
		var ui=this;
		setTimeout(function() { 
			ui.simulationStep(); 
			if(ui.isInSimulationMode)
				ui.startSimulationLoop();
		}, 250);
	};
	this.simulationStep=function()
	{
		var ui=this;
		nodes=graph.getChildVertices(graph.getDefaultParent());
		nodes.forEach(function(node){ if( ui.isInSimulationMode) ui.circuit.updateGateOutput(node);});
	};

   	
   	this.editor.resetGraph();
   	this.init();
   	this.open();
};


mxUtils.extend(EditorUi, mxEventSource);

EditorUi.compactUi = true;

EditorUi.prototype.splitSize = (mxClient.IS_TOUCH || mxClient.IS_POINTER) ? 12 : 8;

EditorUi.prototype.menubarHeight = 30;

EditorUi.prototype.formatEnabled = false;

EditorUi.prototype.formatWidth = 240;

EditorUi.prototype.toolbarHeight = 34;

EditorUi.prototype.footerHeight = 28;

EditorUi.prototype.sidebarFooterHeight = 34;

EditorUi.prototype.hsplitPosition = (screen.width <= 640) ? 80 : 140;

EditorUi.prototype.allowAnimation = false;

EditorUi.prototype.lightboxMaxFitScale = 2;

EditorUi.prototype.lightboxVerticalDivider = 4;

EditorUi.prototype.hsplitClickEnabled = false;

EditorUi.prototype.init = function()
{
	var graph = this.editor.graph;
		
	mxEvent.addListener(graph.container, 'keydown', mxUtils.bind(this, function(evt)
	{
		this.onKeyDown(evt);
	}));
	mxEvent.addListener(graph.container, 'keypress', mxUtils.bind(this, function(evt)
	{
		this.onKeyPress(evt);
	}));

	
	this.addUndoListener();
	this.addBeforeUnloadListener();
	
	graph.getSelectionModel().addListener(mxEvent.CHANGE, mxUtils.bind(this, function()
	{
		this.updateActionStates();
	}));
	
	graph.getModel().addListener(mxEvent.CHANGE, mxUtils.bind(this, function()
	{
		this.updateActionStates();
	}));
	
	
	var graphSetDefaultParent = graph.setDefaultParent;
	var ui = this;
	
	this.editor.graph.setDefaultParent = function()
	{
		graphSetDefaultParent.apply(this, arguments);
		ui.updateActionStates();
	};
	
	
	
	
	this.updateActionStates();
	this.initClipboard();
	this.initCanvas();
	
	if (this.format != null)
	{
		this.format.init();
	}
};

EditorUi.prototype.onKeyDown = function(evt)
{
	var graph = this.editor.graph;
	
	
	if (evt.which == 9 && graph.isEnabled() && !mxEvent.isAltDown(evt))
	{
		if (graph.isEditing())
		{
			graph.stopEditing(false);
		}
		else
		{
			graph.selectCell(!mxEvent.isShiftDown(evt));
		}
		
		mxEvent.consume(evt);
	}
};

EditorUi.prototype.onKeyPress = function(evt)
{
	var graph = this.editor.graph;
	
	
	if (this.isImmediateEditingEvent(evt) && !graph.isEditing() && !graph.isSelectionEmpty() && evt.which !== 0 &&
		!mxEvent.isAltDown(evt) && !mxEvent.isControlDown(evt) && !mxEvent.isMetaDown(evt))
	{
		graph.escape();
		graph.startEditing();

		
		if (mxClient.IS_FF)
		{
			var ce = graph.cellEditor;
			ce.textarea.innerHTML = String.fromCharCode(evt.which);

			
			var range = document.createRange();
			range.selectNodeContents(ce.textarea);
			range.collapse(false);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}
	}
};

EditorUi.prototype.isImmediateEditingEvent = function(evt)
{
	return true;
};

/*
EditorUi.prototype.getCssClassForMarker = function(prefix, shape, marker, fill)
{
	var result = '';

	if (shape == 'flexArrow')
	{
		result = (marker != null && marker != mxConstants.NONE) ?
			'geSprite geSprite-' + prefix + 'blocktrans' : 'geSprite geSprite-noarrow';
	}
	else
	{
		if (marker == mxConstants.ARROW_CLASSIC)
		{
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'classic' : 'geSprite geSprite-' + prefix + 'classictrans';
		}
		else if (marker == mxConstants.ARROW_CLASSIC_THIN)
		{
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'classicthin' : 'geSprite geSprite-' + prefix + 'classicthintrans';
		}
		else if (marker == mxConstants.ARROW_OPEN)
		{
			result = 'geSprite geSprite-' + prefix + 'open';
		}
		else if (marker == mxConstants.ARROW_OPEN_THIN)
		{
			result = 'geSprite geSprite-' + prefix + 'openthin';
		}
		else if (marker == mxConstants.ARROW_BLOCK)
		{
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'block' : 'geSprite geSprite-' + prefix + 'blocktrans';
		}
		else if (marker == mxConstants.ARROW_BLOCK_THIN)
		{
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'blockthin' : 'geSprite geSprite-' + prefix + 'blockthintrans';
		}
		else if (marker == mxConstants.ARROW_OVAL)
		{
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'oval' : 'geSprite geSprite-' + prefix + 'ovaltrans';
		}
		else if (marker == mxConstants.ARROW_DIAMOND)
		{
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'diamond' : 'geSprite geSprite-' + prefix + 'diamondtrans';
		}
		else if (marker == mxConstants.ARROW_DIAMOND_THIN)
		{
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'thindiamond' : 'geSprite geSprite-' + prefix + 'thindiamondtrans';
		}
		else if (marker == 'openAsync')
		{
			result = 'geSprite geSprite-' + prefix + 'openasync';
		}
		else if (marker == 'dash')
		{
			result = 'geSprite geSprite-' + prefix + 'dash';
		}
		else if (marker == 'cross')
		{
			result = 'geSprite geSprite-' + prefix + 'cross';
		}
		else if (marker == 'async')
		{
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'async' : 'geSprite geSprite-' + prefix + 'asynctrans';
		}
		else if (marker == 'circle' || marker == 'circlePlus')
		{
			result = (fill == '1' || marker == 'circle') ? 'geSprite geSprite-' + prefix + 'circle' : 'geSprite geSprite-' + prefix + 'circleplus';
		}
		else if (marker == 'ERone')
		{
			result = 'geSprite geSprite-' + prefix + 'erone';
		}
		else if (marker == 'ERmandOne')
		{
			result = 'geSprite geSprite-' + prefix + 'eronetoone';
		}
		else if (marker == 'ERmany')
		{
			result = 'geSprite geSprite-' + prefix + 'ermany';
		}
		else if (marker == 'ERoneToMany')
		{
			result = 'geSprite geSprite-' + prefix + 'eronetomany';
		}
		else if (marker == 'ERzeroToOne')
		{
			result = 'geSprite geSprite-' + prefix + 'eroneopt';
		}
		else if (marker == 'ERzeroToMany')
		{
			result = 'geSprite geSprite-' + prefix + 'ermanyopt';
		}
		else
		{
			result = 'geSprite geSprite-noarrow';
		}
	}

	return result;
};
*/

EditorUi.prototype.createMenus = function()
{
	return null;
};

EditorUi.prototype.updatePasteActionStates = function()
{
	var graph = this.editor.graph;
	var paste = this.actions.get('paste');
	var pasteHere = this.actions.get('pasteHere');
	
	paste.setEnabled(this.editor.graph.cellEditor.isContentEditing() || (!mxClipboard.isEmpty() &&
		graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())));
	pasteHere.setEnabled(paste.isEnabled());
};

EditorUi.prototype.initClipboard = function()
{
	var ui = this;

	var mxClipboardCut = mxClipboard.cut;
	mxClipboard.cut = function(graph)
	{
		if (graph.cellEditor.isContentEditing())
		{
			document.execCommand('cut', false, null);
		}
		else
		{
			mxClipboardCut.apply(this, arguments);
		}
		
		ui.updatePasteActionStates();
	};
	
	var mxClipboardCopy = mxClipboard.copy;
	mxClipboard.copy = function(graph)
	{
		if (graph.cellEditor.isContentEditing())
		{
			document.execCommand('copy', false, null);
		}
		else
		{
			mxClipboardCopy.apply(this, arguments);
		}
		
		ui.updatePasteActionStates();
	};
	
	var mxClipboardPaste = mxClipboard.paste;
	mxClipboard.paste = function(graph)
	{
		var result = null;
		
		if (graph.cellEditor.isContentEditing())
		{
			document.execCommand('paste', false, null);
		}
		else
		{
			result = mxClipboardPaste.apply(this, arguments);
		}
		
		ui.updatePasteActionStates();
		
		return result;
	};

	
	var cellEditorStartEditing = this.editor.graph.cellEditor.startEditing;
	
	this.editor.graph.cellEditor.startEditing = function()
	{
		cellEditorStartEditing.apply(this, arguments);
		ui.updatePasteActionStates();
	};
	
	var cellEditorStopEditing = this.editor.graph.cellEditor.stopEditing;
	
	this.editor.graph.cellEditor.stopEditing = function(cell, trigger)
	{
		cellEditorStopEditing.apply(this, arguments);
		ui.updatePasteActionStates();
	};
	
	this.updatePasteActionStates();
};

EditorUi.prototype.lazyZoomDelay = 20;

EditorUi.prototype.initCanvas = function()
{
	
	var graph = this.editor.graph;
	graph.timerAutoScroll = true;

	graph.getPagePadding = function()
	{
		return new mxPoint(Math.max(0, Math.round((graph.container.offsetWidth - 34) / graph.view.scale)),
				Math.max(0, Math.round((graph.container.offsetHeight - 34) / graph.view.scale)));
	};

	
	graph.view.getBackgroundPageBounds = function()
	{
		var layout = this.graph.getPageLayout();
		var page = this.graph.getPageSize();
		
		return new mxRectangle(this.scale * (this.translate.x + layout.x * page.width),
				this.scale * (this.translate.y + layout.y * page.height),
				this.scale * layout.width * page.width,
				this.scale * layout.height * page.height);
	};

	graph.getPreferredPageSize = function(bounds, width, height)
	{
		var pages = this.getPageLayout();
		var size = this.getPageSize();
		
		return new mxRectangle(0, 0, pages.width * size.width, pages.height * size.height);
	};
	
	
	var resize = null;
	var ui = this;
	
	if (this.editor.isChromelessView())
	{
        resize = mxUtils.bind(this, function(autoscale, maxScale, cx, cy)
        {
            if (graph.container != null)
            {
                cx = (cx != null) ? cx : 0;
                cy = (cy != null) ? cy : 0;
                
                var bds = (graph.pageVisible) ? graph.view.getBackgroundPageBounds() : graph.getGraphBounds();
                var scroll = mxUtils.hasScrollbars(graph.container);
                var tr = graph.view.translate;
                var s = graph.view.scale;
                
                
                var b = mxRectangle.fromRectangle(bds);
                b.x = b.x / s - tr.x;
                b.y = b.y / s - tr.y;
                b.width /= s;
                b.height /= s;
                
                var st = graph.container.scrollTop;
                var sl = graph.container.scrollLeft;
                var sb = (mxClient.IS_QUIRKS || document.documentMode >= 8) ? 20 : 14;
                
                if (document.documentMode == 8 || document.documentMode == 9)
                {
                    sb += 3;
                }
                
                var cw = graph.container.offsetWidth - sb;
                var ch = graph.container.offsetHeight - sb;
                
                var ns = (autoscale) ? Math.max(0.3, Math.min(maxScale || 1, cw / b.width)) : s;
                var dx = ((cw - ns * b.width) / 2) / ns;
                var dy = (this.lightboxVerticalDivider == 0) ? 0 : ((ch - ns * b.height) / this.lightboxVerticalDivider) / ns;
                
                if (scroll)
                {
                    dx = Math.max(dx, 0);
                    dy = Math.max(dy, 0);
                }

                if (scroll || bds.width < cw || bds.height < ch)
                {
                    graph.view.scaleAndTranslate(ns, Math.floor(dx - b.x), Math.floor(dy - b.y));
                    graph.container.scrollTop = st * ns / s;
                    graph.container.scrollLeft = sl * ns / s;
                }
                else if (cx != 0 || cy != 0)
                {
                    var t = graph.view.translate;
                    graph.view.setTranslate(Math.floor(t.x + cx / s), Math.floor(t.y + cy / s));
                }
            }
        });
		
		
		this.chromelessResize = resize;

		
		this.chromelessWindowResize = mxUtils.bind(this, function()
	   	{
			this.chromelessResize(false);
	   	});

		
		var autoscaleResize = mxUtils.bind(this, function()
	   	{
			this.chromelessWindowResize(false);
	   	});
		
	   	mxEvent.addListener(window, 'resize', autoscaleResize);
	   	
	   	this.destroyFunctions.push(function()
	   	{
	   		mxEvent.removeListener(window, 'resize', autoscaleResize);
	   	});
	   	
		this.editor.addListener('resetGraphView', mxUtils.bind(this, function()
		{
			this.chromelessResize(true);
		}));

		this.actions.get('zoomIn').funct = mxUtils.bind(this, function(evt)
		{
			graph.zoomIn();
			this.chromelessResize(false);
		});
		this.actions.get('zoomOut').funct = mxUtils.bind(this, function(evt)
		{
			graph.zoomOut();
			this.chromelessResize(false);
		});
		
		
		
		if (urlParams['toolbar'] != '0')
		{
			this.chromelessToolbar = document.createElement('div');
			this.chromelessToolbar.style.position = 'fixed';
			this.chromelessToolbar.style.overflow = 'hidden';
			this.chromelessToolbar.style.boxSizing = 'border-box';
			this.chromelessToolbar.style.whiteSpace = 'nowrap';
			this.chromelessToolbar.style.backgroundColor = '#000000';
			this.chromelessToolbar.style.padding = '10px 10px 8px 10px';
			this.chromelessToolbar.style.left = '50%';
			
			if (!mxClient.IS_VML)
			{
				mxUtils.setPrefixedStyle(this.chromelessToolbar.style, 'borderRadius', '20px');
				mxUtils.setPrefixedStyle(this.chromelessToolbar.style, 'transition', 'opacity 600ms ease-in-out');
			}
			
			var updateChromelessToolbarPosition = mxUtils.bind(this, function()
			{
				var css = mxUtils.getCurrentStyle(graph.container);
			 	this.chromelessToolbar.style.bottom = ((css != null) ? parseInt(css['margin-bottom'] || 0) : 0) +
			 		((this.tabContainer != null) ? (20 + parseInt(this.tabContainer.style.height)) : 20) + 'px';
			});
			
			this.editor.addListener('resetGraphView', updateChromelessToolbarPosition);
			updateChromelessToolbarPosition();
			
			var btnCount = 0;
	
			var addButton = mxUtils.bind(this, function(fn, imgSrc, tip)
			{
				btnCount++;
				
				var a = document.createElement('span');
				a.style.paddingLeft = '8px';
				a.style.paddingRight = '8px';
				a.style.cursor = 'pointer';
				mxEvent.addListener(a, 'click', fn);
				
				if (tip != null)
				{
					a.setAttribute('title', tip);
				}
				
				var img = document.createElement('img');
				img.setAttribute('border', '0');
				img.setAttribute('src', imgSrc);
				
				a.appendChild(img);
				this.chromelessToolbar.appendChild(a);
				
				return a;
			});
			
			var prevButton = addButton(mxUtils.bind(this, function(evt)
			{
				this.actions.get('previousPage').funct();
				mxEvent.consume(evt);
			}), Editor.previousLargeImage, mxResources.get('previousPage'));
			
			var pageInfo = document.createElement('div');
			pageInfo.style.display = 'inline-block';
			pageInfo.style.verticalAlign = 'top';
			pageInfo.style.fontFamily = 'Helvetica,Arial';
			pageInfo.style.marginTop = '8px';
			pageInfo.style.fontSize = '14px';
			pageInfo.style.color = '#ffffff';
			this.chromelessToolbar.appendChild(pageInfo);
			
			var nextButton = addButton(mxUtils.bind(this, function(evt)
			{
				this.actions.get('nextPage').funct();
				mxEvent.consume(evt);
			}), Editor.nextLargeImage, mxResources.get('nextPage'));
			
			var updatePageInfo = mxUtils.bind(this, function()
			{
				if (this.pages != null && this.pages.length > 1 && this.currentPage != null)
				{
					pageInfo.innerHTML = '';
					mxUtils.write(pageInfo, (mxUtils.indexOf(this.pages, this.currentPage) + 1) + ' / ' + this.pages.length);
				}
			});
			
			prevButton.style.paddingLeft = '0px';
			prevButton.style.paddingRight = '4px';
			nextButton.style.paddingLeft = '4px';
			nextButton.style.paddingRight = '0px';
			
			var updatePageButtons = mxUtils.bind(this, function()
			{
				if (this.pages != null && this.pages.length > 1 && this.currentPage != null)
				{
					nextButton.style.display = '';
					prevButton.style.display = '';
					pageInfo.style.display = 'inline-block';
				}
				else
				{
					nextButton.style.display = 'none';
					prevButton.style.display = 'none';
					pageInfo.style.display = 'none';
				}
				
				updatePageInfo();
			});
			
			this.editor.addListener('resetGraphView', updatePageButtons);
			this.editor.addListener('pageSelected', updatePageInfo);
	
			addButton(mxUtils.bind(this, function(evt)
			{
				this.actions.get('zoomOut').funct();
				mxEvent.consume(evt);
			}), Editor.zoomOutLargeImage, mxResources.get('zoomOut') + ' (Alt+Mousewheel)');
			
			addButton(mxUtils.bind(this, function(evt)
			{
				this.actions.get('zoomIn').funct();
				mxEvent.consume(evt);
			}), Editor.zoomInLargeImage, mxResources.get('zoomIn') + ' (Alt+Mousewheel)');
			
			addButton(mxUtils.bind(this, function(evt)
			{
				if (graph.isLightboxView())
				{
					if (graph.view.scale == 1)
					{
						this.lightboxFit();
					}
					else
					{
						graph.zoomTo(1);
					}
					
					this.chromelessResize(false);
				}
				else
				{
					this.chromelessResize(true);
				}
				
				mxEvent.consume(evt);
			}), Editor.actualSizeLargeImage, mxResources.get('fit'));
	
			
			var fadeThread = null;
			var fadeThread2 = null;
			
			var fadeOut = mxUtils.bind(this, function(delay)
			{
				if (fadeThread != null)
				{
					window.clearTimeout(fadeThread);
					fadeThead = null;
				}
				
				if (fadeThread2 != null)
				{
					window.clearTimeout(fadeThread2);
					fadeThead2 = null;
				}
				
				fadeThread = window.setTimeout(mxUtils.bind(this, function()
				{
				 	mxUtils.setOpacity(this.chromelessToolbar, 0);
					fadeThread = null;
				 	
					fadeThread2 = window.setTimeout(mxUtils.bind(this, function()
					{
						this.chromelessToolbar.style.display = 'none';
						fadeThread2 = null;
					}), 600);
				}), delay || 200);
			});
			
			var fadeIn = mxUtils.bind(this, function(opacity)
			{
				if (fadeThread != null)
				{
					window.clearTimeout(fadeThread);
					fadeThead = null;
				}
				
				if (fadeThread2 != null)
				{
					window.clearTimeout(fadeThread2);
					fadeThead2 = null;
				}
				
				this.chromelessToolbar.style.display = '';
				mxUtils.setOpacity(this.chromelessToolbar, opacity || 30);
			});
	
			if (urlParams['layers'] == '1')
			{
				this.layersDialog = null;
				
				var layersButton = addButton(mxUtils.bind(this, function(evt)
				{
					if (this.layersDialog != null)
					{
						this.layersDialog.parentNode.removeChild(this.layersDialog);
						this.layersDialog = null;
					}
					else
					{
						this.layersDialog = graph.createLayersDialog();
						
						mxEvent.addListener(this.layersDialog, 'mouseleave', mxUtils.bind(this, function()
						{
							this.layersDialog.parentNode.removeChild(this.layersDialog);
							this.layersDialog = null;
						}));
						
						var r = layersButton.getBoundingClientRect();
						
						mxUtils.setPrefixedStyle(this.layersDialog.style, 'borderRadius', '5px');
						this.layersDialog.style.position = 'fixed';
						this.layersDialog.style.fontFamily = 'Helvetica,Arial';
						this.layersDialog.style.backgroundColor = '#000000';
						this.layersDialog.style.width = '160px';
						this.layersDialog.style.padding = '4px 2px 4px 2px';
						this.layersDialog.style.color = '#ffffff';
						mxUtils.setOpacity(this.layersDialog, 70);
						this.layersDialog.style.left = r.left + 'px';
						this.layersDialog.style.bottom = parseInt(this.chromelessToolbar.style.bottom) +
							this.chromelessToolbar.offsetHeight + 4 + 'px';
						
						
						var style = mxUtils.getCurrentStyle(this.editor.graph.container);
						this.layersDialog.style.zIndex = style.zIndex;
						
						document.body.appendChild(this.layersDialog);
					}
					
					mxEvent.consume(evt);
				}), Editor.layersLargeImage, mxResources.get('layers'));
				
				
				var model = graph.getModel();
	
				model.addListener(mxEvent.CHANGE, function()
				{
					 layersButton.style.display = (model.getChildCount(model.root) > 1) ? '' : 'none';
				});
			}
	
			this.addChromelessToolbarItems(addButton);
	
			
			if (this.lightboxToolbarActions != null)
			{
				for (var i = 0; i < this.lightboxToolbarActions.length; i++)
				{
					var lbAction = this.lightboxToolbarActions[i];
					addButton(lbAction.fn, lbAction.icon, lbAction.tooltip);
				}
			}
			
			if (graph.lightbox && (urlParams['close'] == '1' || this.container != document.body))
			{
				addButton(mxUtils.bind(this, function(evt)
				{
					if (urlParams['close'] == '1')
					{
						window.close();
					}
					else
					{
						this.destroy();
						mxEvent.consume(evt);
					}
				}), Editor.closeLargeImage, mxResources.get('close') + ' (Escape)');
			}
	
			
			this.chromelessToolbar.style.display = 'none';
			mxUtils.setPrefixedStyle(this.chromelessToolbar.style, 'transform', 'translate(-50%,0)');
			graph.container.appendChild(this.chromelessToolbar);
			
			mxEvent.addListener(graph.container, (mxClient.IS_POINTER) ? 'pointermove' : 'mousemove', mxUtils.bind(this, function(evt)
			{
				if (!mxEvent.isTouchEvent(evt))
				{
					if (!mxEvent.isShiftDown(evt))
					{
						fadeIn(30);
					}
					
					fadeOut();
				}
			}));
			
			mxEvent.addListener(this.chromelessToolbar, (mxClient.IS_POINTER) ? 'pointermove' : 'mousemove', function(evt)
			{
				mxEvent.consume(evt);
			});
			
			mxEvent.addListener(this.chromelessToolbar, 'mouseenter', mxUtils.bind(this, function(evt)
			{
				if (!mxEvent.isShiftDown(evt))
				{
					fadeIn(100);
				}
				else
				{
					fadeOut();
				}
			}));

			mxEvent.addListener(this.chromelessToolbar, 'mousemove',  mxUtils.bind(this, function(evt)
			{
				if (!mxEvent.isShiftDown(evt))
				{
					fadeIn(100);
				}
				else
				{
					fadeOut();
				}
				
				mxEvent.consume(evt);
			}));

			mxEvent.addListener(this.chromelessToolbar, 'mouseleave',  mxUtils.bind(this, function(evt)
			{
				if (!mxEvent.isTouchEvent(evt))
				{
					fadeIn(30);
				}
			}));

			
			var tol = graph.getTolerance();

			graph.addMouseListener(
			{
			    startX: 0,
			    startY: 0,
			    scrollLeft: 0,
			    scrollTop: 0,
			    mouseDown: function(sender, me)
			    {
			    	this.startX = me.getGraphX();
			    	this.startY = me.getGraphY();
				    this.scrollLeft = graph.container.scrollLeft;
				    this.scrollTop = graph.container.scrollTop;
			    },
			    mouseMove: function(sender, me) {},
			    mouseUp: function(sender, me)
			    {
			    	if (mxEvent.isTouchEvent(me.getEvent()))
			    	{
				    	if ((Math.abs(this.scrollLeft - graph.container.scrollLeft) < tol &&
				    		Math.abs(this.scrollTop - graph.container.scrollTop) < tol) &&
				    		(Math.abs(this.startX - me.getGraphX()) < tol &&
				    		Math.abs(this.startY - me.getGraphY()) < tol))
				    	{
				    		if (parseFloat(ui.chromelessToolbar.style.opacity || 0) > 0)
				    		{
				    			fadeOut();
				    		}
				    		else
				    		{
				    			fadeIn(30);
				    		}
						}
			    	}
			    }
			});
		} 

		
		if (!this.editor.editable)
		{
			this.addChromelessClickHandler();
		}
	}
	else if (this.editor.extendCanvas)
	{
		var graphViewValidate = graph.view.validate;
		graph.view.validate = function()
		{
			if (this.graph.container != null && mxUtils.hasScrollbars(this.graph.container))
			{
				var pad = this.graph.getPagePadding();
				var size = this.graph.getPageSize();
				
				
				
				var tx = this.translate.x;
				var ty = this.translate.y;
				this.translate.x = pad.x - (this.x0 || 0) * size.width;
				this.translate.y = pad.y - (this.y0 || 0) * size.height;
			}
			
			graphViewValidate.apply(this, arguments);
		};
		
		var graphSizeDidChange = graph.sizeDidChange;
		graph.sizeDidChange = function()
		{
			if (this.container != null && mxUtils.hasScrollbars(this.container))
			{
				var pages = this.getPageLayout();
				var pad = this.getPagePadding();
				var size = this.getPageSize();
				
				
				var minw = Math.ceil(2 * pad.x + pages.width * size.width);
				var minh = Math.ceil(2 * pad.y + pages.height * size.height);
				
				var min = graph.minimumGraphSize;
				
				
				
				if (min == null || min.width != minw || min.height != minh)
				{
					graph.minimumGraphSize = new mxRectangle(0, 0, minw, minh);
				}
				
				
				var dx = pad.x - pages.x * size.width;
				var dy = pad.y - pages.y * size.height;
				
				if (!this.autoTranslate && (this.view.translate.x != dx || this.view.translate.y != dy))
				{
					this.autoTranslate = true;
					this.view.x0 = pages.x;
					this.view.y0 = pages.y;

					
					
					
					var tx = graph.view.translate.x;
					var ty = graph.view.translate.y;
					graph.view.setTranslate(dx, dy);
					
					
					graph.container.scrollLeft += Math.round((dx - tx) * graph.view.scale);
					graph.container.scrollTop += Math.round((dy - ty) * graph.view.scale);
					
					this.autoTranslate = false;
					
					return;
				}

				graphSizeDidChange.apply(this, arguments);
			}
		};
	}
	
	
	
	graph.updateZoomTimeout = null;
	graph.cumulativeZoomFactor = 1;
	
	var cursorPosition = null;

	graph.lazyZoom = function(zoomIn)
	{
		if (this.updateZoomTimeout != null)
		{
			window.clearTimeout(this.updateZoomTimeout);
		}

		
		
		if (zoomIn)
		{
			if (this.view.scale * this.cumulativeZoomFactor < 0.15)
			{
				this.cumulativeZoomFactor = (this.view.scale + 0.01) / this.view.scale;
			}
			else
			{
				
				
				this.cumulativeZoomFactor *= this.zoomFactor;
				this.cumulativeZoomFactor = Math.round(this.view.scale * this.cumulativeZoomFactor * 20) / 20 / this.view.scale;
			}
		}
		else
		{
			if (this.view.scale * this.cumulativeZoomFactor <= 0.15)
			{
				this.cumulativeZoomFactor = (this.view.scale - 0.01) / this.view.scale;
			}
			else
			{
				
				
				this.cumulativeZoomFactor /= this.zoomFactor;
				this.cumulativeZoomFactor = Math.round(this.view.scale * this.cumulativeZoomFactor * 20) / 20 / this.view.scale;
			}
		}
		
		this.cumulativeZoomFactor = Math.max(0.01, Math.min(this.view.scale * this.cumulativeZoomFactor, 160) / this.view.scale);
		
        this.updateZoomTimeout = window.setTimeout(mxUtils.bind(this, function()
        {
            var offset = mxUtils.getOffset(graph.container);
            var dx = 0;
            var dy = 0;
            
            if (cursorPosition != null)
            {
                dx = graph.container.offsetWidth / 2 - cursorPosition.x + offset.x;
                dy = graph.container.offsetHeight / 2 - cursorPosition.y + offset.y;
            }

            var prev = this.view.scale;
            this.zoom(this.cumulativeZoomFactor);
            var s = this.view.scale;
            
            if (s != prev)
            {
                if (resize != null)
                {
                		ui.chromelessResize(false, null, dx * (this.cumulativeZoomFactor - 1),
                				dy * (this.cumulativeZoomFactor - 1));
                }
                
                if (mxUtils.hasScrollbars(graph.container) && (dx != 0 || dy != 0))
                {
                    graph.container.scrollLeft -= dx * (this.cumulativeZoomFactor - 1);
                    graph.container.scrollTop -= dy * (this.cumulativeZoomFactor - 1);
                }
            }
            
            this.cumulativeZoomFactor = 1;
            this.updateZoomTimeout = null;
        }), this.lazyZoomDelay);
	};
	
	mxEvent.addMouseWheelListener(mxUtils.bind(this, function(evt, up)
	{
		
		
		if ((this.dialogs == null || this.dialogs.length == 0) && graph.isZoomWheelEvent(evt))
		{
			var source = mxEvent.getSource(evt);
			
			while (source != null)
			{
				if (source == graph.container)
				{
					cursorPosition = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
					graph.lazyZoom(up);
					mxEvent.consume(evt);
			
					return;
				}
				
				source = source.parentNode;
			}
		}
	}));
};

EditorUi.prototype.addChromelessToolbarItems = function(addButton)
{
	addButton(mxUtils.bind(this, function(evt)
	{
		this.actions.get('print').funct();
		mxEvent.consume(evt);
	}), Editor.printLargeImage, mxResources.get('print'));	
};

EditorUi.prototype.createTemporaryGraph = function(stylesheet)
{
	var graph = new Graph(document.createElement('div'), null, null, stylesheet);
	graph.resetViewOnRootChange = false;
	graph.setConnectable(false);
	graph.gridEnabled = false;
	graph.autoScroll = false;
	graph.setTooltips(false);
	graph.setEnabled(false);

	
	graph.container.style.visibility = 'hidden';
	graph.container.style.position = 'absolute';
	graph.container.style.overflow = 'hidden';
	graph.container.style.height = '1px';
	graph.container.style.width = '1px';
	
	return graph;
};

EditorUi.prototype.addChromelessClickHandler = function()
{
	var hl = urlParams['highlight'];
	
	
	if (hl != null && hl.length > 0)
	{
		hl = '#' + hl;
	}

	this.editor.graph.addClickHandler(hl);
};

EditorUi.prototype.toggleFormatPanel = function(forceHide)
{
	this.formatWidth = (forceHide || this.formatWidth > 0) ? 0 : 240;
	this.formatContainer.style.display = (forceHide || this.formatWidth > 0) ? '' : 'none';
	this.refresh();
	this.format.refresh();
	this.fireEvent(new mxEventObject('formatWidthChanged'));
};

EditorUi.prototype.lightboxFit = function(maxHeight)
{
	if (this.isDiagramEmpty())
	{
		this.editor.graph.view.setScale(1);
	}
	else
	{
		var p = urlParams['border'];
		var border = 60;
		
		if (p != null)
		{
			border = parseInt(p);
		}
		
		
		this.editor.graph.maxFitScale = this.lightboxMaxFitScale;
		this.editor.graph.fit(border, null, null, null, null, null, maxHeight);
		this.editor.graph.maxFitScale = null;
	}
};

EditorUi.prototype.isDiagramEmpty = function()
{
	var model = this.editor.graph.getModel();
	
	return model.getChildCount(model.root) == 1 && model.getChildCount(model.getChildAt(model.root, 0)) == 0;
};

EditorUi.prototype.isSelectionAllowed = function(evt)
{
	return mxEvent.getSource(evt).nodeName == 'SELECT' || (mxEvent.getSource(evt).nodeName == 'INPUT' &&
		mxUtils.isAncestorNode(this.formatContainer, mxEvent.getSource(evt)));
};

EditorUi.prototype.addBeforeUnloadListener = function()
{
	
	
	window.onbeforeunload = mxUtils.bind(this, function()
	{
		if (!this.editor.isChromelessView())
		{
			return this.onBeforeUnload();
		}
	});
};

EditorUi.prototype.onBeforeUnload = function()
{
	if (this.editor.modified)
	{
		return mxResources.get('allChangesLost');
	}
};

EditorUi.prototype.open = function()
{
	
	
	try
	{
		if (window.opener != null && window.opener.openFile != null)
		{
			window.opener.openFile.setConsumer(mxUtils.bind(this, function(xml, filename)
			{
				try
				{
					var doc = mxUtils.parseXml(xml); 
					this.editor.setGraphXml(doc.documentElement);
					this.editor.setModified(false);
					this.editor.undoManager.clear();
					
					if (filename != null)
					{
						this.editor.setFilename(filename);
						this.updateDocumentTitle();
					}
					
					return;
				}
				catch (e)
				{
					mxUtils.alert(mxResources.get('invalidOrMissingFile') + ': ' + e.message);
				}
			}));
		}
	}
	catch(e)
	{
		
	}
	
	
	this.editor.graph.view.validate();
	
	
	
	this.editor.graph.sizeDidChange();
	this.editor.fireEvent(new mxEventObject('resetGraphView'));
};

EditorUi.prototype.setCurrentMenu = function(menu, elt)
{
	this.currentMenuElt = elt;
	this.currentMenu = menu;
};

EditorUi.prototype.resetCurrentMenu = function()
{
	this.currentMenuElt = null;
	this.currentMenu = null;
};

EditorUi.prototype.hideCurrentMenu = function()
{
	if (this.currentMenu != null)
	{
		this.currentMenu.hideMenu();
		this.resetCurrentMenu();
	}
};

EditorUi.prototype.updateDocumentTitle = function()
{
	var title = this.editor.getOrCreateFilename();
	title=title.substr(0,title.lastIndexOf('.'));
	
	if (this.editor.appName != null)
	{
		title += ' - ' + this.editor.appName;
	}
	
	document.title = title;
};

EditorUi.prototype.redo = function()
{
	try
	{
		var graph = this.editor.graph;
		
		if (graph.isEditing())
		{
			document.execCommand('redo', false, null);
		}
		else
		{
			this.editor.undoManager.redo();
		}
	}
	catch (e)
	{
		
	}
};

EditorUi.prototype.undo = function()
{
	try
	{
		var graph = this.editor.graph;
	
		if (graph.isEditing())
		{
			
			
			var value = graph.cellEditor.textarea.innerHTML;
			document.execCommand('undo', false, null);
	
			if (value == graph.cellEditor.textarea.innerHTML)
			{
				graph.stopEditing(true);
				this.editor.undoManager.undo();
			}
		}
		else
		{
			this.editor.undoManager.undo();
		}
	}
	catch (e)
	{
		
	}
};

EditorUi.prototype.canRedo = function()
{
	return this.editor.graph.isEditing() || this.editor.undoManager.canRedo();
};

EditorUi.prototype.canUndo = function()
{
	return this.editor.graph.isEditing() || this.editor.undoManager.canUndo();
};

EditorUi.prototype.getEditBlankXml = function()
{
	return mxUtils.getXml(this.editor.getGraphXml());
};

EditorUi.prototype.getUrl = function(pathname)
{
	var href = (pathname != null) ? pathname : window.location.pathname;
	var parms = (href.indexOf('?') > 0) ? 1 : 0;
	
	
	for (var key in urlParams)
	{
		if (parms == 0)
		{
			href += '?';
		}
		else
		{
			href += '&';
		}
	
		href += key + '=' + urlParams[key];
		parms++;
	}
	
	return href;
};

EditorUi.prototype.setScrollbars = function(value)
{
	var graph = this.editor.graph;
	var prev = graph.container.style.overflow;
	graph.scrollbars = value;
	this.editor.updateGraphComponents();

	if (prev != graph.container.style.overflow)
	{
		if (graph.container.style.overflow == 'hidden')
		{
			var t = graph.view.translate;
			graph.view.setTranslate(t.x - graph.container.scrollLeft / graph.view.scale, t.y - graph.container.scrollTop / graph.view.scale);
			graph.container.scrollLeft = 0;
			graph.container.scrollTop = 0;
			graph.minimumGraphSize = null;
			graph.sizeDidChange();
		}
		else
		{
			var dx = graph.view.translate.x;
			var dy = graph.view.translate.y;

			graph.view.translate.x = 0;
			graph.view.translate.y = 0;
			graph.sizeDidChange();
			graph.container.scrollLeft -= Math.round(dx * graph.view.scale);
			graph.container.scrollTop -= Math.round(dy * graph.view.scale);
		}
	}
	
	this.fireEvent(new mxEventObject('scrollbarsChanged'));
};

EditorUi.prototype.hasScrollbars = function()
{
	return this.editor.graph.scrollbars;
};

EditorUi.prototype.resetScrollbars = function()
{
	var graph = this.editor.graph;
	
	if (!this.editor.extendCanvas)
	{
		graph.container.scrollTop = 0;
		graph.container.scrollLeft = 0;
	
		if (!mxUtils.hasScrollbars(graph.container))
		{
			graph.view.setTranslate(0, 0);
		}
	}
	else if (!this.editor.isChromelessView())
	{
		if (mxUtils.hasScrollbars(graph.container))
		{
			if (graph.pageVisible)
			{
				var pad = graph.getPagePadding();
				graph.container.scrollTop = Math.floor(pad.y - this.editor.initialTopSpacing) - 1;
				graph.container.scrollLeft = Math.floor(Math.min(pad.x,
					(graph.container.scrollWidth - graph.container.clientWidth) / 2)) - 1;

				
				var bounds = graph.getGraphBounds();
				
				if (bounds.width > 0 && bounds.height > 0)
				{
					if (bounds.x > graph.container.scrollLeft + graph.container.clientWidth * 0.9)
					{
						graph.container.scrollLeft = Math.min(bounds.x + bounds.width - graph.container.clientWidth, bounds.x - 10);
					}
					
					if (bounds.y > graph.container.scrollTop + graph.container.clientHeight * 0.9)
					{
						graph.container.scrollTop = Math.min(bounds.y + bounds.height - graph.container.clientHeight, bounds.y - 10);
					}
				}
			}
			else
			{
				var bounds = graph.getGraphBounds();
				var width = Math.max(bounds.width, graph.scrollTileSize.width * graph.view.scale);
				var height = Math.max(bounds.height, graph.scrollTileSize.height * graph.view.scale);
				graph.container.scrollTop = Math.floor(Math.max(0, bounds.y - Math.max(20, (graph.container.clientHeight - height) / 4)));
				graph.container.scrollLeft = Math.floor(Math.max(0, bounds.x - Math.max(0, (graph.container.clientWidth - width) / 2)));
			}
		}
		else
		{
			
			if (graph.pageVisible)
			{
				var b = graph.view.getBackgroundPageBounds();
				graph.view.setTranslate(Math.floor(Math.max(0, (graph.container.clientWidth - b.width) / 2) - b.x),
					Math.floor(Math.max(0, (graph.container.clientHeight - b.height) / 2) - b.y));
			}
			else
			{
				var bounds = graph.getGraphBounds();
				graph.view.setTranslate(Math.floor(Math.max(0, Math.max(0, (graph.container.clientWidth - bounds.width) / 2) - bounds.x)),
					Math.floor(Math.max(0, Math.max(20, (graph.container.clientHeight - bounds.height) / 4)) - bounds.y));
			}
		}
	}
};

EditorUi.prototype.setPageVisible = function(value)
{
	var graph = this.editor.graph;
	var hasScrollbars = mxUtils.hasScrollbars(graph.container);
	var tx = 0;
	var ty = 0;
	
	if (hasScrollbars)
	{
		tx = graph.view.translate.x * graph.view.scale - graph.container.scrollLeft;
		ty = graph.view.translate.y * graph.view.scale - graph.container.scrollTop;
	}
	
	graph.pageVisible = value;
	graph.pageBreaksVisible = value; 
	graph.preferPageSize = value;
	graph.view.validateBackground();

	
	if (hasScrollbars)
	{
		var cells = graph.getSelectionCells();
		graph.clearSelection();
		graph.setSelectionCells(cells);
	}
	
	
	graph.sizeDidChange();
	
	if (hasScrollbars)
	{
		graph.container.scrollLeft = graph.view.translate.x * graph.view.scale - tx;
		graph.container.scrollTop = graph.view.translate.y * graph.view.scale - ty;
	}
	
	this.fireEvent(new mxEventObject('pageViewChanged'));
};

function ChangePageSetup(ui, color, image, format)
{
	this.ui = ui;
	this.color = color;
	this.previousColor = color;
	this.image = image;
	this.previousImage = image;
	this.format = format;
	this.previousFormat = format;
	
	
	this.ignoreColor = false;
	this.ignoreImage = false;
}

ChangePageSetup.prototype.execute = function()
{
	var graph = this.ui.editor.graph;
	
	if (!this.ignoreColor)
	{
		this.color = this.previousColor;
		var tmp = graph.background;
		this.ui.setBackgroundColor(this.previousColor);
		this.previousColor = tmp;
	}
	
	if (!this.ignoreImage)
	{
		this.image = this.previousImage;
		var tmp = graph.backgroundImage;
		this.ui.setBackgroundImage(this.previousImage);
		this.previousImage = tmp;
	}
	
	if (this.previousFormat != null)
	{
		this.format = this.previousFormat;
		var tmp = graph.pageFormat;
		
		if (this.previousFormat.width != tmp.width ||
			this.previousFormat.height != tmp.height)
		{
			this.ui.setPageFormat(this.previousFormat);
			this.previousFormat = tmp;
		}
	}

    if (this.foldingEnabled != null && this.foldingEnabled != this.ui.editor.graph.foldingEnabled)
    {
    		this.ui.setFoldingEnabled(this.foldingEnabled);
        this.foldingEnabled = !this.foldingEnabled;
    }
};


(function()
{
	var codec = new mxObjectCodec(new ChangePageSetup(),  ['ui', 'previousColor', 'previousImage', 'previousFormat']);

	codec.afterDecode = function(dec, node, obj)
	{
		obj.previousColor = obj.color;
		obj.previousImage = obj.image;
		obj.previousFormat = obj.format;

        if (obj.foldingEnabled != null)
        {
        		obj.foldingEnabled = !obj.foldingEnabled;
        }
       
		return obj;
	};
	
	mxCodecRegistry.register(codec);
})();

EditorUi.prototype.setBackgroundColor = function(value)
{
	this.editor.graph.background = value;
	this.editor.graph.view.validateBackground();

	this.fireEvent(new mxEventObject('backgroundColorChanged'));
};

EditorUi.prototype.setFoldingEnabled = function(value)
{
	this.editor.graph.foldingEnabled = value;
	this.editor.graph.view.revalidate();
	
	this.fireEvent(new mxEventObject('foldingEnabledChanged'));
};

EditorUi.prototype.setPageFormat = function(value)
{
	this.editor.graph.pageFormat = value;
	
	if (!this.editor.graph.pageVisible)
	{
		this.actions.get('pageView').funct();
	}
	else
	{
		this.editor.graph.view.validateBackground();
		this.editor.graph.sizeDidChange();
	}

	this.fireEvent(new mxEventObject('pageFormatChanged'));
};

EditorUi.prototype.setPageScale = function(value)
{
	this.editor.graph.pageScale = value;
	
	if (!this.editor.graph.pageVisible)
	{
		this.actions.get('pageView').funct();
	}
	else
	{
		this.editor.graph.view.validateBackground();
		this.editor.graph.sizeDidChange();
	}

	this.fireEvent(new mxEventObject('pageScaleChanged'));
};

EditorUi.prototype.setGridColor = function(value)
{
	this.editor.graph.view.gridColor = value;
	this.editor.graph.view.validateBackground();
	this.fireEvent(new mxEventObject('gridColorChanged'));
};

EditorUi.prototype.addUndoListener = function()
{
	var undo = this.actions.get('undo');
	var redo = this.actions.get('redo');
	
	var undoMgr = this.editor.undoManager;
	
    var undoListener = mxUtils.bind(this, function()
    {
    	undo.setEnabled(this.canUndo());
    	redo.setEnabled(this.canRedo());
    });

    undoMgr.addListener(mxEvent.ADD, undoListener);
    undoMgr.addListener(mxEvent.UNDO, undoListener);
    undoMgr.addListener(mxEvent.REDO, undoListener);
    undoMgr.addListener(mxEvent.CLEAR, undoListener);
	
	
	var cellEditorStartEditing = this.editor.graph.cellEditor.startEditing;
	
	this.editor.graph.cellEditor.startEditing = function()
	{
		cellEditorStartEditing.apply(this, arguments);
		undoListener();
	};
	
	var cellEditorStopEditing = this.editor.graph.cellEditor.stopEditing;
	
	this.editor.graph.cellEditor.stopEditing = function(cell, trigger)
	{
		cellEditorStopEditing.apply(this, arguments);
		undoListener();
	};
	
	
    undoListener();
};

EditorUi.prototype.updateActionStates = function()
{
	var graph = this.editor.graph;
	var selected = !graph.isSelectionEmpty();
	var vertexSelected = false;
	var edgeSelected = false;

	var cells = graph.getSelectionCells();
	
	if (cells != null)
	{
    	for (var i = 0; i < cells.length; i++)
    	{
    		var cell = cells[i];
    		
    		if (graph.getModel().isEdge(cell))
    		{
    			edgeSelected = true;
    		}
    		
    		if (graph.getModel().isVertex(cell))
    		{
    			vertexSelected = true;
    		}
    		
    		if (edgeSelected && vertexSelected)
			{
				break;
			}
		}
	}
	
	
	var actions = ['cut', 'copy', 'delete', 'duplicate',
	               'toFront', 'toBack', 'pasteSize',
	               ];
	
	for (var i = 0; i < actions.length; i++)
	{
		this.actions.get(actions[i]).setEnabled(selected);
	}
	
	
	this.actions.get('clearWaypoints').setEnabled(!graph.isSelectionEmpty());
	this.actions.get('copySize').setEnabled(graph.getSelectionCount() == 1);
	
	
	
	
	
   	var oneVertexSelected = vertexSelected && graph.getSelectionCount() == 1;
	
		
	
		
		
   	
   		

	
   	var state = graph.view.getState(graph.getSelectionCell());
    
    
    	
    
    
    
    
    
    
    
    
    	
    this.actions.get('guides').setEnabled(graph.isEnabled());
    this.actions.get('grid').setEnabled(!this.editor.chromeless || this.editor.editable);

    var unlocked = graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent());
    
    
    
    this.menus.get('align').setEnabled(unlocked && vertexSelected && graph.getSelectionCount() > 1);
    this.menus.get('distribute').setEnabled(unlocked && vertexSelected && graph.getSelectionCount() > 1);
    this.actions.get('selectVertices').setEnabled(unlocked);
    this.actions.get('selectEdges').setEnabled(unlocked);
    this.actions.get('selectAll').setEnabled(unlocked);
    this.actions.get('selectNone').setEnabled(unlocked);
    
    this.updatePasteActionStates();
};

EditorUi.prototype.refresh = function(sizeDidChange)
{
	sizeDidChange = (sizeDidChange != null) ? sizeDidChange : true;
	
	var quirks = mxClient.IS_IE && (document.documentMode == null || document.documentMode == 5);
	var w = this.container.clientWidth;
	var h = this.container.clientHeight;

	if (this.container == document.body)
	{
		w = document.body.clientWidth || document.documentElement.clientWidth;
		h = (quirks) ? document.body.clientHeight || document.documentElement.clientHeight : document.documentElement.clientHeight;
	}
	
	
	
	
	var off = 0;
	
	if (mxClient.IS_IOS && !window.navigator.standalone)
	{
		if (window.innerHeight != document.documentElement.clientHeight)
		{
			off = document.documentElement.clientHeight - window.innerHeight;
			window.scrollTo(0, 0);
		}
	}
	
	var effHsplitPosition = Math.max(0, Math.min(this.hsplitPosition, w - this.splitSize - 20));

	var tmp = 0;
	
	if (this.menubar != null)
	{
		this.menubarContainer.style.height = this.menubarHeight + 'px';
		tmp += this.menubarHeight;
	}
	
	if (this.toolbar != null)
	{
		this.toolbarContainer.style.top = this.menubarHeight + 'px';
		this.toolbarContainer.style.height = this.toolbarHeight + 'px';
		tmp += this.toolbarHeight;
	}
	
	if (tmp > 0 && !mxClient.IS_QUIRKS)
	{
		tmp += 1;
	}
	
	var sidebarFooterHeight = 0;
	
	if (this.sidebarFooterContainer != null)
	{
		var bottom = this.footerHeight + off;
		sidebarFooterHeight = Math.max(0, Math.min(h - tmp - bottom, this.sidebarFooterHeight));
		this.sidebarFooterContainer.style.width = effHsplitPosition + 'px';
		this.sidebarFooterContainer.style.height = sidebarFooterHeight + 'px';
		this.sidebarFooterContainer.style.bottom = bottom + 'px';
	}
	
	var fw = (this.format != null) ? this.formatWidth : 0;
	this.sidebarContainer.style.top = tmp + 'px';
	this.sidebarContainer.style.width = effHsplitPosition + 'px';
	this.formatContainer.style.top = tmp + 'px';
	this.formatContainer.style.width = fw + 'px';
	this.formatContainer.style.display = (this.format != null) ? '' : 'none';
	
	this.diagramContainer.style.left = (this.hsplit.parentNode != null) ? (effHsplitPosition + this.splitSize) + 'px' : '0px';
	this.diagramContainer.style.top = this.sidebarContainer.style.top;
	this.footerContainer.style.height = this.footerHeight + 'px';
	this.hsplit.style.top = this.sidebarContainer.style.top;
	this.hsplit.style.bottom = (this.footerHeight + off) + 'px';
	this.hsplit.style.left = effHsplitPosition + 'px';
	
	if (this.tabContainer != null)
	{
		this.tabContainer.style.left = this.diagramContainer.style.left;
	}
	
	if (quirks)
	{
		this.menubarContainer.style.width = w + 'px';
		this.toolbarContainer.style.width = this.menubarContainer.style.width;
		var sidebarHeight = Math.max(0, h - this.footerHeight - this.menubarHeight - this.toolbarHeight);
		this.sidebarContainer.style.height = (sidebarHeight - sidebarFooterHeight) + 'px';
		this.formatContainer.style.height = sidebarHeight + 'px';
		this.diagramContainer.style.width = (this.hsplit.parentNode != null) ? Math.max(0, w - effHsplitPosition - this.splitSize - fw) + 'px' : w + 'px';
		this.footerContainer.style.width = this.menubarContainer.style.width;
		var diagramHeight = Math.max(0, h - this.footerHeight - this.menubarHeight - this.toolbarHeight);
		
		if (this.tabContainer != null)
		{
			this.tabContainer.style.width = this.diagramContainer.style.width;
			this.tabContainer.style.bottom = (this.footerHeight + off) + 'px';
			diagramHeight -= this.tabContainer.clientHeight;
		}
		
		this.diagramContainer.style.height = diagramHeight + 'px';
		this.hsplit.style.height = diagramHeight + 'px';
	}
	else
	{
		if (this.footerHeight > 0)
		{
			this.footerContainer.style.bottom = off + 'px';
		}
		
		this.diagramContainer.style.right = fw + 'px';
		var th = 0;
		
		if (this.tabContainer != null)
		{
			this.tabContainer.style.bottom = (this.footerHeight + off) + 'px';
			this.tabContainer.style.right = this.diagramContainer.style.right;
			th = this.tabContainer.clientHeight;
		}
		
		this.sidebarContainer.style.bottom = (this.footerHeight + sidebarFooterHeight + off) + 'px';
		this.formatContainer.style.bottom = (this.footerHeight + off) + 'px';
		this.diagramContainer.style.bottom = (this.footerHeight + off + th) + 'px';
	}
	
	if (sizeDidChange)
	{
		this.editor.graph.sizeDidChange();
	}
};

EditorUi.prototype.createTabContainer = function()
{
	return null;
};

EditorUi.prototype.createDivs = function()
{
	this.menubarContainer = this.createDiv('geMenubarContainer');
	this.toolbarContainer = this.createDiv('geToolbarContainer');
	this.sidebarContainer = this.createDiv('geSidebarContainer');
	this.formatContainer = this.createDiv('geSidebarContainer geFormatContainer');
	this.diagramContainer = this.createDiv('geDiagramContainer');
	this.footerContainer = this.createDiv('geFooterContainer');
	this.hsplit = this.createDiv('geHsplit');
	this.hsplit.setAttribute('title', mxResources.get('collapseExpand'));

	
	this.menubarContainer.style.top = '0px';
	this.menubarContainer.style.left = '0px';
	this.menubarContainer.style.right = '0px';
	this.toolbarContainer.style.left = '0px';
	this.toolbarContainer.style.right = '0px';
	this.sidebarContainer.style.left = '0px';
	this.formatContainer.style.right = '0px';
	this.formatContainer.style.zIndex = '1';
	this.diagramContainer.style.right = ((this.format != null) ? this.formatWidth : 0) + 'px';
	this.footerContainer.style.left = '0px';
	this.footerContainer.style.right = '0px';
	this.footerContainer.style.bottom = '0px';
	this.footerContainer.style.zIndex = mxPopupMenu.prototype.zIndex - 2;
	this.hsplit.style.width = this.splitSize + 'px';
	this.sidebarFooterContainer = this.createSidebarFooterContainer();
	
	if (this.sidebarFooterContainer)
	{
		this.sidebarFooterContainer.style.left = '0px';
	}
	
	if (!this.editor.chromeless)
	{
		this.tabContainer = this.createTabContainer();
	}
	else
	{
		this.diagramContainer.style.border = 'none';
	}
};

EditorUi.prototype.createSidebarFooterContainer = function()
{
	return null;
};

EditorUi.prototype.createUi = function()
{
	
	this.menubar = (this.editor.chromeless) ? null : this.menus.createMenubar(this.createDiv('geMenubar'));
	
	if (this.menubar != null)
	{
		this.menubarContainer.appendChild(this.menubar.container);
	}
	
	
	if (this.menubar != null)
	{
		this.statusContainer = this.createStatusContainer();
	
		
		this.editor.addListener('statusChanged', mxUtils.bind(this, function()
		{
			this.setStatusText(this.editor.getStatus());
		}));
	
		this.setStatusText(this.editor.getStatus());
		this.menubar.container.appendChild(this.statusContainer);
		
		
		this.container.appendChild(this.menubarContainer);
	}

	
	this.sidebar = (this.editor.chromeless) ? null : this.createSidebar(this.sidebarContainer);
	
	if (this.sidebar != null)
	{
		this.container.appendChild(this.sidebarContainer);
	}
	
	
	this.format = (this.editor.chromeless || !this.formatEnabled) ? null : this.createFormat(this.formatContainer);
	
	if (this.format != null)
	{
		this.container.appendChild(this.formatContainer);
	}
	
	
	var footer = (this.editor.chromeless) ? null : this.createFooter();
	
	if (footer != null)
	{
		this.footerContainer.appendChild(footer);
		this.container.appendChild(this.footerContainer);
	}

	if (this.sidebar != null && this.sidebarFooterContainer)
	{
		this.container.appendChild(this.sidebarFooterContainer);		
	}

	this.container.appendChild(this.diagramContainer);

	if (this.container != null && this.tabContainer != null)
	{
		this.container.appendChild(this.tabContainer);
	}

	
	this.toolbar = (this.editor.chromeless) ? null : this.createToolbar(this.createDiv('geToolbar'));
	
	if (this.toolbar != null)
	{
		this.toolbarContainer.appendChild(this.toolbar.container);
		this.container.appendChild(this.toolbarContainer);
	}

	
	if (this.sidebar != null)
	{
		this.container.appendChild(this.hsplit);
		
		this.addSplitHandler(this.hsplit, true, 0, mxUtils.bind(this, function(value)
		{
			this.hsplitPosition = value;
			this.refresh();
		}));
	}
};

EditorUi.prototype.createStatusContainer = function()
{
	var container = document.createElement('a');
	container.className = 'geItem geStatus';
	
	if (screen.width < 420)
	{
		container.style.maxWidth = Math.max(20, screen.width - 320) + 'px';
		container.style.overflow = 'hidden';
	}
	
	return container;
};

EditorUi.prototype.setStatusText = function(value)
{
	this.statusContainer.innerHTML = value;
};

EditorUi.prototype.createToolbar = function(container)
{
	return new Toolbar(this, container);
};

EditorUi.prototype.createSidebar = function(container)
{
	return new Sidebar(this, container);
};

EditorUi.prototype.createFormat = function(container)
{
	return new Format(this, container);
};

EditorUi.prototype.createFooter = function()
{
	return this.createDiv('geFooter');
};

EditorUi.prototype.createDiv = function(classname)
{
	var elt = document.createElement('div');
	elt.className = classname;
	
	return elt;
};

EditorUi.prototype.addSplitHandler = function(elt, horizontal, dx, onChange)
{
	var start = null;
	var initial = null;
	var ignoreClick = true;
	var last = null;

	
	if (mxClient.IS_POINTER)
	{
		elt.style.touchAction = 'none';
	}
	
	var getValue = mxUtils.bind(this, function()
	{
		var result = parseInt(((horizontal) ? elt.style.left : elt.style.bottom));
	
		
		if (!horizontal)
		{
			result = result + dx - this.footerHeight;
		}
		
		return result;
	});

	function moveHandler(evt)
	{
		if (start != null)
		{
			var pt = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
			onChange(Math.max(0, initial + ((horizontal) ? (pt.x - start.x) : (start.y - pt.y)) - dx));
			mxEvent.consume(evt);
			
			if (initial != getValue())
			{
				ignoreClick = true;
				last = null;
			}
		}
	};
	
	function dropHandler(evt)
	{
		moveHandler(evt);
		initial = null;
		start = null;
	};
	
	mxEvent.addGestureListeners(elt, function(evt)
	{
		start = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
		initial = getValue();
		ignoreClick = false;
		mxEvent.consume(evt);
	});
	
	mxEvent.addListener(elt, 'click', mxUtils.bind(this, function(evt)
	{
		if (!ignoreClick && this.hsplitClickEnabled)
		{
			var next = (last != null) ? last - dx : 0;
			last = getValue();
			onChange(next);
			mxEvent.consume(evt);
		}
	}));

	mxEvent.addGestureListeners(document, null, moveHandler, dropHandler);
	
	this.destroyFunctions.push(function()
	{
		mxEvent.removeGestureListeners(document, null, moveHandler, dropHandler);
	});	
};

EditorUi.prototype.showDialog = function(elt, w, h, modal, closable, onClose, noScroll, trasparent)
{
	this.editor.graph.tooltipHandler.hideTooltip();
	
	if (this.dialogs == null)
	{
		this.dialogs = [];
	}
	
	this.dialog = new Dialog(this, elt, w, h, modal, closable, onClose, noScroll, trasparent);
	this.dialogs.push(this.dialog);
};

EditorUi.prototype.hideDialog = function(cancel)
{
	if (this.dialogs != null && this.dialogs.length > 0)
	{
		var dlg = this.dialogs.pop();
		dlg.close(cancel);
		
		this.dialog = (this.dialogs.length > 0) ? this.dialogs[this.dialogs.length - 1] : null;

		if (this.dialog == null && this.editor.graph.container.style.visibility != 'hidden')
		{
			this.editor.graph.container.focus();
		}
		
		mxUtils.clearSelection();
		this.editor.fireEvent(new mxEventObject('hideDialog'));
	}
};


EditorUi.prototype.openFile = function()
{
	
	window.openFile = new OpenFile(mxUtils.bind(this, function(cancel)
	{
		this.hideDialog(cancel);
	}));

	
	this.showDialog(new OpenDialog(this).container, (Editor.useLocalStorage) ? 640 : 320,
			(Editor.useLocalStorage) ? 480 : 220, true, true, function()
	{
		window.openFile = null;
	});
};

EditorUi.prototype.extractGraphModelFromHtml = function(data)
{
	var result = null;
	
	try
	{
    	var idx = data.indexOf('&lt;mxGraphModel ');
    	
    	if (idx >= 0)
    	{
    		var idx2 = data.lastIndexOf('&lt;/mxGraphModel&gt;');
    		
    		if (idx2 > idx)
    		{
    			result = data.substring(idx, idx2 + 21).replace(/&gt;/g, '>').
    				replace(/&lt;/g, '<').replace(/\\&quot;/g, '"').replace(/\n/g, '');
    		}
    	}
	}
	catch (e)
	{
		
	}
	
	return result;
};

EditorUi.prototype.extractGraphModelFromEvent = function(evt)
{
	var result = null;
	var data = null;
	
	if (evt != null)
	{
		var provider = (evt.dataTransfer != null) ? evt.dataTransfer : evt.clipboardData;
		
		if (provider != null)
		{
			if (document.documentMode == 10 || document.documentMode == 11)
			{
				data = provider.getData('Text');
			}
			else
			{
				data = (mxUtils.indexOf(provider.types, 'text/html') >= 0) ? provider.getData('text/html') : null;
			
				if (mxUtils.indexOf(provider.types, 'text/plain' && (data == null || data.length == 0)))
				{
					data = provider.getData('text/plain');
				}
			}

			if (data != null)
			{
				data = this.editor.graph.zapGremlins(mxUtils.trim(data));
				
				
				var xml =  this.extractGraphModelFromHtml(data);
				
				if (xml != null)
				{
					data = xml;
				}
			}		
		}
	}
	
	if (data != null && this.isCompatibleString(data))
	{
		result = data;
	}
	
	return result;
};

EditorUi.prototype.isCompatibleString = function(data)
{
	return false;
};

EditorUi.prototype.saveFile = function(forceDialog)
{
console.log("Yes");
	if (!forceDialog && this.editor.filename != null)
	{
		this.save(this.editor.getOrCreateFilename());
	}
	else
	{
		var dlg = new FilenameDialog(this, this.editor.getOrCreateFilename(), mxResources.get('save'), mxUtils.bind(this, function(name)
		{
			this.save(name);
		}), null, mxUtils.bind(this, function(name)
		{
			if (name != null && name.length > 0)
			{
				return true;
			}
			
			mxUtils.confirm(mxResources.get('invalidName'));
			
			return false;
		}));
		this.showDialog(dlg.container, 300, 100, true, true);
		dlg.init();
	}
};

EditorUi.prototype.save = function(name)
{
	if (name != null)
	{
		if (this.editor.graph.isEditing())
		{
			this.editor.graph.stopEditing();
		}
		
		var xml = mxUtils.getXml(this.editor.getGraphXml());
		
		try
		{
			if (Editor.useLocalStorage)
			{
				if (localStorage.getItem(name) != null &&
					!mxUtils.confirm(mxResources.get('replaceIt', [name])))
				{
					return;
				}

				localStorage.setItem(name, xml);
				this.editor.setStatus(mxUtils.htmlEntities(mxResources.get('saved')) + ' ' + new Date());
			}
			else
			{
				if (xml.length < MAX_REQUEST_SIZE)
				{
					
						
   var text = xml;
    var blob = new Blob([text], { type: "text/plain"});
    var anchor = document.createElement("a");
    anchor.download = name;
    anchor.href = window.URL.createObjectURL(blob);
    anchor.target ="_blank";
    anchor.style.display = "none"; 
    document.body.appendChild(anchor);
    anchor.click();


				}
				else
				{
					mxUtils.alert(mxResources.get('drawingTooLarge'));
					mxUtils.popup(xml);
					
					return;
				}
			}

			this.editor.setModified(false);
			this.editor.setFilename(name);
			this.updateDocumentTitle();
		}
		catch (e)
		{
			this.editor.setStatus(mxUtils.htmlEntities(mxResources.get('errorSavingFile')));
		}
	}
};

EditorUi.prototype.executeLayout = function(exec, animate, post)
{
	var graph = this.editor.graph;

	if (graph.isEnabled())
	{
		graph.getModel().beginUpdate();
		try
		{
			exec();
		}
		catch (e)
		{
			throw e;
		}
		finally
		{
			
			
			if (this.allowAnimation && animate && navigator.userAgent.indexOf('Camino') < 0)
			{
				
				var morph = new mxMorphing(graph);
				morph.addListener(mxEvent.DONE, mxUtils.bind(this, function()
				{
					graph.getModel().endUpdate();
					
					if (post != null)
					{
						post();
					}
				}));
				
				morph.startAnimation();
			}
			else
			{
				graph.getModel().endUpdate();
				
				if (post != null)
				{
					post();
				}
			}
		}
	}
};

EditorUi.prototype.showImageDialog = function(title, value, fn, ignoreExisting)
{
	var cellEditor = this.editor.graph.cellEditor;
	var selState = cellEditor.saveSelection();
	var newValue = mxUtils.prompt(title, value);
	cellEditor.restoreSelection(selState);
	
	if (newValue != null && newValue.length > 0)
	{
		var img = new Image();
		
		img.onload = function()
		{
			fn(newValue, img.width, img.height);
		};
		img.onerror = function()
		{
			fn(null);
			mxUtils.alert(mxResources.get('fileNotFound'));
		};
		
		img.src = newValue;
	}
	else
	{
		fn(null);
	}
};


EditorUi.prototype.showDataDialog = function(cell)
{
	if (cell != null)
	{
		var dlg = new EditDataDialog(this, cell);
		this.showDialog(dlg.container, 340, 340, true, false, null, false);
		dlg.init();
	}
};

EditorUi.prototype.showBackgroundImageDialog = function(apply)
{
	apply = (apply != null) ? apply : mxUtils.bind(this, function(image)
	{
		var change = new ChangePageSetup(this, null, image);
		change.ignoreColor = true;
		
		this.editor.graph.model.execute(change);
	});
	
	var newValue = mxUtils.prompt(mxResources.get('backgroundImage'), '');
	
	if (newValue != null && newValue.length > 0)
	{
		var img = new Image();
		
		img.onload = function()
		{
			apply(new mxImage(newValue, img.width, img.height));
		};
		img.onerror = function()
		{
			apply(null);
			mxUtils.alert(mxResources.get('fileNotFound'));
		};
		
		img.src = newValue;
	}
	else
	{
		apply(null);
	}
};

EditorUi.prototype.setBackgroundImage = function(image)
{
	this.editor.graph.setBackgroundImage(image);
	this.editor.graph.view.validateBackgroundImage();

	this.fireEvent(new mxEventObject('backgroundImageChanged'));
};

EditorUi.prototype.confirm = function(msg, okFn, cancelFn)
{
	if (mxUtils.confirm(msg))
	{
		if (okFn != null)
		{
			okFn();
		}
	}
	else if (cancelFn != null)
	{
		cancelFn();
	}
};

EditorUi.prototype.createOutline = function(wnd)
{
	var outline = new mxOutline(this.editor.graph);
	outline.border = 20;

	mxEvent.addListener(window, 'resize', function()
	{
		outline.update();
	});
	
	this.addListener('pageFormatChanged', function()
	{
		outline.update();
	});

	return outline;
};



  
  
  
  
  
  


EditorUi.prototype.createKeyHandler = function(editor)
{
	var editorUi = this;
	var graph = this.editor.graph;
	var keyHandler = new mxKeyHandler(graph);

	var isEventIgnored = keyHandler.isEventIgnored;
	keyHandler.isEventIgnored = function(evt)
	{
		
		return (!this.isControlDown(evt) || mxEvent.isShiftDown(evt) || (evt.keyCode != 90 && evt.keyCode != 89 &&
			evt.keyCode != 188 && evt.keyCode != 190 && evt.keyCode != 85)) && ((evt.keyCode != 66 && evt.keyCode != 73) ||
			!this.isControlDown(evt) || (this.graph.cellEditor.isContentEditing() && !mxClient.IS_FF && !mxClient.IS_SF)) &&
			isEventIgnored.apply(this, arguments);
	};
	
	
	keyHandler.isEnabledForEvent = function(evt)
	{
		return (!mxEvent.isConsumed(evt) && this.isGraphEvent(evt) && this.isEnabled() &&
			(editorUi.dialogs == null || editorUi.dialogs.length == 0));
	};
	
	
	keyHandler.isControlDown = function(evt)
	{
		return mxEvent.isControlDown(evt) || (mxClient.IS_MAC && evt.metaKey);
	};

	var queue = [];
	var thread = null;
	
	
	function nudge(keyCode, stepSize, resize)
	{
		queue.push(function()
		{
			if (!graph.isSelectionEmpty() && graph.isEnabled())
			{
				stepSize = (stepSize != null) ? stepSize : 1;
	
				if (resize)
				{
					
					graph.getModel().beginUpdate();
					try
					{
						var cells = graph.getSelectionCells();
						
						for (var i = 0; i < cells.length; i++)
						{
							if (graph.getModel().isVertex(cells[i]) && graph.isCellResizable(cells[i]))
							{
								var geo = graph.getCellGeometry(cells[i]);
								
								if (geo != null)
								{
									geo = geo.clone();
									
									if (keyCode == 37)
									{
										geo.width = Math.max(0, geo.width - stepSize);
									}
									else if (keyCode == 38)
									{
										geo.height = Math.max(0, geo.height - stepSize);
									}
									else if (keyCode == 39)
									{
										geo.width += stepSize;
									}
									else if (keyCode == 40)
									{
										geo.height += stepSize;
									}
									
									graph.getModel().setGeometry(cells[i], geo);
								}
							}
						}
					}
					finally
					{
						graph.getModel().endUpdate();
					}
				}
				else
				{
					
					var cell = graph.getSelectionCell();
					var parent = graph.model.getParent(cell);
					var layout = null;
	
					if (graph.getSelectionCount() == 1 && graph.model.isVertex(cell) &&
						graph.layoutManager != null && !graph.isCellLocked(cell))
					{
						layout = graph.layoutManager.getLayout(parent);
					}
					
					if (layout != null && layout.constructor == mxStackLayout)
					{
						var index = parent.getIndex(cell);
						
						if (keyCode == 37 || keyCode == 38)
						{
							graph.model.add(parent, cell, Math.max(0, index - 1));
						}
						else if (keyCode == 39 ||keyCode == 40)
						{
							graph.model.add(parent, cell, Math.min(graph.model.getChildCount(parent), index + 1));
						}
					}
					else
					{
						var dx = 0;
						var dy = 0;
						
						if (keyCode == 37)
						{
							dx = -stepSize;
						}
						else if (keyCode == 38)
						{
							dy = -stepSize;
						}
						else if (keyCode == 39)
						{
							dx = stepSize;
						}
						else if (keyCode == 40)
						{
							dy = stepSize;
						}
						
						graph.moveCells(graph.getMovableCells(graph.getSelectionCells()), dx, dy);
					}				
				}
			}
		});
		
		if (thread != null)
		{
			window.clearTimeout(thread);
		}
		
		thread = window.setTimeout(function()
		{
			if (queue.length > 0)
			{
				graph.getModel().beginUpdate();
				try
				{
					for (var i = 0; i < queue.length; i++)
					{
						queue[i]();
					}
					
					queue = [];
				}
				finally
				{
					graph.getModel().endUpdate();
				}
				graph.scrollCellToVisible(graph.getSelectionCell());
			}
		}, 200);
	};
	
	
	var directions = {37: mxConstants.DIRECTION_WEST, 38: mxConstants.DIRECTION_NORTH,
			39: mxConstants.DIRECTION_EAST, 40: mxConstants.DIRECTION_SOUTH};
	
	var keyHandlerGetFunction = keyHandler.getFunction;

	mxKeyHandler.prototype.getFunction = function(evt)
	{
		if (graph.isEnabled())
		{
			
			if (mxEvent.isShiftDown(evt) && mxEvent.isAltDown(evt))
			{
				var action = editorUi.actions.get(editorUi.altShiftActions[evt.keyCode]);

				if (action != null)
				{
					return action.funct;
				}
			}
			
			if (evt.keyCode == 9 && mxEvent.isAltDown(evt))
			{
				if (mxEvent.isShiftDown(evt))
				{
					
					return function()
					{
						graph.selectParentCell();
					};
				}
				else
				{
					
					return function()
					{
						graph.selectChildCell();
					};
				}
			}
			else if (directions[evt.keyCode] != null && !graph.isSelectionEmpty())
			{
				if (mxEvent.isShiftDown(evt) && mxEvent.isAltDown(evt))
				{
					if (graph.model.isVertex(graph.getSelectionCell()))
					{
						return function()
						{
							var cells = graph.connectVertex(graph.getSelectionCell(), directions[evt.keyCode],
								graph.defaultEdgeLength, evt, true);
			
							if (cells != null && cells.length > 0)
							{
								if (cells.length == 1 && graph.model.isEdge(cells[0]))
								{
									graph.setSelectionCell(graph.model.getTerminal(cells[0], false));
								}
								else
								{
									graph.setSelectionCell(cells[cells.length - 1]);
								}

								graph.scrollCellToVisible(graph.getSelectionCell());
								
							}
						};
					}
				}
				else
				{
					
					
					if (this.isControlDown(evt))
					{
						return function()
						{
							nudge(evt.keyCode, (mxEvent.isShiftDown(evt)) ? graph.gridSize : null, true);
						};
					}
					else
					{
						return function()
						{
							nudge(evt.keyCode, (mxEvent.isShiftDown(evt)) ? graph.gridSize : null);
						};
					}
				}
			}
		}

		return keyHandlerGetFunction.apply(this, arguments);
	};

	
	keyHandler.bindAction = mxUtils.bind(this, function(code, control, key, shift)
	{
		var action = this.actions.get(key);
		
		if (action != null)
		{
			var f = function()
			{
				if (action.isEnabled())
				{
					action.funct();
				}
			};
    		
			if (control)
			{
				if (shift)
				{
					keyHandler.bindControlShiftKey(code, f);
				}
				else
				{
					keyHandler.bindControlKey(code, f);
				}
			}
			else
			{
				if (shift)
				{
					keyHandler.bindShiftKey(code, f);
				}
				else
				{
					keyHandler.bindKey(code, f);
				}
			}
		}
	});

	var ui = this;
	var keyHandlerEscape = keyHandler.escape;
	keyHandler.escape = function(evt)
	{
		keyHandlerEscape.apply(this, arguments);
	};

	
	
	keyHandler.enter = function() {};
	
	
	
	
	
	keyHandler.bindAction(107, true, 'zoomIn'); 
	keyHandler.bindAction(109, true, 'zoomOut'); 
	keyHandler.bindAction(80, true, 'print'); 
	keyHandler.bindAction(79, true, 'outline', true); 
	keyHandler.bindAction(112, false, 'about'); 

	if (!this.editor.chromeless || this.editor.editable)
	{
	
	
		keyHandler.bindControlKey(13, function() { if (graph.isEnabled()) { graph.setSelectionCells(graph.duplicateCells(graph.getSelectionCells(), false)); }}); 
		keyHandler.bindAction(8, false, 'delete'); 
		keyHandler.bindAction(8, true, 'deleteAll'); 
		keyHandler.bindAction(46, false, 'delete'); 
		keyHandler.bindAction(46, true, 'deleteAll'); 
		keyHandler.bindAction(72, true, 'resetView'); 
		keyHandler.bindAction(72, true, 'fitWindow', true); 
		keyHandler.bindAction(74, true, 'fitPage'); 
		keyHandler.bindAction(74, true, 'fitTwoPages', true); 
		keyHandler.bindAction(48, true, 'customZoom'); 
		
		
		keyHandler.bindAction(83, true, 'save'); 
		keyHandler.bindAction(83, true, 'saveAs', true); 
		keyHandler.bindAction(65, true, 'selectAll'); 
		keyHandler.bindAction(65, true, 'selectNone', true); 
		keyHandler.bindAction(73, true, 'selectVertices', true); 
		keyHandler.bindAction(69, true, 'selectEdges', true); 
		
		
		keyHandler.bindAction(66, true, 'toBack', true); 
		keyHandler.bindAction(70, true, 'toFront', true); 
		keyHandler.bindAction(68, true, 'duplicate'); 
		
		keyHandler.bindAction(90, true, 'undo'); 
		
		keyHandler.bindAction(88, true, 'cut'); 
		keyHandler.bindAction(67, true, 'copy'); 
		keyHandler.bindAction(86, true, 'pasteHere', true); 
		keyHandler.bindAction(86, true, 'paste'); 
		
		
		keyHandler.bindAction(71, true, 'grid', true); 
		
		
		keyHandler.bindAction(76, true, 'layers', true); 
		
		
		
		
		
		keyHandler.bindKey(13, function() { if (graph.isEnabled()) { graph.startEditingAtCell(); }}); 
		keyHandler.bindKey(113, function() { if (graph.isEnabled()) { graph.startEditingAtCell(); }}); 
	}
	
	if (!mxClient.IS_WIN)
	{
		keyHandler.bindAction(90, true, 'redo', true); 
	}
	else
	{
		keyHandler.bindAction(89, true, 'redo'); 
	}
	
	return keyHandler;
};

EditorUi.prototype.destroy = function()
{
	if (this.editor != null)
	{
		this.editor.destroy();
		this.editor = null;
	}
	
	if (this.menubar != null)
	{
		this.menubar.destroy();
		this.menubar = null;
	}
	
	if (this.toolbar != null)
	{
		this.toolbar.destroy();
		this.toolbar = null;
	}
	
	if (this.sidebar != null)
	{
		this.sidebar.destroy();
		this.sidebar = null;
	}
	
	if (this.keyHandler != null)
	{
		this.keyHandler.destroy();
		this.keyHandler = null;
	}
	
	if (this.keydownHandler != null)
	{
		mxEvent.removeListener(document, 'keydown', this.keydownHandler);
		this.keydownHandler = null;
	}
		
	if (this.keyupHandler != null)
	{
		mxEvent.removeListener(document, 'keyup', this.keyupHandler);
		this.keyupHandler = null;
	}
	
	if (this.resizeHandler != null)
	{
		mxEvent.removeListener(window, 'resize', this.resizeHandler);
		this.resizeHandler = null;
	}
	
	if (this.gestureHandler != null)
	{
		mxEvent.removeGestureListeners(document, this.gestureHandler);
		this.gestureHandler = null;
	}
	
	if (this.orientationChangeHandler != null)
	{
		mxEvent.removeListener(window, 'orientationchange', this.orientationChangeHandler);
		this.orientationChangeHandler = null;
	}
	
	if (this.scrollHandler != null)
	{
		mxEvent.removeListener(window, 'scroll', this.scrollHandler);
		this.scrollHandler = null;
	}

	if (this.destroyFunctions != null)
	{
		for (var i = 0; i < this.destroyFunctions.length; i++)
		{
			this.destroyFunctions[i]();
		}
		
		this.destroyFunctions = null;
	}
	
	var c = [this.menubarContainer, this.toolbarContainer, this.sidebarContainer,
	         this.formatContainer, this.diagramContainer, this.footerContainer,
	         this.chromelessToolbar, this.hsplit, this.sidebarFooterContainer,
	         this.layersDialog];
	
	for (var i = 0; i < c.length; i++)
	{
		if (c[i] != null && c[i].parentNode != null)
		{
			c[i].parentNode.removeChild(c[i]);
		}
	}
};
