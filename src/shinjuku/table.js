function filter_to_Where(callback){
	callback = callback.toString().split(';').trim()
	
}

class Table{
	_array = []
	_Insert = []
	constructor(database,data = {name:"view",}){
		this.database = database
		this.name = data.name.trim().split(/[^a-z;^A-Z]/)[0]
		console.log(data.name,this.name)
		if(data.clazz){
			this.CLAZZ = data.clazz
		}else{
			this.CLAZZ
		}
		this.#reload()
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
		if(typeof condition == "object"){
			if(Object.keys(condition).length){
				where = "WHERE " 
				for(var name in condition){
					var value = condition[name]
					if(typeof value == "number")value = " = "+value
					where += `${name} ${value} `
				}
			}
		}else if(typeof condition == "string"){
			where = "WHERE "+condition
		}
		var statement = this.database.run(`SELECT ${columns} FROM ${this.name} ${where}`)
		statement = eval(statement)||[]
		if(columns == "*"){
			statement.forEach(row=>{
				this._array[row.id] = row
			})
		}
		return statement
	}
	random(number=this.length){
		var n;
		var ls = this.reduce((p,o)=>{
			n = Math.random()<.5
			if(p.length<number && n){
				p.push(o)
			}
			return p
		});
		return ls
	}
	search(){
		
	}
	reduce(callback,value = []){
		return this.select("*").reduce(callback,value)
	}
	filter(callback){
		var filter = filter_to_Where(callback)
		if(filter){
			return this.select("*",filter)
		}else{
			return this.select("*").filter(callback)
		}

	}
	forEach(callback){
		this.select("*").forEach(callback)
	}
	map(callback){
		return this.select("*").map(callback)
	}
	toString(){
		return Object.keys(this).reduce(
			(p,o)=>{
				if(typeof o == "number"||parseInt(o)){
					p.push(this[x])
				}
			},[])
	}
	[Symbol.toPrimitive](hint) {
		if (hint === 'number') {
		  return this.#length;
		}else if(hint === 'string'){
			return this.toString()
		}
		return null
	}
	isFetch(){
		return this.database.run(`.schema ${this.name}`)
	}
	#length = 0
	get length (){
		if(!this.isFetch())return 0
		var statement = this.database.run(`SELECT COUNT(*) FROM ${this.name}`)
		statement = eval(statement)||[]
		statement = statement[0]["COUNT(*)"]
		console.log(statement)
		return statement||0
	}
	#reload(){
		var length = this.length
		if(length != this.#length){
			var statement = this.database.run(`SELECT id FROM ${this.name} WHERE id BETWEEN ${this.#length} AND ${length}`)
			statement = eval(statement)||[]
			/*
			statement.forEach(x=>{
				Object.defineProperty(this,x.id,{
					get:()=>{return this.selectLine(x.id)},
					set:()=>{},
				})
			})
			*/
			this.#length = length
		}
	}
}

module.exports = Table