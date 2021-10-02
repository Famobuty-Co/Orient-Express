const {create, Component} = require("./ui")

class Card extends Component{
	constructor(data){
		super("div")
		Object.keys(data).forEach(label=>{
			this.addData(label,data[label])
		})
		var more = create("button",{
			text:"more",
		})
		this.append(more)
	}
	addData(text,data){
		var div = create("div")
		var label = create("label",data)
		label.setAttribute('name',text)
		div.append(label)
		this.append(div)
	}
	setAction(action){
		this.setAttribute("action",action)
	}
	static create(data){
		return new Card(data)
	}
}

module.exports = {Card}