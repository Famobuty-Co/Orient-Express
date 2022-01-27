function alive(){
	window.addEventListener("load",()=>{
		const aliveElements = [...document.querySelectorAll('*')].filter(x=>Object.values(x.attributes).some(x=>x.nodeName.startsWith("@")))
		aliveElements.forEach(x=>{
			x.name = Object.values(x.attributes).find(x=>x.nodeName.startsWith("@")).nodeName.slice(1)
			x.checkAliveName = function(name){
				return !!Object.values(x.attributes).find(x=>x.nodeName==`@${name}`)
			}
		})
		console.log(aliveElements)
		const ws = new WebSocket(WebSocket.server)
		ws.onopen = ()=>{
			aliveElements.forEach(x=>{
				ws.send({
					type:"@",
					elements:x,
				})
			})
		}
		ws.onclose = ()=>console.log("close")
		ws.onmessage = (msg)=>{
			if(!msg)return
			if(msg.type == "@"){
				var name = msg.name
				console.log(name)
				aliveElements.filter(x=>x.checkAliveName(name)).forEach(x=>{
					console.log(x)
					x.innerHTML = msg.value
				})
			}
		}
		window.sockets = ws
	})
}

module.exports = {setup:(app)=>{
		app.addRoute("/scripts/alive.js",(req,res)=>{
			res.send(`WebSocket.server = "${app.websocketserver}";\n`+alive.toString()+";alive()")
		})
	},
}