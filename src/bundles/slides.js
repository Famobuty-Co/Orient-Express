const {create, Component} = require("./ui")

// eerror /(http?s\:\/\/?([a-z]*\.)[a-z;\-]+\.[a-z;\-]+(\/[a-z;\-]+)?)(\?([a-z;\-]+=[a-z;\-]+&?)+)?)|\/[a-z;\-]+/.test(field)

class Slide extends Component{
	constructor(data){
		super("div")
		Object.values(data).forEach(field=>{
			var div = create("div")
			if(false){
				var image = create("img")
				image.setAttribute("src",field)
				div.append(image)
			}else{
				var text = create("text")
				text.write(field)
				div.append(text)
			}
			this.append(div)
		})
		var more = create("button",{
			text:"more",
		})
		this.append(more)
	}
}

class Slides extends Component{
	static used = false
	static script = create("script",`
		function changeSlice(id,slide) {
			var i;
			var slides = document.querySelector(\`.slide[slideshow=\${id}]\`);
			var dots = document.querySelector(\`.dot[slideshow=\${id}]\`);
			if (n > slides.length) {slideIndex = 1}
			if (n < 1) {slideIndex = slides.length}
			for (i = 0; i < slides.length; i++) {
				slides[i].style.display = "none";
			}
			for (i = 0; i < dots.length; i++) {
				dots[i].className = dots[i].className.replace(" active", "");
			}
			slides[slideIndex-1].style.display = "block";
			dots[slideIndex-1].className += " active";
		}
	`)
	static style = create("style",`.dot {
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
	`)
	div = create("div")
	dots = create("div")
	constructor(){
		super("div")
		if(!Slides.used){
			this.append(Slides.script)
			this.append(Slides.style)
			Slides.used = true
		}
		
		this.append(this.div)
		this.append(this.dots)
	}
	add(slide,dot){
		this.div.append(slide)
		this.div.setAttribute("slideshow",this.id)
		if(!dot){
			dot = create("span")
			dot.setAttribute("class","dot")
		}

		dot.setAttribute("slideshow",this.id)
		dot.addEventListener('click',`changeSlice(${this.id},${this.div.id})`)
		
		this.dots.append(dot)
	}
	static create(...args){
		var slide = new Slides()
		args.forEach(x=>{
			var s = new Slide(x)
			slide.add(s)
		})
		return slide
	}
}

module.exports = {Slides,setup:(app)=>{app.createSlides = Slides.create},}