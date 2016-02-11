"use strict";

let http = require('http');

let port = (process.env.PORT || process.env.VCAP_APP_PORT || 8888);

let chocolateBox = [];

class ChocolateClass {
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

function startMemoryLeak () {
	setInterval (() => {
		chocolateBox.push (new ChocolateClass());
		console.log ('Chocolates: %d', chocolateBox.length);
	}, 1000);
}

io.sockets.on('connection', socket => {
    socket.on('forceCPULoadPeak', msg => {
    	console.error ('About to cause a CPU usage spike');
    	startCPUSpike ();
    });
    
    socket.on('forceServerMemoryLeak', msg => {
    	console.error ('About to start a memory leak');
    	startMemoryLeak ();
    });
});

server.listen(port);

console.log('Server running at http://127.0.0.1:' + port);