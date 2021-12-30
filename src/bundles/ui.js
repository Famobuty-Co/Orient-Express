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
	toComponent(selector){
		var style = create("style")
		style.write(`
		${selector||"body"}{
			${this.toString()}
		}
		`)
		return style
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
const ComponentEvent = {
	onappending:Symbol("onappending"),
}
class Component {
	static ComponentNumber = 0
	_attributes = new Map()
	_content = new  Set()

	#document = null
	get document(){
		return this.#document||this
	}
	set document(value){
		this.#document = value
		if(this.hasEventListener("documentupdated")){
			this.dispatchEvent(createEvent("documentupdated",{target:this,document:this.document}))
			this.removeEventListener("documentupdated")
		}
	}

	get childCount (){
		return this._content.size
	}
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
	static parse = /^[a-z]+|\.[a-z]+|\[[a-z]+(\=)?\w+\]/
	getElementById(id){
		return [...this._content].find(x=>x.id == id)
	}
	getElementByName(name){
		return [...this._content].find(x=>x.getAttribute('name') == name)
	}
	getElementsByClassName(className){
		return [...this._content].filter(x=>x.classList.has(className))
	}
	getElementsByTagName(tag){
		return [...this._content].filter(x=>{
			// console.log(x._tag , tag)
			return x._tag == tag
		})
	}
	isSelector(selector){
		// var rg = new RegExp(this.selector)
		selector = selector.toLowerCase()
		var parsed = selector.match(Component.parse)
		// parsed.every(x=>{
		// 	if(x == this._tag){
		// 		return true
		// 	}else{
		// 		var f =x[0]
		// 		switch(f){
		// 			case ".":
		// 				return this.classList.has(x.slice(1))
		// 		}
		// 	}
		// })

		return selector.startsWith(this._tag)
		
		//rg.test()
	}
	querySelectorAll(selector){
		var elements = [...this._content].reduce((p,x)=>{
			if(x instanceof Component){
				var s = x.isSelector(selector)
				if(!s){
					s = x.querySelectorAll(selector)
					p.push(s)
				}else{
					p.push(x)
				}
			}
			return p
		},[]).flat()
		return elements
	}
	querySelector(selector){
		var element = this.querySelectorAll(selector)[0]
		return element
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
		var appendEvent = "appending"
		child.parent = this
		if(child.hasEventListener(appendEvent)){
			child.dispatchEvent(createEvent(appendEvent,{target:child}))
			child.removeEventListener(appendEvent)
		}
		return this
	}
	remove(child){
		this._content.delete(child)
		return this
	}
	addEventListener(event,callback){
		if(!callback && typeof callback!="function")return
		event = 'on'+event
		if( typeof callback == "function" ){
			
		}
		if( typeof callback == "string" ){
			callback = `(event)=>{${callback}}`
		}
		// if(this.hasAttribute(event)){
		// 	callback = callback
		// }
		this.setAttribute(event,callback)
		return this
	}
	#createStringCallBack(callback){
		return `(${callback.toString()})(event)`
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
		if(typeof callback != "function"){
			callback = new Function("event","app",callback)
		}
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
			if(!v)return
			var t = v.toString()
			if(k.startsWith('on')){
				t = this.#createStringCallBack(t)
			}
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
	document = null
	styles = create("style").write()
	scripts = create("script").write()
	constructor(title,app){
		super("html")
		this.head = create("head")
		this.body = create("body")
		this.title = create("title").write(title)
		

		var charset = create('meta')
		charset.setAttribute('charset',"UTF-8")

		super.append(this.head)
		super.append(this.body)
		this.head.append(this.title)
		this.head.append(charset)
		this.head.append(this.styles)
		this.head.append(this.scripts)
		this.body.style.margin = "auto"

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

		obj.body = obj.getElementsByTagName("body")[0]

		obj.head = obj.getElementsByTagName("head")[0]
		obj.title = obj.head.getElementsByTagName("title")[0]
		obj.scripts =obj.head.getElementsByTagName("script")[0]
		obj.styles = obj.head.getElementsByTagName("style")[0]
		return obj
	}
}
const Unit = {}
Unit.convert=(value="",element = {},woh)=>{
		var number = value.split(/[^0-9]/).join('')||0
		var type = value.split(/[0-9]/).join('')
		var unit;
		var style = element.style
		switch(type){
			case "em":unit = style.fontSize;break
			case "%":unit = woh?style.height:style.width;break
			default:unit = 1
		}
		return number*unit
	}
Unit.max =(...args)=>{
		var _args = args.map(x=>Unit.convert(x))
		return args[_args.indexOf(Math.max(..._args))]
	}
Unit.min = (...args)=>{
		var _args = args.map(x=>Unit.convert(x))
		return args[_args.indexOf(Math.min(..._args))]
	}
module.exports = {
	create,
	createEvent,
	Component,Button,Label,Input,Document,
	ComponentEvent,Unit
}