const mime = require("./mime")
const path = require("path")
const fs = require("fs");

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
class Request{
	constructor(res,req,app){
		this.app = app
		this._res = res
		this._req = req
		this.device = {
			type:/mobile/ig.test(res["user-agent"])?"PHONE":"DESKTOP"
		}
		this.originalUrl = req.url
		const query = {};
		var s = req.url.search(/\?/)
		this.search = s>=0?req.url.slice(s):""
		if(this.search.length){
			this.search.substring(1).split('&').forEach(data=>{
				var [name,value] = data.split('=')
				value = value.replace(/\%20/g," ")
				value = value.replace(/\%C3/g,"")
				value = value.replace(/\%A9/g,"é")
				value = value.replace(/\%E2%82%AC/g,"€")
				
				query[name] = value
			})
		}
		this.query = query
		this.path = req.url.split("/").slice(0,-1).join('/')
		this.page = req.url.split("/").slice(-1).join('/')
		this.file = this.page.search('.')!=-1?this.page:null
	}
}
module.exports = {
	Request,Response
}