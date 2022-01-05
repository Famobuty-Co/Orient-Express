class Table extends Array{
	#columns = []
	get columns(){
		return this.#columns
	}
	constructor(...columns){
		super(0)
		this.#columns = columns
	}
	insert(...items){
		this.push(...items)
	}
	select(callback = ()=>true){
		return this.filter(callback)
	}
	random(number=this.length){
		return this.sort((a,b)=>Math.random()*2-1).slice(0,number)
	}
}
module.exports = Table