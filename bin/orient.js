#!/usr/bin/env node
const readline = require('readline').createInterface({input: process.stdin,output: process.stdout})

const argv = process.argv.slice(2)

const HELP = /^(-*h)(elp)?$/
const CONFIG = /^(-*c)(onfig)?=([a-z;\.;\/]\.json)$/

const { execSync } = require('child_process')
const FS = require("fs")

var config = {
	file:argv.find(x=>CONFIG.test(x))||"app.json",
	assign:function(obj,objChanges){
		var assignOn = (Oldobj,newObj)=>{
			for(var field in newObj){
				if(typeof newObj[field] == "object"){
					Oldobj[field] = assignOn(Oldobj[field]||{},newObj[field])
				}else{
					Oldobj[field] = newObj[field]
				}
			}
			return Oldobj
		}
		return assignOn(obj,objChanges)
	},
	stringify:function(obj){
		var str = Object.keys(obj).map(x=>`"${x}":${
			typeof obj[x] == "object"?
				this.stringify(obj[x]):
				typeof obj[x] == "boolean" || typeof obj[x] == "number"?
					obj[x]:'"'+obj[x]+'"'
			}`).join(",")
		return `{${str}}`
	},
	readConfig:function(){
		var obj
		if(FS.existsSync(this.file)){
			obj = FS.readFileSync(this.file,{encoding:'utf8', flag:'r'})
			obj = eval(`obj = ${obj}`)
		}else{
			obj = {}
		}
		return obj
	},
	write:function(objChanges){
		var obj = this.readConfig()
		obj = this.assign(obj,objChanges)
		var str = this.stringify(obj)
		FS.writeFileSync(this.file,str)
	},
	addRoute:function(ctrls){
		var route = ctrls.url.startsWith("/")?"/"+ctrls.url:ctrls.url
		var method = `${ctrls.type}(${ctrls.file})`
		var obj = {}
		obj[route] = method
		this.write(obj)
	},
	addEntity:function(data){
		var obj = {}
		obj.database = {
			tables:{},
		}
		obj.database.tables[data.name] = data.fields
		this.write(obj)
	},
	start:function(){
		var app = this.readConfig()
		var cmd = app.main
		if(!cmd){
			
		}
		execSync("")
	}
}

Function.prototype.help = function(){
	var str = this.toString()
	str = str.match(/\/\*.*\*\/|\/\/.*\n/)
	str = str.map(x=>{
		x = x.slice(2)
		if(x.endsWith('*/')){
			x = x.slice(0,-2)
		}
		return x
	})
	return str.join("")
}
RegExp.prototype.cmd = function(){
	var str = this.toString()
	return str.slice(1,-1)
}

const CMDS = new Map()

function explain(...args){
	if(args.length>1){
		args.forEach(x=>{
			explain(x)
			console.log(x)
		})
	}else{
		arg = args[0]
		if(HELP.test(arg)){
			CMDS.forEach((v,k)=>{
					console.log(k.cmd(),v.help())
			})
		}else{
			CMDS.forEach((k,v)=>{
				if(k.test(arg)){
					console.log(v.help())
				}
			})
		}
	}
}
function BuildForNode(){

}
function BuildForAppache(){
	
}

CMDS.set(/build =?(apache|node)?/,function build(args){
	/* Create a build Version and generate File who's not existes */
	return true
})

CMDS.set(/create/,function create(args){
	/* Create a build Version and generate File who's not existes */
	return true
})

CMDS.set(/make:(controller|route)/,async function makeController(args){
	/* Create a route from define controlle or create a new controller */
	var ctrls = {
		name:args[1],
		url:"/"+args[1],
		type:"$orient.acess.orient",
		file:"/"+args[1]+".html",
	} 
	new Promise(x=>{
		readline.question(`Choose a name for your controller class (e.g. ${ctrls.name}):`, rslt => {
			ctrls.name = rslt||ctrls.name
			readline.question(`Choose a route for your controller? (${ctrls.url})`, rslt => {
				ctrls.url = rslt||ctrls.url
				readline.question(`Choose a file to render by the controller? (${ctrls.file})`, rslt => {
					ctrls.file = rslt||ctrls.file

					readline.question(`Would you create subpage for this controller? (no)`, rslt => {
						if(/y(es)?/ig.test(rslt)){
						}
						config.addRoute(ctrls)
						console.log(ctrls)
						readline.close()
					})
				})
			})
		})
	})
})

CMDS.set(/make:(entity|table)/,async function makeController(args){
	/* Create a route from define controlle or create a new controller */
	var ctrls = {
		name:args[1],
		fields:{},
	} 
	new Promise(x=>{
		readline.question(`Choose a name for your Entity class (e.g. ${ctrls.name}):`, rslt => {
			ctrls.name = rslt||ctrls.name
			var rsl = true
			var txt = "New property name (press <return> to stop adding fields):"
			var fx = ()=>{
				readline.question(txt, rslt => {
					rsl = rslt||false
					if(rsl){
						txt = "Add another property? Enter the property name (or press <return> to stop adding fields):"
						var fieldName = rslt
						readline.question(`Field type (enter ? to see all types) [string]:`, rslt => {
							var fieldType = rslt||"string"
							readline.question(`Can this field be null in the database (nullable) (yes/no) [no]:`, rslt => {
								var fieldDefault = /y(es)?/ig.test(rslt)
								ctrls.fields[fieldName] = fieldType
								fx()
							})
						})
					}else{
						readline.close()
						config.addEntity(ctrls)
						console.log(ctrls)
					}
					})
			}
			fx()
		})
	})
})
CMDS.set(/serv/,()=>{

})
// console.log("help?",argv.some(arg=>HELP.test(arg)))
if(argv.some(arg=>HELP.test(arg))){
	explain(...argv)
}else{
	argv.forEach((arg,n)=>{
		CMDS.forEach((v,k)=>{
			if(k.test(arg)){
				v(argv.slice(n))
			}
		})
	})
}