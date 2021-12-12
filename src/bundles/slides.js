const {create, Component} = require("./ui")
const ln8 = require("../ln8")
// eerror /(http?s\:\/\/?([a-z]*\.)[a-z;\-]+\.[a-z;\-]+(\/[a-z;\-]+)?)(\?([a-z;\-]+=[a-z;\-]+&?)+)?)|\/[a-z;\-]+/.test(field)

class Slide extends Component{
	constructor(data,options){
		super("div")
		var div = create("div")
		Object.keys(data).forEach(field=>{
			var value = data[field]
			if(options[field]){
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
				text.write(field)
				div.append(value)
			}
		})
		this.append(div)
		var more = create("button",{
			text:"more",
		})
		var moreURL = data["more"]
		more.addEventListener('click',`function(){location.assign('${moreURL}')}`)
		this.append(more)
	}
}

class Slides extends Component{
	static script = (`
		function changeSlide(initiator) {
			var i;
			var slideshow = initiator.parentElement.parentElement
			var dots = slideshow.querySelectorAll(\`.dot\`);
			var slides = slideshow.querySelector(\`.slideshow-container\`);
			dots = [...dots]
			var n = dots.indexOf(initiator)
			if (n > slides.length) {slideIndex = 1}
			if (n < 1) {slideIndex = slides.length}
			var x = n/dots.length*100
			var css = \`translate(-\${x}%)\`
			slides.style.transform = css
			for (i = 0; i < dots.length; i++) {
				dots[i].className = dots[i].className.replace(" active", "");
			}
			initiator.className += " active";
		}
	`)
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
	static create(slides,options){
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
},}