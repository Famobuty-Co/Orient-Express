const { Event } = require("../extra/event");

class WebSokectServer extends Event{
	clients = new Set();
	constructor(app){
		super()
		app.add
	}
	oncreate(){}
}
class WebSokect{
	send(data,options,cb){
		
	}
}
module.exports = {WebSokect,WebSokectServer,setup:(app)=>{
	app.webSocket = new WebSokectServer(app)
	// var page = app.constructor.page
	// page.prototype.addWebSocket = function(){
		// this.script.write(`const ws = new WebSocket('ws://localhost:8000')`)
	// }
},}