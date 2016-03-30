import d3 from 'd3';
import ace from 'ace';
import htmlparser from 'htmlparser2';
import ED from './eventdispatcher';

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

//http://bl.ocks.org/mbostock/3184089
var partition = d3.layout.partition()
  .size([height,width])
  .value(function(d) { return 1; });

var color = d3.scale.category20();

ED.addEventListener('editor_change', (event) => {
	//console.log(event)
	parse(event.payload).then( (dom) => {
		svg.selectAll("*").remove();

		var root = { type: 'root', children: [] };
		
		dom.forEach( (el) => {
			if(el.type === 'tag') {
				let child = { type: el.type, name: el.name, children: [] }
				root.children.push(child);
				traverse(el.children, child);
			}
		})

		var nodes = partition.nodes(root);

		svg.selectAll(".node")
      .data(nodes)
    .enter().append("rect")
      .attr("class", "node")
      .attr("x", function(d) { return d.y; })
      .attr("y", function(d) { return d.x; })
      .attr("width", function(d) { return d.dy; })
      .attr("height", function(d) { return d.dx; })
      .style("fill", function(d) { return color((d.children ? d : d.parent).name); });

		function traverse(nodes,parent) {
			nodes.forEach( (node) => {
				let type = node.type;
				if(type === 'tag') {
					var child = { type: node.type, name: node.name, children: [] }
					parent.children.push(child)

					traverse(node.children, child)
				}
			})
		}
	})

})

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