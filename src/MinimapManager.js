import d3 from 'd3';
import htmlparser from 'htmlparser2';
import EventDispatcher from './EventDispatcher';

export default class MinimapManager {
	
	constructor(container) {

		var width = container.clientWidth
		var height = container.clientHeight
		
		this.selectedNode =  null;

		this.svg = d3.select(container).append("svg")
			.attr("width", width)
			.attr("height", height);

		this.visGroup = this.svg.append("g");

		EventDispatcher.addEventListener('editor_change', (event) => {

			parse(event.payload).then( (dom) => {
				this.selectedNode = null;
				this.visGroup.selectAll("*").remove();
				
				if(dom.length >= 1) {
					var root = { type: 'root', name: 'html', children: dom };

					var level = heightHeighy(root);
					
					if(level > 0) {
					
						//this has to be width + width/maxNestingLevel
						var widthNew = (visContainer.clientWidth + visContainer.clientWidth/level);
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
					      	.style("fill", function(d) {
					      		if(d.type === 'tag') {
					      			return 'blue';
					      		} else {
					      			return 'yellow';
					      		}
					      	});
			    	}
				} 
				EventDispatcher.dispatchEvent( {type:'editor_change_async_end'} );
			});
		});

		EventDispatcher.addEventListener('editor_cursor_change', (event) => {

			//this method might be abit inefficient as it gets called multiple times
			var selectedNode = this.selectedNode;
			
			if(selectedNode) {
				d3.select(selectedNode)
					.transition()
					.duration(250)
					.style("fill","blue");

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
				d3.select(selectedNode)
					.transition()
					.duration(250)
					.style("fill","green");;
			}
		});
	}
}

// ----------------------------------------------------

function heightHeighy(el) {
    if (!el.children)
        return 0;
    var max = -1;
    
    for ( var i = 0; i < el.children.length; i++) {
      if(el.children[i].type !== 'text') {
        var h = heightHeighy(el.children[i]);
        if (h > max) {
            max = h;
        }
       }
    }
    return max + 1;
}

// ----------------------------------------------------
//     Parser Wrapper
function parse(payload) {
	
	var promise = new Promise( function(resolve, reject) {
		var handler = new htmlparser.DomHandler( function (error, dom) {
			//console.log('parsing ...');

			if (error)
				console.log(error);
				//reject(err);
			else
				resolve(dom);
		}, {withStartIndices:true, withEndIndices:true});

		var parser = new htmlparser.Parser(handler, {recognizeSelfClosing: true, decodeEntities: true});

		parser.write(payload);
		parser.done();
	});

	return promise;
}