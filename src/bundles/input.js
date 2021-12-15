const {create, Component} = require("./ui")

let sockets;

class Input extends Component{
	constructor(data){
		super("input")
		this.setAttribute("type",data.type||"text")
		this.setAttribute("name",data.name||"input")
		this.addEventListener('change',(event)=>{
			var obj = {}
			obj[this.getAttribute('name')] = this.value
			sockets.send(obj)
			sockets.onmessage = (data)=>console.log(data)
		})
	}
	static create(data){
		return new Input(data)
	}
}

module.exports = {
	Input,
	setup:(app)=>{
		app.createInput = Input.create
		sockets = app.webSocket
		var page = app.constructor.page
		page.prototype.InputsCount = 0
		page.prototype.createInput = function(...args){
			if(this.InputsCount==0){
				// this.scripts.write()
			}
			this.InputsCount++
			return Input.create(...args)
		}
	},
}