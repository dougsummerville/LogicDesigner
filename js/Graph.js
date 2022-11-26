/**
 * Copyright (c) 2018, Douglas H. Summerville, Binghamton University
 * (see license.txt for attributions)
 */
if (typeof html4 !== 'undefined')
{
	html4.ATTRIBS["a::target"] = 0;
	html4.ATTRIBS["source::src"] = 0;
	html4.ATTRIBS["video::src"] = 0;
}
mxConstants.SHADOW_OPACITY = 0.25;
mxConstants.SHADOWCOLOR = '#000000';
mxConstants.VML_SHADOWCOLOR = '#d0d0d0';
mxGraph.prototype.pageBreakColor = '#c0c0c0';
mxGraph.prototype.pageScale = 1;
(function()
{
	try
	{
		if (navigator != null && navigator.language != null)
		{
			var lang = navigator.language.toLowerCase();
			mxGraph.prototype.pageFormat = (lang === 'en-us' || lang === 'en-ca' || lang === 'es-mx') ?
				mxConstants.PAGE_FORMAT_LETTER_PORTRAIT : mxConstants.PAGE_FORMAT_A4_PORTRAIT;
		}
	}
	catch (e)
	{
		
	}
})();
mxText.prototype.baseSpacingTop = 5;
mxText.prototype.baseSpacingBottom = 1;
mxEdgeStyle.SchematicWiringStyle=function(state,source,target,points,result)
{
		var graph = state.view.graph;
		var sourceEdge = source == null ? false : graph.getModel().isEdge(source.cell);
		var targetEdge = target == null ? false : graph.getModel().isEdge(target.cell);
		if( target == null )
		{
			result=[];
			return;
		}
		var pts = state.absolutePoints;
		var p0 = pts[0];
		var pe = pts[pts.length-1];
		var sourceX = source != null ? source.x : p0.x;
		var sourceY = source != null ? source.y : p0.y;
		var sourceWidth = source != null ? source.width : 0;
		var sourceHeight = source != null ? source.height : 0;
		
		var targetX = target != null ? target.x : pe.x;
		var targetY = target != null ? target.y : pe.y;
		var targetWidth = target != null ? target.width : 0;
		var targetHeight = target != null ? target.height : 0;
		var scaledSourceBuffer = state.view.scale * mxEdgeStyle.getJettySize(state, source, target, points, true);
		var scaledTargetBuffer = state.view.scale * mxEdgeStyle.getJettySize(state, source, target, points, false);
		
		if( state.style['sourcePort'] == null || state.style['targetPort'] == null )
		{
			result=[];
			return;
		}
		
		if (source != null && target == source)
		{
			scaledTargetBuffer = Math.max(scaledSourceBuffer, scaledTargetBuffer);
			scaledSourceBuffer = scaledTargetBuffer;
		}
		
		var totalBuffer = scaledTargetBuffer + scaledSourceBuffer;
		var tooShort = false;
		
		
		if (p0 != null && pe != null)
		{
			var dx = pe.x - p0.x;
			var dy = pe.y - p0.y;
			
			tooShort = dx * dx + dy * dy < totalBuffer * totalBuffer;
		}
		if (tooShort || (mxEdgeStyle.orthPointsFallback && (points != null &&
			points.length > 0)) || sourceEdge || targetEdge)
		{
			mxEdgeStyle.SegmentConnector(state, source, target, points, result);
			return;
		}
		
		
		
		var portConstraint = [mxConstants.DIRECTION_MASK_ALL, mxConstants.DIRECTION_MASK_ALL];
		var rotation = 0;
		
		if (source != null)
		{
			if( state.style['sourcePort'].endsWith("_e"))
				portConstraint[0]=mxConstants.DIRECTION_MASK_EAST;
			else if( state.style['sourcePort'].endsWith("_s"))
				portConstraint[0]=mxConstants.DIRECTION_MASK_SOUTH;
			else if( state.style['sourcePort'].endsWith("_n"))
				portConstraint[0]=mxConstants.DIRECTION_MASK_NORTH;
			else //if( state.style['sourcePort'].endsWith("_w"))
				portConstraint[0]=mxConstants.DIRECTION_MASK_WEST;
		}
		if (target != null)
		{
			if( state.style['targetPort'].endsWith("_e"))
				portConstraint[1]=mxConstants.DIRECTION_MASK_EAST;
			else if( state.style['targetPort'].endsWith("_s"))
				portConstraint[1]=mxConstants.DIRECTION_MASK_SOUTH;
			else if( state.style['targetPort'].endsWith("_n"))
				portConstraint[1]=mxConstants.DIRECTION_MASK_NORTH;
			else //if( state.style['targetPort'].endsWith("_w"))
				portConstraint[1]=mxConstants.DIRECTION_MASK_WEST;
		}
		
		sourceX = Math.round(sourceX * 10) / 10;
		sourceY = Math.round(sourceY * 10) / 10;
		sourceWidth = Math.round(sourceWidth * 10) / 10;
		sourceHeight = Math.round(sourceHeight * 10) / 10;
		
		targetX = Math.round(targetX * 10) / 10;
		targetY = Math.round(targetY * 10) / 10;
		targetWidth = Math.round(targetWidth * 10) / 10;
		targetHeight = Math.round(targetHeight * 10) / 10;
		
		var dir = [0, 0];
		
		
		
		
		var geo = [ [sourceX, sourceY, sourceWidth, sourceHeight] ,
		            [targetX, targetY, targetWidth, targetHeight] ];
		var buffer = [scaledSourceBuffer, scaledTargetBuffer];
		for (var i = 0; i < 2; i++)
		{
			mxEdgeStyle.limits[i][1] = geo[i][0] - buffer[i];
			mxEdgeStyle.limits[i][2] = geo[i][1] - buffer[i];
			mxEdgeStyle.limits[i][4] = geo[i][0] + geo[i][2] + buffer[i];
			mxEdgeStyle.limits[i][8] = geo[i][1] + geo[i][3] + buffer[i];
		}
		
		
		var sourceCenX = geo[0][0] + geo[0][2] / 2.0;
		var sourceCenY = geo[0][1] + geo[0][3] / 2.0;
		var targetCenX = geo[1][0] + geo[1][2] / 2.0;
		var targetCenY = geo[1][1] + geo[1][3] / 2.0;
		
		var dx = sourceCenX - targetCenX;
		var dy = sourceCenY - targetCenY;
		var quad = 0;
		if (dx < 0)
		{
			if (dy < 0)
			{
				quad = 2;
			}
			else
			{
				quad = 1;
			}
		}
		else
		{
			if (dy <= 0)
			{
				quad = 3;
				
				
				if (dx == 0)
				{
					quad = 2;
				}
			}
		}
		
		var currentTerm = null;
		
		if (source != null)
		{
			currentTerm = p0;
		}
		var constraint = [ [0.5, 0.5] , [0.5, 0.5] ];
		for (var i = 0; i < 2; i++)
		{
			if (currentTerm != null)
			{
				constraint[i][0] = (currentTerm.x - geo[i][0]) / geo[i][2];
				
				if (Math.abs(currentTerm.x - geo[i][0]) <= 1)
				{
					dir[i] = mxConstants.DIRECTION_MASK_WEST;
				}
				else if (Math.abs(currentTerm.x - geo[i][0] - geo[i][2]) <= 1)
				{
					dir[i] = mxConstants.DIRECTION_MASK_EAST;
				}
				constraint[i][1] = (currentTerm.y - geo[i][1]) / geo[i][3];
				if (Math.abs(currentTerm.y - geo[i][1]) <= 1)
				{
					dir[i] = mxConstants.DIRECTION_MASK_NORTH;
				}
				else if (Math.abs(currentTerm.y - geo[i][1] - geo[i][3]) <= 1)
				{
					dir[i] = mxConstants.DIRECTION_MASK_SOUTH;
				}
			}
			currentTerm = null;
			
			if (target != null)
			{
				currentTerm = pe;
			}
		}
		var sourceTopDist = geo[0][1] - (geo[1][1] + geo[1][3]);
		var sourceLeftDist = geo[0][0] - (geo[1][0] + geo[1][2]);
		var sourceBottomDist = geo[1][1] - (geo[0][1] + geo[0][3]);
		var sourceRightDist = geo[1][0] - (geo[0][0] + geo[0][2]);
		mxEdgeStyle.vertexSeperations[1] = Math.max(sourceLeftDist - totalBuffer, 0);
		mxEdgeStyle.vertexSeperations[2] = Math.max(sourceTopDist - totalBuffer, 0);
		mxEdgeStyle.vertexSeperations[4] = Math.max(sourceBottomDist - totalBuffer, 0);
		mxEdgeStyle.vertexSeperations[3] = Math.max(sourceRightDist - totalBuffer, 0);
				
		
		
		
		
		
		var dirPref = [];
		var horPref = [];
		var vertPref = [];
		horPref[0] = (sourceLeftDist >= sourceRightDist) ? mxConstants.DIRECTION_MASK_WEST
				: mxConstants.DIRECTION_MASK_EAST;
		vertPref[0] = (sourceTopDist >= sourceBottomDist) ? mxConstants.DIRECTION_MASK_NORTH
				: mxConstants.DIRECTION_MASK_SOUTH;
		horPref[1] = mxUtils.reversePortConstraints(horPref[0]);
		vertPref[1] = mxUtils.reversePortConstraints(vertPref[0]);
		
		var preferredHorizDist = sourceLeftDist >= sourceRightDist ? sourceLeftDist
				: sourceRightDist;
		var preferredVertDist = sourceTopDist >= sourceBottomDist ? sourceTopDist
				: sourceBottomDist;
		var prefOrdering = [ [0, 0] , [0, 0] ];
		var preferredOrderSet = false;
		
		for (var i = 0; i < 2; i++)
		{
			if (dir[i] != 0x0)
			{
				continue;
			}
			if ((horPref[i] & portConstraint[i]) == 0)
			{
				horPref[i] = mxUtils.reversePortConstraints(horPref[i]);
			}
			if ((vertPref[i] & portConstraint[i]) == 0)
			{
				vertPref[i] = mxUtils
						.reversePortConstraints(vertPref[i]);
			}
			prefOrdering[i][0] = vertPref[i];
			prefOrdering[i][1] = horPref[i];
		}
		if (preferredVertDist > 0
				&& preferredHorizDist > 0)
		{
			
			if (((horPref[0] & portConstraint[0]) > 0)
					&& ((vertPref[1] & portConstraint[1]) > 0))
			{
				prefOrdering[0][0] = horPref[0];
				prefOrdering[0][1] = vertPref[0];
				prefOrdering[1][0] = vertPref[1];
				prefOrdering[1][1] = horPref[1];
				preferredOrderSet = true;
			}
			else if (((vertPref[0] & portConstraint[0]) > 0)
					&& ((horPref[1] & portConstraint[1]) > 0))
			{
				prefOrdering[0][0] = vertPref[0];
				prefOrdering[0][1] = horPref[0];
				prefOrdering[1][0] = horPref[1];
				prefOrdering[1][1] = vertPref[1];
				preferredOrderSet = true;
			}
		}
		
		if (preferredVertDist > 0 && !preferredOrderSet)
		{
			prefOrdering[0][0] = vertPref[0];
			prefOrdering[0][1] = horPref[0];
			prefOrdering[1][0] = vertPref[1];
			prefOrdering[1][1] = horPref[1];
			preferredOrderSet = true;
		}
		
		if (preferredHorizDist > 0 && !preferredOrderSet)
		{
			prefOrdering[0][0] = horPref[0];
			prefOrdering[0][1] = vertPref[0];
			prefOrdering[1][0] = horPref[1];
			prefOrdering[1][1] = vertPref[1];
			preferredOrderSet = true;
		}
		
		
		
		for (var i = 0; i < 2; i++)
		{
			if (dir[i] != 0x0)
			{
				continue;
			}
			if ((prefOrdering[i][0] & portConstraint[i]) == 0)
			{
				prefOrdering[i][0] = prefOrdering[i][1];
			}
			dirPref[i] = prefOrdering[i][0] & portConstraint[i];
			dirPref[i] |= (prefOrdering[i][1] & portConstraint[i]) << 8;
			dirPref[i] |= (prefOrdering[1 - i][i] & portConstraint[i]) << 16;
			dirPref[i] |= (prefOrdering[1 - i][1 - i] & portConstraint[i]) << 24;
			if ((dirPref[i] & 0xF) == 0)
			{
				dirPref[i] = dirPref[i] << 8;
			}
			
			if ((dirPref[i] & 0xF00) == 0)
			{
				dirPref[i] = (dirPref[i] & 0xF) | dirPref[i] >> 8;
			}
			
			if ((dirPref[i] & 0xF0000) == 0)
			{
				dirPref[i] = (dirPref[i] & 0xFFFF)
						| ((dirPref[i] & 0xF000000) >> 8);
			}
			dir[i] = dirPref[i] & 0xF;
			if (portConstraint[i] == mxConstants.DIRECTION_MASK_WEST
					|| portConstraint[i] == mxConstants.DIRECTION_MASK_NORTH
					|| portConstraint[i] == mxConstants.DIRECTION_MASK_EAST
					|| portConstraint[i] == mxConstants.DIRECTION_MASK_SOUTH)
			{
				dir[i] = portConstraint[i];
			}
		}
		
		
		var sourceIndex = dir[0] == mxConstants.DIRECTION_MASK_EAST ? 3
				: dir[0];
		var targetIndex = dir[1] == mxConstants.DIRECTION_MASK_EAST ? 3
				: dir[1];
		sourceIndex -= quad;
		targetIndex -= quad;
		if (sourceIndex < 1)
		{
			sourceIndex += 4;
		}
		
		if (targetIndex < 1)
		{
			targetIndex += 4;
		}
		var routePattern = mxEdgeStyle.routePatterns[sourceIndex - 1][targetIndex - 1];
		mxEdgeStyle.wayPoints1[0][0] = geo[0][0];
		mxEdgeStyle.wayPoints1[0][1] = geo[0][1];
		switch (dir[0])
		{
			case mxConstants.DIRECTION_MASK_WEST:
				mxEdgeStyle.wayPoints1[0][0] -= scaledSourceBuffer;
				mxEdgeStyle.wayPoints1[0][1] += constraint[0][1] * geo[0][3];
				break;
			case mxConstants.DIRECTION_MASK_SOUTH:
				mxEdgeStyle.wayPoints1[0][0] += constraint[0][0] * geo[0][2];
				mxEdgeStyle.wayPoints1[0][1] += geo[0][3] + scaledSourceBuffer;
				break;
			case mxConstants.DIRECTION_MASK_EAST:
				mxEdgeStyle.wayPoints1[0][0] += geo[0][2] + scaledSourceBuffer;
				mxEdgeStyle.wayPoints1[0][1] += constraint[0][1] * geo[0][3];
				break;
			case mxConstants.DIRECTION_MASK_NORTH:
				mxEdgeStyle.wayPoints1[0][0] += constraint[0][0] * geo[0][2];
				mxEdgeStyle.wayPoints1[0][1] -= scaledSourceBuffer;
				break;
		}
		var currentIndex = 0;
		
		var lastOrientation = (dir[0] & (mxConstants.DIRECTION_MASK_EAST | mxConstants.DIRECTION_MASK_WEST)) > 0 ? 0
				: 1;
		var initialOrientation = lastOrientation;
		var currentOrientation = 0;
		for (var i = 0; i < routePattern.length; i++)
		{
			var nextDirection = routePattern[i] & 0xF;
			
			
			var directionIndex = nextDirection == mxConstants.DIRECTION_MASK_EAST ? 3
					: nextDirection;
			directionIndex += quad;
			if (directionIndex > 4)
			{
				directionIndex -= 4;
			}
			var direction = mxEdgeStyle.dirVectors[directionIndex - 1];
			currentOrientation = (directionIndex % 2 > 0) ? 0 : 1;
			
			
			
			
			if (currentOrientation != lastOrientation)
			{
				currentIndex++;
				
				
				
				
				mxEdgeStyle.wayPoints1[currentIndex][0] = mxEdgeStyle.wayPoints1[currentIndex - 1][0];
				mxEdgeStyle.wayPoints1[currentIndex][1] = mxEdgeStyle.wayPoints1[currentIndex - 1][1];
			}
			var tar = (routePattern[i] & mxEdgeStyle.TARGET_MASK) > 0;
			var sou = (routePattern[i] & mxEdgeStyle.SOURCE_MASK) > 0;
			var side = (routePattern[i] & mxEdgeStyle.SIDE_MASK) >> 5;
			side = side << quad;
			if (side > 0xF)
			{
				side = side >> 4;
			}
			var center = (routePattern[i] & mxEdgeStyle.CENTER_MASK) > 0;
			if ((sou || tar) && side < 9)
			{
				var limit = 0;
				var souTar = sou ? 0 : 1;
				if (center && currentOrientation == 0)
				{
					limit = geo[souTar][0] + constraint[souTar][0] * geo[souTar][2];
				}
				else if (center)
				{
					limit = geo[souTar][1] + constraint[souTar][1] * geo[souTar][3];
				}
				else
				{
					limit = mxEdgeStyle.limits[souTar][side];
				}
				
				if (currentOrientation == 0)
				{
					var lastX = mxEdgeStyle.wayPoints1[currentIndex][0];
					var deltaX = (limit - lastX) * direction[0];
					if (deltaX > 0)
					{
						mxEdgeStyle.wayPoints1[currentIndex][0] += direction[0]
								* deltaX;
					}
				}
				else
				{
					var lastY = mxEdgeStyle.wayPoints1[currentIndex][1];
					var deltaY = (limit - lastY) * direction[1];
					if (deltaY > 0)
					{
						mxEdgeStyle.wayPoints1[currentIndex][1] += direction[1]
								* deltaY;
					}
				}
			}
			else if (center)
			{
				
				mxEdgeStyle.wayPoints1[currentIndex][0] += direction[0]
						* Math.abs(mxEdgeStyle.vertexSeperations[directionIndex] / 2);
				mxEdgeStyle.wayPoints1[currentIndex][1] += direction[1]
						* Math.abs(mxEdgeStyle.vertexSeperations[directionIndex] / 2);
			}
			if (currentIndex > 0
					&& mxEdgeStyle.wayPoints1[currentIndex][currentOrientation] == mxEdgeStyle.wayPoints1[currentIndex - 1][currentOrientation])
			{
				currentIndex--;
			}
			else
			{
				lastOrientation = currentOrientation;
			}
		}
		for (var i = 0; i <= currentIndex; i++)
		{
			if (i == currentIndex)
			{
				var targetOrientation = (dir[1] & (mxConstants.DIRECTION_MASK_EAST | mxConstants.DIRECTION_MASK_WEST)) > 0 ? 0
						: 1;
				var sameOrient = targetOrientation == initialOrientation ? 0 : 1;
				
				if (sameOrient != (currentIndex + 1) % 2)
				{
					break;
				}
			}
			
			result.push(new mxPoint(Math.round(mxEdgeStyle.wayPoints1[i][0]), Math.round(mxEdgeStyle.wayPoints1[i][1])));
		}
		
		
		var index = 1;
		
		while (index < result.length)
		{
			if (result[index - 1] == null || result[index] == null ||
				result[index - 1].x != result[index].x ||
				result[index - 1].y != result[index].y)
			{
				index++;
			}
			else
			{
				result.splice(index, 1);
			}
		}
}
mxStyleRegistry.putValue('schematicWiringStyle', mxEdgeStyle.SchematicWiringStyle);
mxGraphModel.prototype.ignoreRelativeEdgeParent = false;
mxGraphView.prototype.gridImage = (mxClient.IS_SVG) ? 'data:image/gif;base64,R0lGODlhCgAKAJEAAAAAAP///8zMzP///yH5BAEAAAMALAAAAAAKAAoAAAIJ1I6py+0Po2wFADs=' :
	IMAGE_PATH + '/grid.gif';
mxGraphView.prototype.gridSteps = 4;
mxGraphView.prototype.minGridSize = 4;
mxGraphView.prototype.gridColor = '#e0e0e0';
mxSvgCanvas2D.prototype.foAltText = '[Not supported by viewer]';
Graph = function(container, model, renderHint, stylesheet, themes)
{
	mxGraph.call(this, container, model, renderHint, stylesheet);
	
	this.themes = themes || this.defaultThemes;
	this.currentEdgeStyle = mxUtils.clone(this.defaultEdgeStyle);
	this.currentVertexStyle = mxUtils.clone(this.defaultVertexStyle);
	
	var b = this.baseUrl;
	var p = b.indexOf('//');
	this.domainUrl = '';
	this.domainPathUrl = '';
	
	if (p > 0)
	{
		var d = b.indexOf('/', p + 2);
		if (d > 0)
		{
			this.domainUrl = b.substring(0, d);
		}
		
		d = b.lastIndexOf('/');
		
		if (d > 0)
		{
			this.domainPathUrl = b.substring(0, d + 1);
		}
	}
	
    
    
    
	
	this.isHtmlLabel = function(cell)
	{
		var state = this.view.getState(cell);
		var style = (state != null) ? state.style : this.getCellStyle(cell);
		
		return style['html'] == '1' || style[mxConstants.STYLE_WHITE_SPACE] == 'wrap';
	};
	
	
	if (this.edgeMode)
	{
		var start = {
			point: null,
			event: null,
			state: null,
			handle: null,
			selected: false
		};
		
		
		this.addListener(mxEvent.FIRE_MOUSE_EVENT, mxUtils.bind(this, function(sender, evt)
		{
			if (evt.getProperty('eventName') == 'mouseDown' && this.isEnabled())
			{
				var me = evt.getProperty('event');
				
				if (!mxEvent.isControlDown(me.getEvent()) && !mxEvent.isShiftDown(me.getEvent()))
		    	{
			    	var state = me.getState();
		
			    	if (state != null)
			    	{
			    		
			    		if (this.model.isEdge(state.cell))
			    		{
			    			start.point = new mxPoint(me.getGraphX(), me.getGraphY());
			    			start.selected = this.isCellSelected(state.cell);
			    			start.state = state;
			    			start.event = me;
			    			
	    					if (state.text != null && state.text.boundingBox != null &&
	    						mxUtils.contains(state.text.boundingBox, me.getGraphX(), me.getGraphY()))
	    					{
	    						start.handle = mxEvent.LABEL_HANDLE;
	    					}
	    					else
	    					{
				    			var handler = this.selectionCellsHandler.getHandler(state.cell);
	
				    			if (handler != null && handler.bends != null && handler.bends.length > 0)
				    			{
				    				start.handle = handler.getHandleForEvent(me);
				    			}
	    					}
			    		}
			    	}
		    	}
			}
		}));
		
		var mouseDown = null;
		
		this.addMouseListener(
		{
			mouseDown: function(sender, me) {},
		    mouseMove: mxUtils.bind(this, function(sender, me)
		    {
		    	
		    	var handlerMap = this.selectionCellsHandler.handlers.map;
		    	
		    	for (var key in handlerMap)
		    	{
		    		if (handlerMap[key].index != null)
		    		{
		    			return;
		    		}
		    	}
		    	
		    	if (this.isEnabled() && !this.panningHandler.isActive() && !mxEvent.isControlDown(me.getEvent()) &&
		    		!mxEvent.isShiftDown(me.getEvent()) && !mxEvent.isAltDown(me.getEvent()))
		    	{
		    		var tol = this.tolerance;
	
			    	if (start.point != null && start.state != null && start.event != null)
			    	{
			    		var state = start.state;
			    		
			    		if (Math.abs(start.point.x - me.getGraphX()) > tol ||
			    			Math.abs(start.point.y - me.getGraphY()) > tol)
			    		{
			    			
			    			if (!this.isCellSelected(state.cell))
			    			{
			    				this.setSelectionCell(state.cell);
			    			}
			    			
			    			var handler = this.selectionCellsHandler.getHandler(state.cell);
			    			
			    			if (handler != null && handler.bends != null && handler.bends.length > 0)
			    			{
			    				var handle = handler.getHandleForEvent(start.event);
			    				var edgeStyle = this.view.getEdgeStyle(state);
			    				var entity = edgeStyle == mxEdgeStyle.EntityRelation;
			    				
			    				
			    				
			    				if (!start.selected && start.handle == mxEvent.LABEL_HANDLE)
			    				{
			    					handle = start.handle;
			    				}
			    				
	    						if (!entity || handle == 0 || handle == handler.bends.length - 1 || handle == mxEvent.LABEL_HANDLE)
	    						{
				    				
				    				
				    				if (handle == mxEvent.LABEL_HANDLE || handle == 0 || state.visibleSourceState != null ||
				    					handle == handler.bends.length - 1 || state.visibleTargetState != null)
				    				{
				    					if (!entity && handle != mxEvent.LABEL_HANDLE)
				    					{
					    					var pts = state.absolutePoints;
				    						
					    					
					    					
					    					if (pts != null && ((edgeStyle == null && handle == null) ||
					    						edgeStyle == mxEdgeStyle.OrthConnector))
					    					{
					    						
					    						handle = start.handle;
					    						if (handle == null)
					    						{
							    					var box = new mxRectangle(start.point.x, start.point.y);
							    					box.grow(mxEdgeHandler.prototype.handleImage.width / 2);
							    					
					    							if (mxUtils.contains(box, pts[0].x, pts[0].y))
					    							{
						    							
					    								handle = 0;
					    							}
					    							else if (mxUtils.contains(box, pts[pts.length - 1].x, pts[pts.length - 1].y))
					    							{
					    								
					    								handle = handler.bends.length - 1;
					    							}
					    							else
					    							{
							    						
							    						var nobends = edgeStyle != null && (pts.length == 2 || (pts.length == 3 &&
						    								((Math.round(pts[0].x - pts[1].x) == 0 && Math.round(pts[1].x - pts[2].x) == 0) ||
						    								(Math.round(pts[0].y - pts[1].y) == 0 && Math.round(pts[1].y - pts[2].y) == 0))));
							    						
						    							if (nobends)
								    					{
									    					
								    						handle = 2;
								    					}
								    					else
									    				{
										    				
									    					handle = mxUtils.findNearestSegment(state, start.point.x, start.point.y);
									    					
									    					
									    					if (edgeStyle == null)
									    					{
									    						handle = mxEvent.VIRTUAL_HANDLE - handle;
									    					}
									    					
									    					else
									    					{
									    						handle += 1;
									    					}
									    				}
					    							}
					    						}
					    					}
							    			
						    				
						    				if (handle == null)
						    				{
						    					handle = mxEvent.VIRTUAL_HANDLE;
						    				}
				    					}
					    				
				    					handler.start(me.getGraphX(), me.getGraphX(), handle);
				    					start.state = null;
				    					start.event = null;
				    					start.point = null;
				    					start.handle = null;
				    					start.selected = false;
				    					me.consume();
	
				    					
				    					this.graphHandler.reset();
				    				}
	    						}
	    						else if (entity && (state.visibleSourceState != null || state.visibleTargetState != null))
	    						{
	    							
			    					this.graphHandler.reset();
	    							me.consume();
	    						}
			    			}
			    		}
			    	}
			    	else
			    	{
			    		
				    	var state = me.getState();
				    	
				    	if (state != null)
				    	{
				    		
				    		if (this.model.isEdge(state.cell))
				    		{
				    			var cursor = null;
			    				var pts = state.absolutePoints;
			    				
			    				if (pts != null)
			    				{
			    					var box = new mxRectangle(me.getGraphX(), me.getGraphY());
			    					box.grow(mxEdgeHandler.prototype.handleImage.width / 2);
			    					
			    					if (state.text != null && state.text.boundingBox != null &&
			    						mxUtils.contains(state.text.boundingBox, me.getGraphX(), me.getGraphY()))
			    					{
			    						cursor = 'move';
			    					}
			    					else if (mxUtils.contains(box, pts[0].x, pts[0].y) ||
			    						mxUtils.contains(box, pts[pts.length - 1].x, pts[pts.length - 1].y))
			    					{
			    						cursor = 'pointer';
			    					}
			    					else if (state.visibleSourceState != null || state.visibleTargetState != null)
			    					{
		    							
			    						var tmp = this.view.getEdgeStyle(state);
			    						cursor = 'crosshair';
			    						
			    						if (tmp != mxEdgeStyle.EntityRelation && this.isOrthogonal(state))
						    			{
						    				var idx = mxUtils.findNearestSegment(state, me.getGraphX(), me.getGraphY());
						    				
						    				if (idx < pts.length - 1 && idx >= 0)
						    				{
					    						cursor = (Math.round(pts[idx].x - pts[idx + 1].x) == 0) ?
					    							'col-resize' : 'row-resize';
						    				}
						    			}
			    					}
			    				}
			    				
			    				if (cursor != null)
			    				{
			    					state.setCursor(cursor);
			    				}
				    		}
				    	}
			    	}
		    	}
		    }),
		    mouseUp: mxUtils.bind(this, function(sender, me)
		    {
				start.state = null;
				start.event = null;
				start.point = null;
				start.handle = null;
		    })
		});
	}
	
	
	this.cellRenderer.getLabelValue = function(state)
	{
		var result = mxCellRenderer.prototype.getLabelValue.apply(this, arguments);
		
		if (state.view.graph.isHtmlLabel(state.cell))
		{
			if (state.style['html'] != 1)
			{
				result = mxUtils.htmlEntities(result, false);
			}
			else
			{
				result = state.view.graph.sanitizeHtml(result);
			}
		}
		
		return result;
	};
	
	if (typeof mxVertexHandler !== 'undefined')
	{
		this.setConnectable(true);
		this.setDropEnabled(true);
		this.setPanning(true);
		this.setTooltips(true);
		this.setAllowLoops(true);
		this.allowAutoPanning = true;
		this.resetEdgesOnConnect = false;
		this.constrainChildren = false;
		this.constrainRelativeChildren = true;
		
		
		this.graphHandler.scrollOnMove = false;
		this.graphHandler.scaleGrid = true;
		
		this.connectionHandler.setCreateTarget(false);
		this.connectionHandler.insertBeforeSource = true;
		
		
		this.connectionHandler.isValidSource = function(cell, me)
		{
			return false;
		};
		
		this.alternateEdgeStyle = 'vertical';
		if (stylesheet == null)
		{
			this.loadStylesheet();
		}
		
		var graphHandlerGetGuideStates = this.graphHandler.getGuideStates;
		this.graphHandler.getGuideStates = function()
		{
			var result = graphHandlerGetGuideStates.apply(this, arguments);
			
			
			if (this.graph.pageVisible)
			{
				var guides = [];
				
				var pf = this.graph.pageFormat;
				var ps = this.graph.pageScale;
				var pw = pf.width * ps;
				var ph = pf.height * ps;
				var t = this.graph.view.translate;
				var s = this.graph.view.scale;
				var layout = this.graph.getPageLayout();
				
				for (var i = 0; i < layout.width; i++)
				{
					guides.push(new mxRectangle(((layout.x + i) * pw + t.x) * s,
						(layout.y * ph + t.y) * s, pw * s, ph * s));
				}
				
				for (var j = 0; j < layout.height; j++)
				{
					guides.push(new mxRectangle((layout.x * pw + t.x) * s,
						((layout.y + j) * ph + t.y) * s, pw * s, ph * s));
				}
				
				
				result = guides.concat(result);
			}
			
			return result;
		};
		
		mxDragSource.prototype.dragElementZIndex = mxPopupMenu.prototype.zIndex;
		
		
		mxGuide.prototype.getGuideColor = function(state, horizontal)
		{
			return (state.cell == null) ? '#ffa500'  : mxConstants.GUIDE_COLOR;
		};
		
		this.graphHandler.createPreviewShape = function(bounds)
		{
			this.previewColor = (this.graph.background == '#000000') ? '#ffffff' : mxGraphHandler.prototype.previewColor;
			
			return mxGraphHandler.prototype.createPreviewShape.apply(this, arguments);
		};
		
		
		
		
		
		this.graphHandler.getCells = function(initialCell)
		{
		    var cells = mxGraphHandler.prototype.getCells.apply(this, arguments);
		    var newCells = [];
		    for (var i = 0; i < cells.length; i++)
		    {
				var state = this.graph.view.getState(cells[i]);
				var style = (state != null) ? state.style : this.graph.getCellStyle(cells[i]);
		    	
				if (mxUtils.getValue(style, 'part', '0') == '1')
				{
			        var parent = this.graph.model.getParent(cells[i]);
		
			        if (this.graph.model.isVertex(parent) && mxUtils.indexOf(cells, parent) < 0)
			        {
			            newCells.push(parent);
			        }
				}
				else
				{
					newCells.push(cells[i]);
				}
		    }
		    return newCells;
		};
		
		this.connectionHandler.createTargetVertex = function(evt, source)
		{
			var state = this.graph.view.getState(source);
			var style = (state != null) ? state.style : this.graph.getCellStyle(source);
	    	
			if (mxUtils.getValue(style, 'part', false))
			{
				var parent = this.graph.model.getParent(source);
				if (this.graph.model.isVertex(parent))
				{
					source = parent;
				}
			}
			
			return mxConnectionHandler.prototype.createTargetVertex.apply(this, arguments);
		};
		
	    var rubberband = new mxRubberband(this);
	    
	    this.getRubberband = function()
	    {
	    		return rubberband;
	    };
	    
	    
	    var startTime = new Date().getTime();
	    var timeOnTarget = 0;
	    
	    var connectionHandlerMouseMove = this.connectionHandler.mouseMove;
	    
	    this.connectionHandler.mouseMove = function()
	    {
		    	var prev = this.currentState;
		    	connectionHandlerMouseMove.apply(this, arguments);
		    	
		    	if (prev != this.currentState)
		    	{
		    		startTime = new Date().getTime();
		    		timeOnTarget = 0;
		    	}
		    	else
		    	{
			    	timeOnTarget = new Date().getTime() - startTime;
		    	}
	    };
	    
	    
	    
	    
	    var connectionHandleIsOutlineConnectEvent = this.connectionHandler.isOutlineConnectEvent;
	    
	    this.connectionHandler.isOutlineConnectEvent = function(me)
	    {
		    	return (this.currentState != null && me.getState() == this.currentState && timeOnTarget > 2000) ||
		    		((this.currentState == null || mxUtils.getValue(this.currentState.style, 'outlineConnect', '1') != '0') &&
		    		connectionHandleIsOutlineConnectEvent.apply(this, arguments));
	    };
	    
	    
	    var isToggleEvent = this.isToggleEvent;
	    this.isToggleEvent = function(evt)
	    {
	    		return isToggleEvent.apply(this, arguments) || mxEvent.isShiftDown(evt);
	    };
	    
	    
	    
	    
	    var isForceRubberBandEvent = rubberband.isForceRubberbandEvent;
	    rubberband.isForceRubberbandEvent = function(me)
	    {
		    	return isForceRubberBandEvent.apply(this, arguments) ||
		    		(mxUtils.hasScrollbars(this.graph.container) && mxClient.IS_FF &&
		    		mxClient.IS_WIN && me.getState() == null && mxEvent.isTouchEvent(me.getEvent()));
	    };
	    
	    
	    var prevCursor = null;
	    
		this.panningHandler.addListener(mxEvent.PAN_START, mxUtils.bind(this, function()
		{
			if (this.isEnabled())
			{
				prevCursor = this.container.style.cursor;
				this.container.style.cursor = 'move';
			}
		}));
			
		this.panningHandler.addListener(mxEvent.PAN_END, mxUtils.bind(this, function()
		{
			if (this.isEnabled())
			{
				this.container.style.cursor = prevCursor;
			}
		}));
		this.popupMenuHandler.autoExpand = true;
		
		this.popupMenuHandler.isSelectOnPopup = function(me)
		{
			return mxEvent.isMouseEvent(me.getEvent());
		};
	
		
		var click = this.click;
		this.click = function(me)
		{
			var locked = me.state == null && me.sourceState != null && this.isCellLocked(me.sourceState.cell);
			
			if ((!this.isEnabled() || locked) && !me.isConsumed())
			{
				var cell = (locked) ? me.sourceState.cell : me.getCell();
				
				if (cell != null)
				{
					var link = this.getLinkForCell(cell);
					
					if (link != null)
					{
						if (this.isCustomLink(link))
						{
							this.customLinkClicked(link);
						}
						else
						{
							this.openLink(link);
						}
					}
				}
			}
			else
			{
				return click.apply(this, arguments);
			}
		};
		
		this.tooltipHandler.getStateForEvent = function(me)
		{
			return me.sourceState;
		};
		
		
		var getCursorForMouseEvent = this.getCursorForMouseEvent; 
		this.getCursorForMouseEvent = function(me)
		{
			var locked = me.state == null && me.sourceState != null && this.isCellLocked(me.sourceState.cell);
			
			return this.getCursorForCell((locked) ? me.sourceState.cell : me.getCell());
		};
		
		
		
		var getCursorForCell = this.getCursorForCell;
		this.getCursorForCell = function(cell)
		{
			if (!this.isEnabled() || this.isCellLocked(cell))
			{
				var link = this.getLinkForCell(cell);
				
				if (link != null)
				{
					return 'pointer';
				}
				else if (this.isCellLocked(cell))
				{
					return 'default';
				}
			}
			return getCursorForCell.apply(this, arguments);
		};
		
		
		this.selectRegion = function(rect, evt)
		{
			var cells = this.getAllCells(rect.x, rect.y, rect.width, rect.height);
			this.selectCellsForEvent(cells, evt);
			
			return cells;
		};
		
		
		this.getAllCells = function(x, y, width, height, parent, result)
		{
			result = (result != null) ? result : [];
			
			if (width > 0 || height > 0)
			{
				var model = this.getModel();
				var right = x + width;
				var bottom = y + height;
	
				if (parent == null)
				{
					parent = this.getCurrentRoot();
					
					if (parent == null)
					{
						parent = model.getRoot();
					}
				}
				
				if (parent != null)
				{
					var childCount = model.getChildCount(parent);
					
					for (var i = 0; i < childCount; i++)
					{
						var cell = model.getChildAt(parent, i);
						var state = this.view.getState(cell);
						
						if (state != null && this.isCellVisible(cell) && mxUtils.getValue(state.style, 'locked', '0') != '1')
						{
							var deg = mxUtils.getValue(state.style, mxConstants.STYLE_ROTATION) || 0;
							var box = state;
							
							if (deg != 0)
							{
								box = mxUtils.getBoundingBox(box, deg);
							}
							
							if ((model.isEdge(cell) || model.isVertex(cell)) &&
								box.x >= x && box.y + box.height <= bottom &&
								box.y >= y && box.x + box.width <= right)
							{
								result.push(cell);
							}
	
							this.getAllCells(x, y, width, height, cell, result);
						}
					}
				}
			}
			
			return result;
		};
		
		var graphHandlerShouldRemoveCellsFromParent = this.graphHandler.shouldRemoveCellsFromParent;
		this.graphHandler.shouldRemoveCellsFromParent = function(parent, cells, evt)
		{
			if (this.graph.isCellSelected(parent))
			{
				return false;
			}
			
			return graphHandlerShouldRemoveCellsFromParent.apply(this, arguments);
		};
		
		this.isCellLocked = function(cell)
		{
			var pState = this.view.getState(cell);
			
			while (pState != null)
			{
				if (mxUtils.getValue(pState.style, 'locked', '0') == '1')
				{
					return true;
				}
				
				pState = this.view.getState(this.model.getParent(pState.cell));
			}
			
			return false;
		};
		
		var tapAndHoldSelection = null;
		
		
		this.addListener(mxEvent.FIRE_MOUSE_EVENT, mxUtils.bind(this, function(sender, evt)
		{
			if (evt.getProperty('eventName') == 'mouseDown')
			{
				var me = evt.getProperty('event');
				var state = me.getState();
				
				if (state != null && !this.isSelectionEmpty() && !this.isCellSelected(state.cell))
				{
					tapAndHoldSelection = this.getSelectionCells();
				}
				else
				{
					tapAndHoldSelection = null;
				}
			}
		}));
		
		
		
		this.addListener(mxEvent.TAP_AND_HOLD, mxUtils.bind(this, function(sender, evt)
		{
			if (!mxEvent.isMultiTouchEvent(evt))
			{
				var me = evt.getProperty('event');
				var cell = evt.getProperty('cell');
				
				if (cell == null)
				{
					var pt = mxUtils.convertPoint(this.container,
							mxEvent.getClientX(me), mxEvent.getClientY(me));
					rubberband.start(pt.x, pt.y);
				}
				else if (tapAndHoldSelection != null)
				{
					this.addSelectionCells(tapAndHoldSelection);
				}
				else if (this.getSelectionCount() > 1 && this.isCellSelected(cell))
				{
					this.removeSelectionCell(cell);
				}
				
				
				tapAndHoldSelection = null;
				evt.consume();
			}
		}));
	
		
		this.connectionHandler.selectCells = function(edge, target)
		{
			this.graph.setSelectionCell(target || edge);
		};
		
		
		this.connectionHandler.constraintHandler.isStateIgnored = function(state, source)
		{
			return source && state.view.graph.isCellSelected(state.cell);
		};
		
		
		this.selectionModel.addListener(mxEvent.CHANGE, mxUtils.bind(this, function()
		{
			var ch = this.connectionHandler.constraintHandler;
			
			if (ch.currentFocus != null && ch.isStateIgnored(ch.currentFocus, true))
			{
				ch.currentFocus = null;
				ch.constraints = null;
				ch.destroyIcons();
			}
			
			ch.destroyFocusHighlight();
		}));
		
		
		if (Graph.touchStyle)
		{
			this.initTouch();
		}
		
		var graphUpdateMouseEvent = this.updateMouseEvent;
		this.updateMouseEvent = function(me)
		{
			me = graphUpdateMouseEvent.apply(this, arguments);
			
			if (me.state != null && this.isCellLocked(me.getCell()))
			{
				me.state = null;
			}
			
			return me;
		};
	}
	
	
	this.currentTranslate = new mxPoint(0, 0);
};
Graph.touchStyle = mxClient.IS_TOUCH || (mxClient.IS_FF && mxClient.IS_WIN) || navigator.maxTouchPoints > 0 ||
	navigator.msMaxTouchPoints > 0 || window.urlParams == null || urlParams['touch'] == '1';
Graph.fileSupport = window.File != null && window.FileReader != null && window.FileList != null &&
	(window.urlParams == null || urlParams['filesupport'] != '0');
Graph.lineJumpsEnabled = true;
Graph.defaultJumpSize = 6;
Graph.createSvgImage = function(w, h, data)
{
	var tmp = unescape(encodeURIComponent(
        '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + w + 'px" height="' + h + 'px" ' +
        'version="1.1">' + data + '</svg>'));
    return new mxImage('data:image/svg+xml;base64,' + ((window.btoa) ? btoa(tmp) : Base64.encode(tmp, true)), w, h)
};
mxUtils.extend(Graph, mxGraph);
Graph.prototype.minFitScale = null;
Graph.prototype.maxFitScale = null;
Graph.prototype.linkPolicy = (urlParams['target'] == 'frame') ? 'blank' : (urlParams['target'] || 'auto');
Graph.prototype.linkTarget = (urlParams['target'] == 'frame') ? '_self' : '_blank';
Graph.prototype.linkRelation = 'nofollow noopener noreferrer';
Graph.prototype.defaultScrollbars = !mxClient.IS_IOS;
Graph.prototype.defaultPageVisible = false;
Graph.prototype.lightbox = false;
Graph.prototype.defaultPageBackgroundColor = '#ffffff';
Graph.prototype.defaultPageBorderColor = '#ffffff';
Graph.prototype.defaultGraphBackground = '#ffffff';
Graph.prototype.scrollTileSize = new mxRectangle(0, 0, 400, 400);
Graph.prototype.transparentBackground = true;
Graph.prototype.defaultEdgeLength = 80;
Graph.prototype.edgeMode = false;
Graph.prototype.connectionArrowsEnabled = false;
Graph.prototype.placeholderPattern = new RegExp('%(date\{.*\}|[^%^\{^\}]+)%', 'g');
Graph.prototype.absoluteUrlPattern = new RegExp('^(?:[a-z]+:)?//', 'i');
Graph.prototype.defaultThemeName = 'default';
Graph.prototype.defaultThemes = {};
Graph.prototype.baseUrl = (urlParams['base'] != null) ?
	decodeURIComponent(urlParams['base']) :
	(((window != window.top) ? document.referrer :
	document.location.toString()).split('#')[0]);
Graph.prototype.editAfterInsert = false;
Graph.prototype.builtInProperties = ['label', 'tooltip', 'placeholders', 'placeholder'];
Graph.prototype.init = function(container)
{
	mxGraph.prototype.init.apply(this, arguments);
	
	this.cellRenderer.initializeLabel = function(state, shape)
	{
		mxCellRenderer.prototype.initializeLabel.apply(this, arguments);
		
		
		var tol = state.view.graph.tolerance;
		var handleClick = true;
		var first = null;
		
		var down = mxUtils.bind(this, function(evt)
		{
			handleClick = true;
			first = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
		});
		
		var move = mxUtils.bind(this, function(evt)
		{
			handleClick = handleClick && first != null &&
				Math.abs(first.x - mxEvent.getClientX(evt)) < tol &&
				Math.abs(first.y - mxEvent.getClientY(evt)) < tol;
		});
		
		var up = mxUtils.bind(this, function(evt)
		{
			if (handleClick)
			{
				var elt = mxEvent.getSource(evt)
				
				while (elt != null && elt != shape.node)
				{
					if (elt.nodeName.toLowerCase() == 'a')
					{
						state.view.graph.labelLinkClicked(state, elt, evt);
						break;
					}
					
					elt = elt.parentNode;
				}
			}
		});
		
		mxEvent.addGestureListeners(shape.node, down, move, up);
		mxEvent.addListener(shape.node, 'click', function(evt)
		{
			mxEvent.consume(evt);
		});
	};
	
	this.initLayoutManager();
};
(function()
{
	Graph.prototype.useCssTransforms = false;
	Graph.prototype.currentScale = 1;
	Graph.prototype.currentTranslate = new mxPoint(0, 0);
	Graph.prototype.isCssTransformsSupported = function()
	{
		return this.dialect == mxConstants.DIALECT_SVG && !mxClient.NO_FO;
	};
	Graph.prototype.getCellAt = function(x, y, parent, vertices, edges, ignoreFn)
	{
		if (this.useCssTransforms)
		{
			x = x / this.currentScale - this.currentTranslate.x;
			y = y / this.currentScale - this.currentTranslate.y;
		}
		
		return this.getScaledCellAt.apply(this, arguments);
	};
	Graph.prototype.getScaledCellAt = function(x, y, parent, vertices, edges, ignoreFn)
	{
		vertices = (vertices != null) ? vertices : true;
		edges = (edges != null) ? edges : true;
		if (parent == null)
		{
			parent = this.getCurrentRoot();
			
			if (parent == null)
			{
				parent = this.getModel().getRoot();
			}
		}
		if (parent != null)
		{
			var childCount = this.model.getChildCount(parent);
			
			for (var i = childCount - 1; i >= 0; i--)
			{
				var cell = this.model.getChildAt(parent, i);
				var result = this.getScaledCellAt(x, y, cell, vertices, edges, ignoreFn);
				
				if (result != null)
				{
					return result;
				}
				else if (this.isCellVisible(cell) && (edges && this.model.isEdge(cell) ||
					vertices && this.model.isVertex(cell)))
				{
					var state = this.view.getState(cell);
					if (state != null && (ignoreFn == null || !ignoreFn(state, x, y)) &&
						this.intersects(state, x, y))
					{
						return cell;
					}
				}
			}
		}
		
		return null;
	};
	mxCellHighlight.prototype.getStrokeWidth = function(state)
	{
		var s = this.strokeWidth;
		
		if (this.graph.useCssTransforms)
		{
			s /= this.graph.currentScale;
		}
		return s;
	};
	mxGraphView.prototype.getGraphBounds = function()
	{
		var b = this.graphBounds;
		
		if (this.graph.useCssTransforms)
		{
			var t = this.graph.currentTranslate;
			var s = this.graph.currentScale;
			b = new mxRectangle(
				(b.x + t.x) * s, (b.y + t.y) * s,
				b.width * s, b.height * s);
		}
		return b;
	};
	
	mxGraphView.prototype.viewStateChanged = function()
	{
		if (this.graph.useCssTransforms)
		{
			this.validate();
			this.graph.sizeDidChange();
		}
		else
		{
			this.revalidate();
			this.graph.sizeDidChange();
		}
	};
	var graphViewValidate = mxGraphView.prototype.validate;
	
	mxGraphView.prototype.validate = function(cell)
	{
		if (this.graph.useCssTransforms)
		{
			this.graph.currentScale = this.scale;
			this.graph.currentTranslate.x = this.translate.x;
			this.graph.currentTranslate.y = this.translate.y;
			
			this.scale = 1;
			this.translate.x = 0;
			this.translate.y = 0;
		}
		
		graphViewValidate.apply(this, arguments);
		
		if (this.graph.useCssTransforms)
		{
			this.graph.updateCssTransform();
			
			this.scale = this.graph.currentScale;
			this.translate.x = this.graph.currentTranslate.x;
			this.translate.y = this.graph.currentTranslate.y;
		}
	};
	Graph.prototype.updateCssTransform = function()
	{
		var temp = this.view.getDrawPane();
		
		if (temp != null)
		{
			var g = temp.parentNode;
			
			if (!this.useCssTransforms)
			{
				g.removeAttribute('transformOrigin');
				g.removeAttribute('transform');
			}
			else
			{
				var prev = g.getAttribute('transform');
				g.setAttribute('transformOrigin', '0 0');
				g.setAttribute('transform', 'scale(' + this.currentScale + ',' + this.currentScale + ')' +
					'translate(' + this.currentTranslate.x + ',' + this.currentTranslate.y + ')');
	
				
				if (prev != g.getAttribute('transform'))
				{
					try
					{
						
						
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
						
						if (mxClient.IS_EDGE)
						{
							
							
							var val = g.style.display;
							g.style.display = 'none';
							g.getBBox();
							g.style.display = val;
						}
					}
					catch (e)
					{
						
					}
				}
			}
		}
	};
	
	var graphViewValidateBackgroundPage = mxGraphView.prototype.validateBackgroundPage;
	
	mxGraphView.prototype.validateBackgroundPage = function()
	{
		var useCssTranforms = this.graph.useCssTransforms, scale = this.scale, 
			translate = this.translate;
		
		if (useCssTranforms)
		{
			this.scale = this.graph.currentScale;
			this.translate = this.graph.currentTranslate;
		}
		
		graphViewValidateBackgroundPage.apply(this, arguments);
		
		if (useCssTranforms)
		{
			this.scale = scale;
			this.translate = translate;
		}
	};
	var graphUpdatePageBreaks = mxGraph.prototype.updatePageBreaks;
	
	mxGraph.prototype.updatePageBreaks = function(visible, width, height)
	{
		var useCssTranforms = this.useCssTransforms, scale = this.view.scale, 
			translate = this.view.translate;
	
		if (useCssTranforms)
		{
			this.view.scale = 1;
			this.view.translate = new mxPoint(0, 0);
			this.useCssTransforms = false;
		}
		
		graphUpdatePageBreaks.apply(this, arguments);
		
		if (useCssTranforms)
		{
			this.view.scale = scale;
			this.view.translate = translate;
			this.useCssTransforms = true;
		}
	};
	
})();
Graph.prototype.isLightboxView = function()
{
	return this.lightbox;
};
Graph.prototype.openLink = function(href, target, allowOpener)
{
	var result = window;
	
	if (target == '_self' && window != window.top)
	{
		window.location.href = href;
	}
	else
	{
		if (href.substring(0, this.baseUrl.length) == this.baseUrl &&
			href.charAt(this.baseUrl.length) == '#' &&
			target == '_top' && window == window.top)
		{
			var hash = href.split('#')[1];

			if (window.location.hash == '#' + hash)
			{
				window.location.hash = '';
			}
			
			window.location.hash = hash;
		}
		else
		{
			result = window.open(href, target);
			
			if (result != null && !allowOpener)
			{
				result.opener = null;
			}
		}
	}
	
	return result;
};

Graph.prototype.initLayoutManager = function()
{
	this.layoutManager = new mxLayoutManager(this);
	this.layoutManager.getLayout = function(cell)
	{
		var state = this.graph.view.getState(cell);
		var style = (state != null) ? state.style : this.graph.getCellStyle(cell);
		
		if (style['childLayout'] == 'stackLayout')
		{
			var stackLayout = new mxStackLayout(this.graph, true);
			stackLayout.resizeParentMax = mxUtils.getValue(style, 'resizeParentMax', '1') == '1';
			stackLayout.horizontal = mxUtils.getValue(style, 'horizontalStack', '1') == '1';
			stackLayout.resizeParent = mxUtils.getValue(style, 'resizeParent', '1') == '1';
			stackLayout.resizeLast = mxUtils.getValue(style, 'resizeLast', '0') == '1';
			stackLayout.spacing = style['stackSpacing'] || stackLayout.spacing;
			stackLayout.border = style['stackBorder'] || stackLayout.border;
			stackLayout.marginLeft = style['marginLeft'] || 0;
			stackLayout.marginRight = style['marginRight'] || 0;
			stackLayout.marginTop = style['marginTop'] || 0;
			stackLayout.marginBottom = style['marginBottom'] || 0;
			stackLayout.fill = true;
			
			return stackLayout;
		}
		else if (style['childLayout'] == 'treeLayout')
		{
			var treeLayout = new mxCompactTreeLayout(this.graph);
			treeLayout.horizontal = mxUtils.getValue(style, 'horizontalTree', '1') == '1';
			treeLayout.resizeParent = mxUtils.getValue(style, 'resizeParent', '1') == '1';
			treeLayout.groupPadding = mxUtils.getValue(style, 'parentPadding', 20);
			treeLayout.levelDistance = mxUtils.getValue(style, 'treeLevelDistance', 30);
			treeLayout.maintainParentLocation = true;
			treeLayout.edgeRouting = false;
			treeLayout.resetEdges = false;
			
			return treeLayout;
		}
		else if (style['childLayout'] == 'flowLayout')
		{
			var flowLayout = new mxHierarchicalLayout(this.graph, mxUtils.getValue(style,
					'flowOrientation', mxConstants.DIRECTION_EAST));
			flowLayout.resizeParent = mxUtils.getValue(style, 'resizeParent', '1') == '1';
			flowLayout.parentBorder = mxUtils.getValue(style, 'parentPadding', 20);
			flowLayout.maintainParentLocation = true;
			
			
			flowLayout.intraCellSpacing = mxUtils.getValue(style, 'intraCellSpacing', mxHierarchicalLayout.prototype.intraCellSpacing);
			flowLayout.interRankCellSpacing = mxUtils.getValue(style, 'interRankCellSpacing', mxHierarchicalLayout.prototype.interRankCellSpacing);
			flowLayout.interHierarchySpacing = mxUtils.getValue(style, 'interHierarchySpacing', mxHierarchicalLayout.prototype.interHierarchySpacing);
			flowLayout.parallelEdgeSpacing = mxUtils.getValue(style, 'parallelEdgeSpacing', mxHierarchicalLayout.prototype.parallelEdgeSpacing);
			
			return flowLayout;
		}
		
		return null;
	};
};
	
Graph.prototype.getPageSize = function()
{
	return (this.pageVisible) ? new mxRectangle(0, 0, this.pageFormat.width * this.pageScale,
			this.pageFormat.height * this.pageScale) : this.scrollTileSize;
};
Graph.prototype.getPageLayout = function()
{
	var size = this.getPageSize();
	var bounds = this.getGraphBounds();
	if (bounds.width == 0 || bounds.height == 0)
	{
		return new mxRectangle(0, 0, 1, 1);
	}
	else
	{
		
		var x = Math.ceil(bounds.x / this.view.scale - this.view.translate.x);
		var y = Math.ceil(bounds.y / this.view.scale - this.view.translate.y);
		var w = Math.floor(bounds.width / this.view.scale);
		var h = Math.floor(bounds.height / this.view.scale);
		
		var x0 = Math.floor(x / size.width);
		var y0 = Math.floor(y / size.height);
		var w0 = Math.ceil((x + w) / size.width) - x0;
		var h0 = Math.ceil((y + h) / size.height) - y0;
		
		return new mxRectangle(x0, y0, w0, h0);
	}
};
Graph.prototype.sanitizeHtml = function(value, editing)
{
	
	
	
	
	function urlX(link)
	{
		if (link != null && link.toString().toLowerCase().substring(0, 11) !== 'javascript:')
		{
			return link;
		}
		
		return null;
	};
    function idX(id) { return id };
	
	return html_sanitize(value, urlX, idX);
};
Graph.prototype.updatePlaceholders = function()
{
	var model = this.model;
	var validate = false;
	
	for (var key in this.model.cells)
	{
		var cell = this.model.cells[key];
		
		if (this.isReplacePlaceholders(cell))
		{
			this.view.invalidate(cell, false, false);
			validate = true;
		}
	}
	
	if (validate)
	{
		this.view.validate();
	}
};
Graph.prototype.isReplacePlaceholders = function(cell)
{
	return cell.value != null && typeof(cell.value) == 'object' &&
		cell.value.getAttribute('placeholders') == '1';
};
Graph.prototype.isZoomWheelEvent = function(evt)
{
	return mxEvent.isAltDown(evt) || (mxEvent.isMetaDown(evt) && mxClient.IS_MAC) ||
		(mxEvent.isControlDown(evt) && !mxClient.IS_MAC);
};
Graph.prototype.isTransparentClickEvent = function(evt)
{
	return mxEvent.isAltDown(evt);
};
Graph.prototype.isIgnoreTerminalEvent = function(evt)
{
	return mxEvent.isShiftDown(evt) && mxEvent.isControlDown(evt);
};
Graph.prototype.isSplitTarget = function(target, cells, evt)
{
	return !this.model.isEdge(cells[0]) &&
		!mxEvent.isAltDown(evt) && !mxEvent.isShiftDown(evt) &&
		mxGraph.prototype.isSplitTarget.apply(this, arguments);
};
Graph.prototype.getLabel = function(cell)
{
	var result = mxGraph.prototype.getLabel.apply(this, arguments);
	
	if (result != null && this.isReplacePlaceholders(cell) && cell.getAttribute('placeholder') == null)
	{
		result = this.replacePlaceholders(cell, result);
	}
	
	return result;
};
Graph.prototype.isLabelMovable = function(cell)
{
	var state = this.view.getState(cell);
	var style = (state != null) ? state.style : this.getCellStyle(cell);
	
	return !this.isCellLocked(cell) &&
		((this.model.isEdge(cell) && this.edgeLabelsMovable) ||
		(this.model.isVertex(cell) && (this.vertexLabelsMovable ||
		mxUtils.getValue(style, 'labelMovable', '0') == '1')));
};
Graph.prototype.setGridSize = function(value)
{
	this.gridSize = value;
	this.fireEvent(new mxEventObject('gridSizeChanged'));
};
Graph.prototype.getGlobalVariable = function(name)
{
	var val = null;
	
	if (name == 'date')
	{
		val = new Date().toLocaleDateString();
	}
	else if (name == 'time')
	{
		val = new Date().toLocaleTimeString();
	}
	else if (name == 'timestamp')
	{
		val = new Date().toLocaleString();
	}
	else if (name.substring(0, 5) == 'date{')
	{
		var fmt = name.substring(5, name.length - 1);
		val = this.formatDate(new Date(), fmt);
	}
	return val;
};
Graph.prototype.formatDate = function(date, mask, utc)
{
	
	if (this.dateFormatCache == null)
	{
		this.dateFormatCache = {
			i18n: {
			    dayNames: [
			        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
			        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
			    ],
			    monthNames: [
			        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
			        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
			    ]
			},
			
			masks: {
			    "default":      "ddd mmm dd yyyy HH:MM:ss",
			    shortDate:      "m/d/yy",
			    mediumDate:     "mmm d, yyyy",
			    longDate:       "mmmm d, yyyy",
			    fullDate:       "dddd, mmmm d, yyyy",
			    shortTime:      "h:MM TT",
			    mediumTime:     "h:MM:ss TT",
			    longTime:       "h:MM:ss TT Z",
			    isoDate:        "yyyy-mm-dd",
			    isoTime:        "HH:MM:ss",
			    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
			    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
			}
		};
	}
    
    var dF = this.dateFormatCache;
	var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
    	timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
    	timezoneClip = /[^-+\dA-Z]/g,
    	pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};
    
    if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
        mask = date;
        date = undefined;
    }
    
    date = date ? new Date(date) : new Date;
    if (isNaN(date)) throw SyntaxError("invalid date");
    mask = String(dF.masks[mask] || mask || dF.masks["default"]);
    
    if (mask.slice(0, 4) == "UTC:") {
        mask = mask.slice(4);
        utc = true;
    }
    var _ = utc ? "getUTC" : "get",
        d = date[_ + "Date"](),
        D = date[_ + "Day"](),
        m = date[_ + "Month"](),
        y = date[_ + "FullYear"](),
        H = date[_ + "Hours"](),
        M = date[_ + "Minutes"](),
        s = date[_ + "Seconds"](),
        L = date[_ + "Milliseconds"](),
        o = utc ? 0 : date.getTimezoneOffset(),
        flags = {
            d:    d,
            dd:   pad(d),
            ddd:  dF.i18n.dayNames[D],
            dddd: dF.i18n.dayNames[D + 7],
            m:    m + 1,
            mm:   pad(m + 1),
            mmm:  dF.i18n.monthNames[m],
            mmmm: dF.i18n.monthNames[m + 12],
            yy:   String(y).slice(2),
            yyyy: y,
            h:    H % 12 || 12,
            hh:   pad(H % 12 || 12),
            H:    H,
            HH:   pad(H),
            M:    M,
            MM:   pad(M),
            s:    s,
            ss:   pad(s),
            l:    pad(L, 3),
            L:    pad(L > 99 ? Math.round(L / 10) : L),
            t:    H < 12 ? "a"  : "p",
            tt:   H < 12 ? "am" : "pm",
            T:    H < 12 ? "A"  : "P",
            TT:   H < 12 ? "AM" : "PM",
            Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
            o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
            S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
        };
    return mask.replace(token, function ($0)
    {
        return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
    });
};
Graph.prototype.createLayersDialog = function()
{
	var div = document.createElement('div');
	div.style.position = 'absolute';
	
	var model = this.getModel();
	var childCount = model.getChildCount(model.root);
	
	for (var i = 0; i < childCount; i++)
	{
		(mxUtils.bind(this, function(layer)
		{
			var span = document.createElement('div');
			span.style.overflow = 'hidden';
			span.style.textOverflow = 'ellipsis';
			span.style.padding = '2px';
			span.style.whiteSpace = 'nowrap';
			var cb = document.createElement('input');
			cb.style.display = 'inline-block';
			cb.setAttribute('type', 'checkbox');
			
			if (model.isVisible(layer))
			{
				cb.setAttribute('checked', 'checked');
				cb.defaultChecked = true;
			}
			
			span.appendChild(cb);
			
			var title = this.convertValueToString(layer) || (mxResources.get('background') || 'Background');
			span.setAttribute('title', title);
			mxUtils.write(span, title);
			div.appendChild(span);
			
			mxEvent.addListener(cb, 'click', function()
			{
				if (cb.getAttribute('checked') != null)
				{
					cb.removeAttribute('checked');
				}
				else
				{
					cb.setAttribute('checked', 'checked');
				}
				
				model.setVisible(layer, cb.checked);
			});
		})(model.getChildAt(model.root, i)));
	}
	
	return div;
};
Graph.prototype.replacePlaceholders = function(cell, str)
{
	var result = [];
	
	if (str != null)
	{
		var last = 0;
		
		while (match = this.placeholderPattern.exec(str))
		{
			var val = match[0];
			
			if (val.length > 2 && val != '%label%' && val != '%tooltip%')
			{
				var tmp = null;
	
				if (match.index > last && str.charAt(match.index - 1) == '%')
				{
					tmp = val.substring(1);
				}
				else
				{
					var name = val.substring(1, val.length - 1);
					
					
					if (name.indexOf('{') < 0)
					{
						var current = cell;
						
						while (tmp == null && current != null)
						{
							if (current.value != null && typeof(current.value) == 'object')
							{
								tmp = (current.hasAttribute(name)) ? ((current.getAttribute(name) != null) ?
										current.getAttribute(name) : '') : null;
							}
							
							current = this.model.getParent(current);
						}
					}
					
					if (tmp == null)
					{
						tmp = this.getGlobalVariable(name);
					}
				}
	
				result.push(str.substring(last, match.index) + ((tmp != null) ? tmp : val));
				last = match.index + val.length;
			}
		}
		
		result.push(str.substring(last));
	}
	return result.join('');
};
/*
Graph.prototype.connectVertex = function(source, direction, length, evt, forceClone, ignoreCellAt)
{
	ignoreCellAt = (ignoreCellAt) ? ignoreCellAt : false;
	
	var pt = (source.geometry.relative && source.parent.geometry != null) ?
			new mxPoint(source.parent.geometry.width * source.geometry.x, source.parent.geometry.height * source.geometry.y) :
			new mxPoint(source.geometry.x, source.geometry.y);
		
	if (direction == mxConstants.DIRECTION_NORTH)
	{
		pt.x += source.geometry.width / 2;
		pt.y -= length ;
	}
	else if (direction == mxConstants.DIRECTION_SOUTH)
	{
		pt.x += source.geometry.width / 2;
		pt.y += source.geometry.height + length;
	}
	else if (direction == mxConstants.DIRECTION_WEST)
	{
		pt.x -= length;
		pt.y += source.geometry.height / 2;
	}
	else
	{
		pt.x += source.geometry.width + length;
		pt.y += source.geometry.height / 2;
	}
	var parentState = this.view.getState(this.model.getParent(source));
	var s = this.view.scale;
	var t = this.view.translate;
	var dx = t.x * s;
	var dy = t.y * s;
	
	if (this.model.isVertex(parentState.cell))
	{
		dx = parentState.x;
		dy = parentState.y;
	}
	
	if (this.model.isVertex(source.parent) && source.geometry.relative)
	{
		pt.x += source.parent.geometry.x;
		pt.y += source.parent.geometry.y;
	}
	
	
	var target = (ignoreCellAt || (mxEvent.isControlDown(evt) && !forceClone)) ?
		null : this.getCellAt(dx + pt.x * s, dy + pt.y * s);
	
	if (this.model.isAncestor(target, source))
	{
		target = null;
	}
	
	
	var temp = target;
	
	while (temp != null)
	{
		if (this.isCellLocked(temp))
		{
			target = null;
			break;
		}
		
		temp = this.model.getParent(temp);
	}
	
	
	if (target != null)
	{
		var sourceState = this.view.getState(source);
		var targetState = this.view.getState(target);
		
		if (sourceState != null && targetState != null && mxUtils.intersects(sourceState, targetState))
		{
			target = null;
		}
	}
	
	var duplicate = !mxEvent.isShiftDown(evt) || forceClone;
	
	if (duplicate)
	{
		if (direction == mxConstants.DIRECTION_NORTH)
		{
			pt.y -= source.geometry.height / 2;
		}
		else if (direction == mxConstants.DIRECTION_SOUTH)
		{
			pt.y += source.geometry.height / 2;
		}
		else if (direction == mxConstants.DIRECTION_WEST)
		{
			pt.x -= source.geometry.width / 2;
		}
		else
		{
			pt.x += source.geometry.width / 2;
		}
	}
	
	if (target != null && !this.isCellConnectable(target))
	{
		var parent = this.getModel().getParent(target);
		
		if (this.getModel().isVertex(parent) && this.isCellConnectable(parent))
		{
			target = parent;
		}
	}
	
	if (target == source || this.model.isEdge(target) || !this.isCellConnectable(target))
	{
		target = null;
	}
	
	var result = [];
	
	this.model.beginUpdate();
	try
	{
		var realTarget = target;
		
		if (realTarget == null && duplicate)
		{
			
			var cellToClone = source;
			var geo = this.getCellGeometry(source);
			
			while (geo != null && geo.relative)
			{
				cellToClone = this.getModel().getParent(cellToClone);
				geo = this.getCellGeometry(cellToClone);
			}
			
			
			var state = this.view.getState(cellToClone);
			var style = (state != null) ? state.style : this.getCellStyle(cellToClone);
	    	
			if (mxUtils.getValue(style, 'part', false))
			{
		        var tmpParent = this.model.getParent(cellToClone);
		        if (this.model.isVertex(tmpParent))
		        {
		        	cellToClone = tmpParent;
		        }
			}
			
			realTarget = this.duplicateCells([cellToClone], false)[0];
			
			var geo = this.getCellGeometry(realTarget);
			
			if (geo != null)
			{
				geo.x = pt.x - geo.width / 2;
				geo.y = pt.y - geo.height / 2;
			}
		}
		
		
		var layout = null;
		if (this.layoutManager != null)
		{
			layout = this.layoutManager.getLayout(this.model.getParent(source));
		}
		
		var edge = ((mxEvent.isControlDown(evt) && duplicate) || (target == null && layout != null && layout.constructor == mxStackLayout)) ? null :
			this.insertEdge(this.model.getParent(source), null, '', source, realTarget, this.createCurrentEdgeStyle());
		
		if (edge != null && this.connectionHandler.insertBeforeSource)
		{
			var index = null;
			var tmp = source;
			
			while (tmp.parent != null && tmp.geometry != null &&
				tmp.geometry.relative && tmp.parent != edge.parent)
			{
				tmp = this.model.getParent(tmp);
			}
		
			if (tmp != null && tmp.parent != null && tmp.parent == edge.parent)
			{
				var index = tmp.parent.getIndex(tmp);
				this.model.add(tmp.parent, edge, index);
			}
		}
		
		
		if (target == null && realTarget != null && layout != null && source.parent != null &&
			layout.constructor == mxStackLayout && direction == mxConstants.DIRECTION_WEST)
		{
			var index = source.parent.getIndex(source);
			this.model.add(source.parent, realTarget, index);
		}
		
		if (edge != null)
		{
			result.push(edge);
		}
		
		if (target == null && realTarget != null)
		{
			result.push(realTarget);
		}
		
		if (realTarget == null && edge != null)
		{
			edge.geometry.setTerminalPoint(pt, false);
		}
		
		if (edge != null)
		{
			this.fireEvent(new mxEventObject('cellsInserted', 'cells', [edge]));
		}
	}
	finally
	{
		this.model.endUpdate();
	}
	
	return result;
};
*/
/*
Graph.prototype.getIndexableText = function()
{
	var tmp = document.createElement('div');
	var labels = [];
	var label = '';
	
	for (var key in this.model.cells)
	{
		var cell = this.model.cells[key];
		
		if (this.model.isVertex(cell) || this.model.isEdge(cell))
		{
			if (this.isHtmlLabel(cell))
			{
				tmp.innerHTML = this.getLabel(cell);
				label = mxUtils.extractTextWithWhitespace([tmp]);
			}
			else
			{					
				label = this.getLabel(cell);
			}
			label = mxUtils.trim(label.replace(/[\x00-\x1F\x7F-\x9F]|\s+/g, ' '));
			
			if (label.length > 0)
			{
				labels.push(label);
			}
		}
	}
	
	return labels.join(' ');
};
*/
Graph.prototype.convertValueToString = function(cell)
{
	if (cell.value != null && typeof(cell.value) == 'object')
	{
		if (this.isReplacePlaceholders(cell) && cell.getAttribute('placeholder') != null)
		{
			var name = cell.getAttribute('placeholder');
			var current = cell;
			var result = null;
					
			while (result == null && current != null)
			{
				if (current.value != null && typeof(current.value) == 'object')
				{
					result = (current.hasAttribute(name)) ? ((current.getAttribute(name) != null) ?
							current.getAttribute(name) : '') : null;
				}
				
				current = this.model.getParent(current);
			}
			
			return result || '';
		}
		else
		{	
			return cell.value.getAttribute('label') || '';
		}
	}
	
	return mxGraph.prototype.convertValueToString.apply(this, arguments);
};
Graph.prototype.getLinksForState = function(state)
{
	if (state != null && state.text != null && state.text.node != null)
	{
		return state.text.node.getElementsByTagName('a');
	}
	
	return null;
};
Graph.prototype.getLinkForCell = function(cell)
{
	if (cell.value != null && typeof(cell.value) == 'object')
	{
		var link = cell.value.getAttribute('link');
		
		
		
		if (link != null && link.toLowerCase().substring(0, 11) === 'javascript:')
		{
			link = link.substring(11);
		}
		
		return link;
	}
	
	return null;
};
Graph.prototype.getCellStyle = function(cell)
{
	var style = mxGraph.prototype.getCellStyle.apply(this, arguments);
	
	if (cell != null && this.layoutManager != null)
	{
		var parent = this.model.getParent(cell);
		
		if (this.model.isVertex(parent) && this.isCellCollapsed(cell))
		{
			var layout = this.layoutManager.getLayout(parent);
			
			if (layout != null && layout.constructor == mxStackLayout)
			{
				style[mxConstants.STYLE_HORIZONTAL] = !layout.horizontal;
			}
		}
	}
	
	return style;
};
Graph.prototype.updateAlternateBounds = function(cell, geo, willCollapse)
{
	if (cell != null && geo != null && this.layoutManager != null && geo.alternateBounds != null)
	{
		var layout = this.layoutManager.getLayout(this.model.getParent(cell));
		
		if (layout != null && layout.constructor == mxStackLayout)
		{
			if (layout.horizontal)
			{
				geo.alternateBounds.height = 0;
			}
			else
			{
				geo.alternateBounds.width = 0;
			}
		}
	}
	
	mxGraph.prototype.updateAlternateBounds.apply(this, arguments);
};
Graph.prototype.isMoveCellsEvent = function(evt)
{
	return mxEvent.isShiftDown(evt);
};
Graph.prototype.foldCells = function(collapse, recurse, cells, checkFoldable, evt)
{
	recurse = (recurse != null) ? recurse : false;
	
	if (cells == null)
	{
		cells = this.getFoldableCells(this.getSelectionCells(), collapse);
	}
	
	if (cells != null)
	{
		this.model.beginUpdate();
		
		try
		{
			mxGraph.prototype.foldCells.apply(this, arguments);
			
			
			if (this.layoutManager != null)
			{
				for (var i = 0; i < cells.length; i++)
				{
					var state = this.view.getState(cells[i]);
					var geo = this.getCellGeometry(cells[i]);
					
					if (state != null && geo != null)
					{
						var dx = Math.round(geo.width - state.width / this.view.scale);
						var dy = Math.round(geo.height - state.height / this.view.scale);
						
						if (dy != 0 || dx != 0)
						{
							var parent = this.model.getParent(cells[i]);
							var layout = this.layoutManager.getLayout(parent);
							
							if (layout == null)
							{
								
								if (evt != null && this.isMoveCellsEvent(evt))
								{
									this.moveSiblings(state, parent, dx, dy);
								} 
							}
							else if ((evt == null || !mxEvent.isAltDown(evt)) && layout.constructor == mxStackLayout && !layout.resizeLast)
							{
								this.resizeParentStacks(parent, layout, dx, dy);
							}
						}
					}
				}
			}
		}
		finally
		{
			this.model.endUpdate();
		}
		
		
		if (this.isEnabled())
		{
			this.setSelectionCells(cells);
		}
	}
};
Graph.prototype.moveSiblings = function(state, parent, dx, dy)
{
	this.model.beginUpdate();
	try
	{
		var cells = this.getCellsBeyond(state.x, state.y, parent, true, true);
		
		for (var i = 0; i < cells.length; i++)
		{
			if (cells[i] != state.cell)
			{
				var tmp = this.view.getState(cells[i]);
				var geo = this.getCellGeometry(cells[i]);
				
				if (tmp != null && geo != null)
				{
					geo = geo.clone();
					geo.translate(Math.round(dx * Math.max(0, Math.min(1, (tmp.x - state.x) / state.width))),
						Math.round(dy * Math.max(0, Math.min(1, (tmp.y - state.y) / state.height))));
					this.model.setGeometry(cells[i], geo);
				}
			}
		}
	}
	finally
	{
		this.model.endUpdate();
	}
};
Graph.prototype.resizeParentStacks = function(parent, layout, dx, dy)
{
	if (this.layoutManager != null && layout != null && layout.constructor == mxStackLayout && !layout.resizeLast)
	{
		this.model.beginUpdate();
		try
		{
			var dir = layout.horizontal;
			
			
			while (parent != null && layout != null && layout.constructor == mxStackLayout &&
				layout.horizontal == dir && !layout.resizeLast)
			{
				var pgeo = this.getCellGeometry(parent);
				var pstate = this.view.getState(parent);
				
				if (pstate != null && pgeo != null)
				{
					pgeo = pgeo.clone();
					
					if (layout.horizontal)
					{
						pgeo.width += dx + Math.min(0, pstate.width / this.view.scale - pgeo.width);									
					}
					else
					{
						pgeo.height += dy + Math.min(0, pstate.height / this.view.scale - pgeo.height);
					}
		
					this.model.setGeometry(parent, pgeo);
				}
				
				parent = this.model.getParent(parent);
				layout = this.layoutManager.getLayout(parent);
			}
		}
		finally
		{
			this.model.endUpdate();
		}
	}
};
Graph.prototype.isContainer = function(cell)
{
	var state = this.view.getState(cell);
	var style = (state != null) ? state.style : this.getCellStyle(cell);
	
	if (this.isSwimlane(cell))
	{
		return style['container'] != '0';
	}
	else
	{
		return style['container'] == '1';
	}
};
Graph.prototype.isCellConnectable = function(cell)
{
	var state = this.view.getState(cell);
	var style = (state != null) ? state.style : this.getCellStyle(cell);
	
	return (style['connectable'] != null) ? style['connectable']  != '0' :
		mxGraph.prototype.isCellConnectable.apply(this, arguments);
};
Graph.prototype.selectAll = function(parent)
{
	parent = parent || this.getDefaultParent();
	if (!this.isCellLocked(parent))
	{
		mxGraph.prototype.selectAll.apply(this, arguments);
	}
};
Graph.prototype.selectCells = function(vertices, edges, parent)
{
	parent = parent || this.getDefaultParent();
	if (!this.isCellLocked(parent))
	{
		mxGraph.prototype.selectCells.apply(this, arguments);
	}
};
Graph.prototype.getSwimlaneAt = function (x, y, parent)
{
	parent = parent || this.getDefaultParent();
	if (!this.isCellLocked(parent))
	{
		return mxGraph.prototype.getSwimlaneAt.apply(this, arguments);
	}
	
	return null;
};
Graph.prototype.isCellFoldable = function(cell)
{
	var state = this.view.getState(cell);
	var style = (state != null) ? state.style : this.getCellStyle(cell);
	
	return this.foldingEnabled && !this.isCellLocked(cell) &&
		((this.isContainer(cell) && style['collapsible'] != '0') ||
		(!this.isContainer(cell) && style['collapsible'] == '1'));
};
Graph.prototype.reset = function()
{
	if (this.isEditing())
	{
		this.stopEditing(true);
	}
	
	this.escape();
					
	if (!this.isSelectionEmpty())
	{
		this.clearSelection();
	}
};
Graph.prototype.zoom = function(factor, center)
{
	factor = Math.max(0.01, Math.min(this.view.scale * factor, 160)) / this.view.scale;
	
	mxGraph.prototype.zoom.apply(this, arguments);
};
Graph.prototype.zoomIn = function()
{
	
	if (this.view.scale < 0.15)
	{
		this.zoom((this.view.scale + 0.01) / this.view.scale);
	}
	else
	{
		
		
		this.zoom((Math.round(this.view.scale * this.zoomFactor * 20) / 20) / this.view.scale);
	}
};
Graph.prototype.zoomOut = function()
{
	
	if (this.view.scale <= 0.15)
	{
		this.zoom((this.view.scale - 0.01) / this.view.scale);
	}
	else
	{
		
		
		this.zoom((Math.round(this.view.scale * (1 / this.zoomFactor) * 20) / 20) / this.view.scale);
	}
};
Graph.prototype.getTooltipForCell = function(cell)
{
	var tip = '';
	
	if (mxUtils.isNode(cell.value))
	{
		var tmp = cell.value.getAttribute('tooltip');
		
		if (tmp != null)
		{
			if (tmp != null && this.isReplacePlaceholders(cell))
			{
				tmp = this.replacePlaceholders(cell, tmp);
			}
			
			tip = this.sanitizeHtml(tmp);
		}
		else
		{
			var ignored = this.builtInProperties;
			var attrs = cell.value.attributes;
			var temp = [];
			
			if (this.isEnabled())
			{
				ignored.push('link');
			}
			
			for (var i = 0; i < attrs.length; i++)
			{
				if (mxUtils.indexOf(ignored, attrs[i].nodeName) < 0 && attrs[i].nodeValue.length > 0)
				{
					temp.push({name: attrs[i].nodeName, value: attrs[i].nodeValue});
				}
			}
			
			
			temp.sort(function(a, b)
			{
				if (a.name < b.name)
				{
					return -1;
				}
				else if (a.name > b.name)
				{
					return 1;
				}
				else
				{
					return 0;
				}
			});
			for (var i = 0; i < temp.length; i++)
			{
				if (temp[i].name != 'link' || !this.isCustomLink(temp[i].value))
				{
					tip += ((temp[i].name != 'link') ? '<b>' + temp[i].name + ':</b> ' : '') +
						mxUtils.htmlEntities(temp[i].value) + '\n';
				}
			}
			
			if (tip.length > 0)
			{
				tip = tip.substring(0, tip.length - 1);
				
				if (mxClient.IS_SVG)
				{
					tip = '<div style="max-width:360px;">' + tip + '</div>';
				}
			}
		}
	}
	
	return tip;
};
Graph.prototype.stringToBytes = function(str)
{
	var arr = new Array(str.length);
    for (var i = 0; i < str.length; i++)
    {
        arr[i] = str.charCodeAt(i);
    }
    
    return arr;
};
Graph.prototype.bytesToString = function(arr)
{
	var result = new Array(arr.length);
    for (var i = 0; i < arr.length; i++)
    {
    	result[i] = String.fromCharCode(arr[i]);
    }
    
    return result.join('');
};
Graph.prototype.compressNode = function(node)
{
	return this.compress(this.zapGremlins(mxUtils.getXml(node)));
};
Graph.prototype.compress = function(data)
{
	if (data == null || data.length == 0 || typeof(pako) === 'undefined')
	{
		return data;
	}
	else
	{
   		var tmp = this.bytesToString(pako.deflateRaw(encodeURIComponent(data)));
   		
   		return (window.btoa) ? btoa(tmp) : Base64.encode(tmp, true);
	}
};
Graph.prototype.decompress = function(data)
{
   	if (data == null || data.length == 0 || typeof(pako) === 'undefined')
	{
		return data;
	}
	else
	{
		var tmp = (window.atob) ? atob(data) : Base64.decode(data, true);
		
		return this.zapGremlins(decodeURIComponent(
			this.bytesToString(pako.inflateRaw(tmp))));
	}
};
Graph.prototype.zapGremlins = function(text)
{
	var checked = [];
	
	for (var i = 0; i < text.length; i++)
	{
		var code = text.charCodeAt(i);
		
		
		if (code >= 32 || code == 9 || code == 10 || code == 13)
		{
			checked.push(text.charAt(i));
		}
	}
	
	return checked.join('');
};


(function()
{
	
	var mxGraphViewResetValidationState = mxGraphView.prototype.resetValidationState;
	
	mxGraphView.prototype.resetValidationState = function()
	{
		mxGraphViewResetValidationState.apply(this, arguments);
		
		this.validEdges = [];
	};
	
	var mxGraphViewValidateCellState = mxGraphView.prototype.validateCellState;
	
	mxGraphView.prototype.validateCellState = function(cell, recurse)
	{
		var state = this.getState(cell);
		
		
		if (state != null && this.graph.model.isEdge(state.cell) &&
			state.style != null && state.style[mxConstants.STYLE_CURVED] != 1 &&
			!state.invalid && this.updateLineJumps(state))
		{
			this.graph.cellRenderer.redraw(state, false, this.isRendering());
		}
		
		state = mxGraphViewValidateCellState.apply(this, arguments);
		
		
		if (state != null && this.graph.model.isEdge(state.cell) &&
			state.style[mxConstants.STYLE_CURVED] != 1)
		{
			
			this.validEdges.push(state);
		}
		
		return state;
	};
	var mxCellRendererIsShapeInvalid = mxCellRenderer.prototype.isShapeInvalid;
	
	mxCellRenderer.prototype.isShapeInvalid = function(state, shape)
	{
		return mxCellRendererIsShapeInvalid.apply(this, arguments) ||
			(state.routedPoints != null && shape.routedPoints != null &&
			!mxUtils.equalPoints(shape.routedPoints, state.routedPoints))
	};
	
	var mxGraphViewUpdateCellState = mxGraphView.prototype.updateCellState;
	
	mxGraphView.prototype.updateCellState = function(state)
	{
		mxGraphViewUpdateCellState.apply(this, arguments);
		
		if (this.graph.model.isEdge(state.cell) &&
			state.style[mxConstants.STYLE_CURVED] != 1)
		{
			this.updateLineJumps(state);
		}
	};
	
	mxGraphView.prototype.updateLineJumps = function(state)
	{
		var pts = state.absolutePoints;
		
		if (Graph.lineJumpsEnabled)
		{
			var changed = state.routedPoints != null;
			var actual = null;
			
			if (pts != null && this.validEdges != null &&
				mxUtils.getValue(state.style, 'jumpStyle', 'none') !== 'none')
			{
				var thresh = 0.5 * this.scale;
				changed = false;
				actual = [];
				
				
				function addPoint(type, x, y)
				{
					var rpt = new mxPoint(x, y);
					rpt.type = type;
					
					actual.push(rpt);
					var curr = (state.routedPoints != null) ? state.routedPoints[actual.length - 1] : null;
					
					return curr == null || curr.type != type || curr.x != x || curr.y != y;
				};
				
				for (var i = 0; i < pts.length - 1; i++)
				{
					var p1 = pts[i + 1];
					var p0 = pts[i];
					var list = [];
					
					
					var pn = pts[i + 2];
					
					while (i < pts.length - 2 &&
						mxUtils.ptSegDistSq(p0.x, p0.y, pn.x, pn.y,
						p1.x, p1.y) < 1 * this.scale * this.scale)
					{
						p1 = pn;
						i++;
						pn = pts[i + 2];
					}
					
					changed = addPoint(0, p0.x, p0.y) || changed;
					
					
					for (var e = 0; e < this.validEdges.length; e++)
					{
						var state2 = this.validEdges[e];
						var pts2 = state2.absolutePoints;
						
						if (pts2 != null && mxUtils.intersects(state, state2) && state2.style['noJump'] != '1')
						{
							
							for (var j = 0; j < pts2.length - 1; j++)
							{
								var p3 = pts2[j + 1];
								var p2 = pts2[j];
								
								
								pn = pts2[j + 2];
								
								while (j < pts2.length - 2 &&
									mxUtils.ptSegDistSq(p2.x, p2.y, pn.x, pn.y,
									p3.x, p3.y) < 1 * this.scale * this.scale)
								{
									p3 = pn;
									j++;
									pn = pts2[j + 2];
								}
								
								var pt = mxUtils.intersection(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
	
								
								if (pt != null && (Math.abs(pt.x - p2.x) > thresh ||
									Math.abs(pt.y - p2.y) > thresh) &&
									(Math.abs(pt.x - p3.x) > thresh ||
									Math.abs(pt.y - p3.y) > thresh))
								{
									var dx = pt.x - p0.x;
									var dy = pt.y - p0.y;
									var temp = {distSq: dx * dx + dy * dy, x: pt.x, y: pt.y};
								
									
									for (var t = 0; t < list.length; t++)
									{
										if (list[t].distSq > temp.distSq)
										{
											list.splice(t, 0, temp);
											temp = null;
											
											break;
										}
									}
									
									
									if (temp != null && (list.length == 0 ||
										list[list.length - 1].x !== temp.x ||
										list[list.length - 1].y !== temp.y))
									{
										list.push(temp);
									}
								}
							}
						}
					}
					
					
					for (var j = 0; j < list.length; j++)
					{
						changed = addPoint(1, list[j].x, list[j].y) || changed;
					}
				}
	
				var pt = pts[pts.length - 1];
				changed = addPoint(0, pt.x, pt.y) || changed;
			}
			
			state.routedPoints = actual;
			
			return changed;
		}
		else
		{
			return false;
		}
	};
	
	var mxConnectorPaintLine = mxConnector.prototype.paintLine;
	mxConnector.prototype.paintLine = function (c, absPts, rounded)
	{
		
		this.routedPoints = (this.state != null) ? this.state.routedPoints : null;
		
		if (this.outline || this.state == null || this.style == null ||
			this.state.routedPoints == null || this.state.routedPoints.length == 0)
		{
			mxConnectorPaintLine.apply(this, arguments);
		}
		else
		{
			var arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE,
				mxConstants.LINE_ARCSIZE) / 2;
			var size = (parseInt(mxUtils.getValue(this.style, 'jumpSize',
				Graph.defaultJumpSize)) - 2) / 2 + this.strokewidth;
			var style = mxUtils.getValue(this.style, 'jumpStyle', 'none');
			var f = Editor.jumpSizeRatio;
			var moveTo = true;
			var last = null;
			var len = null;
			var pts = [];
			var n = null;
			c.begin();
			
			for (var i = 0; i < this.state.routedPoints.length; i++)
			{
				var rpt = this.state.routedPoints[i];
				var pt = new mxPoint(rpt.x / this.scale, rpt.y / this.scale);
				
				
				if (i == 0)
				{
					pt = absPts[0];
				}
				else if (i == this.state.routedPoints.length - 1)
				{
					pt = absPts[absPts.length - 1];
				}
				
				var done = false;
				
				if (last != null && rpt.type == 1)
				{
					
					var next = this.state.routedPoints[i + 1];
					var dx = next.x / this.scale - pt.x;
					var dy = next.y / this.scale - pt.y;
					var dist = dx * dx + dy * dy;
					if (n == null)
					{
						n = new mxPoint(pt.x - last.x, pt.y - last.y);
						len = Math.sqrt(n.x * n.x + n.y * n.y);
						n.x = n.x * size / len;
						n.y = n.y * size / len;
					}
					
					if (dist > size * size && len > 0)
					{
						var dx = last.x - pt.x;
						var dy = last.y - pt.y;
						var dist = dx * dx + dy * dy;
						
						if (dist > size * size)
						{
							var p0 = new mxPoint(pt.x - n.x, pt.y - n.y);
							var p1 = new mxPoint(pt.x + n.x, pt.y + n.y);
							pts.push(p0);
							
							this.addPoints(c, pts, rounded, arcSize, false, null, moveTo);
							
							var f = (Math.round(n.x) < 0 || (Math.round(n.x) == 0
									&& Math.round(n.y) <= 0)) ? 1 : -1;
							moveTo = false;
							if (style == 'sharp')
							{
								c.lineTo(p0.x - n.y * f, p0.y + n.x * f);
								c.lineTo(p1.x - n.y * f, p1.y + n.x * f);
								c.lineTo(p1.x, p1.y);
							}
							else if (style == 'arc')
							{
								f *= 1.3;
								c.curveTo(p0.x - n.y * f, p0.y + n.x * f,
									p1.x - n.y * f, p1.y + n.x * f,
									p1.x, p1.y);
							}
							else
							{
								c.moveTo(p1.x, p1.y);
								moveTo = true;
							}
	
							pts = [p1];
							done = true;
						}
					}
				}
				else
				{
					n = null;
				}
				
				if (!done)
				{
					pts.push(pt);
					last = pt;
				}
			}
			
			this.addPoints(c, pts, rounded, arcSize, false, null, moveTo);
			c.stroke();
		}
	};
	
	var mxGraphViewUpdateFloatingTerminalPoint = mxGraphView.prototype.updateFloatingTerminalPoint;
	
	mxGraphView.prototype.updateFloatingTerminalPoint = function(edge, start, end, source)
	{
		if (start != null && edge != null &&
			(start.style['snapToPoint'] == '1' ||
			edge.style['snapToPoint'] == '1'))
		{
		    start = this.getTerminalPort(edge, start, source);
		    var next = this.getNextPoint(edge, end, source);
		    
		    var orth = this.graph.isOrthogonal(edge);
		    var alpha = mxUtils.toRadians(Number(start.style[mxConstants.STYLE_ROTATION] || '0'));
		    var center = new mxPoint(start.getCenterX(), start.getCenterY());
		    
		    if (alpha != 0)
		    {
		        var cos = Math.cos(-alpha);
		        var sin = Math.sin(-alpha);
		        next = mxUtils.getRotatedPoint(next, cos, sin, center);
		    }
		    
		    var border = parseFloat(edge.style[mxConstants.STYLE_PERIMETER_SPACING] || 0);
		    border += parseFloat(edge.style[(source) ?
		        mxConstants.STYLE_SOURCE_PERIMETER_SPACING :
		        mxConstants.STYLE_TARGET_PERIMETER_SPACING] || 0);
		    var pt = this.getPerimeterPoint(start, next, alpha == 0 && orth, border);
		
		    if (alpha != 0)
		    {
		        var cos = Math.cos(alpha);
		        var sin = Math.sin(alpha);
		        pt = mxUtils.getRotatedPoint(pt, cos, sin, center);
		    }
		    
		    edge.setAbsoluteTerminalPoint(this.snapToAnchorPoint(edge, start, end, source, pt), source);
		}
		else
		{
			mxGraphViewUpdateFloatingTerminalPoint.apply(this, arguments);
		}
	};
	mxGraphView.prototype.snapToAnchorPoint = function(edge, start, end, source, pt)
	{
		if (start != null && edge != null)
		{
	        var constraints = this.graph.getAllConnectionConstraints(start)
	        var nearest = null;
	        var dist = null;
	    
	        if (constraints != null)
	        {
		        for (var i = 0; i < constraints.length; i++)
		        {
		            var cp = this.graph.getConnectionPoint(start, constraints[i]);
		            
		            if (cp != null)
		            {
		                var tmp = (cp.x - pt.x) * (cp.x - pt.x) + (cp.y - pt.y) * (cp.y - pt.y);
		            
		                if (dist == null || tmp < dist)
		                {
		                    nearest = cp;
		                    dist = tmp;
		                }
		            }
		        }
	        }
	        
	        if (nearest != null)
	        {
	            pt = nearest;
	        }
		}
		
		return pt;
	};
		
	
	var mxCellRendererCreateShape = mxCellRenderer.prototype.createShape;
	mxCellRenderer.prototype.createShape = function(state)
	{
		if (state.style != null && typeof(pako) !== 'undefined')
		{
	    	var shape = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);
	
	    	
		}
		
		return mxCellRendererCreateShape.apply(this, arguments);
	};
})();
if (typeof mxVertexHandler != 'undefined')
{
	(function()
	{
		
		mxConstants.HANDLE_FILLCOLOR = '#29b6f2';
		mxConstants.HANDLE_STROKECOLOR = '#0088cf';
		mxConstants.VERTEX_SELECTION_COLOR = '#00a8ff';
		mxConstants.OUTLINE_COLOR = '#00a8ff';
		mxConstants.OUTLINE_HANDLE_FILLCOLOR = '#99ccff';
		mxConstants.OUTLINE_HANDLE_STROKECOLOR = '#00a8ff';
		mxConstants.CONNECT_HANDLE_FILLCOLOR = '#cee7ff';
		mxConstants.EDGE_SELECTION_COLOR = '#00a8ff';
		mxConstants.DEFAULT_VALID_COLOR = '#00a8ff';
		mxConstants.LABEL_HANDLE_FILLCOLOR = '#cee7ff';
		mxConstants.GUIDE_COLOR = '#0088cf';
		mxConstants.HIGHLIGHT_OPACITY = 30;
	    mxConstants.HIGHLIGHT_SIZE = 5;
		
		
		mxEdgeHandler.prototype.snapToTerminals = true;
	
		
		mxGraphHandler.prototype.guidesEnabled = true;
	
		
		mxRubberband.prototype.fadeOut = true;
		
		
		mxGuide.prototype.isEnabledForEvent = function(evt)
		{
			return !mxEvent.isAltDown(evt);
		};
		
		
		
		var mxConnectionHandlerCreateTarget = mxConnectionHandler.prototype.isCreateTarget;
		mxConnectionHandler.prototype.isCreateTarget = function(evt)
		{
			return mxEvent.isControlDown(evt) || mxConnectionHandlerCreateTarget.apply(this, arguments);
		};
		
		mxConstraintHandler.prototype.createHighlightShape = function()
		{
			var hl = new mxEllipse(null, this.highlightColor, this.highlightColor, 0);
			hl.opacity = mxConstants.HIGHLIGHT_OPACITY;
			
			return hl;
		};
		
		
		mxConnectionHandler.prototype.livePreview = true;
		mxConnectionHandler.prototype.cursor = 'crosshair';
		
		
		mxConnectionHandler.prototype.createEdgeState = function(me)
		{
			var style = this.graph.createCurrentEdgeStyle();
			var edge = this.graph.createEdge(null, null, null, null, null, style);
			var state = new mxCellState(this.graph.view, edge, this.graph.getCellStyle(edge));
			
			for (var key in this.graph.currentEdgeStyle)
			{
				state.style[key] = this.graph.currentEdgeStyle[key];
			}
			
			return state;
		};
		
		var connectionHandlerCreateShape = mxConnectionHandler.prototype.createShape;
		mxConnectionHandler.prototype.createShape = function()
		{
			var shape = connectionHandlerCreateShape.apply(this, arguments);
			
			shape.isDashed = this.graph.currentEdgeStyle[mxConstants.STYLE_DASHED] == '1';
			
			return shape;
		}
		
		
		mxConnectionHandler.prototype.updatePreview = function(valid)
		{
			
		};
		
		
		var mxConnectionHandlerCreateMarker = mxConnectionHandler.prototype.createMarker;
		mxConnectionHandler.prototype.createMarker = function()
		{
			var marker = mxConnectionHandlerCreateMarker.apply(this, arguments);
		
			var markerGetCell = marker.getCell;
			marker.getCell = mxUtils.bind(this, function(me)
			{
				var result = markerGetCell.apply(this, arguments);
			
				this.error = null;
				
				return result;
			});
			
			return marker;
		};
		mxConnectionHandler.prototype.isCellEnabled = function(cell)
		{
			return !this.graph.isCellLocked(cell);
		};
		Graph.prototype.defaultVertexStyle = {};
		
		Graph.prototype.defaultEdgeStyle = {'edgeStyle': 'schematicWiringStyle', 'rounded': '1',
			'jettySize': '10', 'orthogonalLoop': '1','jumpStyle': 'arc', 'endArrow': 'none', 'endFill': '0'};
		Graph.prototype.createCurrentEdgeStyle = function()
		{
			var style = 'edgeStyle=' + (this.currentEdgeStyle['edgeStyle'] || 'none') + ';';
			
			if (this.currentEdgeStyle['shape'] != null)
			{
				style += 'shape=' + this.currentEdgeStyle['shape'] + ';';
			}
			
			if (this.currentEdgeStyle['curved'] != null)
			{
				style += 'curved=' + this.currentEdgeStyle['curved'] + ';';
			}
			
			if (this.currentEdgeStyle['rounded'] != null)
			{
				style += 'rounded=' + this.currentEdgeStyle['rounded'] + ';';
			}
			if (this.currentEdgeStyle['comic'] != null)
			{
				style += 'comic=' + this.currentEdgeStyle['comic'] + ';';
			}
			if (this.currentEdgeStyle['jumpStyle'] != null)
			{
				style += 'jumpStyle=' + this.currentEdgeStyle['jumpStyle'] + ';';
			}
			if (this.currentEdgeStyle['jumpSize'] != null)
			{
				style += 'jumpSize=' + this.currentEdgeStyle['jumpSize'] + ';';
			}
			
			
			if (this.currentEdgeStyle['edgeStyle'] == 'elbowEdgeStyle' && this.currentEdgeStyle['elbow'] != null)
			{
				style += 'elbow=' + this.currentEdgeStyle['elbow'] + ';';
			}
			
			if (this.currentEdgeStyle['html'] != null)
			{
				style += 'html=' + this.currentEdgeStyle['html'] + ';';
			}
			else
			{
				style += 'html=1;';
			}
			
			return style;
		};
	
		Graph.prototype.getPagePadding = function()
		{
			return new mxPoint(0, 0);
		};
		
		Graph.prototype.loadStylesheet = function()
		{
			var node = (this.themes != null) ? this.themes[this.defaultThemeName] :
				(!mxStyleRegistry.dynamicLoading) ? null :
				mxUtils.load(STYLE_PATH + '/default.xml').getDocumentElement();
			
			if (node != null)
			{
				var dec = new mxCodec(node.ownerDocument);
				dec.decode(node, this.getStylesheet());
			}
		};
		
		Graph.prototype.importGraphModel = function(node, dx, dy, crop)
		{
			dx = (dx != null) ? dx : 0;
			dy = (dy != null) ? dy : 0;
			
			var cells = []
			var model = new mxGraphModel();
			var codec = new mxCodec(node.ownerDocument);
			codec.decode(node, model);
			
			var childCount = model.getChildCount(model.getRoot());
			var targetChildCount = this.model.getChildCount(this.model.getRoot());
			
			
			this.model.beginUpdate();
			try
			{
				
				var mapping = new Object();
				
				
				
				this.cloneCells([model.root], this.isCloneInvalidEdges(), mapping);
				for (var i = 0; i < childCount; i++)
				{
					var parent = model.getChildAt(model.getRoot(), i);
					
					
					if (childCount == 1 && !this.isCellLocked(this.getDefaultParent()))
					{
						var children = model.getChildren(parent);
						cells = cells.concat(this.importCells(children, dx, dy, this.getDefaultParent(), null, mapping));
					}
					else
					{
						
						parent = this.importCells([parent], 0, 0, this.model.getRoot(), null, mapping)[0];
						var children = this.model.getChildren(parent);
						this.moveCells(children, dx, dy);
						cells = cells.concat(children);
					}
				}
				
				if (crop)
				{
					if (this.isGridEnabled())
					{
						dx = this.snap(dx);
						dy = this.snap(dy);
					}
					
					var bounds = this.getBoundingBoxFromGeometry(cells, true);
					
					if (bounds != null)
					{
						this.moveCells(cells, dx - bounds.x, dy - bounds.y);
					}
				}
			}
			finally
			{
				this.model.endUpdate();
			}
			
			return cells;
		}
		
		Graph.prototype.getAllConnectionConstraints = function(terminal, source)
		{
			if (terminal != null)
			{
				var constraints = mxUtils.getValue(terminal.style, 'points', null);
				
				if (constraints != null)
				{
					
					
					var result = [];
					
					try
					{
						var c = JSON.parse(constraints);
						
						for (var i = 0; i < c.length; i++)
						{
							var tmp = c[i];
							result.push(new mxConnectionConstraint(new mxPoint(tmp[0], tmp[1]), (tmp.length > 2) ? tmp[2] != '0' : true));
						}
					}
					catch (e)
					{
						
					}
					
					return result;
				}
				else
				{
					if (terminal.shape != null)
					{
						if (terminal.shape.stencil != null)
						{
							if (terminal.shape.stencil != null)
							{
								return terminal.shape.stencil.constraints;
							}
						}
						else if (terminal.shape.constraints != null)
						{
							return terminal.shape.constraints;
						}
					}
				}
			}
		
			return null;
		};
		
		Graph.prototype.flipEdge = function(edge)
		{
			if (edge != null)
			{
				var state = this.view.getState(edge);
				var style = (state != null) ? state.style : this.getCellStyle(edge);
				
				if (style != null)
				{
					var elbow = mxUtils.getValue(style, mxConstants.STYLE_ELBOW,
						mxConstants.ELBOW_HORIZONTAL);
					var value = (elbow == mxConstants.ELBOW_HORIZONTAL) ?
						mxConstants.ELBOW_VERTICAL : mxConstants.ELBOW_HORIZONTAL;
					this.setCellStyles(mxConstants.STYLE_ELBOW, value, [edge]);
				}
			}
		};
		Graph.prototype.isValidRoot = function(cell)
		{
			
			var childCount = this.model.getChildCount(cell);
			var realChildCount = 0;
			
			for (var i = 0; i < childCount; i++)
			{
				var child = this.model.getChildAt(cell, i);
				
				if (this.model.isVertex(child))
				{
					var geometry = this.getCellGeometry(child);
					
					if (geometry != null && !geometry.relative)
					{
						realChildCount++;
					}
				}
			}
			
			return realChildCount > 0 || this.isContainer(cell);
		};
		
		Graph.prototype.isValidDropTarget = function(cell)
		{
			var state = this.view.getState(cell);
			var style = (state != null) ? state.style : this.getCellStyle(cell);
		
			return mxUtils.getValue(style, 'part', '0') != '1' && (this.isContainer(cell) ||
				(mxGraph.prototype.isValidDropTarget.apply(this, arguments) &&
				mxUtils.getValue(style, 'dropTarget', '1') != '0'));
		};
	
		Graph.prototype.createGroupCell = function()
		{
			var group = mxGraph.prototype.createGroupCell.apply(this, arguments);
			group.setStyle('group');
			
			return group;
		};
		
		Graph.prototype.isExtendParentsOnAdd = function(cell)
		{
			var result = mxGraph.prototype.isExtendParentsOnAdd.apply(this, arguments);
			
			if (result && cell != null && this.layoutManager != null)
			{
				var parent = this.model.getParent(cell);
				
				if (parent != null)
				{
					var layout = this.layoutManager.getLayout(parent);
					
					if (layout != null && layout.constructor == mxStackLayout)
					{
						result = false;
					}
				}
			}
			
			return result;
		};
		Graph.prototype.getPreferredSizeForCell = function(cell)
		{
			var result = mxGraph.prototype.getPreferredSizeForCell.apply(this, arguments);
			
			
			if (result != null)
			{
				result.width += 10;
				result.height += 4;
				
				if (this.gridEnabled)
				{
					result.width = this.snap(result.width);
					result.height = this.snap(result.height);
				}
			}
			
			return result;
		}
		Graph.prototype.turnShapes = function(cells)
		{
			var model = this.getModel();
			var select = [];
			
			model.beginUpdate();
			try
			{
				for (var i = 0; i < cells.length; i++)
				{
					var cell = cells[i];
					
					if (model.isEdge(cell))
					{
						var src = model.getTerminal(cell, true);
						var trg = model.getTerminal(cell, false);
						
						model.setTerminal(cell, trg, true);
						model.setTerminal(cell, src, false);
						
						var geo = model.getGeometry(cell);
						
						if (geo != null)
						{
							geo = geo.clone();
							
							if (geo.points != null)
							{
								geo.points.reverse();
							}
							
							var sp = geo.getTerminalPoint(true);
							var tp = geo.getTerminalPoint(false)
							
							geo.setTerminalPoint(sp, false);
							geo.setTerminalPoint(tp, true);
							model.setGeometry(cell, geo);
							
							
							var edgeState = this.view.getState(cell);
							var sourceState = this.view.getState(src);
							var targetState = this.view.getState(trg);
							
							if (edgeState != null)
							{
								var sc = (sourceState != null) ? this.getConnectionConstraint(edgeState, sourceState, true) : null;
								var tc = (targetState != null) ? this.getConnectionConstraint(edgeState, targetState, false) : null;
								
								this.setConnectionConstraint(cell, src, true, tc);
								this.setConnectionConstraint(cell, trg, false, sc);
							}
		
							select.push(cell);
						}
					}
					else if (model.isVertex(cell))
					{
						var geo = this.getCellGeometry(cell);
			
						if (geo != null)
						{
							
							geo = geo.clone();
							geo.x += geo.width / 2 - geo.height / 2;
							geo.y += geo.height / 2 - geo.width / 2;
							var tmp = geo.width;
							geo.width = geo.height;
							geo.height = tmp;
							model.setGeometry(cell, geo);
							
							
							var state = this.view.getState(cell);
							
							if (state != null)
							{
								var dir = state.style[mxConstants.STYLE_DIRECTION] || 'east';
								
								if (dir == 'east')
								{
									dir = 'south';
								}
								else if (dir == 'south')
								{
									dir = 'west';
								}
								else if (dir == 'west')
								{
									dir = 'north';
								}
								else if (dir == 'north')
								{
									dir = 'east';
								}
								
								this.setCellStyles(mxConstants.STYLE_DIRECTION, dir, [cell]);
							}
		
							select.push(cell);
						}
					}
				}
			}
			finally
			{
				model.endUpdate();
			}
			
			return select;
		};
		
		Graph.prototype.stencilHasPlaceholders = function(stencil)
		{
			if (stencil != null && stencil.fgNode != null)
			{
				var node = stencil.fgNode.firstChild;
				
				while (node != null)
				{
					if (node.nodeName == 'text' && node.getAttribute('placeholders') == '1')
					{
						return true;
					}
					
					node = node.nextSibling;
				}
			}
			
			return false;
		};
		
		Graph.prototype.processChange = function(change)
		{
			mxGraph.prototype.processChange.apply(this, arguments);
			
			if (change instanceof mxValueChange && change.cell != null &&
				change.cell.value != null && typeof(change.cell.value) == 'object')
			{
				
				var desc = this.model.getDescendants(change.cell);
				
				
				if (desc.length > 0)
				{
					for (var i = 0; i < desc.length; i++)
					{
						var state = this.view.getState(desc[i]);
						
						if (state != null && state.shape != null && state.shape.stencil != null &&
							this.stencilHasPlaceholders(state.shape.stencil))
						{
							this.removeStateForCell(desc[i]);
						}
						else if (this.isReplacePlaceholders(desc[i]))
						{
							this.view.invalidate(desc[i], false, false);
						}
					}
				}
			}
		};
		
		Graph.prototype.replaceElement = function(elt, tagName)
		{
			var span = elt.ownerDocument.createElement((tagName != null) ? tagName : 'span');
			var attributes = Array.prototype.slice.call(elt.attributes);
			
			while (attr = attributes.pop())
			{
				span.setAttribute(attr.nodeName, attr.nodeValue);
			}
			
			span.innerHTML = elt.innerHTML;
			elt.parentNode.replaceChild(span, elt);
		};
		
		Graph.prototype.updateLabelElements = function(cells, fn, tagName)
		{
			cells = (cells != null) ? cells : this.getSelectionCells();
			var div = document.createElement('div');
			
			for (var i = 0; i < cells.length; i++)
			{
				
				if (this.isHtmlLabel(cells[i]))
				{
					var label = this.convertValueToString(cells[i]);
					
					if (label != null && label.length > 0)
					{
						div.innerHTML = label;
						var elts = div.getElementsByTagName((tagName != null) ? tagName : '*');
						
						for (var j = 0; j < elts.length; j++)
						{
							fn(elts[j]);
						}
						
						if (div.innerHTML != label)
						{
							this.cellLabelChanged(cells[i], div.innerHTML);
						}
					}
				}
			}
		};
		
		Graph.prototype.cellLabelChanged = function(cell, value, autoSize)
		{
			
			value = this.zapGremlins(value);
			this.model.beginUpdate();
			try
			{			
				if (cell.value != null && typeof cell.value == 'object')
				{
					if (this.isReplacePlaceholders(cell) &&
						cell.getAttribute('placeholder') != null)
					{
						
						var name = cell.getAttribute('placeholder');
						var current = cell;
								
						while (current != null)
						{
							if (current == this.model.getRoot() || (current.value != null &&
								typeof(current.value) == 'object' && current.hasAttribute(name)))
							{
								this.setAttributeForCell(current, name, value);
								
								break;
							}
							
							current = this.model.getParent(current);
						}
					}
					
					var tmp = cell.value.cloneNode(true);
					tmp.setAttribute('label', value);
					value = tmp;
				}
				mxGraph.prototype.cellLabelChanged.apply(this, arguments);
			}
			finally
			{
				this.model.endUpdate();
			}
		};
		Graph.prototype.cellsRemoved = function(cells)
		{
			if (cells != null)
			{
				var dict = new mxDictionary();
				
				for (var i = 0; i < cells.length; i++)
				{
					dict.put(cells[i], true);
				}
				
				
				var parents = [];
				
				for (var i = 0; i < cells.length; i++)
				{
					var parent = this.model.getParent(cells[i]);
					if (parent != null && !dict.get(parent))
					{
						dict.put(parent, true);
						parents.push(parent);
					}
				}
				
				for (var i = 0; i < parents.length; i++)
				{
					var state = this.view.getState(parents[i]);
					
					if (state != null && (this.model.isEdge(state.cell) || this.model.isVertex(state.cell)) && this.isCellDeletable(state.cell))
					{
						var stroke = mxUtils.getValue(state.style, mxConstants.STYLE_STROKECOLOR, mxConstants.NONE);
						var fill = mxUtils.getValue(state.style, mxConstants.STYLE_FILLCOLOR, mxConstants.NONE);
						
						if (stroke == mxConstants.NONE && fill == mxConstants.NONE)
						{
							var allChildren = true;
							
							for (var j = 0; j < this.model.getChildCount(state.cell) && allChildren; j++)
							{
								if (!dict.get(this.model.getChildAt(state.cell, j)))
								{
									allChildren = false;
								}
							}
							
							if (allChildren)
							{
								cells.push(state.cell);
							}
						}
					}
				}
			}
			
			mxGraph.prototype.cellsRemoved.apply(this, arguments);
		};
		
		Graph.prototype.removeCellsAfterUngroup = function(cells)
		{
			var cellsToRemove = [];
			
			for (var i = 0; i < cells.length; i++)
			{
				if (this.isCellDeletable(cells[i]))
				{
					var state = this.view.getState(cells[i]);
					
					if (state != null)
					{
						var stroke = mxUtils.getValue(state.style, mxConstants.STYLE_STROKECOLOR, mxConstants.NONE);
						var fill = mxUtils.getValue(state.style, mxConstants.STYLE_FILLCOLOR, mxConstants.NONE);
						
						if (stroke == mxConstants.NONE && fill == mxConstants.NONE)
						{
							cellsToRemove.push(cells[i]);
						}
					}
				}
			}
			
			cells = cellsToRemove;
			
			mxGraph.prototype.removeCellsAfterUngroup.apply(this, arguments);
		};
		
		Graph.prototype.setLinkForCell = function(cell, link)
		{
			this.setAttributeForCell(cell, 'link', link);
		};
		
		Graph.prototype.setTooltipForCell = function(cell, link)
		{
			this.setAttributeForCell(cell, 'tooltip', link);
		};
		
		Graph.prototype.setAttributeForCell = function(cell, attributeName, attributeValue)
		{
			var value = null;
			
			if (cell.value != null && typeof(cell.value) == 'object')
			{
				value = cell.value.cloneNode(true);
			}
			else
			{
				var doc = mxUtils.createXmlDocument();
				
				value = doc.createElement('UserObject');
				value.setAttribute('label', cell.value || '');
			}
			
			if (attributeValue != null && attributeValue.length > 0)
			{
				value.setAttribute(attributeName, attributeValue);
			}
			else
			{
				value.removeAttribute(attributeName);
			}
			
			this.model.setValue(cell, value);
		};
		
		Graph.prototype.getDropTarget = function(cells, evt, cell, clone)
		{
			var model = this.getModel();
			
			
			if (mxEvent.isAltDown(evt))
			{
				return null;
			}
			
			
			for (var i = 0; i < cells.length; i++)
			{
				if (this.model.isEdge(this.model.getParent(cells[i])))
				{
					return null;
				}
			}
			
			return mxGraph.prototype.getDropTarget.apply(this, arguments);
		};
	
		
		
		Graph.prototype.getInsertPoint = function()
		{
			var gs = this.getGridSize();
			var dx = this.container.scrollLeft / this.view.scale - this.view.translate.x;
			var dy = this.container.scrollTop / this.view.scale - this.view.translate.y;
			
			if (this.pageVisible)
			{
				var layout = this.getPageLayout();
				var page = this.getPageSize();
				dx = Math.max(dx, layout.x * page.width);
				dy = Math.max(dy, layout.y * page.height);
			}
			
			return new mxPoint(this.snap(dx + gs), this.snap(dy + gs));
		};
		
		Graph.prototype.getFreeInsertPoint = function()
		{
			var view = this.view;
			var bds = this.getGraphBounds();
			var pt = this.getInsertPoint();
			
			
			var x = this.snap(Math.round(Math.max(pt.x, bds.x / view.scale - view.translate.x +
				((bds.width == 0) ? 2 * this.gridSize : 0))));
			var y = this.snap(Math.round(Math.max(pt.y, (bds.y + bds.height) / view.scale - view.translate.y +
				2 * this.gridSize)));
			
			return new mxPoint(x, y);
		};
		
		Graph.prototype.isMouseInsertPoint = function()
		{			
			return false;
		};
		
		Graph.prototype.addText = function(x, y, state)
		{
			
			var label = new mxCell();
			label.value = 'Text';
			label.style = 'text;html=1;resizable=0;points=[];'
			label.geometry = new mxGeometry(0, 0, 0, 0);
			label.vertex = true;
			
			if (state != null)
			{
				label.style += 'align=center;verticalAlign=middle;labelBackgroundColor=#ffffff;'
				label.geometry.relative = true;
				label.connectable = false;
				
				
				var pt2 = this.view.getRelativePoint(state, x, y);
				label.geometry.x = Math.round(pt2.x * 10000) / 10000;
				label.geometry.y = Math.round(pt2.y);
				
				
				label.geometry.offset = new mxPoint(0, 0);
				pt2 = this.view.getPoint(state, label.geometry);
			
				var scale = this.view.scale;
				label.geometry.offset = new mxPoint(Math.round((x - pt2.x) / scale), Math.round((y - pt2.y) / scale));
			}
			else
			{
				label.style += 'autosize=1;align=left;verticalAlign=top;spacingTop=-4;'
		
				var tr = this.view.translate;
				label.geometry.width = 40;
				label.geometry.height = 20;
				label.geometry.x = Math.round(x / this.view.scale) - tr.x;
				label.geometry.y = Math.round(y / this.view.scale) - tr.y;
			}
				
			this.getModel().beginUpdate();
			try
			{
				this.addCells([label], (state != null) ? state.cell : null);
				this.fireEvent(new mxEventObject('textInserted', 'cells', [label]));
				
				this.autoSizeCell(label);
			}
			finally
			{
				this.getModel().endUpdate();
			}
			
			return label;
		};
		Graph.prototype.getAbsoluteUrl = function(url)
		{
			if (url != null && this.isRelativeUrl(url))
			{
				if (url.charAt(0) == '#')
				{
					url = this.baseUrl + url;
				}
				else if (url.charAt(0) == '/')
				{
					url = this.domainUrl + url;
				}
				else
				{
					url = this.domainPathUrl + url;
				}
			}
			
			return url;
		};
		Graph.prototype.addClickHandler = function(highlight, beforeClick, onClick)
		{
			
			var checkLinks = mxUtils.bind(this, function()
			{
				var links = this.container.getElementsByTagName('a');
				
				if (links != null)
				{
					for (var i = 0; i < links.length; i++)
					{
						var href = this.getAbsoluteUrl(links[i].getAttribute('href'));
						
						if (href != null)
						{
							links[i].setAttribute('rel', this.linkRelation);
							links[i].setAttribute('href', href);
							
							if (beforeClick != null)
			    			{
								mxEvent.addGestureListeners(links[i], null, null, beforeClick);
			    			}
						}
					}
				}
			});
			
			this.model.addListener(mxEvent.CHANGE, checkLinks);
			checkLinks();
			
			var cursor = this.container.style.cursor;
			var tol = this.getTolerance();
			var graph = this;
			var mouseListener =
			{
			    currentState: null,
			    currentLink: null,
			    highlight: (highlight != null && highlight != '' && highlight != mxConstants.NONE) ?
			    	new mxCellHighlight(graph, highlight, 4) : null,
			    startX: 0,
			    startY: 0,
			    scrollLeft: 0,
			    scrollTop: 0,
			    updateCurrentState: function(me)
			    {
			    	var tmp = me.sourceState;
			    	
			    	
			    	if (tmp == null || graph.getLinkForCell(tmp.cell) == null)
			    	{
			    		var cell = graph.getCellAt(me.getGraphX(), me.getGraphY(), null, null, null, function(state, x, y)
	    				{
			    			return graph.getLinkForCell(state.cell) == null;
	    				});
			    		
			    		tmp = graph.view.getState(cell);
			    	}
			    	
			      	if (tmp != this.currentState)
			      	{
			        	if (this.currentState != null)
			        	{
				          	this.clear();
			        	}
				        
			        	this.currentState = tmp;
				        
			        	if (this.currentState != null)
			        	{
				          	this.activate(this.currentState);
			        	}
			      	}
			    },
			    mouseDown: function(sender, me)
			    {
			    	this.startX = me.getGraphX();
			    	this.startY = me.getGraphY();
				    this.scrollLeft = graph.container.scrollLeft;
				    this.scrollTop = graph.container.scrollTop;
				    
		    		if (this.currentLink == null && graph.container.style.overflow == 'auto')
		    		{
		    			graph.container.style.cursor = 'move';
		    		}
		    		
		    		this.updateCurrentState(me);
			    },
			    mouseMove: function(sender, me)
			    {
			    	if (graph.isMouseDown)
			    	{
			    		if (this.currentLink != null)
			    		{
					    	var dx = Math.abs(this.startX - me.getGraphX());
					    	var dy = Math.abs(this.startY - me.getGraphY());
					    	
					    	if (dx > tol || dy > tol)
					    	{
					    		this.clear();
					    	}
			    		}
			    	}
			    	else
			    	{
				    	
				    	var linkNode = me.getSource();
				    	
				    	while (linkNode != null && linkNode.nodeName.toLowerCase() != 'a')
				    	{
				    		linkNode = linkNode.parentNode;
				    	}
				    	
			    		if (linkNode != null)
			    		{
			    			this.clear();
			    		}
			    		else
			    		{
				    		if (graph.tooltipHandler != null && this.currentLink != null && this.currentState != null)
				    		{
				    			graph.tooltipHandler.reset(me, true, this.currentState);
				    		}
				    		
					    	if (this.currentState != null && (me.getState() == this.currentState || me.sourceState == null) &&
					    		graph.intersects(this.currentState, me.getGraphX(), me.getGraphY()))
					    	{
				    			return;
					    	}
					    	
					    	this.updateCurrentState(me);
			    		}
			    	}
			    },
			    mouseUp: function(sender, me)
			    {
			    	var source = me.getSource();
			    	var evt = me.getEvent();
			    	
			    	
			    	var linkNode = source;
			    	
			    	while (linkNode != null && linkNode.nodeName.toLowerCase() != 'a')
			    	{
			    		linkNode = linkNode.parentNode;
			    	}
			    	
			    	
			    	if (linkNode == null &&
			    		(((Math.abs(this.scrollLeft - graph.container.scrollLeft) < tol &&
			        	Math.abs(this.scrollTop - graph.container.scrollTop) < tol) &&
			    		(me.sourceState == null || !me.isSource(me.sourceState.control))) &&
			    		(((mxEvent.isLeftMouseButton(evt) || mxEvent.isMiddleMouseButton(evt)) &&
			    		!mxEvent.isPopupTrigger(evt)) || mxEvent.isTouchEvent(evt))))
			    	{
				    	if (this.currentLink != null)
				    	{
				    		var blank = graph.isBlankLink(this.currentLink);
				    		
				    		if ((this.currentLink.substring(0, 5) === 'data:' ||
				    			!blank) && beforeClick != null)
				    		{
			    				beforeClick(evt, this.currentLink);
				    		}
				    		
				    		if (!mxEvent.isConsumed(evt))
				    		{
					    		var target = (mxEvent.isMiddleMouseButton(evt)) ? '_blank' :
					    			((blank) ? graph.linkTarget : '_top');
					    		graph.openLink(this.currentLink, target);
					    		me.consume();
				    		}
				    	}
				    	else if (onClick != null && !me.isConsumed() &&
			    			(Math.abs(this.scrollLeft - graph.container.scrollLeft) < tol &&
			        		Math.abs(this.scrollTop - graph.container.scrollTop) < tol) &&
			        		(Math.abs(this.startX - me.getGraphX()) < tol &&
			        		Math.abs(this.startY - me.getGraphY()) < tol))
			        	{
				    		onClick(me.getEvent());
			    		}
			    	}
			    	
			    	this.clear();
			    },
			    activate: function(state)
			    {
			    	this.currentLink = graph.getAbsoluteUrl(graph.getLinkForCell(state.cell));
			    	if (this.currentLink != null)
			    	{
			    		graph.container.style.cursor = 'pointer';
			    		if (this.highlight != null)
			    		{
			    			this.highlight.highlight(state);
			    		}
				    }
			    },
			    clear: function()
			    {
			    	if (graph.container != null)
			    	{
			    		graph.container.style.cursor = cursor;
			    	}
			    	
			    	this.currentState = null;
			    	this.currentLink = null;
			    	
			    	if (this.highlight != null)
			    	{
			    		this.highlight.hide();
			    	}
			    	
			    	if (graph.tooltipHandler != null)
		    		{
		    			graph.tooltipHandler.hide();
		    		}
			    }
			};
			
			graph.click = function(me) {};
			graph.addMouseListener(mouseListener);
			
			mxEvent.addListener(document, 'mouseleave', function(evt)
			{
				mouseListener.clear();
			});
		};
		
		Graph.prototype.duplicateCells = function(cells, append)
		{
			cells = (cells != null) ? cells : this.getSelectionCells();
			append = (append != null) ? append : true;
			
			cells = this.model.getTopmostCells(cells);
			
			var model = this.getModel();
			var s = this.gridSize;
			var select = [];
			
			model.beginUpdate();
			try
			{
				var clones = this.cloneCells(cells, false);
				
				for (var i = 0; i < cells.length; i++)
				{
					var parent = model.getParent(cells[i]);
					var child = this.moveCells([clones[i]], s, s, false)[0];
					select.push(child);
					
					if (append)
					{
						model.add(parent, clones[i]);
					}
					else
					{
						
						var index = parent.getIndex(cells[i]);
						model.add(parent, clones[i], index + 1);
					}
				}
			}
			finally
			{
				model.endUpdate();
			}
			
			return select;
		};
		
		Graph.prototype.insertImage = function(newValue, w, h)
		{
			
			if (newValue != null)
			{
				var tmp = this.cellEditor.textarea.getElementsByTagName('img');
				var oldImages = [];
				
				for (var i = 0; i < tmp.length; i++)
				{
					oldImages.push(tmp[i]);
				}
				
				
				document.execCommand('insertimage', false, newValue);
				
				
				var newImages = this.cellEditor.textarea.getElementsByTagName('img');
				
				if (newImages.length == oldImages.length + 1)
				{
					
					for (var i = newImages.length - 1; i >= 0; i--)
					{
						if (i == 0 || newImages[i] != oldImages[i - 1])
						{
							
							newImages[i].setAttribute('width', w);
							newImages[i].setAttribute('height', h);
							
							break;
						}
					}
				}
			}
		};
				
		Graph.prototype.insertLink = function(value)
		{
			if (value.length == 0)
			{
				document.execCommand('unlink', false);
			}
			else if (mxClient.IS_FF)
			{
				
				
				
				var tmp = this.cellEditor.textarea.getElementsByTagName('a');
				var oldLinks = [];
				
				for (var i = 0; i < tmp.length; i++)
				{
					oldLinks.push(tmp[i]);
				}
				
				document.execCommand('createlink', false, mxUtils.trim(value));
				
				
				var newLinks = this.cellEditor.textarea.getElementsByTagName('a');
				
				if (newLinks.length == oldLinks.length + 1)
				{
					
					for (var i = newLinks.length - 1; i >= 0; i--)
					{
						if (newLinks[i] != oldLinks[i - 1])
						{
							
							
							var tmp = newLinks[i].getElementsByTagName('a');
							
							while (tmp.length > 0)
							{
								var parent = tmp[0].parentNode;
								
								while (tmp[0].firstChild != null)
								{
									parent.insertBefore(tmp[0].firstChild, tmp[0]);
								}
								
								parent.removeChild(tmp[0]);
							}
							
							break;
						}
					}
				}
			}
			else
			{
				
				document.execCommand('createlink', false, mxUtils.trim(value));
			}
		};
		
		Graph.prototype.isCellResizable = function(cell)
		{
			var result = mxGraph.prototype.isCellResizable.apply(this, arguments);
		
			var state = this.view.getState(cell);
			var style = (state != null) ? state.style : this.getCellStyle(cell);
				
			return result || (mxUtils.getValue(style, mxConstants.STYLE_RESIZABLE, '1') != '0' &&
				style[mxConstants.STYLE_WHITE_SPACE] == 'wrap');
		};
		
		Graph.prototype.distributeCells = function(horizontal, cells)
		{
			if (cells == null)
			{
				cells = this.getSelectionCells();
			}
			
			if (cells != null && cells.length > 1)
			{
				var vertices = [];
				var max = null;
				var min = null;
				
				for (var i = 0; i < cells.length; i++)
				{
					if (this.getModel().isVertex(cells[i]))
					{
						var state = this.view.getState(cells[i]);
						
						if (state != null)
						{
							var tmp = (horizontal) ? state.getCenterX() : state.getCenterY();
							max = (max != null) ? Math.max(max, tmp) : tmp;
							min = (min != null) ? Math.min(min, tmp) : tmp;
							
							vertices.push(state);
						}
					}
				}
				
				if (vertices.length > 2)
				{
					vertices.sort(function(a, b)
					{
						return (horizontal) ? a.x - b.x : a.y - b.y;
					});
		
					var t = this.view.translate;
					var s = this.view.scale;
					
					min = min / s - ((horizontal) ? t.x : t.y);
					max = max / s - ((horizontal) ? t.x : t.y);
					
					this.getModel().beginUpdate();
					try
					{
						var dt = (max - min) / (vertices.length - 1);
						var t0 = min;
						
						for (var i = 1; i < vertices.length - 1; i++)
						{
							var pstate = this.view.getState(this.model.getParent(vertices[i].cell));
							var geo = this.getCellGeometry(vertices[i].cell);
							t0 += dt;
							
							if (geo != null && pstate != null)
							{
								geo = geo.clone();
								
								if (horizontal)
								{
									geo.x = Math.round(t0 - geo.width / 2) - pstate.origin.x;
								}
								else
								{
									geo.y = Math.round(t0 - geo.height / 2) - pstate.origin.y;
								}
								
								this.getModel().setGeometry(vertices[i].cell, geo);
							}
						}
					}
					finally
					{
						this.getModel().endUpdate();
					}
				}
			}
			
			return cells;
		};
		
		Graph.prototype.isCloneEvent = function(evt)
		{
			return (mxClient.IS_MAC && mxEvent.isMetaDown(evt)) || mxEvent.isControlDown(evt);
		};
		
		Graph.prototype.encodeCells = function(cells)
		{
			var clones = this.cloneCells(cells);
			
			
			var dict = new mxDictionary();
			
			for (var i = 0; i < cells.length; i++)
			{
				dict.put(cells[i], true);
			}
			
			
			for (var i = 0; i < clones.length; i++)
			{
				var state = this.view.getState(cells[i]);
				
				if (state != null)
				{
					var geo = this.getCellGeometry(clones[i]);
					
					if (geo != null && geo.relative && !this.model.isEdge(cells[i]) &&
						!dict.get(this.model.getParent(cells[i])))
					{
						geo.relative = false;
						geo.x = state.x / state.view.scale - state.view.translate.x;
						geo.y = state.y / state.view.scale - state.view.translate.y;
					}
				}
			}
			
			var codec = new mxCodec();
			var model = new mxGraphModel();
			var parent = model.getChildAt(model.getRoot(), 0);
			
			for (var i = 0; i < cells.length; i++)
			{
				model.add(parent, clones[i]);
			}
			return codec.encode(model);
		};
		
		Graph.prototype.createSvgImageExport = function()
		{
			var exp = new mxImageExport();
			
			
			exp.getLinkForCellState = mxUtils.bind(this, function(state, canvas)
			{
				return this.getLinkForCell(state.cell);
			});
			return exp;
		};
		
		Graph.prototype.getSvg = function(background, scale, border, nocrop, crisp,
			ignoreSelection, showText, imgExport, linkTarget)
		{
			
			var origUseCssTrans = this.useCssTransforms;
			
			if (origUseCssTrans) 
			{
				this.useCssTransforms = false;
				this.view.revalidate();
				this.sizeDidChange();
			}
			try 
			{
				scale = (scale != null) ? scale : 1;
				border = (border != null) ? border : 0;
				crisp = (crisp != null) ? crisp : true;
				ignoreSelection = (ignoreSelection != null) ? ignoreSelection : true;
				showText = (showText != null) ? showText : true;
	
				var bounds = (ignoreSelection || nocrop) ?
						this.getGraphBounds() : this.getBoundingBox(this.getSelectionCells());
	
				if (bounds == null)
				{
					throw Error(mxResources.get('drawingEmpty'));
				}
	
				var vs = this.view.scale;
				
				
				var svgDoc = mxUtils.createXmlDocument();
				var root = (svgDoc.createElementNS != null) ?
			    		svgDoc.createElementNS(mxConstants.NS_SVG, 'svg') : svgDoc.createElement('svg');
			    
				if (background != null)
				{
					if (root.style != null)
					{
						root.style.backgroundColor = background;
					}
					else
					{
						root.setAttribute('style', 'background-color:' + background);
					}
				}
			    
				if (svgDoc.createElementNS == null)
				{
			    	root.setAttribute('xmlns', mxConstants.NS_SVG);
			    	root.setAttribute('xmlns:xlink', mxConstants.NS_XLINK);
				}
				else
				{
					
					root.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', mxConstants.NS_XLINK);
				}
				
				var s = scale / vs;
				var w = Math.max(1, Math.ceil(bounds.width * s) + 2 * border);
				var h = Math.max(1, Math.ceil(bounds.height * s) + 2 * border);
				root.setAttribute('version', '1.1');
				root.setAttribute('width', w + 'px');
				root.setAttribute('height', h + 'px');
				root.setAttribute('viewBox', ((crisp) ? '-0.5 -0.5' : '0 0') + ' ' + w + ' ' + h);
				svgDoc.appendChild(root);
			
			    
				
				var svgCanvas = this.createSvgCanvas(root);
				svgCanvas.foOffset = (crisp) ? -0.5 : 0;
				svgCanvas.textOffset = (crisp) ? -0.5 : 0;
				svgCanvas.imageOffset = (crisp) ? -0.5 : 0;
				svgCanvas.translate(Math.floor((border / scale - bounds.x) / vs),
					Math.floor((border / scale - bounds.y) / vs));
				
				
				var htmlConverter = document.createElement('textarea');
				
				
				var createAlternateContent = svgCanvas.createAlternateContent;
				svgCanvas.createAlternateContent = function(fo, x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation)
				{
					var s = this.state;
	
					
					if (this.foAltText != null && (w == 0 || (s.fontSize != 0 && str.length < (w * 5) / s.fontSize)))
					{
						var alt = this.createElement('text');
						alt.setAttribute('x', Math.round(w / 2));
						alt.setAttribute('y', Math.round((h + s.fontSize) / 2));
						alt.setAttribute('fill', s.fontColor || 'black');
						alt.setAttribute('text-anchor', 'middle');
						alt.setAttribute('font-size', Math.round(s.fontSize) + 'px');
						alt.setAttribute('font-family', s.fontFamily);
						
						if ((s.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD)
						{
							alt.setAttribute('font-weight', 'bold');
						}
						
						if ((s.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC)
						{
							alt.setAttribute('font-style', 'italic');
						}
						
						if ((s.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE)
						{
							alt.setAttribute('text-decoration', 'underline');
						}
						
						try
						{
							htmlConverter.innerHTML = str;
							alt.textContent = htmlConverter.value;
							
							return alt;
						}
						catch (e)
						{
							return createAlternateContent.apply(this, arguments);
						}
					}
					else
					{
						return createAlternateContent.apply(this, arguments);
					}
				};
				
				
				var bgImg = this.backgroundImage;
				
				if (bgImg != null)
				{
					var s2 = vs / scale;
					var tr = this.view.translate;
					var tmp = new mxRectangle(tr.x * s2, tr.y * s2, bgImg.width * s2, bgImg.height * s2);
					
					
					if (mxUtils.intersects(bounds, tmp))
					{
						svgCanvas.image(tr.x, tr.y, bgImg.width, bgImg.height, bgImg.src, true);
					}
				}
				
				svgCanvas.scale(s);
				svgCanvas.textEnabled = showText;
				
				imgExport = (imgExport != null) ? imgExport : this.createSvgImageExport();
				var imgExportDrawCellState = imgExport.drawCellState;
				
				
				imgExport.drawCellState = function(state, canvas)
				{
					var graph = state.view.graph;
					var selected = graph.isCellSelected(state.cell);
					var parent = graph.model.getParent(state.cell);
					
					
					while (!ignoreSelection && !selected && parent != null)
					{
						selected = graph.isCellSelected(parent);
						parent = graph.model.getParent(parent);
					}
					
					if (ignoreSelection || selected)
					{
						imgExportDrawCellState.apply(this, arguments);
					}
				};
	
				imgExport.drawState(this.getView().getState(this.model.root), svgCanvas);
				
				if (linkTarget != null)
				{
					this.updateLinkTargets(root, linkTarget);
				}
			
				return root;
			}
			finally
			{
				if (origUseCssTrans) 
				{
					this.useCssTransforms = true;
					this.view.revalidate();
					this.sizeDidChange();
				}
			}
		};
		
		Graph.prototype.updateLinkTargets = function(node, target)
		{
			var links = node.getElementsByTagName('a');
			
			for (var i = 0; i < links.length; i++)
			{
				var href = links[i].getAttribute('href');
				
				if (href == null)
				{
					href = links[i].getAttribute('xlink:href');
				}
				
				if (href != null && /^https?:\/\//.test(href))
				{
					links[i].setAttribute('target', target);
				}
			}
		};
		
		Graph.prototype.createSvgCanvas = function(node)
		{
			return new mxSvgCanvas2D(node);
		};
		
		Graph.prototype.getSelectedElement = function()
		{
			var node = null;
			
			if (window.getSelection)
			{
				var sel = window.getSelection();
				
			    if (sel.getRangeAt && sel.rangeCount)
			    {
			        var range = sel.getRangeAt(0);
			        node = range.commonAncestorContainer;
			    }
			}
			else if (document.selection)
			{
				node = document.selection.createRange().parentElement();
			}
			
			return node;
		};
		
		Graph.prototype.getParentByName = function(node, name, stopAt)
		{
			while (node != null)
			{
				if (node.nodeName == name)
				{
					return node;
				}
		
				if (node == stopAt)
				{
					return null;
				}
				
				node = node.parentNode;
			}
			
			return node;
		};
		
		Graph.prototype.selectNode = function(node)
		{
			var sel = null;
			
		    
			if (window.getSelection)
		    {
		    	sel = window.getSelection();
		    	
		        if (sel.getRangeAt && sel.rangeCount)
		        {
		        	var range = document.createRange();
		            range.selectNode(node);
		            sel.removeAllRanges();
		            sel.addRange(range);
		        }
		    }
		    
			else if ((sel = document.selection) && sel.type != 'Control')
		    {
		        var originalRange = sel.createRange();
		        originalRange.collapse(true);
		        var range = sel.createRange();
		        range.setEndPoint('StartToStart', originalRange);
		        range.select();
		    }
		};
		
		Graph.prototype.insertRow = function(table, index)
		{
			var bd = table.tBodies[0];
			var cells = bd.rows[0].cells;
			var cols = 0;
			
			
			for (var i = 0; i < cells.length; i++)
			{
				var colspan = cells[i].getAttribute('colspan');
				cols += (colspan != null) ? parseInt(colspan) : 1;
			}
			
			var row = bd.insertRow(index);
			
			for (var i = 0; i < cols; i++)
			{
				mxUtils.br(row.insertCell(-1));
			}
			
			return row.cells[0];
		};
		
		Graph.prototype.deleteRow = function(table, index)
		{
			table.tBodies[0].deleteRow(index);
		};
		
		Graph.prototype.insertColumn = function(table, index)
		{
			var hd = table.tHead;
			
			if (hd != null)
			{
				
				for (var h = 0; h < hd.rows.length; h++)
				{
					var th = document.createElement('th');
					hd.rows[h].appendChild(th);
					mxUtils.br(th);
				}
			}
		
			var bd = table.tBodies[0];
			
			for (var i = 0; i < bd.rows.length; i++)
			{
				var cell = bd.rows[i].insertCell(index);
				mxUtils.br(cell);
			}
			
			return bd.rows[0].cells[(index >= 0) ? index : bd.rows[0].cells.length - 1];
		};
		
		Graph.prototype.deleteColumn = function(table, index)
		{
			if (index >= 0)
			{
				var bd = table.tBodies[0];
				var rows = bd.rows;
				
				for (var i = 0; i < rows.length; i++)
				{
					if (rows[i].cells.length > index)
					{
						rows[i].deleteCell(index);
					}
				}
			}
		};
		
		Graph.prototype.pasteHtmlAtCaret = function(html)
		{
		    var sel, range;
		
			
		    if (window.getSelection)
		    {
		        sel = window.getSelection();
		        
		        if (sel.getRangeAt && sel.rangeCount)
		        {
		            range = sel.getRangeAt(0);
		            range.deleteContents();
		
		            
		            
		            
		            var el = document.createElement("div");
		            el.innerHTML = html;
		            var frag = document.createDocumentFragment(), node;
		            
		            while ((node = el.firstChild))
		            {
		                lastNode = frag.appendChild(node);
		            }
		            
		            range.insertNode(frag);
		        }
		    }
		    
		    else if ((sel = document.selection) && sel.type != "Control")
		    {
		    	
		        sel.createRange().pasteHTML(html);
		    }
		};
	
		Graph.prototype.createLinkForHint = function(link, label)
		{
			link = (link != null) ? link : 'javascript:void(0);';
			if (label == null || label.length == 0)
			{
				if (this.isCustomLink(link))
				{
					label = this.getLinkTitle(link);
				}
				else
				{
					label = link;
				}
			}
			
			function short(str, max)
			{
				if (str.length > max)
				{
					str = str.substring(0, Math.round(max / 2)) + '...' +
						str.substring(str.length - Math.round(max / 4));
				}
				
				return str;
			};
			
			var a = document.createElement('a');
			a.setAttribute('rel', this.linkRelation);
			a.setAttribute('href', this.getAbsoluteUrl(link));
			a.setAttribute('title', short((this.isCustomLink(link)) ?
				this.getLinkTitle(link) : link, 80));
			
			if (this.linkTarget != null)
			{
				a.setAttribute('target', this.linkTarget);
			}
			
			
			mxUtils.write(a, short(label, 40));
			
			
			if (this.isCustomLink(link))
			{
				mxEvent.addListener(a, 'click', mxUtils.bind(this, function(evt)
				{
					this.customLinkClicked(link);
					mxEvent.consume(evt);
				}));
			}
			
			return a;
		};
		
		Graph.prototype.initTouch = function()
		{
			
			this.connectionHandler.marker.isEnabled = function()
			{
				return this.graph.connectionHandler.first != null;
			};
		
			
			this.addListener(mxEvent.START_EDITING, function(sender, evt)
			{
				this.popupMenuHandler.hideMenu();
			});
		
			
			var graphUpdateMouseEvent = this.updateMouseEvent;
			this.updateMouseEvent = function(me)
			{
				me = graphUpdateMouseEvent.apply(this, arguments);
	
				if (mxEvent.isTouchEvent(me.getEvent()) && me.getState() == null)
				{
					var cell = this.getCellAt(me.graphX, me.graphY);
		
					if (cell != null && this.isSwimlane(cell) && this.hitsSwimlaneContent(cell, me.graphX, me.graphY))
					{
						cell = null;
					}
					else
					{
						me.state = this.view.getState(cell);
						
						if (me.state != null && me.state.shape != null)
						{
							this.container.style.cursor = me.state.shape.node.style.cursor;
						}
					}
				}
				
				if (me.getState() == null && this.isEnabled())
				{
					this.container.style.cursor = 'default';
				}
				
				return me;
			};
		
			
			
			var cellSelected = false;
			var selectionEmpty = false;
			var menuShowing = false;
			
			var oldFireMouseEvent = this.fireMouseEvent;
			
			this.fireMouseEvent = function(evtName, me, sender)
			{
				if (evtName == mxEvent.MOUSE_DOWN)
				{
					
					me = this.updateMouseEvent(me);
					
					cellSelected = this.isCellSelected(me.getCell());
					selectionEmpty = this.isSelectionEmpty();
					menuShowing = this.popupMenuHandler.isMenuShowing();
				}
				
				oldFireMouseEvent.apply(this, arguments);
			};
			
			
			
			
			this.popupMenuHandler.mouseUp = mxUtils.bind(this, function(sender, me)
			{
				this.popupMenuHandler.popupTrigger = !this.isEditing() && this.isEnabled() &&
					(me.getState() == null || !me.isSource(me.getState().control)) &&
					(this.popupMenuHandler.popupTrigger || (!menuShowing && !mxEvent.isMouseEvent(me.getEvent()) &&
					((selectionEmpty && me.getCell() == null && this.isSelectionEmpty()) ||
					(cellSelected && this.isCellSelected(me.getCell())))));
				mxPopupMenuHandler.prototype.mouseUp.apply(this.popupMenuHandler, arguments);
			});
		};
		
		mxCellEditor.prototype.isContentEditing = function()
		{
			var state = this.graph.view.getState(this.editingCell);
			
			return state != null && state.style['html'] == 1;
		};
	
		mxCellEditor.prototype.saveSelection = function()
		{
		    if (window.getSelection)
		    {
		        var sel = window.getSelection();
		        
		        if (sel.getRangeAt && sel.rangeCount)
		        {
		            var ranges = [];
		            
		            for (var i = 0, len = sel.rangeCount; i < len; ++i)
		            {
		                ranges.push(sel.getRangeAt(i));
		            }
		            
		            return ranges;
		        }
		    }
		    else if (document.selection && document.selection.createRange)
		    {
		        return document.selection.createRange();
		    }
		    
		    return null;
		};
	
		mxCellEditor.prototype.restoreSelection = function(savedSel)
		{
			try
			{
				if (savedSel)
				{
					if (window.getSelection)
					{
						sel = window.getSelection();
						sel.removeAllRanges();
		
						for (var i = 0, len = savedSel.length; i < len; ++i)
						{
							sel.addRange(savedSel[i]);
						}
					}
					else if (document.selection && savedSel.select)
					{
						savedSel.select();
					}
				}
			}
			catch (e)
			{
				
			}
		};
	
		var mxCellRendererInitializeLabel = mxCellRenderer.prototype.initializeLabel;
		mxCellRenderer.prototype.initializeLabel = function(state)
		{
			if (state.text != null)
			{
				state.text.replaceLinefeeds = mxUtils.getValue(state.style, 'nl2Br', '1') != '0';
			}
			
			mxCellRendererInitializeLabel.apply(this, arguments);
		};
	
		var mxConstraintHandlerUpdate = mxConstraintHandler.prototype.update;
		mxConstraintHandler.prototype.update = function(me, source)
		{
			if (this.isKeepFocusEvent(me) || !mxEvent.isAltDown(me.getEvent()))
			{
				mxConstraintHandlerUpdate.apply(this, arguments);
			}
			else
			{
				this.reset();
			}
		};
	
		mxGuide.prototype.createGuideShape = function(horizontal)
		{
			var guide = new mxPolyline([], mxConstants.GUIDE_COLOR, mxConstants.GUIDE_STROKEWIDTH);
			
			return guide;
		};
	
		mxCellEditor.prototype.escapeCancelsEditing = false;
		
		var mxCellEditorStartEditing = mxCellEditor.prototype.startEditing;
		mxCellEditor.prototype.startEditing = function(cell, trigger)
		{
			mxCellEditorStartEditing.apply(this, arguments);
			
			
			
			var state = this.graph.view.getState(cell);
	
			if (state != null && state.style['html'] == 1)
			{
				this.textarea.className = 'mxCellEditor geContentEditable';
			}
			else
			{
				this.textarea.className = 'mxCellEditor mxPlainTextEditor';
			}
			
			
			this.codeViewMode = false;
			
			
			this.switchSelectionState = null;
			
			
			this.graph.setSelectionCell(cell);
			
			var parent = this.graph.getModel().getParent(cell);
			var geo = this.graph.getCellGeometry(cell);
			
			if ((this.graph.getModel().isEdge(parent) && geo != null && geo.relative) ||
				this.graph.getModel().isEdge(cell))
			{
				
				if (mxClient.IS_QUIRKS)
				{
					this.textarea.style.border = 'gray dotted 1px';
				}
				
				else if (mxClient.IS_IE || mxClient.IS_IE11 || (mxClient.IS_FF && mxClient.IS_WIN))
				{
					this.textarea.style.outline = 'gray dotted 1px';
				}
				else
				{
					this.textarea.style.outline = '';
				}
			}
			else if (mxClient.IS_QUIRKS)
			{
				this.textarea.style.outline = 'none';
				this.textarea.style.border = '';
			}
		}
		var cellEditorInstallListeners = mxCellEditor.prototype.installListeners;
		mxCellEditor.prototype.installListeners = function(elt)
		{
			cellEditorInstallListeners.apply(this, arguments);
			
			function reference(node, clone)
			{
				clone.originalNode = node;
				
				node = node.firstChild;
				var child = clone.firstChild;
				
				while (node != null && child != null)
				{
					reference(node, child);
					node = node.nextSibling;
					child = child.nextSibling;
				}
				
				return clone;
			};
			
			
			function checkNode(node, clone)
			{
				if (node != null)
				{
					if (clone.originalNode != node)
					{
						cleanNode(node);
					}
					else
					{
						node = node.firstChild;
						clone = clone.firstChild;
						
						while (node != null)
						{
							var nextNode = node.nextSibling;
							
							if (clone == null)
							{
								cleanNode(node);
							}
							else
							{
								checkNode(node, clone);
								clone = clone.nextSibling;
							}
	
							node = nextNode;
						}
					}
				}
			};
			
			function cleanNode(node)
			{
				var child = node.firstChild;
				
				while (child != null)
				{
					var next = child.nextSibling;
					cleanNode(child);
					child = next;
				}
				
				if ((node.nodeType != 1 || (node.nodeName !== 'BR' && node.firstChild == null)) &&
					(node.nodeType != 3 || mxUtils.trim(mxUtils.getTextContent(node)).length == 0))
				{
					node.parentNode.removeChild(node);
				}
				else
				{
					
					if (node.nodeType == 3)
					{
						mxUtils.setTextContent(node, mxUtils.getTextContent(node).replace(/\n|\r/g, ''));
					}
					
					if (node.nodeType == 1)
					{
						node.removeAttribute('style');
						node.removeAttribute('class');
						node.removeAttribute('width');
						node.removeAttribute('cellpadding');
						node.removeAttribute('cellspacing');
						node.removeAttribute('border');
					}
				}
			};
			
			
			
			if (!mxClient.IS_QUIRKS && document.documentMode !== 7 && document.documentMode !== 8)
			{
				mxEvent.addListener(this.textarea, 'paste', mxUtils.bind(this, function(evt)
				{
					var clone = reference(this.textarea, this.textarea.cloneNode(true));
	
					window.setTimeout(mxUtils.bind(this, function()
					{
						checkNode(this.textarea, clone);
					}), 0);
				}));
			}
		};
		
		mxCellEditor.prototype.toggleViewMode = function()
		{
			var state = this.graph.view.getState(this.editingCell);
			var nl2Br = state != null && mxUtils.getValue(state.style, 'nl2Br', '1') != '0';
			var tmp = this.saveSelection();
			
			if (!this.codeViewMode)
			{
				
				if (this.clearOnChange && this.textarea.innerHTML == this.getEmptyLabelText())
				{
					this.clearOnChange = false;
					this.textarea.innerHTML = '';
				}
				
				
				
				var content = mxUtils.htmlEntities(this.textarea.innerHTML);
	
			    
				if (!mxClient.IS_QUIRKS && document.documentMode != 8)
				{
					content = mxUtils.replaceTrailingNewlines(content, '<div><br></div>');
				}
				
			    content = this.graph.sanitizeHtml((nl2Br) ? content.replace(/\n/g, '').replace(/&lt;br\s*.?&gt;/g, '<br>') : content, true);
				this.textarea.className = 'mxCellEditor mxPlainTextEditor';
				
				var size = mxConstants.DEFAULT_FONTSIZE;
				
				this.textarea.style.lineHeight = (mxConstants.ABSOLUTE_LINE_HEIGHT) ? Math.round(size * mxConstants.LINE_HEIGHT) + 'px' : mxConstants.LINE_HEIGHT;
				this.textarea.style.fontSize = Math.round(size) + 'px';
				this.textarea.style.textDecoration = '';
				this.textarea.style.fontWeight = 'normal';
				this.textarea.style.fontStyle = '';
				this.textarea.style.fontFamily = mxConstants.DEFAULT_FONTFAMILY;
				this.textarea.style.textAlign = 'left';
				
				
				this.textarea.style.padding = '2px';
				
				if (this.textarea.innerHTML != content)
				{
					this.textarea.innerHTML = content;
				}
	
				this.codeViewMode = true;
			}
			else
			{
				var content = mxUtils.extractTextWithWhitespace(this.textarea.childNodes);
			    
				
			    if (content.length > 0 && content.charAt(content.length - 1) == '\n')
			    {
			    	content = content.substring(0, content.length - 1);
			    }
			    
				content = this.graph.sanitizeHtml((nl2Br) ? content.replace(/\n/g, '<br/>') : content, true)
				this.textarea.className = 'mxCellEditor geContentEditable';
				
				var size = mxUtils.getValue(state.style, mxConstants.STYLE_FONTSIZE, mxConstants.DEFAULT_FONTSIZE);
				var family = mxUtils.getValue(state.style, mxConstants.STYLE_FONTFAMILY, mxConstants.DEFAULT_FONTFAMILY);
				var align = mxUtils.getValue(state.style, mxConstants.STYLE_ALIGN, mxConstants.ALIGN_LEFT);
				var bold = (mxUtils.getValue(state.style, mxConstants.STYLE_FONTSTYLE, 0) &
						mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD;
				var italic = (mxUtils.getValue(state.style, mxConstants.STYLE_FONTSTYLE, 0) &
						mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC;
				var uline = (mxUtils.getValue(state.style, mxConstants.STYLE_FONTSTYLE, 0) &
						mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE;
				
				this.textarea.style.lineHeight = (mxConstants.ABSOLUTE_LINE_HEIGHT) ? Math.round(size * mxConstants.LINE_HEIGHT) + 'px' : mxConstants.LINE_HEIGHT;
				this.textarea.style.fontSize = Math.round(size) + 'px';
				this.textarea.style.textDecoration = (uline) ? 'underline' : '';
				this.textarea.style.fontWeight = (bold) ? 'bold' : 'normal';
				this.textarea.style.fontStyle = (italic) ? 'italic' : '';
				this.textarea.style.fontFamily = family;
				this.textarea.style.textAlign = align;
				this.textarea.style.padding = '0px';
				
				if (this.textarea.innerHTML != content)
				{
					this.textarea.innerHTML = content;
					
					if (this.textarea.innerHTML.length == 0)
					{
						this.textarea.innerHTML = this.getEmptyLabelText();
						this.clearOnChange = this.textarea.innerHTML.length > 0;
					}
				}
	
				this.codeViewMode = false;
			}
			
			this.textarea.focus();
		
			if (this.switchSelectionState != null)
			{
				this.restoreSelection(this.switchSelectionState);
			}
			
			this.switchSelectionState = tmp;
			this.resize();
		};
		
		var mxCellEditorResize = mxCellEditor.prototype.resize;
		mxCellEditor.prototype.resize = function(state, trigger)
		{
			if (this.textarea != null)
			{
				var state = this.graph.getView().getState(this.editingCell);
				
				if (this.codeViewMode && state != null)
				{
					var scale = state.view.scale;
					this.bounds = mxRectangle.fromRectangle(state);
					
					
					
					if (this.bounds.width == 0 && this.bounds.height == 0)
					{
						this.bounds.width = 160 * scale;
						this.bounds.height = 60 * scale;
						
						var m = (state.text != null) ? state.text.margin : null;
						
						if (m == null)
						{
							m = mxUtils.getAlignmentAsPoint(mxUtils.getValue(state.style, mxConstants.STYLE_ALIGN, mxConstants.ALIGN_CENTER),
									mxUtils.getValue(state.style, mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_MIDDLE));
						}
						
						this.bounds.x += m.x * this.bounds.width;
						this.bounds.y += m.y * this.bounds.height;
					}
		
					this.textarea.style.width = Math.round((this.bounds.width - 4) / scale) + 'px';
					this.textarea.style.height = Math.round((this.bounds.height - 4) / scale) + 'px';
					this.textarea.style.overflow = 'auto';
		
					
					if (this.textarea.clientHeight < this.textarea.offsetHeight)
					{
						this.textarea.style.height = Math.round((this.bounds.height / scale)) + (this.textarea.offsetHeight - this.textarea.clientHeight) + 'px';
						this.bounds.height = parseInt(this.textarea.style.height) * scale;
					}
					
					if (this.textarea.clientWidth < this.textarea.offsetWidth)
					{
						this.textarea.style.width = Math.round((this.bounds.width / scale)) + (this.textarea.offsetWidth - this.textarea.clientWidth) + 'px';
						this.bounds.width = parseInt(this.textarea.style.width) * scale;
					}
									
					this.textarea.style.left = Math.round(this.bounds.x) + 'px';
					this.textarea.style.top = Math.round(this.bounds.y) + 'px';
		
					if (mxClient.IS_VML)
					{
						this.textarea.style.zoom = scale;
					}
					else
					{
						mxUtils.setPrefixedStyle(this.textarea.style, 'transform', 'scale(' + scale + ',' + scale + ')');	
					}
				}
				else
				{
					this.textarea.style.height = '';
					this.textarea.style.overflow = '';
					mxCellEditorResize.apply(this, arguments);
				}
			}
		};
		
		mxCellEditorGetInitialValue = mxCellEditor.prototype.getInitialValue;
		mxCellEditor.prototype.getInitialValue = function(state, trigger)
		{
			if (mxUtils.getValue(state.style, 'html', '0') == '0')
			{
				return mxCellEditorGetInitialValue.apply(this, arguments);
			}
			else
			{
				var result = this.graph.getEditingValue(state.cell, trigger)
			
				if (mxUtils.getValue(state.style, 'nl2Br', '1') == '1')
				{
					result = result.replace(/\n/g, '<br/>');
				}
				
				result = this.graph.sanitizeHtml(result, true);
				
				return result;
			}
		};
		
		mxCellEditorGetCurrentValue = mxCellEditor.prototype.getCurrentValue;
		mxCellEditor.prototype.getCurrentValue = function(state)
		{
			if (mxUtils.getValue(state.style, 'html', '0') == '0')
			{
				return mxCellEditorGetCurrentValue.apply(this, arguments);
			}
			else
			{
				var result = this.graph.sanitizeHtml(this.textarea.innerHTML, true);
	
				if (mxUtils.getValue(state.style, 'nl2Br', '1') == '1')
				{
					result = result.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>');
				}
				else
				{
					result = result.replace(/\r\n/g, '').replace(/\n/g, '');
				}
				
				return result;
			}
		};
	
		var mxCellEditorStopEditing = mxCellEditor.prototype.stopEditing;
		mxCellEditor.prototype.stopEditing = function(cancel)
		{
			
			if (this.codeViewMode)
			{
				this.toggleViewMode();
			}
			
			mxCellEditorStopEditing.apply(this, arguments);
			
			
			this.focusContainer();
		};
		
		mxCellEditor.prototype.focusContainer = function()
		{
			try
			{
				this.graph.container.focus();
			}
			catch (e)
			{
				
			}
		};
	
		var mxCellEditorApplyValue = mxCellEditor.prototype.applyValue;
		mxCellEditor.prototype.applyValue = function(state, value)
		{
			
			this.graph.getModel().beginUpdate();
			
			try
			{
				mxCellEditorApplyValue.apply(this, arguments);
				
				if (this.graph.isCellDeletable(state.cell) && this.graph.model.getChildCount(state.cell) == 0)
				{
					var stroke = mxUtils.getValue(state.style, mxConstants.STYLE_STROKECOLOR, mxConstants.NONE);
					var fill = mxUtils.getValue(state.style, mxConstants.STYLE_FILLCOLOR, mxConstants.NONE);
					
					if (value == '' && stroke == mxConstants.NONE && fill == mxConstants.NONE)
					{
						this.graph.removeCells([state.cell], false);
					}
				}
			}
			finally
			{
				this.graph.getModel().endUpdate();
			}
		};
		mxCellEditor.prototype.getBackgroundColor = function(state)
		{
			var color = null;
			
			if (this.graph.getModel().isEdge(state.cell) || this.graph.getModel().isEdge(this.graph.getModel().getParent(state.cell)))
			{
				var color = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_BACKGROUNDCOLOR, null);
				
				if (color == mxConstants.NONE)
				{
					color = null;
				}
			}
			
			return color;
		};
		
		mxCellEditor.prototype.getMinimumSize = function(state)
		{
			var scale = this.graph.getView().scale;
			
			return new mxRectangle(0, 0, (state.text == null) ? 30 :  state.text.size * scale + 20, 30);
		};
		
		
		var mxGraphHandlerMoveCells = mxGraphHandler.prototype.moveCells;
		
		mxGraphHandler.prototype.moveCells = function(cells, dx, dy, clone, target, evt)
		{
			if (mxEvent.isAltDown(evt))
			{
				target = null;
			}
			
			mxGraphHandlerMoveCells.apply(this, arguments);
		};
		
		function createHint()
		{
			var hint = document.createElement('div');
			hint.className = 'geHint';
			hint.style.whiteSpace = 'nowrap';
			hint.style.position = 'absolute';
			
			return hint;
		};
		
		mxGraphHandler.prototype.updateHint = function(me)
		{
			if (this.shape != null)
			{
				if (this.hint == null)
				{
					this.hint = createHint();
					this.graph.container.appendChild(this.hint);
				}
	
				var t = this.graph.view.translate;
				var s = this.graph.view.scale;
				var x = this.roundLength((this.bounds.x + this.currentDx) / s - t.x);
				var y = this.roundLength((this.bounds.y + this.currentDy) / s - t.y);
				
				this.hint.innerHTML = x + ', ' + y;
	
				this.hint.style.left = (this.shape.bounds.x + Math.round((this.shape.bounds.width - this.hint.clientWidth) / 2)) + 'px';
				this.hint.style.top = (this.shape.bounds.y + this.shape.bounds.height + 12) + 'px';
			}
		};
	
		mxGraphHandler.prototype.removeHint = function()
		{
			if (this.hint != null)
			{
				this.hint.parentNode.removeChild(this.hint);
				this.hint = null;
			}
		};
	
		mxVertexHandler.prototype.isRecursiveResize = function(state, me)
		{
			return !this.graph.isSwimlane(state.cell) && this.graph.model.getChildCount(state.cell) > 0 &&
				!mxEvent.isControlDown(me.getEvent()) && !this.graph.isCellCollapsed(state.cell) &&
				mxUtils.getValue(state.style, 'recursiveResize', '1') == '1' &&
				mxUtils.getValue(state.style, 'childLayout', null) == null;
		};
		
		mxVertexHandler.prototype.isCenteredEvent = function(state, me)
		{
			return (!(!this.graph.isSwimlane(state.cell) && this.graph.model.getChildCount(state.cell) > 0 &&
					!this.graph.isCellCollapsed(state.cell) &&
					mxUtils.getValue(state.style, 'recursiveResize', '1') == '1' &&
					mxUtils.getValue(state.style, 'childLayout', null) == null) &&
					mxEvent.isControlDown(me.getEvent())) ||
				mxEvent.isMetaDown(me.getEvent());
		};
		
		var vertexHandlerGetHandlePadding = mxVertexHandler.prototype.getHandlePadding;
		mxVertexHandler.prototype.getHandlePadding = function()
		{
			var result = new mxPoint(0, 0);
			var tol = this.tolerance;
			
			if (this.graph.cellEditor.getEditingCell() == this.state.cell && 
				this.sizers != null && this.sizers.length > 0 && this.sizers[0] != null)
			{
				tol /= 2;
				
				result.x = this.sizers[0].bounds.width + tol;
				result.y = this.sizers[0].bounds.height + tol;
			}
			else
			{
				result = vertexHandlerGetHandlePadding.apply(this, arguments);
			}
			
			return result;
		};
	
		mxVertexHandler.prototype.updateHint = function(me)
		{
			if (this.index != mxEvent.LABEL_HANDLE)
			{
				if (this.hint == null)
				{
					this.hint = createHint();
					this.state.view.graph.container.appendChild(this.hint);
				}
	
				if (this.index == mxEvent.ROTATION_HANDLE)
				{
					this.hint.innerHTML = this.currentAlpha + '&deg;';
				}
				else
				{
					var s = this.state.view.scale;
					this.hint.innerHTML = this.roundLength(this.bounds.width / s) + ' x ' + this.roundLength(this.bounds.height / s);
				}
				
				var rot = (this.currentAlpha != null) ? this.currentAlpha : this.state.style[mxConstants.STYLE_ROTATION] || '0';
				var bb = mxUtils.getBoundingBox(this.bounds, rot);
				
				if (bb == null)
				{
					bb = this.bounds;
				}
				
				this.hint.style.left = bb.x + Math.round((bb.width - this.hint.clientWidth) / 2) + 'px';
				this.hint.style.top = (bb.y + bb.height + 12) + 'px';
				
				if (this.linkHint != null)
				{
					this.linkHint.style.display = 'none';
				}
			}
		};
	
		mxVertexHandler.prototype.removeHint = function()
		{
			mxGraphHandler.prototype.removeHint.apply(this, arguments);
			
			if (this.linkHint != null)
			{
				this.linkHint.style.display = '';
			}
		};
	
		mxEdgeHandler.prototype.updateHint = function(me, point)
		{
			if (this.hint == null)
			{
				this.hint = createHint();
				this.state.view.graph.container.appendChild(this.hint);
			}
	
			var t = this.graph.view.translate;
			var s = this.graph.view.scale;
			var x = this.roundLength(point.x / s - t.x);
			var y = this.roundLength(point.y / s - t.y);
			
			this.hint.innerHTML = x + ', ' + y;
			this.hint.style.visibility = 'visible';
			
			if (this.isSource || this.isTarget)
			{
				if (this.constraintHandler.currentConstraint != null &&
					this.constraintHandler.currentFocus != null)
				{
					var pt = this.constraintHandler.currentConstraint.point;
					this.hint.innerHTML = '[' + Math.round(pt.x * 100) + '%, '+ Math.round(pt.y * 100) + '%]';
				}
				else if (this.marker.hasValidState())
				{
					this.hint.style.visibility = 'hidden';
				}
			}
			
			this.hint.style.left = Math.round(me.getGraphX() - this.hint.clientWidth / 2) + 'px';
			this.hint.style.top = (Math.max(me.getGraphY(), point.y) + this.state.view.graph.gridSize) + 'px';
			
			if (this.linkHint != null)
			{
				this.linkHint.style.display = 'none';
			}
		};
	
		mxEdgeHandler.prototype.removeHint = mxVertexHandler.prototype.removeHint;
	
		
		
		
		mxVertexHandler.prototype.rotationEnabled = false;
		mxVertexHandler.prototype.manageSizers = false;
		mxVertexHandler.prototype.livePreview = false;
	
		
		mxRubberband.prototype.defaultOpacity = 30;
		
		
		mxConnectionHandler.prototype.outlineConnect = true;
		mxCellHighlight.prototype.keepOnTop = true;
		mxVertexHandler.prototype.parentHighlightEnabled = true;
		mxVertexHandler.prototype.rotationHandleVSpacing = -20;
		
		mxEdgeHandler.prototype.parentHighlightEnabled = true;
		mxEdgeHandler.prototype.dblClickRemoveEnabled = true;
		mxEdgeHandler.prototype.straightRemoveEnabled = true;
		mxEdgeHandler.prototype.virtualBendsEnabled = true;
		mxEdgeHandler.prototype.mergeRemoveEnabled = true;
		mxEdgeHandler.prototype.manageLabelHandle = true;
		mxEdgeHandler.prototype.outlineConnect = true;
		
		
		mxEdgeHandler.prototype.isAddVirtualBendEvent = function(me)
		{
			return !mxEvent.isShiftDown(me.getEvent());
		};
	
		
		mxEdgeHandler.prototype.isCustomHandleEvent = function(me)
		{
			return !mxEvent.isShiftDown(me.getEvent());
		};
		
		if (Graph.touchStyle)
		{
			
			if (mxClient.IS_TOUCH || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)
			{
				mxShape.prototype.svgStrokeTolerance = 18;
				mxVertexHandler.prototype.tolerance = 12;
				mxEdgeHandler.prototype.tolerance = 12;
				Graph.prototype.tolerance = 12;
				
				mxVertexHandler.prototype.rotationHandleVSpacing = -24;
				
				
				
				mxConstraintHandler.prototype.getTolerance = function(me)
				{
					return (mxEvent.isMouseEvent(me.getEvent())) ? 4 : this.graph.getTolerance();
				};
			}
				
			
			mxPanningHandler.prototype.isPanningTrigger = function(me)
			{
				var evt = me.getEvent();
				
			 	return (me.getState() == null && !mxEvent.isMouseEvent(evt)) ||
			 		(mxEvent.isPopupTrigger(evt) && (me.getState() == null ||
			 		mxEvent.isControlDown(evt) || mxEvent.isShiftDown(evt)));
			};
			
			
			var graphHandlerMouseDown = mxGraphHandler.prototype.mouseDown;
			mxGraphHandler.prototype.mouseDown = function(sender, me)
			{
				graphHandlerMouseDown.apply(this, arguments);
	
				if (mxEvent.isTouchEvent(me.getEvent()) && this.graph.isCellSelected(me.getCell()) &&
					this.graph.getSelectionCount() > 1)
				{
					this.delayedSelection = false;
				}
			};
		}
		else
		{
			
			mxPanningHandler.prototype.isPanningTrigger = function(me)
			{
				var evt = me.getEvent();
				
				return (mxEvent.isLeftMouseButton(evt) && ((this.useLeftButtonForPanning &&
						me.getState() == null) || (mxEvent.isControlDown(evt) &&
						!mxEvent.isShiftDown(evt)))) || (this.usePopupTrigger &&
						mxEvent.isPopupTrigger(evt));
			};
		}
		
		mxRubberband.prototype.isSpaceEvent = function(me)
		{
			return this.graph.isEnabled() && !this.graph.isCellLocked(this.graph.getDefaultParent()) &&
				mxEvent.isControlDown(me.getEvent()) && mxEvent.isShiftDown(me.getEvent());
		};
		
		
		mxRubberband.prototype.mouseUp = function(sender, me)
		{
			var execute = this.div != null && this.div.style.display != 'none';
			var x0 = null;
			var y0 = null;
			var dx = null;
			var dy = null;
			if (this.first != null && this.currentX != null && this.currentY != null)
			{
				x0 = this.first.x;
				y0 = this.first.y;
				dx = (this.currentX - x0) / this.graph.view.scale;
				dy = (this.currentY - y0) / this.graph.view.scale;
				if (!mxEvent.isAltDown(me.getEvent()))
				{
					dx = this.graph.snap(dx);
					dy = this.graph.snap(dy);
					
					if (!this.graph.isGridEnabled())
					{
						if (Math.abs(dx) < this.graph.tolerance)
						{
							dx = 0;
						}
						
						if (Math.abs(dy) < this.graph.tolerance)
						{
							dy = 0;
						}
					}
				}
			}
			
			this.reset();
			
			if (execute)
			{
				if (mxEvent.isAltDown(me.getEvent()) && this.graph.isToggleEvent(me.getEvent()))
				{
					var rect = new mxRectangle(this.x, this.y, this.width, this.height);
					var cells = this.graph.getCells(rect.x, rect.y, rect.width, rect.height);
					
					this.graph.removeSelectionCells(cells);
				}
				else if (this.isSpaceEvent(me))
				{
					this.graph.model.beginUpdate();
					try
					{
						var cells = this.graph.getCellsBeyond(x0, y0, this.graph.getDefaultParent(), true, true);
						for (var i = 0; i < cells.length; i++)
						{
							if (this.graph.isCellMovable(cells[i]))
							{
								var tmp = this.graph.view.getState(cells[i]);
								var geo = this.graph.getCellGeometry(cells[i]);
								
								if (tmp != null && geo != null)
								{
									geo = geo.clone();
									geo.translate(dx, dy);
									this.graph.model.setGeometry(cells[i], geo);
								}
							}
						}
					}
					finally
					{
						this.graph.model.endUpdate();
					}
				}
				else
				{
					var rect = new mxRectangle(this.x, this.y, this.width, this.height);
					this.graph.selectRegion(rect, me.getEvent());
				}
				
				me.consume();
			}
		};
		
		
		mxRubberband.prototype.mouseMove = function(sender, me)
		{
			if (!me.isConsumed() && this.first != null)
			{
				var origin = mxUtils.getScrollOrigin(this.graph.container);
				var offset = mxUtils.getOffset(this.graph.container);
				origin.x -= offset.x;
				origin.y -= offset.y;
				var x = me.getX() + origin.x;
				var y = me.getY() + origin.y;
				var dx = this.first.x - x;
				var dy = this.first.y - y;
				var tol = this.graph.tolerance;
				
				if (this.div != null || Math.abs(dx) > tol ||  Math.abs(dy) > tol)
				{
					if (this.div == null)
					{
						this.div = this.createShape();
					}
					
					
					
					mxUtils.clearSelection();
					this.update(x, y);
					
					if (this.isSpaceEvent(me))
					{
						var right = this.x + this.width;
						var bottom = this.y + this.height;
						var scale = this.graph.view.scale;
						
						if (!mxEvent.isAltDown(me.getEvent()))
						{
							this.width = this.graph.snap(this.width / scale) * scale;
							this.height = this.graph.snap(this.height / scale) * scale;
							
							if (!this.graph.isGridEnabled())
							{
								if (this.width < this.graph.tolerance)
								{
									this.width = 0;
								}
								
								if (this.height < this.graph.tolerance)
								{
									this.height = 0;
								}
							}
							
							if (this.x < this.first.x)
							{
								this.x = right - this.width;
							}
							
							if (this.y < this.first.y)
							{
								this.y = bottom - this.height;
							}
						}
						
						this.div.style.borderStyle = 'dashed';
						this.div.style.backgroundColor = 'white';
						this.div.style.left = this.x + 'px';
						this.div.style.top = this.y + 'px';
						this.div.style.width = Math.max(0, this.width) + 'px';
						this.div.style.height = this.graph.container.clientHeight + 'px';
						this.div.style.borderWidth = (this.width <= 0) ? '0px 1px 0px 0px' : '0px 1px 0px 1px';
						
						if (this.secondDiv == null)
						{
							this.secondDiv = this.div.cloneNode(true);
							this.div.parentNode.appendChild(this.secondDiv);
						}
						
						this.secondDiv.style.left = this.x + 'px';
						this.secondDiv.style.top = this.y + 'px';
						this.secondDiv.style.width = this.graph.container.clientWidth + 'px';
						this.secondDiv.style.height = Math.max(0, this.height) + 'px';
						this.secondDiv.style.borderWidth = (this.height <= 0) ? '1px 0px 0px 0px' : '1px 0px 1px 0px';
					}
					else
					{
						
						this.div.style.backgroundColor = '';
						this.div.style.borderWidth = '';
						this.div.style.borderStyle = '';
						
						if (this.secondDiv != null)
						{
							this.secondDiv.parentNode.removeChild(this.secondDiv);
							this.secondDiv = null;
						}
					}
					me.consume();
				}
			}
		};
		
		
		var mxRubberbandReset = mxRubberband.prototype.reset;
		mxRubberband.prototype.reset = function()
		{
			if (this.secondDiv != null)
			{
				this.secondDiv.parentNode.removeChild(this.secondDiv);
				this.secondDiv = null;
			}
			
			mxRubberbandReset.apply(this, arguments);
		};
		
	    
	    var startTime = new Date().getTime();
	    var timeOnTarget = 0;
	    
		var mxEdgeHandlerUpdatePreviewState = mxEdgeHandler.prototype.updatePreviewState;
		
		mxEdgeHandler.prototype.updatePreviewState = function(edge, point, terminalState, me)
		{
			mxEdgeHandlerUpdatePreviewState.apply(this, arguments);
			
	    	if (terminalState != this.currentTerminalState)
	    	{
	    		startTime = new Date().getTime();
	    		timeOnTarget = 0;
	    	}
	    	else
	    	{
		    	timeOnTarget = new Date().getTime() - startTime;
	    	}
			
			this.currentTerminalState = terminalState;
		};
	
		
		var mxEdgeHandlerIsOutlineConnectEvent = mxEdgeHandler.prototype.isOutlineConnectEvent;
		
		mxEdgeHandler.prototype.isOutlineConnectEvent = function(me)
		{
			return (this.currentTerminalState != null && me.getState() == this.currentTerminalState && timeOnTarget > 2000) ||
				((this.currentTerminalState == null || mxUtils.getValue(this.currentTerminalState.style, 'outlineConnect', '1') != '0') &&
				mxEdgeHandlerIsOutlineConnectEvent.apply(this, arguments));
		};
		
		
		mxVertexHandler.prototype.isCustomHandleEvent = function(me)
		{
			return !mxEvent.isShiftDown(me.getEvent());
		};
	
		
		mxEdgeHandler.prototype.createHandleShape = function(index, virtual)
		{
			var source = index != null && index == 0;
			var terminalState = this.state.getVisibleTerminalState(source);
			var c = (index != null && (index == 0 || index >= this.state.absolutePoints.length - 1 ||
				(this.constructor == mxElbowEdgeHandler && index == 2))) ?
				this.graph.getConnectionConstraint(this.state, terminalState, source) : null;
			var pt = (c != null) ? this.graph.getConnectionPoint(this.state.getVisibleTerminalState(source), c) : null;
			var img = (pt != null) ? this.fixedHandleImage : ((c != null && terminalState != null) ?
				this.terminalHandleImage : this.handleImage);
			
			if (img != null)
			{
				var shape = new mxImageShape(new mxRectangle(0, 0, img.width, img.height), img.src);
				
				
				shape.preserveImageAspect = false;
	
				return shape;
			}
			else
			{
				var s = mxConstants.HANDLE_SIZE;
				
				if (this.preferHtml)
				{
					s -= 1;
				}
				
				return new mxRectangleShape(new mxRectangle(0, 0, s, s), mxConstants.HANDLE_FILLCOLOR, mxConstants.HANDLE_STROKECOLOR);
			}
		};
	
		
		
		var mxGraphHandlerGetBoundingBox = mxGraphHandler.prototype.getBoundingBox;
		mxGraphHandler.prototype.getBoundingBox = function(cells)
		{
			if (cells != null && cells.length == 1)
			{
				var model = this.graph.getModel();
				var parent = model.getParent(cells[0]);
				var geo = this.graph.getCellGeometry(cells[0]);
				
				if (model.isEdge(parent) && geo != null && geo.relative)
				{
					var state = this.graph.view.getState(cells[0]);
					
					if (state != null && state.width < 2 && state.height < 2 && state.text != null && state.text.boundingBox != null)
					{
						return mxRectangle.fromRectangle(state.text.boundingBox);
					}
				}
			}
			
			return mxGraphHandlerGetBoundingBox.apply(this, arguments);
		};
		
		
		var mxVertexHandlerGetSelectionBounds = mxVertexHandler.prototype.getSelectionBounds;
		mxVertexHandler.prototype.getSelectionBounds = function(state)
		{
			var model = this.graph.getModel();
			var parent = model.getParent(state.cell);
			var geo = this.graph.getCellGeometry(state.cell);
			
			if (model.isEdge(parent) && geo != null && geo.relative && state.width < 2 && state.height < 2 && state.text != null && state.text.boundingBox != null)
			{
				var bbox = state.text.unrotatedBoundingBox || state.text.boundingBox;
				
				return new mxRectangle(Math.round(bbox.x), Math.round(bbox.y), Math.round(bbox.width), Math.round(bbox.height));
			}
			else
			{
				return mxVertexHandlerGetSelectionBounds.apply(this, arguments);
			}
		};
	
		
		
		var mxVertexHandlerMouseDown = mxVertexHandler.prototype.mouseDown;
		mxVertexHandler.prototype.mouseDown = function(sender, me)
		{
			var model = this.graph.getModel();
			var parent = model.getParent(this.state.cell);
			var geo = this.graph.getCellGeometry(this.state.cell);
			
			
			var handle = this.getHandleForEvent(me);
			
			if (handle == mxEvent.ROTATION_HANDLE || !model.isEdge(parent) || geo == null || !geo.relative ||
				this.state == null || this.state.width >= 2 || this.state.height >= 2)
			{
				mxVertexHandlerMouseDown.apply(this, arguments);
			}
		};
		
		mxVertexHandler.prototype.isRotationHandleVisible = function()
		{
			return this.graph.isEnabled() && this.rotationEnabled && this.graph.isCellRotatable(this.state.cell) &&
				(mxGraphHandler.prototype.maxCells <= 0 || this.graph.getSelectionCount() < mxGraphHandler.prototype.maxCells);
		};
	
		
		mxVertexHandler.prototype.rotateClick = function()
		{
			this.state.view.graph.turnShapes([this.state.cell]);
		};
		
		var vertexHandlerMouseMove = mxVertexHandler.prototype.mouseMove;
	
		
		mxVertexHandler.prototype.mouseMove = function(sender, me)
		{
			vertexHandlerMouseMove.apply(this, arguments);
			
			if (this.graph.graphHandler.first != null)
			{
				if (this.rotationShape != null && this.rotationShape.node != null)
				{
					this.rotationShape.node.style.display = 'none';
				}
			}
		};
		
		var vertexHandlerMouseUp = mxVertexHandler.prototype.mouseUp;
		mxVertexHandler.prototype.mouseUp = function(sender, me)
		{
			vertexHandlerMouseUp.apply(this, arguments);
			
			
			if (this.rotationShape != null && this.rotationShape.node != null)
			{
				this.rotationShape.node.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
			}
		};
	
		var vertexHandlerInit = mxVertexHandler.prototype.init;
		mxVertexHandler.prototype.init = function()
		{
			vertexHandlerInit.apply(this, arguments);
			var redraw = false;
			
			if (this.rotationShape != null)
			{
				this.rotationShape.node.setAttribute('title', mxResources.get('rotateTooltip'));
			}
			
			var update = mxUtils.bind(this, function()
			{
				
				if (this.rotationShape != null && this.rotationShape.node != null)
				{
					this.rotationShape.node.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
				}
				
				if (this.specialHandle != null)
				{
					this.specialHandle.node.style.display = (this.graph.isEnabled() && this.graph.getSelectionCount() < this.graph.graphHandler.maxCells) ? '' : 'none';
				}
				
				this.redrawHandles();
			});
			
			this.selectionHandler = mxUtils.bind(this, function(sender, evt)
			{
				update();
			});
			
			this.graph.getSelectionModel().addListener(mxEvent.CHANGE, this.selectionHandler);
			
			this.changeHandler = mxUtils.bind(this, function(sender, evt)
			{
				this.updateLinkHint(this.graph.getLinkForCell(this.state.cell),
					this.graph.getLinksForState(this.state));
				update();
			});
			
			this.graph.getModel().addListener(mxEvent.CHANGE, this.changeHandler);
			
			
			this.editingHandler = mxUtils.bind(this, function(sender, evt)
			{
				this.redrawHandles();
			});
			
			this.graph.addListener(mxEvent.EDITING_STOPPED, this.editingHandler);
			var link = this.graph.getLinkForCell(this.state.cell);
			var links = this.graph.getLinksForState(this.state);
			this.updateLinkHint(link, links);
			
			if (link != null || (links != null && links.length > 0))
			{
				redraw = true;
			}
			
			if (redraw)
			{
				this.redrawHandles();
			}
		};
	
		mxVertexHandler.prototype.updateLinkHint = function(link, links)
		{
			if ((link == null && (links == null || links.length == 0)) ||
				this.graph.getSelectionCount() > 1)
			{
				if (this.linkHint != null)
				{
					this.linkHint.parentNode.removeChild(this.linkHint);
					this.linkHint = null;
				}
			}
			else if (link != null || (links != null && links.length > 0))
			{
				if (this.linkHint == null)
				{
					this.linkHint = createHint();
					this.linkHint.style.padding = '6px 8px 6px 8px';
					this.linkHint.style.opacity = '1';
					this.linkHint.style.filter = '';
					
					this.graph.container.appendChild(this.linkHint);
				}
				this.linkHint.innerHTML = '';
				
				if (link != null)
				{
					this.linkHint.appendChild(this.graph.createLinkForHint(link));
					
					if (this.graph.isEnabled() && typeof this.graph.editLink === 'function')
					{
						var changeLink = document.createElement('img');
						changeLink.setAttribute('src', Editor.editImage);
						changeLink.setAttribute('title', mxResources.get('editLink'));
						changeLink.setAttribute('width', '11');
						changeLink.setAttribute('height', '11');
						changeLink.style.marginLeft = '10px';
						changeLink.style.marginBottom = '-1px';
						changeLink.style.cursor = 'pointer';
						this.linkHint.appendChild(changeLink);
						
						mxEvent.addListener(changeLink, 'click', mxUtils.bind(this, function(evt)
						{
							this.graph.setSelectionCell(this.state.cell);
							this.graph.editLink();
							mxEvent.consume(evt);
						}));
						
						var removeLink = document.createElement('img');
						removeLink.setAttribute('src', Dialog.prototype.clearImage);
						removeLink.setAttribute('title', mxResources.get('removeIt', [mxResources.get('link')]));
						removeLink.setAttribute('width', '13');
						removeLink.setAttribute('height', '10');
						removeLink.style.marginLeft = '4px';
						removeLink.style.marginBottom = '-1px';
						removeLink.style.cursor = 'pointer';
						this.linkHint.appendChild(removeLink);
						
						mxEvent.addListener(removeLink, 'click', mxUtils.bind(this, function(evt)
						{
							this.graph.setLinkForCell(this.state.cell, null);
							mxEvent.consume(evt);
						}));
					}
				}
				if (links != null)
				{
					for (var i = 0; i < links.length; i++)
					{
						var div = document.createElement('div');
						div.style.marginTop = (link != null || i > 0) ? '6px' : '0px';
						div.appendChild(this.graph.createLinkForHint(
							links[i].getAttribute('href'),
							mxUtils.getTextContent(links[i])));
						
						this.linkHint.appendChild(div);
					}
				}
			}
		};
		
		mxEdgeHandler.prototype.updateLinkHint = mxVertexHandler.prototype.updateLinkHint;
		
		var edgeHandlerInit = mxEdgeHandler.prototype.init;
		mxEdgeHandler.prototype.init = function()
		{
			edgeHandlerInit.apply(this, arguments);
			
			
			this.constraintHandler.isEnabled = mxUtils.bind(this, function()
			{
				return this.state.view.graph.connectionHandler.isEnabled();
			});
			
			var update = mxUtils.bind(this, function()
			{
				if (this.linkHint != null)
				{
					this.linkHint.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
				}
				
				if (this.labelShape != null)
				{
					this.labelShape.node.style.display = (this.graph.isEnabled() && this.graph.getSelectionCount() < this.graph.graphHandler.maxCells) ? '' : 'none';
				}
			});
	
			this.selectionHandler = mxUtils.bind(this, function(sender, evt)
			{
				update();
			});
			
			this.graph.getSelectionModel().addListener(mxEvent.CHANGE, this.selectionHandler);
			
			this.changeHandler = mxUtils.bind(this, function(sender, evt)
			{
				this.updateLinkHint(this.graph.getLinkForCell(this.state.cell),
					this.graph.getLinksForState(this.state));
				update();
				this.redrawHandles();
			});
			
			this.graph.getModel().addListener(mxEvent.CHANGE, this.changeHandler);
	
			var link = this.graph.getLinkForCell(this.state.cell);
			var links = this.graph.getLinksForState(this.state);
									
			if (link != null || (links != null && links.length > 0))
			{
				this.updateLinkHint(link, links);
				this.redrawHandles();
			}
		};
	
		
		var connectionHandlerInit = mxConnectionHandler.prototype.init;
		
		mxConnectionHandler.prototype.init = function()
		{
			connectionHandlerInit.apply(this, arguments);
			
			this.constraintHandler.isEnabled = mxUtils.bind(this, function()
			{
				return this.graph.connectionHandler.isEnabled();
			});
		};
	
		var vertexHandlerRedrawHandles = mxVertexHandler.prototype.redrawHandles;
		mxVertexHandler.prototype.redrawHandles = function()
		{
			vertexHandlerRedrawHandles.apply(this);
			if (this.state != null && this.linkHint != null)
			{
				var c = new mxPoint(this.state.getCenterX(), this.state.getCenterY());
				var tmp = new mxRectangle(this.state.x, this.state.y - 22, this.state.width + 24, this.state.height + 22);
				var bb = mxUtils.getBoundingBox(tmp, this.state.style[mxConstants.STYLE_ROTATION] || '0', c);
				var rs = (bb != null) ? mxUtils.getBoundingBox(this.state,
					this.state.style[mxConstants.STYLE_ROTATION] || '0') : this.state;
				var tb = (this.state.text != null) ? this.state.text.boundingBox : null;
				
				if (bb == null)
				{
					bb = this.state;
				}
				
				var b = bb.y + bb.height;
				
				if (tb != null)
				{
					b = Math.max(b, tb.y + tb.height);
				}
				
				this.linkHint.style.left = Math.max(0, Math.round(rs.x + (rs.width - this.linkHint.clientWidth) / 2)) + 'px';
				this.linkHint.style.top = Math.round(b + this.verticalOffset / 2 + 6 +
					this.state.view.graph.tolerance) + 'px';
			}
		};
		
		var vertexHandlerReset = mxVertexHandler.prototype.reset;
		mxVertexHandler.prototype.reset = function()
		{
			vertexHandlerReset.apply(this, arguments);
			
			
			if (this.rotationShape != null && this.rotationShape.node != null)
			{
				this.rotationShape.node.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
			}
		};
	
		var vertexHandlerDestroy = mxVertexHandler.prototype.destroy;
		mxVertexHandler.prototype.destroy = function()
		{
			vertexHandlerDestroy.apply(this, arguments);
			
			if (this.linkHint != null)
			{
				this.linkHint.parentNode.removeChild(this.linkHint);
				this.linkHint = null;
			}
			if (this.selectionHandler != null)
			{
				this.graph.getSelectionModel().removeListener(this.selectionHandler);
				this.selectionHandler = null;
			}
			
			if  (this.changeHandler != null)
			{
				this.graph.getModel().removeListener(this.changeHandler);
				this.changeHandler = null;
			}
			
			if  (this.editingHandler != null)
			{
				this.graph.removeListener(this.editingHandler);
				this.editingHandler = null;
			}
		};
		
		var edgeHandlerRedrawHandles = mxEdgeHandler.prototype.redrawHandles;
		mxEdgeHandler.prototype.redrawHandles = function()
		{
			
			
			if (this.marker != null)
			{
				edgeHandlerRedrawHandles.apply(this);
		
				if (this.state != null && this.linkHint != null)
				{
					var b = this.state;
					
					if (this.state.text != null && this.state.text.bounds != null)
					{
						b = new mxRectangle(b.x, b.y, b.width, b.height);
						b.add(this.state.text.bounds);
					}
					
					this.linkHint.style.left = Math.max(0, Math.round(b.x + (b.width - this.linkHint.clientWidth) / 2)) + 'px';
					this.linkHint.style.top = Math.round(b.y + b.height + 6 + this.state.view.graph.tolerance) + 'px';
				}
			}
		};
	
		var edgeHandlerReset = mxEdgeHandler.prototype.reset;
		mxEdgeHandler.prototype.reset = function()
		{
			edgeHandlerReset.apply(this, arguments);
			
			if (this.linkHint != null)
			{
				this.linkHint.style.visibility = '';
			}
		};
		
		var edgeHandlerDestroy = mxEdgeHandler.prototype.destroy;
		mxEdgeHandler.prototype.destroy = function()
		{
			edgeHandlerDestroy.apply(this, arguments);
			
			if (this.linkHint != null)
			{
				this.linkHint.parentNode.removeChild(this.linkHint);
				this.linkHint = null;
			}
	
			if (this.selectionHandler != null)
			{
				this.graph.getSelectionModel().removeListener(this.selectionHandler);
				this.selectionHandler = null;
			}
	
			if  (this.changeHandler != null)
			{
				this.graph.getModel().removeListener(this.changeHandler);
				this.changeHandler = null;
			}
		};
	})();
}
