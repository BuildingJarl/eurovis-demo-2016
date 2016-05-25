import ace from 'ace';
import EventDispatcher from './EventDispatcher';
import log from 'loglevel';

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
		this.editor.$blockScrolling = Infinity;

		EventDispatcher.addEventListener('editor_change_async_end', (event) => {
			log.debug('Editor event: change async');

			//this could be put into a function
			var cursorPosition = this.editor.selection.getCursor();
			var r = new Range(0, 0, cursorPosition.row, cursorPosition.column);
			var content = this.editor.session.getTextRange(r);
			var newCursorPos = content.length;

			EventDispatcher.dispatchEvent( {type:'editor_cursor_change', payload: newCursorPos} );
		});

		EventDispatcher.addEventListener('vis_click_event', (event) => {
			var startPos = event.payload.start;
			var endPos = event.payload.end;
			
			//editor.gotoLine(row, col) scrolls + animation
			//editor.selection.moveTo(row, col) no scroll
			var rows = this.editor.getValue().split('\n');
			var rowCount = -1;
			var columCount = 0;
			var stopPos = -1;

			//we need to iteratate through all rows
			rows.some( (line) => {
 
				if(stopPos < startPos) {
					rowCount++;
					stopPos++;
					//we need to iterate through line string
					//reset columCount
					columCount = 0;
					line.split('').some( (char) => {

						if(stopPos < startPos) {
							columCount ++;
							stopPos ++;
						} else {
							return true;
						}
					});

				} else {
					return true;
				}

			});
			//ace editor start row count at 1 -> so we need to add 1
			rowCount += 1;

			//currently the cursor position is at the beginning of tag -> so we need to move cursor 1 to right to be in tag
			columCount += 1;
			//log.info(`${rowCount} : ${columCount}`);
			this.editor.gotoLine(rowCount, columCount);
		});

		EventDispatcher.addEventListener('gutter_highlight', (event) => {
			var startPos = event.payload.start;
			var endPos = event.payload.end;
			
			function bla(startPos, rows) {
				var rowCount = -1;
				var columCount = 0;
				var stopPos = -1;

				//we need to iteratate through all rows
				rows.some( (line) => {
	 
					if(stopPos < startPos) {
						rowCount++;
						stopPos++;
						//we need to iterate through line string
						//reset columCount
						columCount = 0;
						line.split('').some( (char) => {

							if(stopPos < startPos) {
								columCount ++;
								stopPos ++;
							} else {
								return true;
							}
						});

					} else {
						return true;
					}

				});
				//ace editor start row count at 1 -> so we need to add 1
				return rowCount;
			}

			var startRow = bla(startPos, this.editor.getValue().split('\n'));
			var endRow = bla(endPos, this.editor.getValue().split('\n'));
			
			this.highlightCorrispondingGutterLines({start: startRow, end: endRow});
		});

		EventDispatcher.addEventListener('gutter_highlight_reset', (event) => {
			this.gutter_highlight_reset();
		});

		EventDispatcher.addEventListener('editor_loadHTML', (event) => {
			this.editor.setValue(event.payload);
			this.editor.gotoLine(1, 0, true);
		});
		
		this.editor.on('change', (change,target)=> {	
			log.debug('Editor event: change');

			EventDispatcher.dispatchEvent( {type:'editor_change', payload: this.editor.getValue()} );
		});

		this.editor.selection.on('changeCursor', (event)=> {
			log.debug('Editor event: cursor change');

			//this could be put into a function
			var cursorPosition = this.editor.selection.getCursor();
			var r = new Range(0, 0, cursorPosition.row, cursorPosition.column);
			var content = this.editor.session.getTextRange(r);
			var newCursorPos = content.length;

			EventDispatcher.dispatchEvent( {type:'editor_cursor_change', payload: newCursorPos} );
		});
	}

	highlightCorrispondingGutterLines(r) {

		var rows = this.editor.session.getLength();

		for ( let i = 0; i < rows; i++) { 

			if(i >= r.start && i <= r.end) {
				//this has to be here since it will keep adding the same class
				this.editor.getSession().removeGutterDecoration( i, 'editor-gutter-highlight' );
				this.editor.getSession().addGutterDecoration( i, 'editor-gutter-highlight' );
			} else {
				this.editor.getSession().removeGutterDecoration( i, 'editor-gutter-highlight' );
			}
		}
	}

	gutter_highlight_reset() {
		var rows = this.editor.session.getLength();

		for ( let i = 0; i < rows; i++) { 
			this.editor.getSession().removeGutterDecoration( i, 'editor-gutter-highlight' );
		}
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