const http = require("http");
const fs = require("fs");
const path = require("path");
const Route = require("./src/route.js");
const SQL = require("./src/sql.js");
const web = require("./src/web.js");

function loadFile(file){
	if(!path.isAbsolute(file)){
		file = file=="/"?"index.html":file;
		file="./"+file
	}
	if(fs.existsSync(file)){
		return fs.readFileSync(file,{encoding:'utf8', flag:'r'})
	}else{
		return null
	}
}
const include = loadFile
const noop = ()=>{}
const orient = {
	acces:{
		free:function (req, res) {res.sendFile("./"+req.originalUrl.split('?')[0])},
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
		orient:(file)=>{
			return {
				default:function (req, res) {if(!file){file = req.originalUrl.split('/').slice(-1).join('/');if(file.search('.')==-1){file+="index.html"}};var dir = "./"+req.originalUrl.split('/').slice(0,-1).join('/')+"/";var content = loadFile(dir+file);content = orient.parse(content,{request:req,response:res});res.send(content)},
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
	include,
	execute : (OrientJS,options = {})=>{
		if(!options.request)options.request = {}
		if(!options.response)options.response = {}
		if(!options.app){
			options.app = options.request.app||options.response.app||orient
		}
		OrientJS = (new Function("orient","app",
		`var _echo_msg = [];
		const echo = (...value)=>{_echo_msg.push(...value);};
			with(orient){${OrientJS}};return _echo_msg.join('')`))(orient.libs,options)
		return OrientJS
	},
	parse : function(OrientHTML,options){
		OrientHTML = OrientHTML.split('<?orient')
		OrientJS = OrientHTML.slice(1).map(w=>w.split("?>")[0])

		OrientJS = OrientJS.map(x=>{
			return this.execute(x,options)
		})

		OrientHTML = OrientHTML.map((w,n)=>{
			if(n==0)return w
			w = w.split("?>")
			w[0] = OrientJS[n-1]
			return w.join('')
		}).join('')

		return OrientHTML
	},
	libs : {},
	"use":function(name,lib){
		this.libs[name] = lib
	},
	sql:SQL,
	shortcut:{
		parse:function(value,shortcut){
			switch (value[0]) {
				case (shortcut||this).script:{
					value = eval(value.slice(1))
				}break;
			}
			return value
		},
	},
}

class App{
	constructor(data){
		this.accesTable = new Route()
		this.shortcut = data.shortcut||{}
		for(var key in data){
			var value = orient.shortcut.parse(data[key],this.shortcut)
			
			if(key.startsWith('/')){
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
						this.sql = SQL.createConnection(value);
					break;
					case "libs":
						for(var lib in value){
							var obj = {}
							for(var _var in value[lib]){
								obj[_var] = orient.shortcut.parse(value[lib][_var],this.shortcut)
							}
							orient.use(lib,obj)
						}
					break;
				}
			}
		}
		if(data.port)
			this.listen(data.port)
	}
	listen(port,callback){
		http.createServer((req, res)=>{
			var action = this.accesTable.find(req.method,req.url)
			var _res = new web.Response(res,req,this)
			var _req = new web.Request(res,req,this)
			if(action==noop){
				res.end(`<script>location.assign("${this.errorPage||this.accesTable.sort()[0]}")</script>`)
			}else{
				action(_req,_res)
			}
		}).listen(port);
		// callback()
	}
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
}

orient.express = function(data){
	return new App(data)
}
orient.express.static = function(){

}

module.exports = orient