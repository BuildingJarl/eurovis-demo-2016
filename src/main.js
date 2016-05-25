import MinimapManger from './MinimapManager';
import EditorManager from './EditorManager';
import EventDispatcher from './EventDispatcher';
import sampleHTML from './sampleHTML.html!text';
import helpText from './helpText.html!text';


//D3 tree orientation
//http://bl.ocks.org/mbostock/3184089



// remove loading screen
var child = document.getElementById("loadingFiller");
child.parentNode.removeChild(child);

// add view
document.getElementById("container-main").style.display = "block";

//setup button events
document.getElementById('buttonOne').addEventListener('click', () => {
	EventDispatcher.dispatchEvent( {type:'editor_loadHTML', payload: sampleHTML} );
});

document.getElementById('buttonTwo').addEventListener('click', () => {
	EventDispatcher.dispatchEvent( {type:'editor_loadHTML', payload: ''} );
});

document.getElementById('buttonThree').addEventListener('click', () => {
	EventDispatcher.dispatchEvent( {type:'editor_loadHTML', payload: helpText} );
});

//add vis and editor
var editorManager = new EditorManager( document.getElementById('container-ace'),'html');
var minimapManger = new MinimapManger( document.getElementById('container-vis') );

EventDispatcher.dispatchEvent( {type:'editor_loadHTML', payload: helpText} );
