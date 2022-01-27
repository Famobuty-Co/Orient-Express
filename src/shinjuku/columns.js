class Column{
	#name = ""
	#type = ""
	#default = ""
	get name(){
		return this.#name
	}
	get type(){
		return this.#type
	}
	#compare
	constructor(name,type,options = {}){
		this.#name = name
		this.#type = type.toLowerCase()
		this.#default = options.default||null
		switch(this.#type){
			case "string":
				this.#compare = (a,b)=>a.localeCompare(b)
			case "date":
				this.#compare = (a,b)=>a-b
			default:
				this.#compare = (a,b)=>a-b
		}
	}
	get compare(){
		return this.#compare
	}
	toString(){
		return `${this.#name} ${this.#type}`
	}
	[Symbol.toStringTag](){
		return this.toString()
	}
}
class Columns{
	#array = []
	get(name){
		return this.#array.find(x=>x.name == name)
	}
	has(item){
		return this.get(item.name)!=null
	}
	add(item){
		if(item instanceof Column && !this.has(item)){
			this.#array.push(item)
		}else{
			console.error(item.toString())
		}
	}
	push(item){
		this.add(item)
	}
	forEach(callback){
		this.#array.forEach(callback)
	}
	constructor(columns = []){
		columns.forEach(element => {
			this.add(element)
		});
	}
}
module.exports = {Column,Columns}