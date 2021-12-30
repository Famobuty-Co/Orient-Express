const noop = ()=>{}
const url = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/

const fs = require("fs");
const path = require("path");
function getFileName(file){
	return path.parse(file).base
}

function loadFile(file){
	if(!path.isAbsolute(file)){
		file = file=="/"?"index.html":file;
		file="./"+file
	}
	if(fs.existsSync(file) && fs.statSync(file).isDirectory()){
		return fs.readdirSync(file)
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

let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
function GUID(length=10){
	let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;
}
function stringify(obj){
	var str = Object.keys(obj).map(x=>`"${x}":${
		typeof obj[x] == "object"?
			this.stringify(obj[x]):
			typeof obj[x] == "boolean" || typeof obj[x] == "number"?
				obj[x]:'"'+obj[x]+'"'
		}`).join(",")
	return `{${str}}`
}
function getContentFunction(fx){
	return fx.toString().split("anonymous").slice(1).join("anonymous").replace("this._","this.#")
}
function createClass(obj,name){
	var private = new Map
	var vars = new Map
	var methods = new Map
	Object.keys(obj).forEach(k=>{
		var x = obj[k]
		if(typeof x == "function"){
			methods.set(k,x)
		}else if(typeof x == "object" && Object.keys(x).length <= 3 && (x.get||x.set) ){
			private.set(k,x)
		}else{
			if(typeof x == "object"){
				x = stringify(x)
			}
			vars.set(k,x)
		}
	})
	
	var _private = []
	private.forEach((value,key)=>{
		_private.push(
			`
			"${value.annotation||""}"
			#${key} = null;
			get ${key} ${getContentFunction(value.get)}
			set ${key} ${getContentFunction(value.set)}`
		)
	})

	var _vars = []
	vars.forEach((value,key)=>{
		_vars.push(
			`${key} = ${value};`
		)
	})

	var _methods = []
	methods.forEach((value,key)=>{
		_methods.push(
			`${key} ${getContentFunction(value.set)}`
		)
	})

	var js = `class ${name}{

		${_private.join("\n")}
		${_vars.join("\n")}
		${_methods.join("\n")}
	}`
	return js
}

module.exports = {
	noop,
	include:loadFile,getFileName,
	loadFile,GUID,createClass,stringify,
	url,
}