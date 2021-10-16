function filter_to_Where(callback){
	callback = callback.toString().split(';').trim()
	
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
}

module.exports = Table