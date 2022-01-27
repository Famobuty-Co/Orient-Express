const Table = require("../shinjuku/table")
const {create, Component} = require("./ui")

class Form extends Component{
	constructor(data,tag = "form",options = {}){
		super(tag)
		if(data instanceof Table){
			data.columns.forEach(column=>{
				var otpn = options[column.name]
				if(typeof otpn != "object"){
					otpn = {name:otpn}
				}
				if(otpn == null){
					return
				}
				otpn = Object.assign(otpn,column)
				this.addInput(column.name,otpn);
			})
		}else{
			data = Object.keys(data).forEach(label=>{
				var obj = data[label]
				if(typeof obj != "object"){
					obj = {value:obj,}
				}
				this.addInput(label,obj);
			})
		}
		var submit = create("submit",{
			text:"submit",
		})
		submit.classList.add("btn")
		this.append(submit)
		if(Form.websocketserver && tag=="div"){
			submit.addEventListener('click',(event)=>{
				var obj = {}
				var inputs = this.parentElement.querySelectorAll('.input')
				for (const input of inputs) {
					obj[input.getAttribute('name')] = input.value;
					input.value = input.min||'';
				}
				sockets.send({
					type:'form',
					form:obj,
				})
				// sockets.onmessage = (data)=>console.log(data)
			})
			this.setMethod('fetch')
			this.setAction('#success')
		}
	}
	addInput(text,option){
		var div = create("div")
		div.classList.add("input-group")
		div.classList.add(text)
		if(option.tagName){
			div.classList.add("form-control")
		}else{
			div.classList.add("floating-form")
		}
		var label = create("label",text)
		var input = create(option.tagName||"input")
		input.setAttribute('placeholder',text)
		input.setAttribute('class',"input")
		input.setAttribute('id',text)
		label.setAttribute('for',text)
		if(option.type){input.setAttribute("type",option.type)}
		if(option.min){input.setAttribute("min",option.min)}
		if(option.value){input.setAttribute("value",option.value)}
		if(option.tagName == "select" && option.options){
			option.options.forEach(x=>{
				var o = create("option",x)
				o.setAttribute("value",x)
				input.append(o)
			})
		}
		if(option.max){input.setAttribute("max",option.max)}
		if(option.step){input.setAttribute("step",option.step)}
		input.setAttribute('name',text)
		div.append(input)
		div.append(label)
		if(option.tips){
			var tips = create("p",option.tips)
			tips.classList.add("tips")
			div.append(tips)
		}
		this.append(div)
	}
	setMethod(method){
		this.setAttribute("method",method)
	}
	setAction(action){
		this.setAttribute("action",action)
	}
	static websocketserver;
	static create(data,tag,options){
		return new Form(data,tag,options)
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