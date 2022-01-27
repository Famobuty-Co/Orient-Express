const fs = require("fs");
const path = require("path");
const { noop, loadFile } = require("../extra/static");
const orient = require("../orient");
App = require("./app")

class Entity{
	addField(name,type){
		this[name] = (typeof type == "string")?type:(type.constructor.name||type.toString())
		return this
	}

}

class Controller{
	annoations = new Map
	constructor(name){
		this.filename = name
	}
	setRoute(path){
		this.annoations.set("route",path)
	}
	#pages = []
	createPage(name,render,renderoptn,page){
		this.#pages.push({
			name,route:name,
			render,renderoptn,
		})
	}
	toString(){
return `class ${this.filename}{
	"route /${this.annoations.get("route")}"
${this.#pages.map(page=>{
	return `	${page.name}(){
		"route /${page.route}"
		return this.render("${page.render}",
			${page.renderoptn}
		);
	}`}).join('\n')}
}`
	}
}

class ClassApp extends App{
	#templatesPath = "./"
	#entitiesPath = "./"
	#componentsPath = "./"
	#controllersPath = "./"
	#controllers = new Set
	setTemplates(path){
		this.#templatesPath = path
	}
	setEntities(path){
		this.#entitiesPath = path
		this.loadEntities()
	}
	#entities = {}
	loadEntity(file){
		var _path = path.join(process.cwd(),this.#entitiesPath,file)
		var entity = require(_path)
		this.#entities[entity.name] = entity
	}
	loadEntities(){
		var files = fs.readdirSync(this.#entitiesPath)
		files.forEach(file=>{
			this.loadEntity(file)
		})
	}
	setComponents(path){
		this.#componentsPath = path
		this.loadComponents()
	}
	#components = new Map
	loadComponent(file){
		if(! this.#components.has(file)){
			var _path = path.join(process.cwd(),this.#controllersPath,file)
			

		}
	}
	loadComponents(){
		var files = fs.readdirSync(this.#controllersPath)
		files.forEach(file=>{
			this.loadComponent(file)
		})
	}
	setControllers(path){
		this.#controllersPath = path
		this.loadControllers()
	}
	loadController(file){
		if(! this.#controllers.has(file)){
			var _path = path.join(process.cwd(),this.#controllersPath,file)
			var controller = require(_path)
			orient.createControler(controller,{
				templates:this.#templatesPath,
				app:this,
			})
			this.#controllers.add(file)
		}else{
			console.log("already open")
		}
	}
	loadControllers(){
		// this.accesTable.clear()
		var files = fs.readdirSync(this.#controllersPath)
		files.forEach(file=>{
			this.loadController(file)
		})
	}
	findAction(req,res){
		var action = super.findAction(req,res)
		if(!action || action == noop){
			this.loadControllers()
			action = super.findAction(req,res)
		}
		console.log(action)
		return action
	}
	startDatabase(name = "db"){
		var entities = Object.values(this.#entities)
		var data = {
			name,
			entities
		}
		console.log(data)
		this.createDatabaseConnection(data)
	}
	login(...args){
		this.startDatabase()
		console.log("login")
		super.login(...args)
	}
	constructor(name){
		super()
		this.name = name
		use("websocket",this)
		use("form",this)
		use("admin",this)
	}
}
function use(lib,that){
	var {setup} = require(`../bundles/${lib}`);
	setup(that)
}

var _create = function (name){
	return new ClassApp(name)
}
_create.createController = function(name){
	return new Controller(name)
}
_create.createEntity = function(name){
	return new Entity(name)
}
module.exports = _create