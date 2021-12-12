const {create, Component} = require("./ui")

class Section extends Component{
	static style = ""
	static script = ""
	constructor(data){
		super("section")
		Object.keys(data).forEach(label=>{
			this.addInput(label,data[label])
		})
	}
	addInput(text,data){
		var div = create("div")
		var input = create("h",data)
		div.append(input)
		this.append(div)
	}
	static create(data){
		return new Section(data)
	}
}
module.exports = {Section,setup:(app)=>{
	app.createSection = Section.create
	var page = app.constructor.page
	page.prototype.SectionCount = 0
	page.prototype.createSection = function(...args){
		if(this.SectionCount==0){
			this.scripts.write(Section.script)
			this.styles.write(Section.style)
		}
		this.SectionCount++
		return Section.create(...args)
	}
},}