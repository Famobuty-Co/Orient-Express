const { Component,create ,Unit} = require("./ui");
const {GUID} = require('../extra/static')

class GridTemplateLine{
	#lineHeihgt = "auto"
	#elements = []
	get width(){
		return this.#elements.length
	}
	add(...items){
		this.#elements.push(...items)
	}
	set(name,x){
		this.#elements[x] = name
	}
	setHeight(height){
		this.#lineHeihgt = height
	}
	toString(){
		return `'${this.#elements.map(x=>{
			if(x instanceof Component){
				this.#lineHeihgt = Unit.max(this.#lineHeihgt,x.style.height)
				if(x.hasAttribute("name")){
					x = x.getAttribute('name')
				}else{
					var rid = GUID()
					x.setName(rid)
					x = rid
				}
				return x
			}
		}).join(' ')}'${this.#lineHeihgt}`
	}
	extend(length){
		var array = new Array(length).fill(0)
		array = array.map((x,n)=>{
			return this.#elements[(~~(n/length*this.length))]
		})
		this.#elements = array
	}
	get length (){
		return this.#elements.length
	}
	forEach(callback){
		this.#elements.forEach(callback)
	}
}

class GridTemplate{
	#rowsWidth = []
	#lines = []
	#resize(){
		this.#lines.forEach((x,n)=>{
			if(x.length<this.#rowsWidth.length){
				x.extend(this.#rowsWidth.length)
			}
		})
	}
	addLine(line,height){
		var _height = 0
		var _line = new GridTemplateLine()
		line.forEach((name,n)=>{
			_line.add(name)
			if(n>=this.#rowsWidth.length){
				this.#rowsWidth.push(name)
				this.#resize()
			}
		})
		_line.setHeight(height||_height||"auto")
		this.#lines.push(_line)
		this.#lines.forEach((x,n)=>{
			x.forEach((y,m)=>{
				if(y instanceof Component){
					var s = y.style.width!=undefined&&y.style.width!="auto"
					var z = this.#rowsWidth[m]
					if(z instanceof Component){
						z = z.style.width==undefined||z.style.width=="auto"
					}else{
						z = z=="auto"
					}
					if(s && z){
						this.#rowsWidth[m] = y
					}
				}
			})
		})

	}
	addRow(name,width){
		if(name instanceof Component && !width){
			width = name.style.width
		}
		this.#rowsWidth.push(width||"auto")
		this.#lines.forEach(line=>{
			line.add(name)
		})
	}
	setLine(y,name,height){
		if(name instanceof Component && !height){
			height = name.style.height
		}
		this.#lines[y] = this.#lines[y].map(x=>{return name})
		this.#lines[y].setHeight(height||"auto")
	}
	setArea(name,x=1,y=1){
		var w = this.width
		if(this.width > x){
			if(this.height > y){
				this.#lines[y].set(name,x)
			}else{
				if(typeof x == "number"){
					for(var i = 0;i<x;i++){
						this.addRow(name)
					}
				}
			}
		}else{
			var ls = new Array(x).fill(0)
			ls = ls.map(x=>name)
			this.addLine(ls)
		}
	}
	get width(){
		return this.#lines.reduce((p,o)=>{
			return Math.max(o.width,p)
		},0)
	}
	get height(){
		return this.#lines.length
	}
	toString(){
		return `${this.#lines.join(" ")} / ${this.#rowsWidth.map(x=>{
			var w = x
			if(x instanceof Component){
				w = x.style.width
			}
			return w||"auto"
		}).join(' ')}`
	}
}
class Template extends Component{
	
	constructor(main){
		super((main&&typeof main == "boolean")?"body":"div")
		this.setAttribute('template',"")
		this.style.display = "grid"
		this.style.height = "100%"
		this.style.margin = "auto"
		var documentupdated = (ev)=>{
			ev.target._content.forEach(x=>{
				x.document = ev.document||ev.target.document
			})
		}
		this.addEventListener('documentupdated',documentupdated)
	}
	clone(){
		var obj = super.clone()
		obj._tag = this._tag
		obj.main = obj.getElementsByTagName('main')[0]
		// console.log([...this._content].map(x=>x.selector))
		return obj
	}
	createMain(name="main"){
		if(!this.main){
			this.main = create('main')
			this.main.setName(name)
			this.append(this.main)
			this.addLine([this.main])
		}
		return this.main
	}
	grid = new GridTemplate
	toString(){
		this.style.gridTemplate = this.grid.toString()
		return super.toString()
	}
	set background(color){
		this.style.background = color
	}
	get background(){
		return this.style.background
	}
	setBackgroundImage(img){
		this.style.backgroundImage = `url(${img})`
	}
	append(elements){
		if(elements instanceof Component){
			return super.append(elements)
		}else if(elements instanceof Array){
			elements.forEach(element=>{
				if(element instanceof Component){
					super.append(element)
				}
			})
			return this
		}
	}
	addBlock(element,height){
		this.append(element)
		this.addLine([element])
	}
	addLine(...args){
		this.grid.addLine(...args)
		this.append(...args[0])
	}
	addRow(...args){
		this.grid.addRow(...args)
		this.append(...args[0])
	}
	static create(){
		return new Template()
	}
	clone(){
		throw "can't clone a template"
	}
	apply(element){
		var rid = GUID()
		element.setName(rid)
		this.style.gridTemplate = this.grid.toString()
		// console.log(this.style.toString())
		element.append(this.style.toComponent(`.${rid}`))
		this._content.forEach(x=>{
			var y = x
			if(x instanceof Component){
				y = x.clone()
			}
			element.append(y)
		})
		element.main = this.main
	}
}

module.exports = {
	Template,
	setup:(app)=>{
		app.createTemplate = Template.create
		app.setTemplate = function(template){
			app.addEventListener('pagecreate',(page)=>{
				page.setTemplate(template)
				console.log("apply template to page",page.path)
			})
		}
		var page = app.constructor.page
		page.prototype._cloneUtils = function(obj){
			obj.template = obj.querySelector('[template]')
		}
		page.prototype.setTemplate = function(template){
			// template = template.clone()
			// template._tag = "body"
			// this.remove(this.body)
			// this.body = null
			// this.append(template)
			// this.body = template
			// template.document = this
			template.apply(this.body)
			return this
		}
		// page.prototype._append = page.prototype.append
		// page.prototype.append = function(...args){
		// 	console.log(args,this.toString(),this.template)
		// 	if(this.template){
		// 		this.template.append(...args)
		// 	}else{
		// 		this._append(...args)
		// 	}
		// 	return this
		// }
	}
}
