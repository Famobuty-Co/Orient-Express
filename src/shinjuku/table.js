const { Columns, Column } = require("./columns")

class Table extends Array{
	#columns = new Columns
	get columns(){
		return this.#columns
	}
	constructor(...columns){
		super(0)
		if(!(columns instanceof Columns)){
			columns = new Columns(columns)
		}
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
	last(number=1){
		return this.slice(-number)
	}
	sort(callback){
		if(callback instanceof Column){
			var compare = callback.compare
			var _callback = (a,b)=>{
				a = a[callback.name]
				b = b[callback.name]
				return compare(a,b)
			}
			return super.sort(_callback)
		}else{
			return super.sort(callback)
		}
	}
}
module.exports = Table