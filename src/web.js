const mime = require("./mime/mime")
const path = require("path")
const fs = require("fs");
const { Component } = require("./bundles/ui");
const debug = require("./extra/console");

class Response{
	constructor(res,req,app){
		this._res = res
		this._req = req
		this.app = app
	}
	format(formats){
		var _mime = mime.lookup(this._req.url);
		(formats[_mime]||formats.default)()
	}
	setMime(mime){
		this._res.setHeader("Content-Type", mime);
	}
	setMimeFile(file){
		var _mime = mime.lookup(file,"text/plain");
		this.setMime(_mime)
	}
	send(text){
		if(text instanceof Component){
			text = text.toString()
		}
		if(typeof text != "string"){
			console.log(text)
		}
		this._res.end(text.toString())
	}
	sendDirFile(dirfile,dirname){
		var raw = this._req.rawHeaders.map(x=>x.toLowerCase())
		console.log(raw)
		var sfd = raw.indexOf('sec-fetch-dest')
		sfd = raw[sfd+1]
		var sfm = raw.indexOf('sec-fetch-mode')
		sfm = raw[sfm+1]
		var sfs = raw.indexOf('sec-fetch-site')
		sfs = raw[sfs+1]

		var str = ""
		console.log(sfd,sfm,sfs)
		if(sfd == "script" && sfm == "cors" && sfs == "same-origin"){
			str = dirfile.map(x=>{
				return `import * as ${x.split('.')[0]} from "./${dirname}/${x}"`
			}).join(';')+";\n"
			str += "export {"+dirfile.map(x=>{
				return `${x.split('.')[0]}`
			}).join(',')+"}"
			this.setMime("application/javascript")
		}
		if(sfd == "document" && sfm == "navigate" && sfs == "none"){
			str = "<html><body><ul>"+dirfile.map(x=>{
				return `<li><a href="/${x}">${x}</a><li>`
			}).join('')+"</ul></body></html>"
			this.setMime("text/html")
		}
		console.log(str)
		this.send(str)
	}
	sendFile(file){
		if(!path.isAbsolute(file)){
			file = file=="/"?"index.html":file;
			file="./"+file
		}
		// if(fs.existsSync(file)){
		// 	console.log("send file :",file)
		// 	console.log(this._req.rawHeaders,this._res)
		// 	// this._res.setHeader("Content-Type", mime.lookup(file));
		// 	fs.createReadStream(file,{autoClose:true,}).pipe(this._res)
		// }else{
		// 	this._res.end();
		// }
		if(fs.existsSync(file)){
			console.log("acces to "+file)
			var content = fs.readFileSync(file)
			this._res.end(content)
		}else{
			console.log("can't acces to "+file)
			this._res.end();
		}
	}
	close(){
		this._res.end();
	}
}
function parserQuery(search){
	const query = {};
	if(search.length){
		if(search.startsWith("?"))search = search.substring(1)
		search.split('&').forEach(data=>{
			var [name,value] = data.split('=')
			value = value.replace(/\%20/g," ")
			value = value.replace(/\%C3/g,"")
			value = value.replace(/\%A9/g,"é")
			value = value.replace(/\%E2%82%AC/g,"€")
			
			query[name] = value
		})
	}
	return query
}
class Request{
	constructor(res,req,app){
		this.app = app
		this._res = res
		this._req = req
		this.data = ""
		this._req.on('data',chunk=>{
			this.data+=chunk
		})
		this._req.on('end',()=>{
			debug.info(this.data)
		})
		this.device = {
			type:/mobile/ig.test(res["user-agent"])?"PHONE":"DESKTOP"
		}
		this.originalUrl = req.url

		var s = req.url.search(/\?/)
		this.search = s>=0?req.url.slice(s):""

		this.query = parserQuery(this.search)
		this.path = req.url.split("/").slice(0,-1).join('/')
		this.page = req.url.split("/").slice(-1).join('/')
		this.file = this.page.search('.')!=-1?this.page:null
	}
	get method(){
		return this._req.method.toUpperCase()
	}
	get header(){
		return this._req.rawHeaders||this._req.getRawHeaderNames().map(x=>this._req.getHeader(x))||[]
	}
	get body(){
		return this.data
	}
	get socket(){
		return this._req.socket
	}
	async getBody(){
		return new Promise((resolve)=>{
			this._req.on('end',()=>{
				resolve(parserQuery(this.data))
			})
		})
	}
	on(event){
		return new Promise(resolve=>{
			this._req.on(event,resolve)
		})
	}
}
module.exports = {
	Request,Response
}