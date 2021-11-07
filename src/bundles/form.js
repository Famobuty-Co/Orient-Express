const {create, Component} = require("./ui")

class Form extends Component{
	constructor(data){
		super("form")
		Object.keys(data).forEach(label=>{
			this.addInput(label,data[label])
		})
		var submit = create("submit",{
			text:"submit",
		})
		this.append(submit)
	}
	addInput(text,data){
		var div = create("div")
		var label = create("label",text)
		var input = create("input",data)
		input.setAttribute('name',text)
		div.append(label)
		div.append(input)
		this.append(div)
	}
	setMethod(method){
		this.setAttribute("method",method)
	}
	setAction(action){
		this.setAttribute("action",action)
	}
	static create(data){
		return new Form(data)
	}
}

module.exports = {Form,setup:(app)=>{app.createForm = Form.create},}