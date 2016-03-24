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

// ----------------------------------------------------

var svg = d3.select(visContainer).append("svg")
  .attr("width", visContainer.clientWidth)
  .attr("height", visContainer.clientHeight);

var partition = d3.layout.partition()
  .size([visContainer.clientWidth, visContainer.clientHeight])
  .value(function(d) { return d.size; });

ED.addEventListener('editor_change', (event) => {
	//console.log(event)
	var handler = new htmlparser.DomHandler( function (error, dom) {
		console.log('parsing ...');

		if (error)
			console.log(error)
		else
			console.log(dom);
	}, {withStartIndices:true});
	
	var parser = new htmlparser.Parser(handler, {recognizeSelfClosing: true, decodeEntities: true});
	
	parser.write(event.payload);
	parser.done();
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
