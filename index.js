const http = require("http");
const fs = require("fs");
const path = require("path");
const Route = require("./src/route.js");
const SQL = require("./src/sql.js");
const mime = require("./src/mime.js");
const web = require("./src/web.js");

function loadFile(file){
	if(!path.isAbsolute(file)){
		file = file=="/"?"index.html":file;
		file="./"+file
	}
	console.log("\t loadfile",file,fs.existsSync(file));
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
		query:function (req, res) {res.sendFile("./"+req.originalUrl.split('?')[0]+req.query.file)},
		combine:(...files)=>{
			return function (req, res) {var dir = "./"+req.originalUrl.split('/').slice(0,-1).join('/')+"/";var file = files.map(w=>loadFile(dir+w)).join("\n");res.send(file)}
		},
		create:(fileSelector)=>{
			return function (req, res) {fileSelector(req, res)}
		},
		file:(file)=>{
			return function (req, res) {res.sendFile(file)}
		},
		orient:(file)=>{
			return {
				default:function (req, res) {if(!file){file = req.originalUrl.split('/').slice(-1).join('/');if(file.search('.')==-1){file+="index.html"}};var dir = "./"+req.originalUrl.split('/').slice(0,-1).join('/')+"/";var content = loadFile(dir+file);content = orient.parse(content);res.send(content)},
				static:true,
			}
		}
	},
	include,
	execute : function(OrientJS){
		OrientJS = (new Function("orient",`var _echo_msg = [];const echo = (...value)=>{_echo_msg.push(...value);console.log(value);};with(orient){${OrientJS}};return _echo_msg.join('')`))(orient.libs)
		return OrientJS
	},
	parse : function(OrientHTML){
		OrientHTML = OrientHTML.split('<?orient')
		OrientJS = OrientHTML.slice(1).map(w=>w.split("?>")[0])

		OrientJS = OrientJS.map(x=>{
			return this.execute(x)
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
	use:function(name,lib){
		
		this.libs[name] = lib
	},
}

class App{
	constructor(data){
		this.accesTable = new Route()
		for(var key in data){
			if(key.startsWith('/')){
				if(typeof data[key]=="function"){
					this.use(key,data[key])
				}else if(typeof data[key]=="object"){
					for(var method in data[key]){
						this.method(method,key,data[key][method])
					}
				}
			}else{
				switch(key.toLowerCase()){
					case "error":
						this.errorPage = data[key];
					break;
					case "sql":
						this.sql = SQL.createConnection(data[key]);
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
			var _res = new web.Response(res,req)
			var _req = new web.Request(res,req)
			console.log(action,req.method,req.url)
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