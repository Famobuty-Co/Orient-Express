const http = require("http");
const Route = require("../route");
const {Event} = require("../extra/event");
const web = require("../web");
const debug = require('../extra/console')
const { exec, execSync } = require("child_process");
const {noop} = require("../extra/static")
const SQL = require("../shinjuku");


class App extends Event{
	constructor(data){
		super()
		this.accesTable = new Route()
	}
	login(port = this.port){
		if(!this.port)
			this.port = port
		console.log(this.port , port)
		if(port){
			this.listen(port)
		}
	}
	listen(port,callback){
		const start = ()=>{
			this.show()
			this.onready()
		}
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
					try{
						action(_req,_res)
					}catch(e){
						debug.error(e)
						res.end()
					}
				}
			}catch(e){
				debug.error(e)
				res.end()
			}
		}).listen(port);
		debug.log("html route make")
		if(this.database){
			this.database.on("connected",()=>{
				debug.log("database connected")
				start()
			})
		}else{
			debug.log("no database find")
			start()
		}
	}
	createDatabaseConnection(data){
		this.database = SQL.createConnection(data)
	}
	show(url=""){
		url = `http://localhost:${this.port}/${url}`
		debug.succes(url)
		return url
	}
	browser(url=""){
		url = `http://localhost:${this.port}/${url}`
		execSync(`start ${url}`)
		return url
	}
	onready(){}
	addRoute(path,callback){
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

	path(...dirsorfile){
		var url = '/'+dirsorfile.join(`/`)
		var path = '.'+url
		this.method("default",url,orient.acces.file(path))
		return path
	}
}

module.exports = App