class VARCHAR{}
class INT{}
class FLOAT{}
class DATETIME{}
class BOOL{}
class DECIMAL{}



var datatypes = {VARCHAR,INT,FLOAT,DATETIME,BOOL,DECIMAL}

const {exec,spawn,execSync, spawnSync} = require('child_process')
const fs= require('fs')
const path = require('path')

class Database{
	_tables = []
	constructor(database){
		this.name = database
		// sqlite_exec(database,'')
	}
	Register(_table){
		this._tables.push(_table)
		this[_table.name] = new Table(_table.clazz)
		var values=_table.row.map(x=>`${x.name} ${x.type} ${x.value==null?"":"NOT NULL"}`)
		this.run(`create table ${_table.name}(id int NOT NULL AUTO_INCREMENT, ${values});`)
	}
	run(sql,callback=()=>{}){
		return sqlite_exec(this.name,sql,null,callback)
	}
}
class Table{
	_array = []
	constructor(CLAZZ = Object){
		this.CLAZZ = CLAZZ
	}
	insert(...items){
		items.forEach(item=>{
			if(item instanceof this.CLAZZ)
			this._array.push(item)
		})
	}
	select(list,condition){
		if(!list)list = (clazz)=>clazz
		if(!condition)condition = ()=>true
		return this._array.filter(condition).map(list)
	}
}
var isWin = process.platform === "win32";
const sqlite = __dirname.split('\\').slice(0,-1).join('\\')+`\\libs\\sqlite3${isWin?".exe":""}`
function sqlite_init(database,initfileorsqltable){
	sqlite_exec(database,initfileorsqltable,["init"])
}
function sqlite_exec(database,sql,args=["cmd","json","bail"],callback){
	if(!database)return
	if(database.includes(' '))throw "Invalid database"
	if(!path.isAbsolute(database)){
		database = "./"+database
	}
	if(!fs.existsSync(database))throw `Database "${database}" not exist`
	if(!Array.isArray(sql)){
		if(database.includes('"'))throw `command replace '"' by an other character : '${sql}'`
		cmd = `${sqlite} ${database} "${sql}" -json`
		exec(cmd,{
			stdio:[0,1,2],
			encoding:"string",
		},(err,stdio,stderr)=>{
			if(err){
				throw err
			}
			callback(`${stdio}`,stderr)
		});
	}else{
		cmd = `${sqlite} ${database} ${args.map((_,n)=>" -"+args[n]+" "+(sql[n]||"")).join('')}`
	}
}
class Shijuku_Connection{
	_url = "127.0.0.1"
	_connect = ()=>{}
	_connected = false
	setupCode = []
	database = new Database()
	constructor(host,user,password,database){
		// this._url = url
		this.use(database)
	}
	use(database){
		if(database){
			this.database = new Database(database)
		}
		this._connected = true
		this._connect()
	}
	connect(callback){
		this._connect = callback
		if(this._connected)
			this._connect()
	}
	query(sql,callback){
		console.log(sql," : ",SQLExec(sql))
	}
	load(...tables){
		tables.forEach(table=>{
			if(typeof table == "string"){
				this.loadSQL(table)
			}else if(typeof table == "object"){
				this.loadObject(table)
			}else{
				this.loadClass(table)
			}
		})
		return this
	}
	loadClass(...clazz){
		clazz.forEach(table=>{
			var _table = Classparser(table)
			this.database.Register(_table)
		})
		return this
	}
	loadObject(...clazz){
		clazz.forEach(table=>{
			var _tables = Objectparser(table)
			_tables.forEach(_table=>{
				this.database.Register(_table)
			})
		})
		return this
	}
	loadSQL(...sql){
		sql.forEach(table=>{
			if(fs.existsSync(table)){
				console.log(table)
				if(table.endsWith('.sql'))
					sqlite_init(this.database.name,table)
			}else{

			}
		})
		return this
	}
	export(){
		return {
			setup:this.setupCode.join(''),
		}
	}
}
function Objectparser(tables){
	console.log(tables)
	var _tables = []
	for(var table in tables){
		var _table = {}
		_table.name = table
		_table.row = Object.keys(tables[table]).map(x=>{return {name:x,type:tables[table][x]}})
		_tables.push(_table)
	}
	return _tables
}
function Classparser(clazz){
	var table = {}
	table.clazz = clazz
	table.name = clazz.name||clazz.constructor.name
	var extend = clazz.toString().split('{')[0].split('extends').slice(1).join('extends')
	var dclar = clazz.toString().split("constructor")[0].split('{').slice(1).join('{')
	dclar = dclar.replace(/\n|\r/g,";").replace(/;/,";").split(";").map(x=>x.trim())
	dclar = dclar.map(w=>{
		w = w.split('=')
		var name = w[0].trim()
		var value = w.slice(1).join('=').trim()
		var type = /^new /g.test(value)?value.split(/^new /).slice(1).join('new ').split(/[^a-z]/ig)[0]:(typeof eval(value))
		switch(type){
			case "string" : type = "varchar"; break;
			case "number" : type = "float"; break;
		}
		return {
			value,name,type
		}
	})
	if(extend){
		extend = {
			name:extend.toLowerCase(),
			value:`new ${extend}()`,
			type:extend,
		}
		dclar.push(extend)
	}
	table.row = dclar.reduce((p,o)=>{if(o.name){p.push(o)};return p},[])
	return table
}
const execSQLObject = (opt,app)=>{
	console.log(opt,"app")
}
module.exports = {
	createConnection:(options)=>{
		var host = options.host||"127.0.0.1"
		var user = options.user||"root"
		var password = options.password||""
		var database = options.database
		var sql = null
		if(database){
			sql = new Shijuku_Connection(host,user,password,database)
		}else{
			sql = new Shijuku_Connection(host,user,password)
		}
		if(options.tables){
			sql.load(options.tables)
		}
		if(options.init){
			if(fs.existsSync(options.init) && !fs.existsSync(database)){
				sqlite_init(database,options.init)
			}
		}
		if(options.check){
			sqlite_exec(database,".show")
		}
		return sql
	},
	datatypes,
	exec,
	select:(opt)=>{
		return (app)=>{execSQLObject(opt,app)}
	},
}