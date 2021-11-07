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
		// this._res.setHeader("Content-Type", _mime);
		(formats[_mime]||formats.default)()
	}
	send(text){
		if(text instanceof Component){
			text = text.toString()
		}
		this._res.end(text)
	}
	sendFile(file){
		if(!path.isAbsolute(file)){
			file = file=="/"?"index.html":file;
			file="./"+file
		}
		if(fs.existsSync(file)){
			// this._res.setHeader("Content-Type", mime.lookup(file));
			fs.createReadStream(file).pipe(this._res)
		}else{
			this._res.end();
		}
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
		console.log(this._req)
		return this._req.getRawHeaderNames().map(x=>this._req.getHeader(x))||[]
	}
	get body(){
		return this.data
	}
	async getBody(){
		return new Promise((resolve)=>{
			this._req.on('end',()=>{
				resolve(parserQuery(this.data))
			})
		})
	}
}
module.exports = {
	Request,Response
}