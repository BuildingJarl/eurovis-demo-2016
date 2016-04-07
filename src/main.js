import d3 from 'd3';
import ace from 'ace';
import htmlparser from 'htmlparser2';
import ED from './eventdispatcher';

//D3 tree orientation
//http://bl.ocks.org/mbostock/3184089

// settings for ace
let base = System.normalizeSync('ace');
base = base.substr(0, base.length - 3);
ace.config.set('basePath', base);

// add needed DOM elements
var container = document.createElement('div');
container.setAttribute("id", "container");

var visContainer = document.createElement('div');
visContainer.setAttribute("id", "visContainer");

var aceContainer = document.createElement('div');
aceContainer.setAttribute("id", "aceContainer");

container.appendChild(visContainer);
container.appendChild(aceContainer);

document.body.appendChild(container);


// remove loading screen
var child = document.getElementById("loadingFiller");
child.parentNode.removeChild(child);

// ----------------------------------------------------
//     D3 VIS

var width = visContainer.clientWidth
var height = visContainer.clientHeight

var svg = d3.select(visContainer).append("svg")
  .attr("width", width)
  .attr("height", height);

var visGroup = svg.append("g");

ED.addEventListener('editor_change', (event) => {

	parse(event.payload).then( (dom) => {

		visGroup.selectAll("*").remove();
		
		if(dom.length >= 1) {
			var root = { type: 'tag', name: 'html', children: dom };

			var level = heightHeighy(root);
			
			if(level > 0) {
			
				//this has to be width + width/maxNestingLevel
				var widthNew = visContainer.clientWidth + visContainer.clientWidth/level;
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
				visGroup.attr("transform", "translate("+ -(nodes[0].dy+1)+",0)");

				visGroup.selectAll(".node")
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
	});
});



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
//     ACE EDITOR
var editor = ace.edit(aceContainer);
editor.setTheme('ace/theme/monokai');
editor.getSession().setMode('ace/mode/html');
editor.setOptions({
		fontSize: "12pt",
		readOnly: false,
		highlightActiveLine: true,
		showPrintMargin: false,
		wrap: true
	});

editor.on('change', (change,target)=> {
	//console.log(change)
	var content = editor.getValue();
	ED.dispatchEvent( {type:'editor_change', payload: content} )
})
// ----------------------------------------------------



// ----------------------------------------------------
//     Parser Wrapper
function parse(payload) {
	
	var promise = new Promise( function(resolve, reject) {
		var handler = new htmlparser.DomHandler( function (error, dom) {
			console.log('parsing ...');

			if (error)
				console.log(error);
				//reject(err);
			else
				resolve(dom);
		}, {withStartIndices:true});

		var parser = new htmlparser.Parser(handler, {recognizeSelfClosing: true, decodeEntities: true});

		parser.write(payload);
		parser.done();
	});

	return promise;
}