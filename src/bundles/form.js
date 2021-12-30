const Table = require("../shinjuku/table")
const {create, Component} = require("./ui")

class Form extends Component{
	constructor(data,tag){
		super(tag||"form")
		console.log("tagName",tag)
		if(data instanceof Table){
			data.columns.forEach(column=>{
				this.addInput(column.name,{
					type:column.type,
				});
			})
		}else{
			data = Object.keys(data).forEach(label=>{
				this.addInput(label,{value:data[label]});
			})
		}
		var submit = create("submit",{
			text:"submit",
		})
		submit.classList.add("btn")
		submit.addEventListener('click',(event)=>{
			var obj = {}
			var inputs = this.parentElement.querySelectorAll('input')
			for (const input of inputs) {
				obj[input.getAttribute('name')] = input.value;
				input.value = input.min||'';
			}
			sockets.send({
				type:'form',
				form:obj,
			})
			sockets.onmessage = (data)=>console.log(data)
		})
		this.append(submit)
		if(Form.websocketserver){
			this._tag = "div"
			this.setMethod('fetch')
			this.setAction('#success')
		}
	}
	addInput(text,option){
		var div = create("div")
		div.classList.add("input-group")
		div.classList.add("form-control")
		var label = create("label",text)
		var input = create("input")
		if(option.type){input.type = option.type}
		if(option.min){input.min = option.min}
		if(option.value){input.value = option.value}
		if(option.max){input.max = option.max}
		if(option.step){input.step = option.step}
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
	static websocketserver;
	static create(data,tag){
		return new Form(data,tag)
	}
}

module.exports = {Form,setup:(app)=>{
	if(app.createSocketServer){
		if(app.websocketserver){
			Form.websocketserver = app.websocketserver
		}
	}
	app.createForm = Form.create
},}