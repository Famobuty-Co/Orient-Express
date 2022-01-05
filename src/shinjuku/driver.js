const {execSync} = require('child_process')
const path = require("path")

var isWin = process.platform === "win32";
const sqlite = isWin?__dirname.split('\\').slice(0,-2).join('\\')+`\\libs\\sqlite3.exe`:"sqlite3"
//__dirname.split('\\').slice(0,-2).join('\\')+`\\libs\\sqlite3${isWin?".exe":""}`
// const createdb = __dirname.split('\\').slice(0,-2).join('\\')+`\\libs\\sqlite3${isWin?".exe":""}`
const createdb = sqlite

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
		cmd = `${sqlite} ${database} "${sql}" -csv`
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
		var resp = out
		if(/SELECT/.test(sql)){
			var columns = sql.split(/select /i).slice(1).join('select').split(/ from /i)[0]
			if(/$\*/.test(columns)){
				console.log(execSync(``))
			}else{
				columns = columns.split(",")
			}
			console.log("columns ",columns)
			resp = []
			console.log("ouput ",out)
			out.split("\n").forEach(x=>{
				var concat = []
				var obj = {}
				var n = 0
				var add = ()=>{
					obj[columns[n]] = concat
					concat = []
					n++
				}
				x.split('').forEach(x=>{
					if(x==","){
						add()
					}else{
						concat.push(x)
					}
				})
				add()
				resp.push(obj)
			})
			console.log("return ",resp)
		// }else{
		// 	console.log("return ",out)
			// resp.push(out)
		}
		
		if(callback){
			callback(resp)
		}else{
			return resp
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