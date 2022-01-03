const { Form } = require("../bundles/form");
const { Grid } = require("../bundles/card");
const ui = require("../bundles/ui");
const { loadFile } = require("../extra/static");

function getParentFX(_function){
	var caller = _function.caller
	while(caller.caller){
		caller = caller.caller
	}
	return caller
}
function getParentClasses(_function){
	var caller = _function.caller
	var classes = new Set()
	while(caller.caller){
		if(classes.has(caller.name)){
			throw "cyclic"
		}else{
			classes.add(caller.name)
		}
		caller = caller.caller
	}
	return classes
}
function createComponent(tag){
	var parentFX = getParentFX(createComponent)
	var classes = getParentClasses(createComponent)
	var parent = createComponent.caller?.caller.name
	var el = ui.create(tag)
	el.setAttribute('id',parent)
	el.classList.add(classes[classes.length-1])
	// classes.forEach(clazz=>{
	// })
	parentFX.components.add(el)
	el.checkPresence = ()=>{
		if(parentFX.components.has(el)){
			parentFX.components.delete(el)
		}
	}
	return el
}
function checkPresence(content){
	if(content.checkPresence)
		content.checkPresence()
}
function list (content,column){
	var el = createComponent("div")
	el.style.display = "flex"
	if(column)
		el.style.flexDirection = "column"
	Object.values(content).forEach(element=>{
		el.append(element)
		checkPresence(element)
	})
	return el
}
function grid (content){
	var el = createComponent("div")
	var grid = Grid.create(content)
	el.append(grid)
	// el.style.display = "flex"
	// el.style.flexWarp = "warp"
	// Object.values(content).forEach(element=>{
		// el.append(element)
		// checkPresence(element)
	// })
	return el
}
function collapsed (text,content){
	var el = createComponent("details")
	var title = ui.create("summary")
	title.append(text)
	el.append(title)
	if(content){
		el.append(content)
		checkPresence(content)
	}
	return el
}
function form (data){
	var el = createComponent("div")
	var form = Form.create(data)
	el.append(form)
	return el
}
function button(text,action){
	var el = createComponent("button")
	el.write(text)
	el.setAttribute('click',action)
	return el
}
function title(text,size=1){
	var el = createComponent("h"+size)
	el.write(text)
	return el
}
function paragraphe(text){
	var el = createComponent("p")
	el.write(text)
	return el
}
function group(...content){
	var el = createComponent("div")
	content.forEach(element=>{
		// if(element){
			el.append(element)
			checkPresence(element)
		// }
	})
	return el
}
function text(titre,content,size){
	var el = group()
	el.append(title(titre,size))
	el.append(paragraphe(content))
	return el
}
function header(data){
	var el = createComponent("header")
	if(data){
		el.append(data)
		checkPresence(data)
	}
	return el
}
function toggle(){
	var el = createComponent("div")
	var input = ui.create("input")
	el.addEventListener("click",()=>{
		var input = this.firstChild
		input.checked = !input.checked
	})
	input.setAttribute('type',"checkbox")
	el.append(input)
	var div = ui.create("div")
	el.append( div)
	div.append(ui.create("span"))
	div.append(ui.create("span"))
	div.append(ui.create("span"))
	return el
}
function nav(menuitems,generateURL = (t)=>t.name){
	if(! (menuitems instanceof Array) ){
		menuitems = Object.keys(menuitems).map(item=>{
			var a = ui.create("a",item)
			a.setAttribute('href',generateURL(menuitems[item]))
			return a
		})
	}
	return group(
	toggle(),
	list(menuitems)
	)
}
function section(titre,...content){
	var el = createComponent("section")
	el.append(title(titre))
	content.forEach(element=>{
		// if(element){
			el.append(element)
			checkPresence(element)
		// }
	})
	return el
}
function table(content){
	var el = createComponent("div")
	var grid = Grid.create(content)
	grid.flexWarp = "none"
	grid.flexDirection="column"
	grid._content.forEach(card=>{
		card.classList.add('line')
		card.classList.delete('card')
		card.style.display="flex"
	})
	el.append(grid)
	return el
}
const components = {
	//CONTAINER
	header,group,nav,section,
	//LIST
	list,grid,table,
	//HTML5
	collapsed,button,
	tab:()=>{},
	//text
	text,paragraphe,title,
	//FORMS
	form,
	//icons
	toggle,
}
const componentsMaker = {
	Component:ui.Component,
	create:ui.create,
	createComponent,
	checkPresence,
}
class FunctionalController{
	#route = "/"
	#pages = new Map
	#file
	constructor(path,object){
		this.#route = path
		if(typeof object == "string"){
			this.#file = object
		}else{
			Object.keys(object).forEach((name,index)=>{
				this.#pages.set(name,object[name])
			})
		}
	}
	get route(){
		return this.#route
	}
	render(req,res){
		if(this.#file){
			var object = require(this.#file)
			Object.keys(object).forEach((name,index)=>{
				this.#pages.set(name,object[name])
			})
		}
		var page = req.page
		var callback = this.#pages.get(page)
		var components = new Set()
		callback = Object.assign(callback,{components})
		var returns = new callback()
		// console.log(page,components)
		var document = new ui.Document()
		document.styles.write(this.style)
		components.forEach(element=>{
			document.append(element)
		})
		res.send(document.toString())
		// res.close()
	}
}
function ObjectToStyle(object){
	var css = `
	.toggle{
		width: 1em;
		height: 1em;
		margin: auto 0;
		padding: 0 1em;
	}
	.toggle input {
		display:none;
	}
	.toggle input ~ div{
		width: 100%;
		height: 100%;
		margin: auto;
	}
	.toggle input ~ div span{
		display:block;
		height:2px;
		border-radius:2px;
		width:100%;
		background:#eee;
		position:relative;
		transition:transform .6s ease,width .6s ease,top .6s ease;
		left:50%;
		transform: translate(-50%,-2.5px);
	}
	.toggle input ~ div span:nth-child(1){
		top: 25%;
	}
	.toggle input ~ div span:nth-child(2){
		top: 50%;
	}
	.toggle input ~ div span:nth-child(3){
		top: 75%;
	}
	.toggle input:checked ~ div span:nth-child(1) {
	  transform: translate(-50%,2px) rotate(45deg);
	  top: 50%;
	}
	.toggle input:checked ~ div span:nth-child(2) {
	  width:0;
	}
	.toggle input:checked ~ div span:nth-child(3) {
	  transform: translate(-50%,-2px) rotate(-45deg);
	  top: 50%;
	}
	*:not(.nav)>.nav{
		width: 100%;
		background-color: #555;
		overflow: auto;
		display:flex;
	}
	.nav a {
		float: left;
		text-align: center;
		padding: 12px;
		color: #f2f2f2;
		text-decoration: none;
		font-size: 17px;
	}
	.nav a:hover {
		background-color: #ddd;
		color: black;
	}
	.nav a:target {
		background-color: #04AA6D;
	}
	.nav .toggle {
		color: white;
	}
	@media screen and (min-width: 999px) {
		.nav .toggle{
			display:none;
		}
	}
	details.collapsed summary{
		display:block;
		background-color: #eee;
		color: #444;
		cursor: pointer;
		padding: 18px;
		width: 100%;
		text-align: left;
		border: none;
		outline: none;
		transition: 0.4s;
	}
	details.collapsed[open] summary, details.collapsed summary:hover {
		background-color: #ccc;
	}
	details.collapsed *:not(summary) {
		padding: 0 18px;
		background-color: white;
		display: none;
		overflow: hidden;
	}
	details.collapsed[open] *:not(summary) {
		display:block;
	}
	.button {
		background-color: #ddd;
		border: none;
		color: black;
		padding: 10px 20px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		margin: 4px 2px;
		cursor: pointer;
		border-radius: 16px;
	}
	.card {
		box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
		max-width: 300px;
		margin: auto;
		text-align: center;
		font-family: arial;
		position:relative;
		display: grid;
		grid-template:${`"${object.card.template.join('" "')}"`||`"title author" "price price" "content content" "more more"`};
	}
	.card .author{
		color: #000;
		font-size: 12px;
		bottom: 1em;
		right: 1em;
		opacity: .5;
		grid-area:author;
	}
	.card .title {
		font-size: 22px;
		font-weight:bold;
		grid-area:title;
	}
	.card .price {
		color: grey;
		font-size: 22px;
		grid-area:price;
	}
	.card .more {
		grid-area:more;
	}
	.card button {
		border: none;
		outline: 0;
		padding: 12px;
		color: white;
		background-color: #000;
		text-align: center;
		cursor: pointer;
		width: 100%;
		font-size: 18px;
	}
	.card button:hover {
		opacity: 0.7;
	}
	`
	return css
}

class FunctionAlpp extends App{
	#style = null
	#styleFiles = []
	addStyle(object){
		if(typeof object == "object"){
			object = ObjectToStyle(object)
			this.#style = object
		}
		if(typeof object == "string"){
			this.#styleFiles.push(object)
		}
		
	}
	addController(path,object){
		const fc = new FunctionalController(path,object)
		fc.style = this.#style
		this.addRoute(fc.route,(req,res)=>{
			fc.render(req,res)
		})
		
	}
}
function create(name){
	return new FunctionAlpp(name)
}
module.exports = {
	create,
	components,componentsMaker,
}