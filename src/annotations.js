const { info } = require("./extra/console");

module.exports = {
	"socket":function Socket(req, res,{method,controller,app}){
		const wss = app.getSocketServer()
		wss.onconnect = client=>{
			client.onmessage = message=>{
				var render = controller._instance[method](message,client)
				if(typeof render == "string"){
					client.send(render)
				}
				client.end()
			}
		};
		wss.sendResponse(req,res)
	},
	"route":function Route(req, res,{method,controller,app}){
			var render = controller._instance[method](req, res)
			var title = method;
			if(render instanceof Promise){
				render.then(text=>{
					var str = controller._instance.renderToString(text,{app,title,})
					res.send(str)
				})
			}else{
				var str = controller._instance.renderToString(render,{app,title,})
				res.send(str)
			}
	},
	"authenticated":function(req,res,{method,controller,annotation,app}){
		var session = req.getSession()
		console.log("Session",session.isAuthenticated())
		if(session.isAuthenticated()){
			module.exports.route(req,res,{method,controller,app})
		}else{
			info("redirect to",annotation.getAnnotationValues())
			res.redirect(annotation.getAnnotationValues())
		}
	},
	"authenticate":function(req,res,{method,controller,annotation,app}){
		if(req.method != "POST"){
			module.exports.route(req,res,{method,controller,app})
		}
		req.getBody().then(body=>{
			var session = req.getSession()
			for(var field in body){
				session.setAttribute(field,body[field])
			}
			var source = app.getEntity(annotation.getAnnotationValues()[0])
			if(session.authenticate(source)){
				info("redirect to",annotation.getAnnotationValues())
				res.redirect(annotation.getAnnotationValues()[1])
			}else{
				module.exports.route(req,res,{method,controller,app})
			}
		})
	},
}