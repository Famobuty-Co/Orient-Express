
const datatypes = require('./datatype')
const Database = require('./database')
const {sqlite_init,sqlite_create} = require('./driver')
const {Objectparser,SQLparser,Classparser} = require('./parser')
const fs = require("fs")
const {Event} = require("../extra/event")
const { join } = require('path')

class Shijuku_Connection extends Event{
	_url = "127.0.0.1"
	_connect = ()=>{}
	_connected = false
	setupCode = []
	tables = new Database()
	constructor(host,user,password,database){
		super()
		// this._url = url
		this.name = database
		database = `${database}.db`
		//sqlite_create(database)
		this.use(database)
	}
	select(...args){
		this.tables.select(...args)
	}
	use(database){
		if(database){
			this.tables = new Database(database)
			console.log("conection to database")
			this.tables.on('connected',()=>{
				this._connected = true
				console.log("conected to database")
				this.onconnected?.call()
			})
		}
	}
	query(sql,callback){
		console.log(sql," : ",SQLExec(sql))
	}
	load(tables){
		console.log("41",tables.length)
		if(tables instanceof Array){
			tables.forEach(table=>{
				if(typeof table == "string"){
					this.loadSQL(table)
				}else if(table.constructor){
					this.loadClass(table)
				}else{
					this.loadObject(table)
				}
			})
		}else{
			this.loadObjects(tables)
		}
		return this
	}
	exec(JS){
		const exec = (cmd)=>{
			console.log(`SQL : ${cmd}`)
			var ret = this.tables.run(cmd)
			console.log(ret)
		}
		if(JS == "tables"){
			exec(".tables")
		}else{
			var path = JS.split('.')
			var table = path[0]
			if(this.tables[table]){
				console.log(table)
				table = this.tables[table]
				console.log(path)
				if(path[1]?.split('(')[0] == "push"){
					var args = path.slice(1).join('.').split('(').slice(1).join('(').slice(0,-1)
					args = eval(`[${args}]`)
					console.log("push",args)
					table.insert(...args)
					console.log(table.select())
				}else{
					console.log(table.select())
				}
			}
		}
	}
	loadClass(...clazz){
		console.log("54",clazz)
		clazz.forEach(table=>{
			var _table = Classparser(table)
			this.tables.Register(_table)
		})
		return this
	}
	loadObjects(objs){
		var _tables = Objectparser(objs)
		_tables.forEach(_table=>{
			this.tables.Register(_table)
		})
	}
	loadObject(...clazz){
		clazz.forEach(table=>{
			var _tables = Objectparser(table)
			_tables.forEach(_table=>{
				this.tables.Register(_table)
			})
		})
		return this
	}
	loadSQL(...sql){
		sql.forEach(table=>{
			if(fs.existsSync(table)){

				if(table.endsWith('.sql'))
					sqlite_init(this.tables.name,table)
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

var connections = []
module.exports = {
	createConnection:(options)=>{
		var host = options.host||"127.0.0.1"
		var user = options.user||"root"
		var password = options.password||""
		var database = options.name||options.database
		var sql = null
		if(!fs.existsSync(database)){
			sqlite_create(database)
		}
		if(database){
			sql = new Shijuku_Connection(host,user,password,database)
		}else{
			sql = new Shijuku_Connection(host,user,password)
		}
		if(!options.entities)
			options.entities = options.tables
		connections.push(sql)
		console.log(options.entities)
		if(options.entities){
			sql.load(options.entities)
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
	select:({database,table,column,where})=>{
		if(! database.endsWith('.db')){
			database+=".db"
		}
		var con = connections.find(x=>x.tables.name==database)
		if(!con.tables[table])throw "unkonw table "+table
		var sta = con.tables[table].select(column,where)
		return sta
	},
	insert : ({database,table},values)=>{
		if(! database.endsWith('.db')){
			database+=".db"
		}
		var con = connections.find(x=>x.tables.name==database)
		if(!con.tables[table])throw "unkonw table "+table
		return con.tables[table].insert(values)
	}
}