const {noop} = require("./extra/static")

function compareString(a,b){
	var i = 0
	b.split("").forEach(x=>{
		if(a.includes(x))i++
	})
	return i
}

class AccesTable{
	static Acces = class{
		static methods = ["DEFAULT","GET","POST","STATIC"]
		setAcces(method,callback){
			method = method.toUpperCase()
			if(! (this.constructor.methods.includes(method))) method = this.constructor.methods[0]
			this[method] = callback
		}
	}
	table = {}
	append(path,optn = {}){
		if(!this.table[path])
			this.table[path] = new AccesTable.Acces()
		this.table[path].setAcces(optn.method||"default",optn.callback||noop)
	}
	find(method,path){
		method = method.toUpperCase()
		var url = path.split("#")[0].split('?')[0]
		var callback = null
		var table = this.table[path]
		console.log(table , this.table,path)
		if(table){
			callback = table[method]||table.DEFAULT
		}else{
			path = url
			var keys = Object.keys(this.table).filter(x=>(new RegExp(x)).test(path))
			keys = keys.sort((a,b)=>compareString(b,path)-compareString(a,path))
			path = keys[0]
			table = this.table[path]
			if(table)
				callback = table[method]||table.DEFAULT||callback
		}
		if(callback && ((!table.STATIC)||url==path)){
			return callback
		}
		return noop
	}
	sort(){
		var keys = Object.keys(this.table)
		return keys.sort((a,b)=>a.length-b.length)
	}
}

module.exports = AccesTable