App = require("./app")
const {Component,create,createEvent,Document} = require("../bundles/ui");
const Table = require('../shinjuku/table');
const Database = require("../shinjuku/database");

class FastPage extends Document{
	#app = null
	constructor(root,app){
		super()
		this.path = root
		this.#app = app
	}
	append(...args){
		if(this.body){
			this.body.append(...args)
		}else{
			super.append(...args)
		}
		return this
	}
	static loadEvent = "pageloading"
	createSession(request){
		var page = this.clone()
		if(page.hasEventListener(FastPage.loadEvent)){
			page.dispatchEvent(createEvent(FastPage.loadEvent,{target:page,app:this.#app,request}))
			page.removeEventListener(FastPage.loadEvent)
		}
		return page
	}
	getRoute(){
		return this.path
	}
}
class FastEntity{
	addField(name,type){
		this[name] = (typeof type == "string")?type:(type.constructor.name||type.toString())
		return this
	}

}
class FastApp extends App{
	static page = FastPage
	constructor(name){
		super()
		this.name = name
	}
	paths = {}
	path(accesName){
		var page = this.paths[accesName]
		if(!page)return "null"
		return page
		// return page.getRoute?page.getRoute():"null"
	}
	createPage(root,name){
		var page = new FastPage(root,this)
		this.paths[name||root.slice(1)] = page
		this.addRoute(root,function fastPage(req, res) {var _page  = page.createSession(req);res.send(_page)})
		this.onpagecreate?.call(page)
		return page
	}
	#hasDatabase = false
	#entities = {}
	createEntity(name){
		var table = new FastEntity()
		this.#entities[name] = table
		this.#hasDatabase = true
		return table
	}
	getEntity(name){
		return this.database.tables[name]
	}
	startDatabase(name = this.name){
		var entities = this.#entities
		var data = {
			name,
			entities
		}
		this.createDatabaseConnection(data)
		this.#hasDatabase = false
	}
	login(...args){
		if(this.#hasDatabase)
			this.startDatabase()
		super.login(...args)
	}
	use(lib){
		if(typeof lib == "string"){
			var {setup} = require(`../bundles/${lib}`);
			setup(this)
		}else{
			
		}
	}
}

module.exports = function (name){
	return new FastApp(name)
}