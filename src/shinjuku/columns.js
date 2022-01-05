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
	constructor(name,type,options = {}){
		this.#name = name
		this.#type = type
		this.#default = options.default||null
	}
}
module.exports = Column