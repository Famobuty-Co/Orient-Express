class StyleSheet{
	toString(){
		
		var css = Object.keys(this).map(key=>{
			var value = this[key]
			while(/[A-Z]/.test(key)){
				var s = key.search(/[A-Z]/);
				var b = key.slice(0,s);
				var a = key.slice(s+1);
				var c = "-"+key.slice(s,s+1).toLowerCase();
				key = b+c+a;
			}
			return `${key}:${value}`
		})
		return css.join(';')
	}
	[Symbol.toStringTag](){
		return this.toString()
	}
	[Symbol.toPrimitive](){
		return this.toString()
	}
	
	[Symbol.toString](){
		return this.toString()
	}
}
class ClassList extends Set{
	toString(){
		return [...this].join(" ")
	}
	[Symbol.toStringTag](){
		return this.toString()
	}
	[Symbol.toPrimitive](){
		return this.toString()
	}
	
	[Symbol.toString](){
		return this.toString()
	}
}

class Component{
	static ComponentNumber = 0
	_attributes = new Map()
	_content = new  Set()
	get innerHTML(){return [...this._content].map(x=>x?x.toString():"").join('')}
	set innerHTML(html){this._content = new Set();if(html)this._content.add(html)}

	style = new StyleSheet()
	classList = new ClassList()

	_tag = ""
	get tagName(){return this._tag}
	set tagName(html){this._tag = html}

	constructor(tag,value){
		this.id = Component.ComponentNumber++
		this.tagName = tag
		switch(typeof value){
			case "string":
			default:
				this.innerHTML = value;break;

		}
		this._attributes.set('style',this.style)
		this._attributes.set('class',this.classList)
	}
	static cloneContent(_content){
		var _content = [..._content].map(x=>{
			var y = x
			if(x instanceof Component)
				y = x.clone()
			return y
		})
		return _content
	}
	
	get selector(){
		return `${this.tagName}?${[...this.classList].map(x=>"\."+x+"?").join("")}`
	}
	isSelector(selector){
		var rg = new RegExp(this.selector)
		return rg.test(selector.toLowerCase())
	}
	querySelectorAll(selector){
		return [...this._content].filter(x=>{
			if(x instanceof Component){
				var s = x.isSelector(selector)
				if(!s){
					s = x.querySelectorAll(selector)
				}
				return s
			}
		}).flat()
	}
	querySelector(selector){
		return [...this._content].find(x=>{
			if(x instanceof Component){
				var s = x.isSelector(selector)
				if(!s){
					s = x.querySelector(selector)
				}
				return s
			}
		})
	}
	clone(){
		var obj = new this.constructor(this.tagName,this.innerHTML)
		obj._attributes = new Map(this._attributes);
		obj._content = new Set();
		[...this._content].forEach(x=>{
			var y = x
			if(x instanceof Component){
				y = x.clone()
			}
			obj._content.add(y)
		})
		return obj
	}
	write(value=""){
		if(value instanceof Date){
			value = value.toISOString().split(/[A-Z]|\./).slice(0,2).join(' - ')
		}
		this.innerHTML += value
		return this
	}
	setAttribute(name,value){
		this._attributes.set(name,value)
		return this
	}
	hasAttribute(name){
		return this._attributes.has(name)
	}
	getAttribute(name,value){
		return this._attributes.get(name,value)
	}
	removeAttribute(name){
		this._attributes.delete(name)
		return this
	}
	append(child){
		// if(typeof child != "object")
			// throw "Uncaught TypeError: Component.appendChild: Argument 1 is not an object."
		// if(! child instanceof Component)
			// throw "Uncaught TypeError: Component.appendChild: Argument 1 does not implement interface Node."
		this._content.add(child)
		return this
	}
	addEventListener(event,callback){
		if(!callback && typeof callback!="function")return
		event = 'on'+event
		callback = `(${callback.toString()})(event)`
		if(this.hasAttribute(event)){
			callback = this.getAttribute(event)+";"+callback
		}
		this.setAttribute(event,callback)
		return this
	}
	removeEventListener(event){
		event = 'on'+event
		this.removeAttribute(event)
	}
	hasEventListener(event){
		event = 'on'+event
		return this.hasAttribute(event)
	}
	dispatchEvent(event){
		var name = 'on'+(event.type||event.name)
		var callback = this.getAttribute(name)
		callback = new Function("event","app",callback)
		callback(event,event.app)
		return this
	}
	setName(name){
		this.style.gridArea = name
		this.classList.add(name)
		this.setAttribute("name",name)
	}
	toString(){
		var attrs = []
		this._attributes.forEach((v,k)=>{
			var t = v.toString()
			if(t && t.length!=0){
				attrs.push(`${k}="${t}"`)
			}
		})
		var innerHTML = [...this._content].map(x=>x?x.toString():"").join('')
		return `<${this._tag} ${attrs.join(' ')}>${innerHTML}</${this._tag}>`
	}
	[Symbol.toStringTag](){
		return this.toString()
	}
	[Symbol.toPrimitive](){
		return this.toString()
	}
	
	[Symbol.toString](){
		return this.toString()
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
function createEvent(eventName,content = {}){
	const event = Object.assign({},content)
	if(!event.target){
		event.target = this
	}
	event.name = event.type  = eventName
	return event
}

class Document extends Component{
	constructor(title,app){
		super("html")
		this.head = create("head")
		this.body = create("body")
		this.title = create("title").write(title)
		this.style = create("style").write()
		this.script = create("script").write()

		super.append(this.head)
		super.append(this.body)
		this.head.append(this.title)
		this.head.append(this.style)
		this.head.append(this.script)
	}
	write(...args){
		this.body.write(...args)
		return this
	}
	setTitle(title){
		this.title.innerHTML = title
		return this
	}
	clone(){
		var obj = super.clone()
		obj.body = obj.querySelector("body")
		obj.head = obj.querySelector("head")
		obj.title = obj.querySelector("title")
		obj.script =obj.querySelector("script")
		obj.style = obj.querySelector("style")
		return obj
	}
}

module.exports = {
	create,
	createEvent,
	Component,Button,Label,Input,Document
}