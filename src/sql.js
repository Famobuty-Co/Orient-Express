class VARCHAR{}
class INTEGER{}
class FLOAT{}
class DATETIME{}
class BOOLEAN{}
class DECIMAL{}
class DATE{}



var datatypes = {VARCHAR,INTEGER,FLOAT,DATETIME,BOOLEAN,DECIMAL,DATE,INT:INTEGER,}

const {exec,spawn,execSync, spawnSync} = require('child_process')
const fs= require('fs')
const path = require('path')
const { runInNewContext } = require('vm')
const { Event } = require('./event')

class Database extends Event{
	isConnected = false
	_tables = []
	constructor(database){
		super()
		this.name = database
		const conxion = ()=>{
			console.log("connected to the base")
			this.isConnected = true
			this.onconnected()
		}
		// sqlite_exec(database,'')
		this.runPromise(".tables").then(stat=>{
			if(!stat){
				conxion()
				return
			}
			stat = stat.match(/\w+/g)
			var c = stat.length
			console.log("connection in "+c+"...")
			stat.forEach(_name=>{
				this.runPromise(".schema "+_name).then(_table=>{
					_table = SQLparser(_table).tables[0]
					this._tables.push(_table)
					this[_table.name] = new Table(this,_table)
					c--
					console.log("connection in "+c+"...")
					if(c<=0){
						conxion()
					}
				})
			})
		})
	}
	onconnected(){}
	Register(_table){
		this._tables.push(_table)
		this[_table.name] = new Table(this,_table)
		var exist = this.run(`.schema ${_table.name}`)
		if(exist){
			var _table2 = SQLparser(exist).tables[0]
			exist = _table2.row.reduce((p,o)=>{
				if(!_table.row.map(x=>x.name).includes(o.name)){
					p.push(o)
				}
				return p
			},[])
		}
		if(!exist || exist.length==_table.row.length){
			var values=_table.row.map(x=>`${x.name} ${x.type} ${x.value==null?"":"NOT NULL"}`)
			this.run(`create table ${_table.name}(id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,${values});`)
		}else if(exist.length!=0){
			var values=exist.map(x=>{
				x = `${x.name} ${x.type} ${x.value==null?"":"NOT NULL"}`
				return `alter table ${_table.name} ADD ${x};`
			})
			this.run(values.join('\n'))
		}

	}
	runPromise(sql,callback=()=>{}){
		var p = new Promise((resolve,reject)=>{
			sqlite_exec(this.name,sql,null,resolve)
		})
		if(callback){
			p.then(callback)
		}
		return p
	}
	run(sql){
		return sqlite_exec(this.name,sql,null)
	}
	// drop(table){
	// 	if(this[table])
	// 		this.run(`IF EXIST TABLE ${table} DROP TABLE ${table};`)
	// }
}
class Table{
	_array = []
	_Insert = []
	constructor(database,data = {name:"view",}){
		this.database = database
		this.name = data.name
		if(data.clazz){
			this.CLAZZ = data.clazz
		}else{
			this.CLAZZ
		}
	}
	insert(...items){
		/*
		items.forEach(item=>{
			if(item instanceof this.CLAZZ)
			this._Insert.push(item)
		})
		*/
		var items_sql = items.map(x=>{
			var cols =Object.values(x).map(x=>`'${x}'`)
			return `(${cols})`
		})
		var rows = `(${Object.keys(items[0])})`
		var statement = this.database.run(`INSERT INTO ${this.name} ${rows} VALUES ${items_sql};`)
		return statement
	}
	select(columns = "*",condition){
		var where = ""
		if(Object.keys(condition).length){
			where = "WHERE " 
			for(var name in condition){
				var value = condition[name]
				if(typeof value == "number")value = " = "+value
				where += `${name} ${value} `
			}
		}
		var statement = this.database.run(`SELECT ${columns} FROM ${this.name} ${where}`)
		statement = eval(statement)||[]
		if(columns == "*"){
			statement.forEach(row=>{
				this._array[runInNewContext.ID] = row
			})
		}
		return statement
	}

}
var isWin = process.platform === "win32";
const sqlite = __dirname.split('\\').slice(0,-1).join('\\')+`\\libs\\sqlite3${isWin?".exe":""}`
const createdb = __dirname.split('\\').slice(0,-1).join('\\')+`\\libs\\sqlite3${isWin?".exe":""}`
function sqlite_create(database){
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
class Shijuku_Connection extends Event{
	_url = "127.0.0.1"
	_connect = ()=>{}
	_connected = false
	setupCode = []
	database = new Database()
	constructor(host,user,password,database){
		super()
		// this._url = url
		database = `${database}.db`
		sqlite_create(database)
		this.use(database)
	}
	use(database){
		if(database){
			this.database = new Database(database)
			console.log("conection to database")
			this.database.on('connected',()=>{
				this._connected = true
				console.log("conected to database")
				this.onconnected()
			})
		}
	}
	onconnected(){}
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
				SQLparser(sql)
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
function SQLparser(sql){
	var cmds = sql.split(';')
	var sql_O = {
		tables:[],
	}
	cmds.forEach(cmd=>{
		cmd = cmd.split(' ')
		switch(cmd[0].toLowerCase()){
			case "create":{
				if(cmd[1].toLowerCase() == "table"){
					var t = {}
					t.name = cmd[2]
					var line = cmd.slice(cmd.find((a)=>{a=="("})).join(' ')
					t.row = line.split(/\,[\r\n\t]*/).map(x=>{
						x = x.trim().split(' ');
						var typ = x[1].match(/[a-z]*/ig)[0]
						if(datatypes[typ]){
							return {name:x[0],type:x[1]}
						}
					}).reduce((p,o)=>{if(o)p.push(o);return p},[])
					sql_O.tables.push(t)
				}
			}break;
		}
	})
	return sql_O
}
function Objectparser(tables){
	var _tables = []
	for(var table in tables){
		var _table = {}
		_table.name = table
		_table.row = Object.keys(tables[table]).map(x=>{
			var tp = tables[table][x]
			if(!datatypes[tp])tp = "INTEGER"
			return {
				name:x,
				type:tp
			}
		})
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
var connections = []
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
		connections.push(sql)
		if(options.tables){
			sql.load(options.tables)
		}
		/*
		if(options.init){
			if(fs.existsSync(options.init) && !fs.existsSync(database)){
				sqlite_init(database,options.init)
			}
		}*/
		return sql
	},
	datatypes,
	exec,
	select:({database,table,column,where})=>{
		var con = connections.find(x=>x.database.name==database)
		if(!con.database[table])throw "unkonw table "+table
		var sta = con.database[table].select(column,where)
		return sta
	},
	insert : ({database,table},values)=>{
		var con = connections.find(x=>x.database.name==database)
		if(!con.database[table])throw "unkonw table "+table
		return con.database[table].insert(values)
	}
}