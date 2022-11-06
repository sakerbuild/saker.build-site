const TYPE_BYTE = 1;
const TYPE_SHORT = 2;
const TYPE_INT = 3;
const TYPE_LONG = 4;
const TYPE_OBJECT = 5;
const TYPE_ARRAY = 6;
const TYPE_STRING = 7;
const TYPE_NULL = 8;
const TYPE_ARRAY_NULL_BOUNDED = 9;
const TYPE_OBJECT_EMPTY_BOUNDED = 10;
const TYPE_BYTE_ARRAY = 11;
const TYPE_BOOLEAN_TRUE = 12;
const TYPE_BOOLEAN_FALSE = 13;
const TYPE_FLOAT_AS_STRING = 14;
const TYPE_DOUBLE_AS_STRING = 15;
const TYPE_EXCEPTION_STACKTRACE = 16;
function readProgress(buffer) {
	let percent = buffer.idx / buffer.buffer.length;
	if (buffer.lastPercent == null || percent - buffer.lastPercent > 0.01) {
		buffer.lastPercent = percent;
		self.postMessage({
			type: 'progress',
			percent: percent
		});
	}
};
function readByte(buffer) {
	let b1 = buffer.buffer[buffer.idx++];
	if(b1 === undefined) {
		throw "EOF";
	}
	return b1;
};
function readShort(buffer) {
	let b1 = buffer.buffer[buffer.idx++];
	let b2 = buffer.buffer[buffer.idx++];
	if(b1 === undefined || b2 === undefined) {
		throw "EOF";
	}
	return (b1 << 8) | b2;
};
function readInt(buffer) {
	let b1 = buffer.buffer[buffer.idx++];
	let b2 = buffer.buffer[buffer.idx++];
	let b3 = buffer.buffer[buffer.idx++];
	let b4 = buffer.buffer[buffer.idx++];
	if(b1 === undefined || b2 === undefined || b3 === undefined || b4 === undefined) {
		throw "EOF";
	}
	return (b1 << 24) | (b2 << 16) | (b3 << 8) | b4;
};
function readLong(buffer) {
	let b1 = buffer.buffer[buffer.idx++];
	let b2 = buffer.buffer[buffer.idx++];
	let b3 = buffer.buffer[buffer.idx++];
	let b4 = buffer.buffer[buffer.idx++];
	let b5 = buffer.buffer[buffer.idx++];
	let b6 = buffer.buffer[buffer.idx++];
	let b7 = buffer.buffer[buffer.idx++];
	let b8 = buffer.buffer[buffer.idx++];
	if(b1 === undefined || b2 === undefined || b3 === undefined || b4 === undefined ||
		b5 === undefined || b6 === undefined || b7 === undefined || b8 === undefined) {
		throw "EOF";
	}
	let i1 = ((b1 << 24) | (b2 << 16) | (b3 << 8) | (b4));
	let i2 = (((b5 << 24) | (b6 << 16) | (b7 << 8) | b8));
	//needs multiplication as shifting is 32 bit only
	if (i2 >= 0) {
		return i1 * 0x100000000 + i2;
	}
	//needs to fix if i2 is negative
	return i1 * 0x100000000 + 0x100000000 + i2;
};
function readString(buffer) {
	let len = readInt(buffer);
	let charbuf = new Array(len);
	for(let i = 0; i < len; i++) {
		let c = readShort(buffer);
		charbuf[i] = String.fromCharCode(c);
	}
	readProgress(buffer);
	return charbuf.join('');
};
function readObject(buffer, listener) {
	let type = readByte(buffer);
	switch (type) {
		case TYPE_BYTE: {
			return readByte(buffer);
		}
		case TYPE_SHORT: {
			return readShort(buffer);
		}
		case TYPE_INT: {
			return readInt(buffer);
		}
		case TYPE_LONG: {
			return readLong(buffer);
		}
		case TYPE_OBJECT: {
			let len = readInt(buffer);
			let result = {
			};
			for(let i = 0; i < len; i++) {
				let name = readString(buffer);
				let value = readObject(buffer, listener);
				result[name] = value;
			}
			readProgress(buffer);
			return result;
		}
		case TYPE_ARRAY: {
			let len = readInt(buffer);
			let array = new Array(len);
			for(let i = 0; i < len; i++) {
				array[i] = readObject(buffer, listener);
			}
			readProgress(buffer);
			return array;
		}
		case TYPE_STRING: {
			let str = readString(buffer);
			readProgress(buffer);
			return str;
		}
		case TYPE_NULL: {
			return null;
		}
		case TYPE_ARRAY_NULL_BOUNDED: {
			let array = new Array();
			while (true) {
				let obj = readObject(buffer, listener);
				if (obj == null) {
					break;
				}
				array.push(obj);
			}
			readProgress(buffer);
			return array;
		}
		case TYPE_OBJECT_EMPTY_BOUNDED: {
			let result = {
			};
			while (true) {
				let name = readString(buffer);
				if (name == "") {
					break;
				}
				let value = readObject(buffer, listener);
				result[name] = value;
			}
			readProgress(buffer);
			return result;
		}
		case TYPE_BYTE_ARRAY: {
			let len = readInt(buffer);
			let result = buffer.buffer.slice(buffer.idx, buffer.idx + len);
			buffer.idx += len;
			
			return new TextDecoder().decode(result);
		}
		case TYPE_BOOLEAN_TRUE: {
			return true;
		}
		case TYPE_BOOLEAN_FALSE: {
			return false;
		}
		case TYPE_FLOAT_AS_STRING:
		case TYPE_DOUBLE_AS_STRING: {
			let str = readString(buffer);
			readProgress(buffer);
			return Number(str);
		}
		case TYPE_EXCEPTION_STACKTRACE: {
			let str = readString(buffer);
			let result = {
				__bt_type: 'exception_stacktrace',
				stackTraceString: str
			};
			if (listener != null && listener.onReadException != null) {
				listener.onReadException(result);
			}
			readProgress(buffer);
			return result;
		}
		default: {
			throw "unknown-type " + type;
		}
	}
}

const CONSOLE_MARKER_STR_PATTERN = /[ \t]*(\\[(?:.*?)\\])?[ \t]*(((.*?)(:(-?[0-9]+)(:([0-9]*)(-([0-9]+))?)?)?):)?[ ]*([wW]arning|[eE]rror|[iI]nfo|[sS]uccess|[fF]atal [eE]rror):[ ]*(.*)/;
const CONSOLE_MARKER_GROUP_DISPLAY_ID = 1;
const CONSOLE_MARKER_GROUP_PATHANDLOCATION = 3;
const CONSOLE_MARKER_GROUP_FILEPATH = 4;
const CONSOLE_MARKER_GROUP_LINE = 6;
const CONSOLE_MARKER_GROUP_LINESTART = 8;
const CONSOLE_MARKER_GROUP_LINEEND = 10;
const CONSOLE_MARKER_GROUP_SEVERITY = 11;
const CONSOLE_MARKER_GROUP_MESSAGE = 12;

function parseInput(buffer) {
	let magic = readInt(buffer);
	if (magic != 0x45a8f96a) {
		throw "Invalid input";
	}
	let version = readInt(buffer);
	if (version != 1) {
		throw "Unsupported version " + version;
	}
	let bt = {
		_custom_exceptions: [],
		_exception_count: 0
	};
	let exceptiontraceidcounter = 0;
	while (true) {
		let str;
		try {
			str = readString(buffer);
		} catch(e) {
			if (e != "EOF") {
				console.log("TODO read error: " + e);
			}
			break;
		}
		try {
			bt[str] = readObject(buffer, {
				onReadException: function (exc) {
					exc.trace_id = exceptiontraceidcounter++;
					bt._custom_exceptions.push(exc);
					bt._exception_count++;
				}
			});
		} catch(e) {
			throw "Read error " + e;
		}
	}
	function compareDuration(l, r){
		let ldur = l.end - l.start;
		let rdur = r.end - r.start;
		return rdur - ldur;
	};
	bt.tasks.sort(compareDuration);
	bt._tasks_by_trace_id = {
	};
	bt.tasks.forEach(function(task){
		if (task.trace_id != null) {
			bt._tasks_by_trace_id[task.trace_id] = task;
		}
		task._created_by = [];
		if (task.inner_tasks != null) {
			task.inner_tasks.sort(compareDuration);
		}
	});
	let totalwarningcount = 0;
	let totalexceptioncount = 0;
	let exceptionseverity = 10;
	if (bt.ignored_exceptions != null) {
		totalexceptioncount += bt.ignored_exceptions.length;
		exceptionseverity = Math.min(exceptionseverity, 3);
	}
	bt.tasks.forEach(function(task){
		if (task.created_tasks != null && task.created_tasks.length > 0) {
			task.created_tasks.forEach(function(createdtasktraceid){
				let createdtask = bt._tasks_by_trace_id[createdtasktraceid];
				if (createdtask == null) {
					return;
				}
				createdtask._created_by.push(task);
			});
		}
		let exceptioncount = 0;
		let warningcount = 0;
			
		if(task.exception != null) {
			++exceptioncount;
			exceptionseverity = 1;
		}
		if(task.abort_exceptions != null) {
			exceptioncount += task.abort_exceptions.length;
			exceptionseverity = Math.min(exceptionseverity, 2);
		}
		if(task.ignored_exceptions != null) {
			exceptioncount += task.ignored_exceptions.length;
			exceptionseverity = Math.min(exceptionseverity, 3);
		}
		
		if (task.stdout != null) {
			let arrayOfLines = task.stdout.match(/[^\r\n]+/g);
			for (let i = 0; i < arrayOfLines.length; ++i){
				let line = arrayOfLines[i];
				let match = CONSOLE_MARKER_STR_PATTERN.exec(line);
				if (match != null) {
					let severity = match[CONSOLE_MARKER_GROUP_SEVERITY];
					if (severity != null) {
						if(severity.toLowerCase() == 'warning') {
							++warningcount;
						}
					}
				}
			}
		}
		if (task.inner_tasks != null) {
			task.inner_tasks.forEach(function(innertask) {
				if(innertask.exception != null) {
					++exceptioncount;
				}
			});
		}
		
		task._exception_count = exceptioncount;
		totalexceptioncount += exceptioncount;
		
		task._warning_count = warningcount;
		totalwarningcount += warningcount;
	});
	bt._warning_count = totalwarningcount;
	bt._exception_count += totalexceptioncount;
	bt._artifact_count = bt.artifacts == null ? 0 : Object.keys(bt.artifacts).length;
	switch(exceptionseverity) {
		case 1: {
			bt._exception_severity = 'fatal';
			break;
		}
		case 2: {
			bt._exception_severity = 'abort';
			break;
		}
		case 3: {
			bt._exception_severity = 'ignored';
			break;
		}
		case 10: {
			//not assignd
			bt._exception_severity = 'ignored';
			break;
		}
	}
	return bt;
}

function parseBufferInputImpl(buffer, zipentryname){
	let bt;
	try {
		bt = parseInput(buffer);
	}catch (e) {
		self.postMessage({
			type: 'exception',
			exception: e,
			zip_entry_name: zipentryname
		});
		return;
	}
	self.postMessage({
		type: 'done',
		result: bt,
		zip_entry_name: zipentryname
	});
}

self.addEventListener('message', function(e) {
	let mimetype = e.data.mime_type;
	let entryname = e.data.zip_entry_name;
	if (mimetype != null && mimetype.indexOf('application/zip') >= 0) {
		//read as zip
		self.importScripts('jszip.min.js');
		
		new JSZip().loadAsync(e.data.buffer.buffer)
		.then(function(zip) {
		    let loadfile;
		    if(entryname != null) {
		    	loadfile = zip.files[entryname];
		    	if(loadfile == null) {
		    		let entrynames = [];
		    		Object.values(zip.files).forEach(function(fobj){
				    	if (fobj.dir) {
				    		return;
				    	}
				    	entrynames.push(fobj.name);
				    });
		    		self.postMessage({
						type: 'exception',
						exception: 'ZIP entry not found: ' + entryname,
						zip_entry_names: entrynames
					});
		    		return;
		    	}
		    }else{
				let thefiles = [];
			    Object.values(zip.files).forEach(function(fobj){
			    	if (fobj.dir) {
			    		return;
			    	}
			    	thefiles.push(fobj);
			    });
			    if(thefiles.length == 0) {
			    	self.postMessage({
						type: 'exception',
						exception: 'No files found in ZIP archive.'
					});
					return;
			    }
			    if(thefiles.length == 1) {
			    	loadfile = thefiles[0];
			    } else {
			    	let traceending = [];
			    	thefiles.forEach(function(f) {
			    		if(f.name.toLowerCase().endsWith('.trace')) {
			    			traceending.push(f);
			    		}
			    	});
			    	if(traceending.length == 1) {
			    		loadfile = traceending[0];
			    	} else {
			    		let entrynames = [];
			    		thefiles.forEach(function(f){ entrynames.push(f.name); });
			    		self.postMessage({
							type: 'exception',
							exception: 'Failed to determine build trace file to load from ZIP.',
							zip_entry_names: entrynames
						});
						return;
			    	}
			    }
		    }
		    loadfile.async('uint8array').then(function(data){
		    	parseBufferInputImpl({
		    		buffer: data,
		    		idx: 0
		    	}, loadfile.name);
		    });
		});
		return;
	}
	parseBufferInputImpl(e.data.buffer);
}, false);