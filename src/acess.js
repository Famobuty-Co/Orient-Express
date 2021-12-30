const {loadFile} = require('./extra/static');
const fs = require('fs');
const mime = require('./mime/mime');
const orient = require('./orient/index')

function stream(file,res){
	console.log(fs.existsSync(file),file)
	if(fs.existsSync(file)){
		fs.createReadStream(file).pipe(res)
	}else{
		res.end();
	}
}

acces = {
	stream:function(req, res){
		var dir = "./"+req.decodeURL
		stream(dir,res._res)
	},
	images:function (req, res) {
		var file = req.decodeURL.split('/').slice(-1).join('/');
		var dir = "./"+req.decodeURL.split('/').slice(0,-1).join('/')+"/";
		var _mime = mime.lookup(file)
		if(/image/.test(_mime)){
			stream(dir+file,res._res)
		}else{
			res.end()
		}
	},
	free:function (req, res) {
		
		var file = req.originalUrl.split('/').slice(-1).join('/');

		if(file.search('.')==-1){file+="index.html"}

		var dir = "./"+req.originalUrl.split('/').slice(0,-1).join('/')+"/";
		var content = loadFile(dir+file);
		if(content){
			if(content instanceof Array){
				res.sendDirFile(content,file)
			}else{
				res.setMimeFile(dir+file)
				res.send(content)
			}
		}
		res.close()

		// res.sendFile("./"+req.originalUrl.split('?')[0])
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
			var content = loadFile(file);
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
		return this.orientFile("./index.html")
	},
	orientFile:(file)=>{
		return {
			default:function (req, res) {
				console.log(file)
				if(!file){
					file = req.originalUrl.split('/').slice(-1).join('/');
					if(file.search('.')==-1){file+="index.html"}
				};
				var dir = "./"+req.originalUrl.split('/').slice(0,-1).join('/')+"/";
				var content = loadFile(dir+file);
				content = orient.parse(content,{request:req,response:res});
				res.send(content)
			},
			static:true,
		}
	},
	orient:(req, res)=>{
				
				var file = req.originalUrl.split('/').slice(-1).join('/');

				if(file.search('.')==-1){file+="index.html"}

				var dir = "./"+req.originalUrl.split('/').slice(0,-1).join('/')+"/";
				var content = loadFile(dir+file);
				if(content){
					if(content instanceof Array){
						res.sendDirFile(content,file)
					}else{
						content = orient.parse(content,{request:req,response:res});
						res.setMimeFile(dir+file)
						res.send(content)
					}
				}
				res.close()
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
	},
}

module.exports = acces