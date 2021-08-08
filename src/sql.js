const mysql = require("mysql")

class SHIJUKU{
	databases = {}
	USE(name){
		this.database = this.databases[name]
	}
	CREATE = {
		DATABASE:(name)=>{
			if(!name)return
			this.databases[name] = new DATABASE
			return this
		},
		TABLE:(name)=>{
			if(!name)return
			var args = TABLE.parse(name)
			this.database.tables[args[0]] = new TABLE(...args)
			return this
		},
	}
	SELECT(x){
		return new QUERY_REQUEST(x)
	}
	SHOW = {
		DATABASE:(name)=>{
			return this.databases[name]||this.databases
		},
		TABLE:(name)=>{
			return this.database.tables[name]||this.database.tables
		},
	}
	INSERT= {
		INTO:(table)=>{
			return new INSERT_REQUEST(table)
		},
	}
	GET(name){
		return this.database.tables[name]
	}
}
class DATABASE{
	constructor(){
	}
	tables = {}

}
class TABLE{
	constructor(name,...args){
		this.name = name
		this.columns = args
	}
	columns = []
	lines = []
	static parse(table){
		table = table.split(',')
		var args = [table[0],...(table.slice(1).join(',').slice(1,-1).split(',').map((x,n)=>!(n%2)?x:undefined))]
		return args
	}
}
class INSERT_REQUEST{
	table = null
	order = null
	constructor(table){
		table = table.split(',')
		this.table = table[0]
		this.order = table.slice(1).join(',').slice(1,-1).split(',')
	}
	VALUES(values){
		values = values.slice(1,-1).split(',')
		//exec
		var table = GLOBAL.GET(this.table)
		table.lines.push(new Array(table.columns.length))
		values.forEach((x,n)=>{
			var nn
			if(this.order)
				nn  = table.columns.indexOf(v=>v==this.order[n])
			if(nn<0)
				nn = n||0
			table.lines[table.lines.length-1][nn] = x
		})
	}
}
class QUERY_REQUEST{
	_columns = null
	_from = null
	_union = [this]
	constructor(columns){
		this.SELECT(columns)
	}
	FROM(table){
		this._from = GLOBAL.GET(table)
		var res = this._from
		console.log(res)
		return res.lines
		// return this
	}
	get UNION(){
		var _u = new QUERY_REQUEST
		this._union.push(_u)
		_u._union = this._union
		return _u
	}
	SELECT(columns=""){
		this._columns = columns.split(',')
		return this
	}
}
var SQL = new SHIJUKU;
var GLOBAL = SQL;
var KeyWord = new Set()
KeyWord.add('CREATE')
KeyWord.add('USE')
KeyWord.add('SHOW')
KeyWord.add('TABLE')
KeyWord.add('DATABASE')
KeyWord.add('SELECT')
KeyWord.add('FROM')
KeyWord.add('UNION')
KeyWord.add('INSERT')
KeyWord.add('INTO')
KeyWord.add('VALUES')
function SQLExec(sql){
	var rsls = []
	sql = sql.toUpperCase()
	sql = sql.split(';').map(x=>{
		x = x.trim()
		if(x.length<1)return
		var cmd = ""
		var args = []
		x = x.split(/\ |\,/).forEach(x=>{
			if(x.length<1)return
			if(KeyWord.has(x)){
				if(args.length){
					cmd += "(`"+args+"`)"
					args = []
				}
				cmd += "."+x
			}else{
				args.push(x)
			}
		})
		cmd = "GLOBAL"+cmd+"(`"+args+"`)"
		rsls.push(eval(cmd))
	})
	return rsls
}

function Read(){
	const fs = require('fs');
	const readline = require('readline');

	const rl = readline.createInterface({
		input: fs.createReadStream('file.txt'),
		output: process.stdout,
		terminal: false
	});

	rl.on('line', (line) => {
		console.log(line);
	});
}
class Database{
	_tables = []
	Register(_table){
		this._tables.push(_table)
		this[_table.name] = new Table(_table.clazz)
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
class Shijuku_Connection{
	_url = "127.0.0.1"
	_connect = ()=>{}
	_connected = false
	setupCode = []
	database = new Database()
	constructor(host,user,password){
		// this._url = url
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
	loadSQL(...sql){
		sql.forEach(table=>{

		})
		return this
	}
	export(){
		return {
			setup:this.setupCode.join(''),
		}
	}
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
module.exports = {
	createConnection:(options)=>{
		var host = options.host||"127.0.0.1"
		var user = options.user||"root"
		var password = options.password||""
		if(options.tables){
			return (new Shijuku_Connection(host,user,password)).load(...options.tables)
		}
		return new Shijuku_Connection(host,user,password)
	},
}