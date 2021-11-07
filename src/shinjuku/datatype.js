class DATATYPE{
	static from(value){
		var clazz = Object.values(equivalents).find(x=>x==this.constructor.name)
		if(clazz){
			return new clazz(value)
		}else{
			return undefined
		}
	}
}
class VARCHAR extends DATATYPE{}
class INTEGER extends DATATYPE{}
class FLOAT extends DATATYPE{}
class DATETIME extends DATATYPE{}
class BOOLEAN extends DATATYPE{}
class DECIMAL extends DATATYPE{}
class DATE extends DATATYPE{}

var datatypes = {
	VARCHAR,INTEGER,FLOAT,DATETIME,BOOLEAN,DECIMAL,DATE,INT:INTEGER,
	String,Number,Date,Boolean,
}
var equivalents = {
	"String":VARCHAR,
	"Number":FLOAT,
	"Date":DATE,
	"Boolean":BOOLEAN,
}
function converts(value){
	var type = typeof value
	type == ""
	if(type == "object"){
		console.log(value)
		type = a.constructor.name
	}
	var values = [x]
	Object.keys(equivalents).forEach(x=>{
		if(x.toLowerCase()!=type){
			values.push(equivalents[x].from(value))
		}
	})
	return values
}

module.exports = {
	datatypes,
	converts
}