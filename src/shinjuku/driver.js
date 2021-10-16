const {execSync} = require('child_process')
const path = require("path")

var isWin = process.platform === "win32";
const sqlite = __dirname.split('\\').slice(0,-2).join('\\')+`\\libs\\sqlite3${isWin?".exe":""}`
const createdb = __dirname.split('\\').slice(0,-2).join('\\')+`\\libs\\sqlite3${isWin?".exe":""}`


function sqlite_create(database){
	/*

	if(! database.endsWith('.db')){
		database+=".db"
	}
	if(!path.isAbsolute(database)){
		database = path.join(__dirname,database)
	}
	console.log(database,path.isAbsolute(database))
	if(!fs.existsSync(database)){
		fs.writeFileSync(database,"")
	}
	*/
	var cmd = `${createdb} ${database}`
	return execSync(cmd)
}
function sqlite_init(database,initfileorsqltable){
	sqlite_exec(database,initfileorsqltable,["init"])
}
function sqlite_exec(database,sql,args=["cmd","json","bail"],callback){
	if(!database)return
	if(database.includes(' '))throw "Invalid database"
	if(!path.isAbsolute(database)){
		database = "./"+database
	}
	//if(!fs.existsSync(database))throw `Database "${database}" not exist`//when you setup it can exist
	if(!Array.isArray(sql)){
		if(database.includes('"'))throw `command replace '"' by an other character : '${sql}'`
		cmd = `${sqlite} ${database} "${sql}" -json`
		var out = execSync(cmd)
		/*,{
			stdio:[0,1,2],
			encoding:"string",
		},(err,stdio,stderr)=>{
			if(err){
				throw err
			}
			//callback(`${stdio}`,stderr)
		});*/
		out = out.toString()
		if(callback){
			callback(out)
		}else{
			return out
		}

	}else{
		cmd = `${sqlite} ${database} ${args.map((_,n)=>" -"+args[n]+" "+(sql[n]||"")).join('')}`
	}
}

module.exports = {
	sqlite_exec,
	sqlite_init,
	sqlite_create
}