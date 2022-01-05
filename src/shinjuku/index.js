const { Event } = require("../extra/event");
const Column = require("./columns");
const Table = require("./table");

const database = {}
class Connection extends Event{
	tables = database
	constructor(){
		super()
		this.register("connected")
		setTimeout(()=>{
			this.onconnected?.call()
		},1000)
	}
}
function createTable(object){
	console.log(object)
	var columns = []
	Object.keys(object).forEach(name=>{
		var value = object[name]
		columns.push(new Column(name,value))
	})
	var table = new Table(...columns)
	return table
}
function createConnection(data){
	if(data.entities){
		Object.keys(data.entities).forEach(element => {
			if(! database[element]){
				database[element] = createTable(data.entities[element])
			}
		});
	}

	
	return new Connection()
}

module.exports = {
	createConnection
}