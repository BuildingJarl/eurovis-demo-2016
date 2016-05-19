import d3 from 'd3';
import htmlparser from 'htmlparser2';
import EventDispatcher from './EventDispatcher';
import {calculateHierarchyDepth} from './HierarchyHelper';
import log from 'loglevel';


export default class MinimapManager {
	
	constructor(container) {

		var width = container.clientWidth
		var height = container.clientHeight
		
		this.selectedNode =  null;
		this.container = container;

		this.svg = d3.select(container).append("svg")
			.attr("width", width)
			.attr("height", height);

		this.visGroup = this.svg.append("g");

		EventDispatcher.addEventListener('editor_change', (event) => {
			log.debug('Visualisation event: editor change');

			this.parse(event.payload).then( (dom) => {
				this.update(dom);
				EventDispatcher.dispatchEvent( {type:'editor_change_async_end'} );
			});
		});

		//This event gets called when the cursor changes in the text editor
		EventDispatcher.addEventListener('editor_cursor_change', (event) => {
			log.debug('Visualisation event: editor cursor change');

			//this method might be abit inefficient as it gets called multiple times
			var selectedNode = this.selectedNode;
			
			if(selectedNode) {
				d3.select(selectedNode)
					.transition()
					.duration(250)
					.style("fill","#484c0d");

				this.selectedNode = null;
				selectedNode = null;
			}	

			var cursorPosition = event.payload;

			this.visGroup.selectAll(".node").each( function(d) {
				if(d.type !== 'root') {
					var start = d.startIndex + 1;
					var end = d.endIndex;
					
					if(start <= cursorPosition) {
						if(end >= cursorPosition) {				
							selectedNode = this;
						}
					}
					
				}
			});

			if(selectedNode) {
				this.selectedNode = selectedNode;
				d3.select(selectedNode)
					.transition()
					.duration(250)
					.style("fill","#d32661");

				var payload = {
					start: d3.select(selectedNode).datum().startIndex,
					end: d3.select(selectedNode).datum().endIndex
				};

				EventDispatcher.dispatchEvent( {type:'gutter_highlight', payload: payload });
			} else {
				EventDispatcher.dispatchEvent( {type:'gutter_highlight_reset'});
			}
		});
	}

	parse(payload) {
		var promise = new Promise( function(resolve, reject) {
			var handler = new htmlparser.DomHandler( function (error, dom) {

				if (error) {
					console.log(error);
					reject(err);
				}
				else
					resolve(dom);
			}, {withStartIndices:true, withEndIndices:true});

			var parser = new htmlparser.Parser(handler, {recognizeSelfClosing: true, decodeEntities: true});

			parser.write(payload);
			parser.done();
		});

		return promise;
	}

	update(dom) {

		//this is probably very inefficent -> but for sake of demo ok
		this.selectedNode = null;
		this.visGroup.selectAll("*").remove();
		
		if(dom.length >= 1) {
			var root = { type: 'root', name: 'html', children: dom };

			var level = calculateHierarchyDepth(root);
			
			if(level > 0) {
			
				//this has to be width + width/maxNestingLevel
				var height = this.container.clientHeight;
				var widthNew = (this.container.clientWidth + this.container.clientWidth/level);
				var partition = d3.layout.partition()
			  		.size([height,widthNew])
			  		.value(function(d) { return 1; })
			  		.children(function(d){
			  				if(d.children) {
			  					return d.children.filter(function(o){
				  					if(o.type === 'tag') {
				  						return true;
				  					} else {
				  						return false;
				  					}
				  				});
			  				}
			  		})
			  		.sort(null);

				var nodes = partition.nodes(root);
				this.visGroup.attr("transform", "translate("+ -(nodes[0].dy)+",0)");

				this.visGroup.selectAll(".node")
		      		.data(nodes)
		    		.enter().append("rect")
		      		.attr("class", "node")
			      	.attr("x", function(d) { return d.y; })
			     	.attr("y", function(d) { return d.x; })
			      	.attr("width", function(d) { return d.dy; })
			      	.attr("height", function(d) { return d.dx; })
			      	.style("fill", "484c0d")
			      	.on("click", function(d) { 
			      		EventDispatcher.dispatchEvent( {type:'vis_click_event', payload: {start: d.startIndex, end: d.endIndex}} );
			      	});
	    	}
		} 
	}
}
/*
.on("mouseover", function() { log.info('mouseover') })
.on("mouseout", function() { log.info('mouseout') })
.style("fill", function(d) {
		if(d.type === 'tag') {
			return 'blue';
		} else {
			return 'yellow';
		}
	})*/