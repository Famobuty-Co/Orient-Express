const noop = ()=>{}

const fs = require("fs");
const path = require("path");
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

let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function GUID(length=10){
	let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;
}
module.exports = {
	noop,
	include:loadFile,
	loadFile,GUID
}