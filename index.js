const http = require("http");
const fs = require("fs");

const noop = ()=>{}
const orient = {}

function sendFile(file){
	file = file=="/"?"index.html":file;
	file="./"+file
	if(fs.existsSync(file)){
		console.log("acces to "+file)
		fs.createReadStream(file).pipe(res)
	}else{
		console.log("can't acces to "+file)
		res.end();
	}
}
class Response{
	
}
class AccesTable{
	static Acces = class{
		static methods = ["DEFAULT","GET","POST"]
		setAcces(method,callback){
			method = method.toUpperCase()
			if(! (method in this.constructor.methods)) method = this.constructor.methods[0]
			this[method] = callback
		}
	}
	table = {}
	append(path,optn = {}){
		this.table[path] = new AccesTable.Acces()
		this.table[path].setAcces(optn.method||"default",optn.callback||noop)
	}
	find(method,path){
		if(this.table[path]){
			method = method.toUpperCase()
			var callback = this.table[path][method]||this.table[path].DEFAULT
			if(callback){
				return callback
			}
			return noop
		}
	}
}

class App{
	constructor(){
		this.accesTable = new AccesTable()
	}
	listen(port,callback){
		http.createServer((req, res)=>{
			callback()
			this.accesTable.find(req.method,req.url)(req,new Response(res))
		}).listen(port);
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

orient.express = function(){
	return new App()
}
orient.express.static = function(){

}

module.exports = orient