
const TWIG = require('./twig')
const {Annoted } = require("../extra/annoted");
const { loadFile } = require("../extra/static");
const path = require("path");
const { Document, Component, create } = require('../bundles/ui');
const { debug } = require('console');

const orient = {
	annotations : require("./../annotations"),
	createControler:function(controller,data = {}){
		Annoted(controller)
		var _templatesPath = data.templates
		var app = data.app
		controller.prototype.database = app.database
		controller.prototype.getDoctrine = function(entity){
			return app.getEntity(entity)
		}
		controller.prototype.renderForm = function(...args){
			return app.createForm(...args)
		}
		controller.prototype.loadFile = function(file){
			return loadFile(file)
		}
		controller.prototype.render = function(file,option){
			var _path = path.join(process.cwd(),_templatesPath,file)
			var content = loadFile(_path)
			return orient.parse(content,option,{
				path:path.join(process.cwd(),_templatesPath),
			})
		}
		controller.prototype.renderToString = function (render,{title,app}){
			if(typeof render == "string"){
				return render
			}else{
				if(render instanceof Document){
					return render.toString()
				}else if(render instanceof Component){
					doc = new Document(title,app)
					doc.append(render)
					return doc.toString()
				}
			}
			return "NO CONTENT"
		}
		var Anno_route = controller.getAnnotations().find("route")
		var baseURL = "/"
		if(Anno_route){
			baseURL = Anno_route.getAnnotationValues()[0]
		}
		
		controller.getAnnotedMethods().forEach(method=>{
			(function(baseURL,method){
				var path = `${baseURL}/${method}`
				path = path.replace(/\/+/g,"/")
				console.log(baseURL,method,path);
				var name = `${controller.name}.${method}`;
				var callback = function(req, res){
					console.log(method,baseURL);
					controller._instance.response = res
					controller._instance.request = req
					controller._instance.app = app
					var annotations = controller.getAnnotations(method)
					console.info(`${annotations} on ${callback.name} for ${path}`);
					annotations.forEach(annotation=>{
						var annotationName = annotation.getAnnotationName()
						if(orient.annotations[annotationName]){
							console.info(`${annotation} is call`);
							orient.annotations[annotationName](req,res,{
								method,
								app,
								annotation,
								annotationName,
								controller,
								baseURL,
							})
						}else{
							console.warn(`${annotation} is unkown`);
						}
					})
				}
				app.addRoute(path,callback)
			})(baseURL,method);
		})
	},
	parse:function (OrientHTML="",options={},env) {
		// console.log(OrientHTML)
		// orient.automateOrientHTML.analayser(OrientHTML)
		env = env||{}
		env.path = env.path ||"./"
		TWIG.setEnvPath(env.path)
		if(OrientHTML)
			return TWIG.execute(OrientHTML,options)
		return null
	},
}
module.exports = orient