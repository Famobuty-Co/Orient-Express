const http = require("http");
const fs = require("fs");
const path = require("path");
const Route = require("./src/route.js");
const SQL = require("./src/shinjuku");
const {Event} = require("./src/event.js");
const web = require("./src/web.js");
const {Form} = require("./src/form.js");
const {Card} = require("./src/card");
const bundles = require("./src/bundles.js");
const assets = require("./src/assets.js");
const debug = require("./src/console");
const {noop} = require("./src/static");
const { exec, execSync } = require("child_process");

function loadFile(file){
	if(!path.isAbsolute(file)){
		file = file=="/"?"index.html":file;
		file="./"+file
	}
	if(!fs.existsSync(file) && fs.existsSync(file+".html")){
		file += ".html"
	}
	if(fs.existsSync(file)){
		return fs.readFileSync(file,{encoding:'utf8', flag:'r'})
	}else{
		return null
	}
}
const include = loadFile
const orient = {
	extends:function (file){
		return include(file)
	},
	acces:{
		free:function (req, res) {
			res.sendFile("./"+req.originalUrl.split('?')[0])
		},
		private:function (req, res) {res.sendFile("./"+req.originalUrl.split('?')[0])},
		// query:function (req, res) {res.sendFile("./"+req.originalUrl.split('?')[0]+req.query.file)},
		combine:(...files)=>{
			return function (req, res) {var dir = "./"+req.originalUrl.split('/').slice(0,-1).join('/')+"/";var file = files.map(w=>loadFile(dir+w)).join("\n");res.send(file)}
		},
		switch:(obj)=>{
			return function (req, res) {
				var file = obj.default
				var pages
				if(pages = Object.keys(req.query).reduce((p,query)=>Object.keys(obj.keys).includes(query)?[...p,query]:p,[])){
					console.log(pages)
					file = obj[pages[0]]
				}
				var content = orient.include(file);
				content = orient.parse(content,{request:req,response:res});
				res.send(content)
			}
		},
		create:(fileSelector)=>{
			return function (req, res) {fileSelector(req, res)}
		},
		file:(file)=>{
			return function (req, res) {res.sendFile(file)}
		},
		root:function(){
			return this.orient("./index.html")
		},
		orient:(file)=>{
			return {
				default:function (req, res) {
					if(!file){
						file = req.originalUrl.split('/').slice(-1).join('/');
						if(file.search('.')==-1){file+="index.html"}};
						var dir = "./"+req.originalUrl.split('/').slice(0,-1).join('/')+"/";
						var content = loadFile(dir+file);
						console.log(dir+file)
						content = orient.parse(content,{request:req,response:res});
						res.send(content)},
				static:true,
			}
		},
		queryFile:(file)=>{
			return (req,res)=>{
						if(!req.file){
							file = req.file
						}
						var content = orient.include(file);
						content = orient.parse(content,{request:req,response:res});
						res.send(content)
					}
		}
	},
	include:function(file,params){
		var content = loadFile(file)
		if(!file)return null
		content = orient.parse(content,params);
		return content
	},
	execute : (OrientJS,options = {})=>{
		if(!options.request)options.request = {}
		if(!options.response)options.response = {}
		if(!options.app){
			options.app = options.request.app||options.response.app||orient
		}
		OrientJS = (new Function("orient","app",
		`var _echo_msg = [];
		const echo = (...value)=>{_echo_msg.push(...value);};
		with(orient){
			${OrientJS}
		};
		return _echo_msg.join('')`))(orient.libs,options);
		return OrientJS
	},
	parse : function(OrientHTML="",options={}){
		var startBlock = /<\?orient/
		var endBlock = /\?>/
		try{

			OrientHTML = OrientHTML.split(startBlock)
			OrientJS = OrientHTML.slice(1).map(w=>w.split(endBlock)[0])
			
			OrientJS = OrientJS.map(x=>{
				return this.execute(x,options)
			})
			
			OrientHTML = OrientHTML.map((w,n)=>{
				if(n==0)return w
				w = w.split(endBlock)
				w[0] = OrientJS[n-1]
				return w.join('')
			}).join('')
			try{
				var app = (options.request||options.response||orient).app||{}
				translate = (new Function("orient","app","options",`try{with(orient){with(orient.libs){with(app){with(options){html = \`${OrientHTML}\`}}}}}catch(e){html = e};return html`))
				OrientHTML = translate(orient,app,options)
			}catch(e){
				debug.error(e);
			}
			
			return OrientHTML
		}catch(e){
			debug.error(e);
			return OrientHTML
		}
	},
	libs : {},
	"use":function(name,lib){
		this.libs[name] = lib
	},
	sql:SQL,
	shortcut:{
		parse:function(value,shortcut){
			if(typeof value != "string") return value
			switch (value[0]) {
				case (shortcut.script||this.script):{
					value = eval(value.slice(1))
				}break;
			}
			console.log(value,typeof value,(shortcut||this).script)
			return value
		},
		script:"$",
	},
}

class App extends Event{
	constructor(data){
		super()
		this.accesTable = new Route()
		this.shortcut = data.shortcut||{}
		this.port = data.port
		for(var key in data){
			var value = orient.shortcut.parse(data[key],this.shortcut)
			if(key.startsWith('/')){
				console.log(value)
				if(typeof value=="function"){
					this.use(key,value)
				}else if(typeof value=="object"){
					for(var method in value){
						this.method(method,key,value[method])
					}
				}
			}else{
				switch(key.toLowerCase()){
					case "error":
						this.errorPage = value;
					break;
					case "sql":
					case "database":
						this.database = SQL.createConnection(value);
					break;
					case "template":
						this.template = value
						var nav = this.template.nav||{}
						var mth = orient.acces[data.requestMethode||'orient']()
						for (var item of nav){
							for(var method in mth){
								this.method(method,`/${item}`,mth[method])
							}
						}
						var forms = this.template.forms||[]
						for (var item of forms){
							this.method("default",`/${value.url||"admin"}`,orient.acces.create((req,res)=>{
								ad.toPage(req).then(html=>res.send(html))
							}))
						}
					break;
					case "libs":
						for(var lib in value){
							var obj = {}
							if(typeof value[lib] == "object"){
								for(var _var in value[lib]){
									obj[_var] = orient.shortcut.parse(value[lib][_var],this.shortcut)
									console.log(_var,obj[_var])
								}
							}else{
								obj = orient.shortcut.parse(value[lib],this.shortcut)||value
							}
							
							orient.use(lib,obj)
						}
					break;
					case "assets":
						this.assets = new assets(value)
						this.entry_script = this.assets.entry_script
						this.entry_link = this.assets.entry_link
					break;
					case "admin":
					case "administrator":
						var ad = new bundles.AdminPanel(value)
						this.method("default",`/${value.url||"admin"}`,orient.acces.create((req,res)=>{
							ad.toPage(req).then(html=>res.send(html))
						}))
					break;
				}
			}
		}
		orient.app = this
	}
	login(port = this.port){
		if(port)
			this.listen(port)
	}
	listen(port,callback){
		http.createServer((req, res)=>{
			var action = this.accesTable.find(req.method,req.url)
			debug.info(req.url)
			if(!req.url)return
			var _res = new web.Response(res,req,this)
			var _req = new web.Request(res,req,this)
			try{
				if(action==noop){
					var errorPage = this.errorPage||this.accesTable.sort()[0]
					if( errorPage){
						res.end(`<script>location.assign("${errorPage}")</script>`)
					}else{
						res.end()
					}
				}else{
					action(_req,_res)
				}
			}catch(e){
				debug.error(e)
				res.end()
			}
		}).listen(port);
		// callback()
		console.log("html route make")
		if(this.database){
			this.database.on("connected",()=>{
				console.log("database connected")
				this.onready()
			})
		}else{
			console.log("no database find")
			this.onready()
		}
	}
	browser(url){
		url = `http://localhost:${this.port}/${url}`
		execSync(`start ${url}`)
		return url
	}
	onready(){}
	use(path,callback){
		this.method(null,path,callback)
	}
	get(path,callback){
		this.method("GET",path,callback)
	}
	post(path,callback){
		this.method("POST",path,callback)
	}
	method(method,path,callback){
		if(!callback)callback = path
		if(!callback)return
		if(!method)method = "default"
		this.accesTable.append(path,{method:method.toUpperCase(),callback})
	}
	makeForm(...args){
		return Form.create(...args)
	}
	makeCard(...args){
		return Card.create(...args)
	}
	path(...dirsorfile){
		var url = '/'+dirsorfile.join(`/`)
		var path = '.'+url
		this.method("default",url,orient.acces.file(path))
		return path
	}
}

orient.express = function(data){
	return new App(data)
}
orient.express.static = function(){

}
orient.makeForm = Form.create
orient.help = function(data){
	var explain = {}
	explain.type = typeof data
	explain.comments = data.toString().match(/\/\*.*\*\/|\/\/.*/)
	debug.explain(explain)
	return explain
}

module.exports = orient