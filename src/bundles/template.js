const { Component } = require("./ui");
const {GUID} = require('../extra/static')

class GridTemplateLine{
	#lineHeihgt = "auto"
	#elements = []
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
		this.#lines[y] = this.#lines[y].map(x=>{name})
		this.#lines[y].setHeight(height||"auto")
	}
	setArea(name,x,y){
		this.#lines[y].set(name,x)
	}
	toString(){
		console.log(this.#rowsWidth)
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
	constructor(){
		super("div")
		this.style.display = "grid"
		this.style.height = "100%"
		this.style.margin = "auto"
	}
	grid = new GridTemplate
	toString(){
		this.style.gridTemplate = this.grid.toString()
		return super.toString()
	}
	static create(){

	}
}

module.exports = {
	Template,
	setup:(app)=>{
		app.createTemplate = Template.create
	}
}
