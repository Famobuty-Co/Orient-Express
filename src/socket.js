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
		// socket.cork();
		// socket.write("hello")
		// socket.uncork();

	}
}

module.exports = websocket