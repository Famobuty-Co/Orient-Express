const readline = require('readline').createInterface({input: process.stdin,output: process.stdout})
const argv = process.argv.slice(2)

const HELP = /^(-*h)(elp)?$/

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
class parserArgs extends Map{
	#array = []
	constructor(args){
		super()
		this.#array = args
		var temp = ""
		args.forEach(x=>{
			if(x.startsWith('-')){
				temp = x
			}else{
				this.set(temp.slice(1),x)
			}
		})
	}
	getIndex(n){
		return this.#array[n]
	}
}
function add(key,callback){
	if(!callback){
		callback = key
		key = new RegExp(key.name)
	}
	CMDS.set(key,callback)
}

function execute(autoexit){
	var returns;
	if(argv.some(arg=>HELP.test(arg))){
		returns = explain(...argv)
	}else{
		var callback
		// argv.forEach((arg,n)=>{
			var arg = argv[0]
			CMDS.forEach((v,k)=>{
				if(k.test(arg)){
					callback = v
				}
			})
		// })
		if(callback){
			returns = callback(new parserArgs(argv))
		}else{
			console.log("command not find")
			returns = new Error;
		}
	}
	if(autoexit){
		exit(returns)
	}else{
		return returns
	}
}
function quit(code){
	console.log(code)
	process.exit(code)
}
function exit(returns){
	if(returns instanceof Error){
		quit(1)
	}
	else if(returns instanceof Promise){
		returns.then(
			_=>quit(0)
		).catch(
			err=>quit(err)
		)
	}else{
		quit(0)
	}
}
function question(text){
	return new Promise(resolve=>{
		readline.question(text+" ",resolve)
	})
}
module.exports = {
	CMDS,
	add,argv,
	question,
	execute,exit,
}