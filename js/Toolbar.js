/**
 * Copyright (c) 2018-2023, Douglas H. Summerville, Binghamton University
 * 
 */
function Toolbar(editorUi, container)
{
	this.editorUi = editorUi;
	this.container = container;
	this.staticElements = [];
	this.init();

	
	this.gestureHandler = mxUtils.bind(this, function(evt)
	{
		if (this.editorUi.currentMenu != null && mxEvent.getSource(evt) != this.editorUi.currentMenu.div)
		{
			this.hideMenu();
		}
	});

	mxEvent.addGestureListeners(document, this.gestureHandler);
};

Toolbar.prototype.dropdownImage = (!mxClient.IS_SVG) ? IMAGE_PATH + '/dropdown.gif' : 'data:image/gif;base64,R0lGODlhDQANAIABAHt7e////yH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCREM1NkJFMjE0NEMxMUU1ODk1Q0M5MjQ0MTA4QjNDMSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCREM1NkJFMzE0NEMxMUU1ODk1Q0M5MjQ0MTA4QjNDMSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkQzOUMzMjZCMTQ0QjExRTU4OTVDQzkyNDQxMDhCM0MxIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkQzOUMzMjZDMTQ0QjExRTU4OTVDQzkyNDQxMDhCM0MxIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAIfkEAQAAAQAsAAAAAA0ADQAAAhGMj6nL3QAjVHIu6azbvPtWAAA7';

Toolbar.prototype.dropdownImageHtml = '<img border="0" style="position:absolute;right:4px;top:' +
	((!EditorUi.compactUi) ? 8 : 6) + 'px;" src="' + Toolbar.prototype.dropdownImage + '" valign="middle"/>';

Toolbar.prototype.selectedBackground = '#d0d0d0';

Toolbar.prototype.unselectedBackground = 'none';

Toolbar.prototype.staticElements = null;

Toolbar.prototype.init = function()
{
	var sw = screen.width;
	
	
	sw -= (screen.height > 740) ? 56 : 0;
	
	
	var viewMenu = this.addMenu('', mxResources.get('zoom') + ' (Alt+Mousewheel)', true, 'viewZoom', null, true);
	viewMenu.showDisabled = true;
	viewMenu.style.whiteSpace = 'nowrap';
	viewMenu.style.position = 'relative';
	viewMenu.style.overflow = 'hidden';
	
	if (EditorUi.compactUi)
	{
		viewMenu.style.width = (mxClient.IS_QUIRKS) ? '58px' : '50px';
	}
	else
	{
		viewMenu.style.width = (mxClient.IS_QUIRKS) ? '62px' : '36px';
	}
	
	if (sw >= 420)
	{
		this.addSeparator();
		var elts = this.addItems(['zoomIn', 'zoomOut']);
		elts[0].setAttribute('title', mxResources.get('zoomIn') + ' (' + this.editorUi.actions.get('zoomIn').shortcut + ')');
		elts[1].setAttribute('title', mxResources.get('zoomOut') + ' (' + this.editorUi.actions.get('zoomOut').shortcut + ')');
	}
	
	
	this.updateZoom = mxUtils.bind(this, function()
	{
		viewMenu.innerHTML = Math.round(this.editorUi.editor.graph.view.scale * 100) + '%' +
			this.dropdownImageHtml;
		
		if (EditorUi.compactUi)
		{
			viewMenu.getElementsByTagName('img')[0].style.right = '1px';
			viewMenu.getElementsByTagName('img')[0].style.top = '5px';
		}
	});

	this.editorUi.editor.graph.view.addListener(mxEvent.EVENT_SCALE, this.updateZoom);
	this.editorUi.editor.addListener('resetGraphView', this.updateZoom);

	var elts = this.addItems(['-', 'undo', 'redo']);
	elts[1].setAttribute('title', mxResources.get('undo') + ' (' + this.editorUi.actions.get('undo').shortcut + ')');
	elts[2].setAttribute('title', mxResources.get('redo') + ' (' + this.editorUi.actions.get('redo').shortcut + ')');
	
	if (sw >= 320)
	{
		var elts = this.addItems(['-', 'delete']);
		elts[1].setAttribute('title', mxResources.get('delete') + ' (' + this.editorUi.actions.get('delete').shortcut + ')');
	}
	
	if (sw >= 550)
	{
		this.addItems(['-', 'toFront', 'toBack']);
	}



};

Toolbar.prototype.hideMenu = function()
{
	this.editorUi.hideCurrentMenu();
};

Toolbar.prototype.addMenu = function(label, tooltip, showLabels, name, c, showAll, ignoreState)
{
	var menu = this.editorUi.menus.get(name);
	var elt = this.addMenuFunction(label, tooltip, showLabels, function()
	{
		menu.funct.apply(menu, arguments);
	}, c, showAll);
	
	if (!ignoreState)
	{
		menu.addListener('stateChanged', function()
		{
			elt.setEnabled(menu.enabled);
		});
	}
	
	return elt;
};

Toolbar.prototype.addMenuFunction = function(label, tooltip, showLabels, funct, c, showAll)
{
	return this.addMenuFunctionInContainer((c != null) ? c : this.container, label, tooltip, showLabels, funct, showAll);
};

Toolbar.prototype.addMenuFunctionInContainer = function(container, label, tooltip, showLabels, funct, showAll)
{
	var elt = (showLabels) ? this.createLabel(label) : this.createButton(label);
	this.initElement(elt, tooltip);
	this.addMenuHandler(elt, showLabels, funct, showAll);
	container.appendChild(elt);
	
	return elt;
};

Toolbar.prototype.addSeparator = function(c)
{
	c = (c != null) ? c : this.container;
	var elt = document.createElement('div');
	elt.className = 'geSeparator';
	c.appendChild(elt);
	
	return elt;
};

Toolbar.prototype.addItems = function(keys, c, ignoreDisabled)
{
	var items = [];
	
	for (var i = 0; i < keys.length; i++)
	{
		var key = keys[i];
		
		if (key == '-')
		{
			items.push(this.addSeparator(c));
		}
		else
		{
			items.push(this.addItem('geSprite-' + key.toLowerCase(), key, c, ignoreDisabled));
		}
	}
	
	return items;
};

Toolbar.prototype.addItem = function(sprite, key, c, ignoreDisabled)
{
	var action = this.editorUi.actions.get(key);
	var elt = null;
	
	if (action != null)
	{
		var tooltip = action.label;
		
		if (action.shortcut != null)
		{
			tooltip += ' (' + action.shortcut + ')';
		}
		
		elt = this.addButton(sprite, tooltip, action.funct, c);

		if (!ignoreDisabled)
		{
			elt.setEnabled(action.enabled);
			
			action.addListener('stateChanged', function()
			{
				elt.setEnabled(action.enabled);
			});
		}
	}
	
	return elt;
};

Toolbar.prototype.addButton = function(classname, tooltip, funct, c)
{
	var elt = this.createButton(classname);
	c = (c != null) ? c : this.container;
	
	this.initElement(elt, tooltip);
	this.addClickHandler(elt, funct);
	c.appendChild(elt);
	
	return elt;
};

Toolbar.prototype.initElement = function(elt, tooltip)
{
	
	if (tooltip != null)
	{
		elt.setAttribute('title', tooltip);
	}

	this.addEnabledState(elt);
};

Toolbar.prototype.addEnabledState = function(elt)
{
	var classname = elt.className;
	
	elt.setEnabled = function(value)
	{
		elt.enabled = value;
		
		if (value)
		{
			elt.className = classname;
		}
		else
		{
			elt.className = classname + ' mxDisabled';
		}
	};
	
	elt.setEnabled(true);
};

Toolbar.prototype.addClickHandler = function(elt, funct)
{
	if (funct != null)
	{
		mxEvent.addListener(elt, 'click', function(evt)
		{
			if (elt.enabled)
			{
				funct(evt);
			}
			
			mxEvent.consume(evt);
		});
		
		if (document.documentMode != null && document.documentMode >= 9)
		{
			
			mxEvent.addListener(elt, 'mousedown', function(evt)
			{
				evt.preventDefault();
			});
		}
	}
};

Toolbar.prototype.createButton = function(classname)
{
	var elt = document.createElement('a');
	elt.setAttribute('href', 'javascript:void(0);');
	elt.className = 'geButton';

	var inner = document.createElement('div');
	
	if (classname != null)
	{
		inner.className = 'geSprite ' + classname;
	}
	
	elt.appendChild(inner);
	
	return elt;
};

Toolbar.prototype.createLabel = function(label, tooltip)
{
	var elt = document.createElement('a');
	elt.setAttribute('href', 'javascript:void(0);');
	elt.className = 'geLabel';
	mxUtils.write(elt, label);
	
	return elt;
};

Toolbar.prototype.addMenuHandler = function(elt, showLabels, funct, showAll)
{
	if (funct != null)
	{
		var graph = this.editorUi.editor.graph;
		var menu = null;
		var show = true;

		mxEvent.addListener(elt, 'click', mxUtils.bind(this, function(evt)
		{
			if (show && (elt.enabled == null || elt.enabled))
			{
				graph.popupMenuHandler.hideMenu();
				menu = new mxPopupMenu(funct);
				menu.div.className += ' geToolbarMenu';
				menu.showDisabled = showAll;
				menu.labels = showLabels;
				menu.autoExpand = true;
				
				var offset = mxUtils.getOffset(elt);
				menu.popup(offset.x, offset.y + elt.offsetHeight, null, evt);
				this.editorUi.setCurrentMenu(menu, elt);
				
				
				if (!showLabels && menu.div.scrollHeight > menu.div.clientHeight)
				{
					menu.div.style.width = '40px';
				}
				
				menu.hideMenu = mxUtils.bind(this, function()
				{
					mxPopupMenu.prototype.hideMenu.apply(menu, arguments);
					this.editorUi.resetCurrentMenu();
					menu.destroy();
				});
				
				
				menu.addListener(mxEvent.EVENT_HIDE, mxUtils.bind(this, function()
				{
					this.currentElt = null;
				}));
			}
			
			show = true;
			mxEvent.consume(evt);
		}));

		
		mxEvent.addListener(elt, 'mousedown', mxUtils.bind(this, function(evt)
		{
			show = this.currentElt != elt;
			
			
			if (document.documentMode != null && document.documentMode >= 9)
			{
				evt.preventDefault();
			}
		}));
	}
};

Toolbar.prototype.destroy = function()
{
	if (this.gestureHandler != null)
	{	
		mxEvent.removeGestureListeners(document, this.gestureHandler);
		this.gestureHandler = null;
	}
};
