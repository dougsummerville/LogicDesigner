/**
 * Copyright (c) 2018-2023, Douglas H. Summerville, Binghamton University
 * (see license.txt for attributions)
 */
alwaysDeleteEdges=true;
function Actions(editorUi)
{
	this.editorUi = editorUi;
	this.actions = new Object();
	this.init();
};

Actions.prototype.init = function()
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var isGraphEnabled = function()
	{
		return Action.prototype.isEnabled.apply(this, arguments) && graph.isEnabled();
	};
	
	this.addAction('new...', function() { graph.openLink(ui.getUrl()); });
	this.addAction('open...', function()
	{
		window.openNew = true;
		window.openKey = 'open';
		
		ui.openFile();
	});
	this.addAction('import...', function()
	{
		window.openNew = false;
		window.openKey = 'import';
		
		
		window.openFile = new OpenFile(mxUtils.bind(this, function()
		{
			ui.hideDialog();
		}));
		
		window.openFile.setConsumer(mxUtils.bind(this, function(xml, filename)
		{
			try
			{
				var doc = mxUtils.parseXml(xml);
				editor.graph.setSelectionCells(editor.graph.importGraphModel(doc.documentElement));
			}
			catch (e)
			{
				mxUtils.alert(mxResources.get('invalidOrMissingFile') + ': ' + e.message);
			}
		}));

		
		ui.showDialog(new OpenDialog(this).container, 320, 220, true, true, function()
		{
			window.openFile = null;
		});
	}).isEnabled = isGraphEnabled;
	this.addAction('save', function() { ui.saveFile(false); }, null, null, Editor.ctrlKey + '+S').isEnabled = isGraphEnabled;
	this.addAction('saveAs...', function() { ui.saveFile(true); }, null, null, Editor.ctrlKey + '+Shift+S').isEnabled = isGraphEnabled;
	

	
		
		
			
			
			
		
	action=this.addAction('exportVerilog', mxUtils.bind(this, function()
	{
		if (this.verilogWindow == null)
		{
			
			this.verilogWindow = new VerilogWindow(ui, document.body.offsetWidth *2/3-30, 0, document.body.offsetWidth/3, 500  );
			//this.verilogWindow.window.addListener('show', function()
			//{
				//ui.fireEvent(new mxEventObject('verilog'));
			//});
			//this.verilogWindow.window.addListener('hide', function()
			//{
				//ui.fireEvent(new mxEventObject('verilog'));
			//});
			this.verilogWindow.window.setVisible(true);
			//ui.fireEvent(new mxEventObject('verilog'));
		}
		else
		{
			this.verilogWindow.window.setVisible(!this.verilogWindow.window.isVisible());
		}
		if( this.verilogWindow.window.isVisible())
			this.verilogWindow.update();
	}), null, null, null );


	this.addAction('designRulesCheck', mxUtils.bind(this, function()
	{
		if (this.DRCWindow == null)
		{
			this.DRCWindow = new DRCWindow(ui, 200, 30, 360, 200  );
			this.DRCWindow.window.setVisible(true);
			this.DRCWindow.again();
			//ui.fireEvent(new mxEventObject('drc'));
		}
		else
		{
			//this.DRCWindow.window.setVisible(true);
			this.DRCWindow.window.setVisible(!this.DRCWindow.window.isVisible());
		}
		if( this.DRCWindow.window.isVisible())
			ui.circuit.runDRC(true,this.DRCWindow);
	}), null, null, null);



	action=this.addAction('simulate', function()
	{
		if( ui.isInSimulationMode )
			ui.setSimulationMode(false);
		else
			ui.setSimulationMode(true);
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return ui.isInSimulationMode; });
	this.addAction('editDiagram...', function()
	{
		var dlg = new EditDiagramDialog(ui);
		ui.showDialog(dlg.container, 620, 420, true, false);
		dlg.init();
	});
	this.addAction('pageSetup...', function() { ui.showDialog(new PageSetupDialog(ui).container, 320, 220, true, true); }).isEnabled = isGraphEnabled;
	this.addAction('print...', function() { ui.showDialog(new PrintDialog(ui).container, 300, 180, true, true); }, null, 'sprite-print', Editor.ctrlKey + '+P');
	this.addAction('preview', function() { mxUtils.show(graph, null, 10, 10); });
	
	
	this.addAction('undo', function() { ui.undo(); }, null, 'sprite-undo', Editor.ctrlKey + '+Z');
	this.addAction('redo', function() { ui.redo(); }, null, 'sprite-redo', (!mxClient.IS_WIN) ? Editor.ctrlKey + '+Shift+Z' : Editor.ctrlKey + '+Y');
	this.addAction('cut', function() { mxClipboard.cut(graph); }, null, 'sprite-cut', Editor.ctrlKey + '+X');
	this.addAction('copy', function() { mxClipboard.copy(graph); }, null, 'sprite-copy', Editor.ctrlKey + '+C');
	this.addAction('paste', function()
	{
		if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent()))
		{
			mxClipboard.paste(graph);
		}
	}, false, 'sprite-paste', Editor.ctrlKey + '+V');
	this.addAction('pasteHere', function(evt)
	{
		if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent()))
		{
			graph.getModel().beginUpdate();
			try
			{
				var cells = mxClipboard.paste(graph);
				
				if (cells != null)
				{
					var includeEdges = true;
					
					for (var i = 0; i < cells.length && includeEdges; i++)
					{
						includeEdges = includeEdges && graph.model.isEdge(cells[i]);
					}

					var t = graph.view.translate;
					var s = graph.view.scale;
					var dx = t.x;
					var dy = t.y;
					var bb = null;
					
					if (cells.length == 1 && includeEdges)
					{
						var geo = graph.getCellGeometry(cells[0]);
						
						if (geo != null)
						{
							bb = geo.getTerminalPoint(true);
						}
					}

					bb = (bb != null) ? bb : graph.getBoundingBoxFromGeometry(cells, includeEdges);
					
					if (bb != null)
					{
						var x = Math.round(graph.snap(graph.popupMenuHandler.triggerX / s - dx));
						var y = Math.round(graph.snap(graph.popupMenuHandler.triggerY / s - dy));
						
						graph.cellsMoved(cells, x - bb.x, y - bb.y);
						graph.view.setTranslate(dx-10,dy-10);
					}
				}
			}
			finally
			{
				graph.getModel().endUpdate();
			}
		}
	//});
	}, false, 'sprite-paste', Editor.ctrlKey + '+Shift+v');
	
	this.addAction('copySize', function(evt)
	{
		var cell = graph.getSelectionCell();
		
		if (graph.isEnabled() && cell != null && graph.getModel().isVertex(cell))
		{
			var geo = graph.getCellGeometry(cell);
			
			if (geo != null)
			{
				ui.copiedSize = new mxRectangle(geo.x, geo.y, geo.width, geo.height);
			}
		}
	}, null, null, 'Alt+Shit+X');

	this.addAction('pasteSize', function(evt)
	{
		if (graph.isEnabled() && !graph.isSelectionEmpty() && ui.copiedSize != null)
		{
			graph.getModel().beginUpdate();
			
			try
			{
				var cells = graph.getSelectionCells();
				
				for (var i = 0; i < cells.length; i++)
				{
					if (graph.getModel().isVertex(cells[i]))
					{
						var geo = graph.getCellGeometry(cells[i]);
						
						if (geo != null)
						{
							geo = geo.clone();
							geo.width = ui.copiedSize.width;
							geo.height = ui.copiedSize.height;
							
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
	}, null, null, 'Alt+Shit+V');
	
	function deleteCells(includeEdges)
	{
		
		graph.escape();
		var cells = graph.getDeletableCells(graph.getSelectionCells());
		
		if (cells != null && cells.length > 0)
		{
			var parents = graph.model.getParents(cells);
			graph.removeCells(cells, includeEdges);
			
			
			if (parents != null)
			{
				var select = [];
				
				for (var i = 0; i < parents.length; i++)
				{
					if (graph.model.contains(parents[i]) &&
						(graph.model.isVertex(parents[i]) ||
						graph.model.isEdge(parents[i])))
					{
						select.push(parents[i]);
					}
				}
				
				graph.setSelectionCells(select);
			}
		}
	};
	
	this.addAction('delete', function(evt)
	{
		
		deleteCells(true);
	}, null, null, 'Delete');
	this.addAction('deleteAll', function()
	{
		deleteCells(true);
	}, null, null, Editor.ctrlKey + '+Delete');
	this.addAction('duplicate', function()
	{
		graph.setSelectionCells(graph.duplicateCells());
	}, null, null, Editor.ctrlKey + '+D');
	
	
		
	
	this.addAction('selectVertices', function() { graph.selectVertices(); }, null, null, Editor.ctrlKey + '+Shift+I');
	this.addAction('selectEdges', function() { graph.selectEdges(); }, null, null, Editor.ctrlKey + '+Shift+E');
	this.addAction('selectAll', function() { graph.selectAll(null, true); }, null, null, Editor.ctrlKey + '+A');
	this.addAction('selectNone', function() { graph.clearSelection(); }, null, null, Editor.ctrlKey + '+Shift+A');

	
	
	this.addAction('toFront', function() { graph.orderCells(false); }, null, null, Editor.ctrlKey + '+Shift+F');
	this.addAction('toBack', function() { graph.orderCells(true); }, null, null, Editor.ctrlKey + '+Shift+B');
	
	
	this.addAction('resetView', function()
	{
		graph.zoomTo(1);
		ui.resetScrollbars();
	}, null, null, Editor.ctrlKey + '+H');
	this.addAction('zoomIn', function(evt) { graph.zoomIn(); }, null, null, Editor.ctrlKey + ' + (Numpad) / Alt+Mousewheel');
	this.addAction('zoomOut', function(evt) { graph.zoomOut(); }, null, null, Editor.ctrlKey + ' - (Numpad) / Alt+Mousewheel');
	this.addAction('fitWindow', function() { graph.fit(); }, null, null, Editor.ctrlKey + '+Shift+H');
	this.addAction('fitPage', mxUtils.bind(this, function()
	{
		if (!graph.pageVisible)
		{
			this.get('pageView').funct();
		}
		
		var fmt = graph.pageFormat;
		var ps = graph.pageScale;
		var cw = graph.container.clientWidth - 10;
		var ch = graph.container.clientHeight - 10;
		var scale = Math.floor(20 * Math.min(cw / fmt.width / ps, ch / fmt.height / ps)) / 20;
		graph.zoomTo(scale);
		
		if (mxUtils.hasScrollbars(graph.container))
		{
			var pad = graph.getPagePadding();
			graph.container.scrollTop = pad.y * graph.view.scale - 1;
			graph.container.scrollLeft = Math.min(pad.x * graph.view.scale, (graph.container.scrollWidth - graph.container.clientWidth) / 2) - 1;
		}
	}), null, null, Editor.ctrlKey + '+J');
	this.addAction('fitTwoPages', mxUtils.bind(this, function()
	{
		if (!graph.pageVisible)
		{
			this.get('pageView').funct();
		}
		
		var fmt = graph.pageFormat;
		var ps = graph.pageScale;
		var cw = graph.container.clientWidth - 10;
		var ch = graph.container.clientHeight - 10;
		
		var scale = Math.floor(20 * Math.min(cw / (2 * fmt.width) / ps, ch / fmt.height / ps)) / 20;
		graph.zoomTo(scale);
		
		if (mxUtils.hasScrollbars(graph.container))
		{
			var pad = graph.getPagePadding();
			graph.container.scrollTop = Math.min(pad.y, (graph.container.scrollHeight - graph.container.clientHeight) / 2);
			graph.container.scrollLeft = Math.min(pad.x, (graph.container.scrollWidth - graph.container.clientWidth) / 2);
		}
	}), null, null, Editor.ctrlKey + '+Shift+J');
	this.addAction('fitPageWidth', mxUtils.bind(this, function()
	{
		if (!graph.pageVisible)
		{
			this.get('pageView').funct();
		}
		
		var fmt = graph.pageFormat;
		var ps = graph.pageScale;
		var cw = graph.container.clientWidth - 10;

		var scale = Math.floor(20 * cw / fmt.width / ps) / 20;
		graph.zoomTo(scale);
		
		if (mxUtils.hasScrollbars(graph.container))
		{
			var pad = graph.getPagePadding();
			graph.container.scrollLeft = Math.min(pad.x * graph.view.scale,
				(graph.container.scrollWidth - graph.container.clientWidth) / 2);
		}
	}));
	this.put('customZoom', new Action(mxResources.get('custom') + '...', mxUtils.bind(this, function()
	{
		var dlg = new FilenameDialog(this.editorUi, parseInt(graph.getView().getScale() * 100), mxResources.get('apply'), mxUtils.bind(this, function(newValue)
		{
			var val = parseInt(newValue);
			
			if (!isNaN(val) && val > 0)
			{
				graph.zoomTo(val / 100);
			}
		}), mxResources.get('zoom') + ' (%)');
		this.editorUi.showDialog(dlg.container, 300, 80, true, true);
		dlg.init();
	}), null, null, Editor.ctrlKey + '+0'));
	this.addAction('pageScale...', mxUtils.bind(this, function()
	{
		var dlg = new FilenameDialog(this.editorUi, parseInt(graph.pageScale * 100), mxResources.get('apply'), mxUtils.bind(this, function(newValue)
		{
			var val = parseInt(newValue);
			
			if (!isNaN(val) && val > 0)
			{
				ui.setPageScale(val / 100);
			}
		}), mxResources.get('pageScale') + ' (%)');
		this.editorUi.showDialog(dlg.container, 300, 80, true, true);
		dlg.init();
	}));

	
	var action = null;
	action = this.addAction('grid', function()
	{
		graph.setGridEnabled(!graph.isGridEnabled());
		ui.fireEvent(new mxEventObject('gridEnabledChanged'));
	}, null, null, Editor.ctrlKey + '+Shift+G');
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.isGridEnabled(); });
	action.setEnabled(false);
	
	action = this.addAction('guides', function()
	{
		graph.graphHandler.guidesEnabled = !graph.graphHandler.guidesEnabled;
		ui.fireEvent(new mxEventObject('guidesEnabledChanged'));
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.graphHandler.guidesEnabled; });
	action.setEnabled(false);
	
	action = this.addAction('tooltips', function()
	{
		graph.tooltipHandler.setEnabled(!graph.tooltipHandler.isEnabled());
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.tooltipHandler.isEnabled(); });
	
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.foldingEnabled; });
	action.isEnabled = isGraphEnabled;
	action = this.addAction('scrollbars', function()
	{
		ui.setScrollbars(!ui.hasScrollbars());
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.scrollbars; });
	action = this.addAction('pageView', mxUtils.bind(this, function()
	{
		ui.setPageVisible(!graph.pageVisible);
	}));
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.pageVisible; });
	action = this.addAction('connectionArrows', function()
	{
		graph.connectionArrowsEnabled = !graph.connectionArrowsEnabled;
		ui.fireEvent(new mxEventObject('connectionArrowsChanged'));
	}, null, null, 'Alt+Shift+A');
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.connectionArrowsEnabled; });
	action = this.addAction('connectionPoints', function()
	{
		graph.setConnectable(!graph.connectionHandler.isEnabled());
		ui.fireEvent(new mxEventObject('connectionPointsChanged'));
	}, null, null, 'Alt+Shift+P');
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.connectionHandler.isEnabled(); });
	action = this.addAction('copyConnect', function()
	{
		graph.connectionHandler.setCreateTarget(!graph.connectionHandler.isCreateTarget());
		ui.fireEvent(new mxEventObject('copyConnectChanged'));
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.connectionHandler.isCreateTarget(); });
	action.isEnabled = isGraphEnabled;
	action = this.addAction('autosave', function()
	{
		ui.editor.setAutosave(!ui.editor.autosave);
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return ui.editor.autosave; });
	action.isEnabled = isGraphEnabled;
	action.visible = false;
	
	var showingAbout = false;
	
	this.put('about', new Action(mxResources.get('about') + ' Logic Designer...', function()
	{
		if (!showingAbout)
		{
			ui.showDialog(new AboutDialog(ui).container, 320, 300, true, true, function()
			{
				showingAbout = false;
			});
			
			showingAbout = true;
		}
	}, null, null, 'F1'));
	
	this.addAction('help', function()
	{
		var ext = '';
		
		if (mxResources.isLanguageSupported(mxClient.language))
		{
			ext = '_' + mxClient.language;
		}
		
		graph.openLink(RESOURCES_PATH + '/help' + ext + '.html');
	});
	
	var showingAbout = false;
	
	this.put('about', new Action(mxResources.get('about') + ' Logic Designer...', function()
	{
		if (!showingAbout)
		{
			ui.showDialog(new AboutDialog(ui).container, 320, 280, true, true, function()
			{
				showingAbout = false;
			});
			
			showingAbout = true;
		}
	}, null, null, 'F1'));
	this.addAction('addWaypoint', function()
	{
		var cell = graph.getSelectionCell();
		
		if (cell != null && graph.getModel().isEdge(cell))
		{
			var handler = editor.graph.selectionCellsHandler.getHandler(cell);
			
			if (handler instanceof mxEdgeHandler)
			{
				var t = graph.view.translate;
				var s = graph.view.scale;
				var dx = t.x;
				var dy = t.y;
				
				var parent = graph.getModel().getParent(cell);
				var pgeo = graph.getCellGeometry(parent);
				
				while (graph.getModel().isVertex(parent) && pgeo != null)
				{
					dx += pgeo.x;
					dy += pgeo.y;
					
					parent = graph.getModel().getParent(parent);
					pgeo = graph.getCellGeometry(parent);
				}
				
				var x = Math.round(graph.snap(graph.popupMenuHandler.triggerX / s - dx));
				var y = Math.round(graph.snap(graph.popupMenuHandler.triggerY / s - dy));
				
				handler.addPointAt(handler.state, x, y);
			}
		}
	});
	this.addAction('removeWaypoint', function()
	{
		
		var rmWaypointAction = ui.actions.get('removeWaypoint');
		
		if (rmWaypointAction.handler != null)
		{
			
			rmWaypointAction.handler.removePoint(rmWaypointAction.handler.state, rmWaypointAction.index);
		}
	});
	this.addAction('clearWaypoints', function()
	{
		var cells = graph.getSelectionCells();
		
		if (cells != null)
		{
			cells = graph.addAllEdges(cells);
			
			graph.getModel().beginUpdate();
			try
			{
				for (var i = 0; i < cells.length; i++)
				{
					var cell = cells[i];
					
					if (graph.getModel().isEdge(cell))
					{
						var geo = graph.getCellGeometry(cell);
			
						if (geo != null)
						{
							geo = geo.clone();
							geo.points = null;
							graph.getModel().setGeometry(cell, geo);
						}
					}
				}
			}
			finally
			{
				graph.getModel().endUpdate();
			}
		}
	}, null, null, 'Alt+Shift+C');
	action = this.addAction('subscript', mxUtils.bind(this, function()
	{
	    if (graph.cellEditor.isContentEditing())
	    {
			document.execCommand('subscript', false, null);
		}
	}), null, null, Editor.ctrlKey + '+,');
	action = this.addAction('superscript', mxUtils.bind(this, function()
	{
	    if (graph.cellEditor.isContentEditing())
	    {
			document.execCommand('superscript', false, null);
		}
	}), null, null, Editor.ctrlKey + '+.');
	this.addAction('image...', function()
	{
		if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent()))
		{
			var title = mxResources.get('image') + ' (' + mxResources.get('url') + '):';
	    	var state = graph.getView().getState(graph.getSelectionCell());
	    	var value = '';
	    	
	    	if (state != null)
	    	{
	    		value = state.style[mxConstants.STYLE_IMAGE] || value;
	    	}
	    	
	    	var selectionState = graph.cellEditor.saveSelection();
	    	
	    	ui.showImageDialog(title, value, function(newValue, w, h)
			{
	    		
	    		if (graph.cellEditor.isContentEditing())
	    		{
	    			graph.cellEditor.restoreSelection(selectionState);
	    			graph.insertImage(newValue, w, h);
	    		}
	    		else
	    		{
					var cells = graph.getSelectionCells();
					
					if (newValue != null && (newValue.length > 0 || cells.length > 0))
					{
						var select = null;
						
						graph.getModel().beginUpdate();
			        	try
			        	{
			        		
			    			if (cells.length == 0)
			    			{
			    				var pt = graph.getFreeInsertPoint();
			    				cells = [graph.insertVertex(graph.getDefaultParent(), null, '', pt.x, pt.y, w, h,
			    						'shape=image;imageAspect=0;aspect=fixed;verticalLabelPosition=bottom;verticalAlign=top;')];
			    				select = cells;
		            	    		graph.fireEvent(new mxEventObject('cellsInserted', 'cells', select));
			    			}
			    			
			        		graph.setCellStyles(mxConstants.STYLE_IMAGE, (newValue.length > 0) ? newValue : null, cells);
			        		
			        		
			        		var state = graph.view.getState(cells[0]);
			        		var style = (state != null) ? state.style : graph.getCellStyle(cells[0]);
			        		
			        		if (style[mxConstants.STYLE_SHAPE] != 'image' && style[mxConstants.STYLE_SHAPE] != 'label')
			        		{
			        			graph.setCellStyles(mxConstants.STYLE_SHAPE, 'image', cells);
			        		}
			        		else if (newValue.length == 0)
			        		{
			        			graph.setCellStyles(mxConstants.STYLE_SHAPE, null, cells);
			        		}
				        	
				        	if (graph.getSelectionCount() == 1)
				        	{
					        	if (w != null && h != null)
					        	{
					        		var cell = cells[0];
					        		var geo = graph.getModel().getGeometry(cell);
					        		
					        		if (geo != null)
					        		{
					        			geo = geo.clone();
						        		geo.width = w;
						        		geo.height = h;
						        		graph.getModel().setGeometry(cell, geo);
					        		}
					        	}
				        	}
			        	}
			        	finally
			        	{
			        		graph.getModel().endUpdate();
			        	}
			        	
			        	if (select != null)
			        	{
			        		graph.setSelectionCells(select);
			        		graph.scrollCellToVisible(select[0]);
			        	}
					}
		    	}
			}, graph.cellEditor.isContentEditing(), !graph.cellEditor.isContentEditing());
		}
	}).isEnabled = isGraphEnabled;
	this.addAction('insertImage...', function()
	{
		if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent()))
		{
			graph.clearSelection();
			ui.actions.get('image').funct();
		}
	}).isEnabled = isGraphEnabled;
	action = this.addAction('layers', mxUtils.bind(this, function()
	{
		if (this.layersWindow == null)
		{
			
			this.layersWindow = new LayersWindow(ui, document.body.offsetWidth - 280, 120, 220, 180);
			this.layersWindow.window.addListener('show', function()
			{
				ui.fireEvent(new mxEventObject('layers'));
			});
			this.layersWindow.window.addListener('hide', function()
			{
				ui.fireEvent(new mxEventObject('layers'));
			});
			this.layersWindow.window.setVisible(true);
			ui.fireEvent(new mxEventObject('layers'));
		}
		else
		{
			this.layersWindow.window.setVisible(!this.layersWindow.window.isVisible());
		}
	}), null, null, Editor.ctrlKey + '+Shift+L');
	action.setToggleAction(true);
	action.setSelectedCallback(mxUtils.bind(this, function() { return this.layersWindow != null && this.layersWindow.window.isVisible(); }));
	action = this.addAction('formatPanel', mxUtils.bind(this, function()
	{
		ui.toggleFormatPanel();
	}), null, null, Editor.ctrlKey + '+Shift+P');
	action.setToggleAction(true);
	action.setSelectedCallback(mxUtils.bind(this, function() { return ui.formatWidth > 0; }));
	action = this.addAction('outline', mxUtils.bind(this, function()
	{
		if (this.outlineWindow == null)
		{
			
			this.outlineWindow = new OutlineWindow(ui, document.body.offsetWidth - 260, 100, 180, 180);
			this.outlineWindow.window.addListener('show', function()
			{
				ui.fireEvent(new mxEventObject('outline'));
			});
			this.outlineWindow.window.addListener('hide', function()
			{
				ui.fireEvent(new mxEventObject('outline'));
			});
			this.outlineWindow.window.setVisible(true);
			ui.fireEvent(new mxEventObject('outline'));
		}
		else
		{
			this.outlineWindow.window.setVisible(!this.outlineWindow.window.isVisible());
		}
	}), null, null, Editor.ctrlKey + '+Shift+O');
	
	action.setToggleAction(true);
	action.setSelectedCallback(mxUtils.bind(this, function() { return this.outlineWindow != null && this.outlineWindow.window.isVisible(); }));
};

Actions.prototype.addAction = function(key, funct, enabled, iconCls, shortcut)
{
	var title;
	
	if (key.substring(key.length - 3) == '...')
	{
		key = key.substring(0, key.length - 3);
		title = mxResources.get(key) + '...';
	}
	else
	{
		title = mxResources.get(key);
	}
	
	return this.put(key, new Action(title, funct, enabled, iconCls, shortcut));
};

Actions.prototype.put = function(name, action)
{
	this.actions[name] = action;
	
	return action;
};

Actions.prototype.get = function(name)
{
	return this.actions[name];
};

function Action(label, funct, enabled, iconCls, shortcut)
{
	mxEventSource.call(this);
	this.label = label;
	this.funct = this.createFunction(funct);
	this.enabled = (enabled != null) ? enabled : true;
	this.iconCls = iconCls;
	this.shortcut = shortcut;
	this.visible = true;
};


mxUtils.extend(Action, mxEventSource);

Action.prototype.createFunction = function(funct)
{
	return funct;
};

Action.prototype.setEnabled = function(value)
{
	if (this.enabled != value)
	{
		this.enabled = value;
		this.fireEvent(new mxEventObject('stateChanged'));
	}
};

Action.prototype.isEnabled = function()
{
	return this.enabled;
};

Action.prototype.setToggleAction = function(value)
{
	this.toggleAction = value;
};

Action.prototype.setSelectedCallback = function(funct)
{
	this.selectedCallback = funct;
};

Action.prototype.isSelected = function()
{
	return this.selectedCallback();
};
