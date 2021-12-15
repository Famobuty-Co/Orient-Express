const { Event } = require("../extra/event");
const websocket = require("../socket");

class WebSokectServer extends Event{
	clients = new Set();
	constructor(app){
		super()
	}
	oncreate(){}
}
// class WebSokect{
// 	send(data,options,cb){
		
// 	}
// }
class WebSocketClient{
	constructor(){
	}
	onopen = ()=>{}
	onclose = ()=>{}
	onerror = ()=>{}
	onmessage = ()=>{}
	send(message){
		var data = {
			body:message,
		}
		this.#res.send(JSON.stringify(data))
	}
	#res
	receive(body,res){
		this.#res = res
		this.onmessage(body.data)
	}
}
class WebSocketServer{
	#reponse(req,res){
		var raw = req.header.map(x=>x.toLowerCase())
		var sfd = raw.indexOf('request-type')
		sfd = raw[sfd+1]
		if(sfd == "websocket"){
			req.on("end").then(()=>{
				var body = req.body
				try{
					body = JSON.parse(body)
				}catch{
					res.close()
					return
				}
				if(body.sessionid != undefined){
					this.#clients[body.sessionid].receive(body,res)
				}else{
					var createConnection = this.#connection()
					res.send(createConnection)
				}
				res.close()
			})
		}else{
			res.close()
		}
	}
	#clients = new Array
	constructor(route,app){
		app.addRoute(route,(req,res)=>{
			this.#reponse(req,res)
		})
	}
	#connection(){
		var wsc = new WebSocketClient()
		wsc.sessionid = this.#clients.length
		this.#clients.push(wsc)
		this.onconnect(wsc)
		return `{"sessionid":${wsc.sessionid}}`
	}
	onconnect = ()=>{}
}
class WebSocket{
	#request(optns,callback = ()=>{}){
		try{
			fetch(this.#url,optns).then(response=>{
				if(response.status == 200){
					response.json().then(json=>{
						callback(json)
					})
				}else{
					this.onerror(response)
				}
			})
		}catch(e){
			this.onerror(e)
		}
	}
	#url = location;
	#sessionid;
	constructor(url){
		this.#url = url
		this.#request({
			method:"POST",
			headers: {
				'Content-Type': 'application/json;charset=utf-8',
				'Request-Type': 'WebSocket'
			},
			body:"{}",
		},(json)=>{
			this.#sessionid = json.sessionid
			this.onopen(json)
		})
	}
	#createRequest(message){
		var data = {
			sessionid:this.#sessionid,
			data:message,
		}
		return {
			method:"POST",
			headers: {
				'Content-Type': 'application/json;charset=utf-8',
				'Request-Type': 'WebSocket'
			},
			body:JSON.stringify(data),
		}
	}
	#recieve(json){
		this.onmessage(json.body)
	}
	onopen = ()=>{}
	onclose = ()=>{}
	onerror = ()=>{}
	onmessage = ()=>{}
	send(message){
		this.#request(this.#createRequest(message),(json)=>this.#recieve(json))
	}
	close(){
		this.onclose()
	}
}
module.exports = {WebSocket,setup:(app)=>{
	app.webSocket = new WebSokectServer(app)
	app.createSocketServer = function(route = "/"){
		app.websocketserver = route.startsWith('/')?route:`/${route}`
		// app.addRoute(route,websocket)
		wss = new WebSocketServer(route,app)
		return wss
	}
	var page = app.constructor.page
	page.prototype.addWebSocket = function(){
		if(!app.createSocketServer)throw "please use `app.createSocketServer()`"
		this.scripts.write(`${WebSocket.toString()}const sockets = new WebSocket(\`\${location}${app.websocketserver}\`);sockets.onopen = ()=>console.log("open")
		sockets.onmessage = (msg)=>console.log("message",msg)
		sockets.onclose = ()=>console.log("close")`)
		// this.scripts.write(`const ws = new WebSocket(\`ws://\${location.host}${app.websocketserver}\`);ws.onopen = ()=>{console.log("I got a server")};console.log("request send")`)
	}
},}