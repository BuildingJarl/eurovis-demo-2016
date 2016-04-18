import MinimapManger from './MinimapManager';
import EditorManager from './EditorManager';



//D3 tree orientation
//http://bl.ocks.org/mbostock/3184089



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

//
var editorManager = new EditorManager( aceContainer,'html');
var minimapManger = new MinimapManger( visContainer );