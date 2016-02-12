"use strict";

let http = require('http');

let port = (process.env.PORT || process.env.VCAP_APP_PORT || 8888);

let memoryBlocks = [];

class MemoryBlock {
	constructor () {
		// Just allocate unnecessary memory
		this.leak = new Array (500000);
	}
}

let html = require ('fs').readFileSync('./index.html');

let server = http.createServer((request, response) => {  
	response.writeHeader(200, {"Content-Type": "text/html"});
    response.write(html);  
    response.end();  
});

let io = require('socket.io')(server);

function startCPUSpike () {
	const TOTAL_INTEGERS = 10000000;
	let randomIntegers = [];
	console.log (`Start ${TOTAL_INTEGERS} random number generation`);
	// Generate a random integer array in the range [1-100000]
	for (let i = 0; i < TOTAL_INTEGERS; i++) {
		randomIntegers.push(Math.floor(Math.random() * 100000) + 1);
	}
	 
	console.log ('Start sorting');	 
	randomIntegers.sort();
	console.log ('Finished sorting');
	randomIntegers = undefined;
}

var setIntervalId;

function startMemoryLeak () {
	// If not undefined, this is currently 
	// running -> do nothing
	if (setIntervalId !== undefined) {
		return;
	}
	
	setIntervalId = setInterval (() => {
		memoryBlocks.push (new MemoryBlock());
		console.log (`Allocated memory blocks: ${memoryBlocks.length}`);
	}, 1000);
}

function pauseMemoryLeak () {
	if (setIntervalId !== undefined) {
		clearInterval(setIntervalId);
		setIntervalId = undefined;
	}
}

function clearMemoryLeak () {
	pauseMemoryLeak();
	memoryBlocks = []; // Revert to an empty array
}

io.sockets.on('connection', socket => {
    socket.on('forceCPULoadPeak', msg => {
    	console.error ('Forcing a CPU usage spike');
    	startCPUSpike ();
    });
    
    socket.on('startServerMemoryLeak', msg => {
    	console.error ('Starting server memory leak');
    	startMemoryLeak ();
    });
    
    socket.on('pauseServerMemoryLeak', msg => {
    	console.error ('Pausing server memory leak');
    	pauseMemoryLeak ();
    });
    
    socket.on('clearServerMemoryLeak', msg => {
    	console.error ('Clearing server memory leak');
    	clearMemoryLeak ();
    });
});

server.listen(port);

console.log('Server running at http://127.0.0.1:' + port);