const { Component ,create,ComponentEvent } = require("./ui")

class NavBar extends Component{
	static style = `
	.navbar {background-color: #333;overflow: hidden;top: 0;width: 100%;}
	.navbar a {float: left;display: block;color: #f2f2f2;text-align: center;padding: 14px;text-decoration: none;}
	.navbar a:hover {background-color: #ddd;color: black;}
	.navbar a.active {background-color: #04AA6D;color: white;}
	`
	static script = ``
	constructor(){
		super('nav')
		this.classList.add('navbar')
		// this.style.overflow= "hidden";
		// this.style.minHeight = "2em" 
		this.style.height = "50px"
		this.style.display = "flex";
		// this.style.height = "100%"
		// this.style.top = "0"
		// this.style.width = "100%"
		var documentupdated = (ev)=>{
			var that = ev.document
			if(that.NavsCount==0){
				that.script.write(NavBar.script)
				that.style.write(NavBar.style)
			}
			that.NavsCount++
			this.removeEventListener('documentupdated',documentupdated)
		}
		// this.addEventListener('documentupdated',documentupdated)
	}
	add(itemName,pageURL){
		var item = create('a')
		item.write(itemName)
		item.setAttribute('href',pageURL)
		this.append(item)
	}
	fixed(){
		this.style.position = "fixed"
	}
	clone(){
		console.log("clone nav",this._content.size)
		return super.clone()
	}
	static create(){
		return new NavBar()
	}
}

module.exports = {
	NavBar,
	setup:(app)=>{
		app.createNavBar = function(){
			var nav = NavBar.create()
			nav.append(create("script",NavBar.script))
			nav.append(create("style",NavBar.style))
			return nav
		}
		var page = app.constructor.page
		page.prototype.NavsCount = 0
		page.prototype.createNavBar = function(...args){
			if(this.NavsCount==0){
				this.scripts.write(NavBar.script)
				this.styles.write(NavBar.style)
			}
			this.NavsCount++
			return NavBar.create(...args)
		}
	}
}
