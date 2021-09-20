class Component{
	_attributes = new Map()
	_content = new  Set()
	get innerHTML(){return [...this._content].map(x=>x?x.toString():"").join('')}
	set innerHTML(html){this._content = new Set();this._content.add(html)}

	_tag = ""
	get tagName(){return this._tag}
	set tagName(html){this._tag = html}

	constructor(tag,value){
		this.tagName = tag
		switch(typeof value){
			case "string":
			default:
				this.innerHTML = value;break;

		}
	}
	setAttribute(name,value){
		this._attributes.set(name,value)
	}
	hasAttribute(name,value){
		this._attributes.has(name,value)
	}
	getAttribute(name,value){
		this._attributes.get(name,value)
	}
	append(child){
		this._content.add(child)
	}
	addEventListener(event,callback){
		if(!callback && typeof callback!="function")return
		event = 'on'+event
		callback = `(${callback.toString()})()`
		if(this.hasAttribute(event)){
			callback = this.getAttribute(event)+";"+callback
		}
		this.setAttribute(event,callback)
	}
	toString(){
		var attrs = []
		this._attributes.forEach((v,k)=>{
			attrs.push(`${k}="${v}"`)
		})
		return `<${this._tag} ${attrs.join(' ')}>${this.innerHTML}</${this._tag}>`
	}
}
class Label extends Component{

}
class Input extends Component{
	constructor(tag,value){
		super(tag)
		this.setAttribute('value',value)
	}
}
class Button extends Component{
	constructor(tag,value = {}){
		super("button",value.text||"Click")
		this.addEventListener('click',value.click)
	}
}
function create(tag,data){
	var c = null
	switch(tag){
		case "label":
		case "text":
			c = Label;break;
		case "input":
			c =  Input;break;
		case "submit":
		case "button":
			c =  Button;break;
		default:
			c = Component;
	}
	return c?new c(tag,data):null
}
module.exports = {
	create,
	Component,Button,Label,Input
}