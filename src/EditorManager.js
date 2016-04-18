import ace from 'ace';
import EventDispatcher from './EventDispatcher';

var Range = ace.require('ace/range').Range;

// settings for ace
let base = System.normalizeSync('ace');
base = base.substr(0, base.length - 3);
ace.config.set('basePath', base);

var options = {
	fontSize: "12pt",
	readOnly: false,
	highlightActiveLine: true,
	showPrintMargin: false,
	wrap: true
};

export default class EditorManager {
	

	constructor(container, mode) {
		this.editor = ace.edit(container);
		this.editor.setTheme('ace/theme/monokai');
		this.editor.getSession().setMode('ace/mode/' + mode);
		this.editor.setOptions(options);

		EventDispatcher.addEventListener('editor_change_async_end', (event) => {
			var cursorPosition = this.editor.selection.getCursor();
			var r = new Range(0, 0, cursorPosition.row, cursorPosition.column);
			var content = this.editor.session.getTextRange(r);
			var newCursorPos = content.length;

			EventDispatcher.dispatchEvent( {type:'editor_cursor_change', payload: newCursorPos} );
		});

		this.editor.on('change', (change,target)=> {	
			EventDispatcher.dispatchEvent( {type:'editor_change', payload: this.editor.getValue()} );
		});

		this.editor.selection.on('changeCursor', (event)=> {
			
			var cursorPosition = this.editor.selection.getCursor();
			var r = new Range(0, 0, cursorPosition.row, cursorPosition.column);
			var content = this.editor.session.getTextRange(r);
			var newCursorPos = content.length;

			EventDispatcher.dispatchEvent( {type:'editor_cursor_change', payload: newCursorPos} );
		});
	}
}







/*
editor.on("copy", function() {
	console.log('copy');
});

editor.on("paste", function() {
	console.log('paste');
});
*/