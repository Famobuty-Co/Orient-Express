const Table = require('./_table')
const {sqlite_exec,sqlite_init,sqlite_create} = require('./driver')
const {Event} = require("../extra/event")
const {Objectparser,SQLparser,Classparser} = require('./parser')

class Database extends Event{
	isConnected = false
	_tables = []
	constructor(database){
		super()
		this.name = database
		const conxion = ()=>{
			console.log("connected to the base")
			this.isConnected = true
			this.onconnected?.call()
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
					if(!this[_table.name]){
						this._tables.push(_table)
						this[_table.name] = new Table(this,_table)
					}
					c--
					console.log("connection in "+c+"...")
					if(c<=0){
						conxion()
					}
				})
			})
		})
	}
	Register(_table){
		this._tables.push(_table)
		//utils
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
			if(values.length){
				this.run(`create table ${_table.name}(id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,${values});`)
			}else{
				throw `${_table.name} has no column`
			}
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

module.exports = Database