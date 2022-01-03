const {create, Component} = require("./ui")
const mime = require("../mime/mime")
const { url } = require("../extra/static")

class Row extends Component{
	constructor(data,options){
		super("tr")
		this.classList.add('card')
		Object.keys(data).forEach(label=>{
			if(typeof options[label] == "object" && options[label] == null)return
			var div = create("td")
			div.classList.add(label)
			if(url.test(data[label])){
				var m = mime.lookup(data[label])
				if(/image/.test(m)){
					var thumbnail = create("img")
					div.append(thumbnail)
					thumbnail.setAttribute("src",data[label])
				}else{
					var more = create("button",{
						text:"more",
					})
					more.addEventListener("click",`location.assign('${data[label]}')`)
					div.append(more)
				}
			}else{
				var text = create("label",data[label])
				text.setAttribute('name',label)
				div.append(text)
			}
			this.append(div)
		})
	}
	setAction(action){
		this.setAttribute("action",action)
	}
	static create(data){
		return new Row(data)
	}
}
class Table extends Component{
	constructor(){
		super("table")
	}
	add(row){
		this.append(row)
	}
	static create(tables,options = {}){
		var table = new Table()
		tables.forEach(x=>{
			var s = new Row(x,options)
			table.add(s)
		})
		return table
	}
}
module.exports = {Table,Row,setup:(app)=>{
	app.createTable = Table.create
	app.createRow = Row.create
},}