
const datatypes = require('./datatype')
const Database = require('./database')
const {sqlite_init,sqlite_create} = require('./driver')
const {Objectparser,SQLparser,Classparser} = require('./parser')
const fs = require("fs")
const {Event} = require("../extra/event")

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
			this.tables.Register(_table)
		})
		return this
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