const {create, Component} = require("./ui")
const ln8 = require("../ln8")
const { url } = require("../extra/static")
const mime = require("../mime/mime")
// eerror /(http?s\:\/\/?([a-z]*\.)[a-z;\-]+\.[a-z;\-]+(\/[a-z;\-]+)?)(\?([a-z;\-]+=[a-z;\-]+&?)+)?)|\/[a-z;\-]+/.test(field)

class Slide extends Component{
	constructor(data,options = {}){
		super("div")
		this.classList.add('slide')
		var div = create("div")
		Object.keys(data).forEach(field=>{
			if(typeof options[field] == "object" && options[field] == null)return
			var value = data[field]
			console.log(value,url.test(value))
			if(url.test(value)){
				var m = mime.lookup(value)
				if(/image/.test(m)){
					var thumbnail = create("img")
					thumbnail.setAttribute("src",value)
					div.append(thumbnail)
					thumbnail.classList.add(field)
				}else{
					var more = create("button",{
						text:"more",
					})
					more.addEventListener("click",`location.assign('${value}')`)
					div.append(more)
					more.classList.add(field)
				}
			}else if(options[field]){
				var comp = create(options[field])
				comp.write(value)
				div.append(comp)
			}else if(typeof options[field] != "undefined" || field == "more" || field == "id"){
				// console.log(field, options[field],typeof options[field])
			}else if(field == "see"){
				var comp = create("a")
				comp.write(ln8("See"))
				comp.setAttribute("href",value)
				div.append(comp)
			}else if(field == "thumbnail"){
				var image = create("img")
				image.setAttribute("src",field)
				div.append(image)
			}else{
				var text = create("p")
				text.write(value)
				div.append(text)
				text.classList.add(field)
			}
		})
		this.append(div)
		// var more = create("button",{
		// 	text:"more",
		// })
		// var moreURL = data["more"]
		// more.addEventListener('click',`function(){location.assign('${moreURL}')}`)
		// this.append(more)
	}
}
function changeSlide(initiator) {
	var i;
	var slideshow = initiator.parentElement.parentElement
	var dots = slideshow.querySelectorAll(`.dot`);
	var slides = slideshow.querySelector(`.slideshow-container`);
	dots = [...dots]
	var n = dots.indexOf(initiator)
	if (n > slides.length) {slideIndex = 1}
	if (n < 1) {slideIndex = slides.length}
	var x = n/dots.length*100
	var css = `translate(-${x}%)`
	slides.style.transform = css
	for (i = 0; i < dots.length; i++) {
		dots[i].className = dots[i].className.replace(" active", "");
	}
	initiator.className += " active";
}
class Slides extends Component{
	static script = changeSlide.toString()
	static style = (`.dot {
		cursor: pointer;
		height: 15px;
		width: 15px;
		margin: 0 2px;
		background-color: #bbb;
		border-radius: 50%;
		display: inline-block;
		transition: background-color 0.6s ease;
	}
	.active, .dot:hover {
		background-color: #f55;
	}
	.slideshow-container{
		position: relative;
		margin: auto;
		display:flex;
		flex-direction:row;
		width: max-content;
		transform:translate(0%);
		transition: transform .5s ease-out;
	}
	.slide{
		height: 50vmin;
		width: 100vw;
	}
	`)
	div = create("div")
	dots = create("div")
	constructor(){
		super("div")
		this.style.maxWidth = "100vw";
		this.style.overflow = "hidden";
		
		this.append(this.div)
		this.div.classList.add('slideshow-container')
		this.dots.classList.add('slide-dots')
		this.dots.style.position = 'absolute';
		this.append(this.dots)
	}
	add(slide,dot){
		this.div.append(slide)
		slide.classList.add('slide')
		// this.div.setAttribute("slideshow",this.uuid)
		if(!dot){
			dot = create("span")
			dot.setAttribute("class","dot")
		}

		// dot.setAttribute("slideshow",this.uuid)//${this.uuid}${this.div.uuid}
		dot.addEventListener('click',`changeSlide(this)`)
		
		this.dots.append(dot)
	}
	static create(slides,options = {}){
		var slide = new Slides()
		slides.forEach(x=>{
			var s = new Slide(x,options)
			slide.add(s)
		})
		return slide
	}
}

module.exports = {Slides,setup:(app)=>{
	app.createSlides = Slides.create
	
	var page = app.constructor.page
	page.prototype.SlidesCount = 0
	page.prototype.createSlides = function(...args){
		if(this.SlidesCount==0){
			this.scripts.write(Slides.script)
			this.styles.write(Slides.style)
		}
		this.SlidesCount++
		return Slides.create(...args)
	}
	app.addRoute("/scripts/slides.js",(req,res)=>{
		res.send(`
			${changeSlide.toString()}
			style = document.createElement('style');style.innerHTML = \`${Slides.style}\`;document.head.appendChild(style);
		`)
	})
},}