function websocket(req,res){
	var raw = req.header.map(x=>x.toLowerCase())
	var sfd = raw.indexOf('sec-fetch-dest')
	sfd = raw[sfd+1]
	var sfm = raw.indexOf('sec-fetch-mode')
	sfm = raw[sfm+1]
	var sfs = raw.indexOf('sec-fetch-site')
	sfs = raw[sfs+1]
	if(sfd == "websocket" && sfm == "websocket" && sfs == "same-origin"){
		var swv = raw.indexOf('sec-webSocket-version')
		swv = raw[swv+1]
		var swe = raw.indexOf('sec-webSocket-extensions')
		swe = raw[swe+1]
		var swk = raw.indexOf('sec-webSocket-key')
		swk = raw[swk+1]

		
		var socket = req.socket
		console.log("I got a Socket")
		var address = socket.address()
		console.log(socket.connecting)
		socket.on('connect',()=>{
			console.log("i connted")
		})
		socket.on('ready',()=>{
			console.log("i ready")
		})
		socket.connect(address.port)
		socket.write("hello")
		socket.end();
		// console.log(socket.connecting)
		// if (req.timeoutCb) {
		// 	socket.setTimeout(0, req.timeoutCb);
		// 	req.timeoutCb = null;
		// }
		// console.log(socket.address())

		// console.log(socket.on)
		// socket.on('data',(data)=>{
		// 	console.log(`Server says: ${data.toString('utf-8')}`)
		// })
		// socket.on('socket',(data)=>{
		// 	console.log(`Server says: ${data.toString('utf-8')}`)
		// })

		// req.emit('information', {
		// 	statusCode: res.statusCode,
		// 	statusMessage: res.statusMessage,
		// 	httpVersion: res.httpVersion,
		// 	httpVersionMajor: res.httpVersionMajor,
		// 	httpVersionMinor: res.httpVersionMinor,
		// 	headers: res.headers,
		// 	rawHeaders: res.rawHeaders
		// });

		// socket.cork();
		// socket.write("hello")
		// socket.uncork();

	}
}

module.exports = websocket