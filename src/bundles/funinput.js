inputs = []

class Input{
	#style = ``
	#html= ``
	#js = ``
	#name
	constructor(name,style="",html="",js=""){
		this.#name = name
		this.#style = style
		this.#html = html
		this.#js = js
	}
	get tagName(){
		return `funinput-${this.#name.toLowerCase()}`
	}
	toString(){
		return `class ${this.#name} extends HTMLInterface{
			static style = \`${this.#style}\` 
			static script = \`${this.#js}\` 
			constructor(){
				super()
				var document = window.document;

				var style = document.createElement('style')
				style.innerHTML = ${this.#name}.style

				var script = document.createElement('script')
				script.innerHTML = ${this.#name}.script

				this.shadowRoot.innerHTML = \`${this.#html}\`
				this.shadowRoot.appendChild(style)
				// this.shadowRoot.appendChild(script)

				var root = this.shadowRoot;
				${this.#js}

			}
		};window.customElements.define("${this.tagName}",${this.#name})`
	}
}

function createInput(name,style,html,js){
	var input = new Input(name,style,html,js)
	inputs.push(input)
	return input
}
function importInput(name){
	switch(name){
		case "StarRate":
			return createInput("StartRate",`    div.stars {
				width: 270px;
				display: inline-block;
			  }
			   
			  input.star { display: none; }
			   
			  label.star {
				  float: right;
				  padding: 10px;
				  font-size: 24px;
				  color: #444;
				  transition: all .2s;
				}
				input.star:checked ~ label.star svg {
					fill:currentColor;
					stroke:#0000;
				}
				input.star:checked ~ label.star svg {
					fill: #FD4;
					stroke:#0000;
					transition: all .25s;
				}
				input.star-5:checked ~ label.star svg {
					fill: #FE7;
					stroke:#0000;
					text-shadow: 0 0 20px #952;
				}
				input.star-1:checked ~ label.star svg{
					fill: #F62; 
				}
				label.star:hover { transform: rotate(-15deg) scale(1.3); }
				label.star svg {
					stroke:currentColor;
					fill:#0000;
			  }`,`
			  	<svg style="display:none;">
					<path id="star-outline" d="M431 256c9 0 17 -7 17 -16c0 -4 -2 -8 -5 -11l-3 -2l-120 -86l46 -135c2 -7 1 -14 -5 -18c-3 -2 -6 -4 -9 -4s-7 2 -10 4l-118 84l-118 -84c-3 -2 -7 -4 -10 -4s-6 2 -9 4c-6 4 -7 12 -5 18l46 135l-121 85c-5 4 -7 7 -7 11v3c0 9 7 16 16 16v0h148l45 133 c2 6 8 11 15 11s13 -5 15 -11l45 -133h147zM304 164l79 57c3 2 2 7 -2 7h-97v0c-12 0 -23 8 -27 19l-29 89c-1 4 -7 4 -8 0l-30 -89c-4 -11 -14 -19 -26 -19h-99c-4 0 -5 -5 -2 -7l81 -57c10 -7 14 -20 10 -32l-30 -88c-1 -4 3 -6 6 -4l78 55c5 4 10 5 16 5s11 -1 16 -5 l78 -56c3 -2 7 1 6 5l-30 88c-4 12 0 25 10 32z"></path>
					<path id="star" transform="rotate(180 240 200)" d="M431 256c9 0 17 -7 17 -16c0 -4 -2 -8 -5 -11l-3 -2l-120 -86l46 -135c2 -7 1 -14 -5 -18c-3 -2 -6 -4 -9 -4s-7 2 -10 4l-118 84l-118 -84c-3 -2 -7 -4 -10 -4s-6 2 -9 4c-6 4 -7 12 -5 18l46 135l-121 85c-5 4 -7 7 -7 11v3c0 9 7 16 16 16v0h148l45 133 c2 6 8 11 15 11s13 -5 15 -11l45 -133h147z"></path>
			  	</svg>
				<input class="star star-5" id="star-5" type="radio" name="star"/>
				<label class="star star-5" for="star-5"><svg viewBox="-10 -20 500 500" height="1em" stroke-width="20" ><use href="#star"></use></svg></label>
				<input class="star star-4" id="star-4" type="radio" name="star"/>
				<label class="star star-4" for="star-4"><svg viewBox="-10 -20 500 500" height="1em" stroke-width="20" ><use href="#star"></use></svg></label>
				<input class="star star-3" id="star-3" type="radio" name="star"/>
				<label class="star star-3" for="star-3"><svg viewBox="-10 -20 500 500" height="1em" stroke-width="20" ><use href="#star"></use></svg></label>
				<input class="star star-2" id="star-2" type="radio" name="star"/>
				<label class="star star-2" for="star-2"><svg viewBox="-10 -20 500 500" height="1em" stroke-width="20" ><use href="#star"></use></svg></label>
				<input class="star star-1" id="star-1" type="radio" name="star"/>
				<label class="star star-1" for="star-1"><svg viewBox="-10 -20 500 500" height="1em" stroke-width="20" ><use href="#star"></use></svg></label>
			  </form>
				</div>`)
			break;
		case "RubberSlider": 
			return createInput("RubberSlider",`
		    [slider] {
				position: relative;
				height: 14px;
				border-radius: 10px;
				text-align: left;
				margin: 45px 0 10px 0;
			  }
			   
			  [slider] > div {
				position: absolute;
				left: 13px;
				right: 15px;
				height: 14px;
			  }
			  [slider] > div > [inverse-left] {
				position: absolute;
				left: 0;
				height: 4px;
				border-radius: 10px;
				background-color: var(--dark);
				margin: 4px 7px;
			  }
			   
			  [slider] > div > [inverse-right] {
				position: absolute;
				right: 0;
				height: 4px;
				border-radius: 10px;
				background-color: var(--dark);
				margin: 4px 7px;
			  }
			   
			  [slider] > div > [range] {
				position: absolute;
				left: 0;
				height: 4px;
				margin:4px 0;
				border-radius: 14px;
				background-color: var(--color);
			  }
			   
			  [slider] > div > [thumb] {
				position: absolute;
				top: -10px;
				z-index: 2;
				height: 28px;
				width: 28px;
				text-align: left;
				margin-left: -11px;
				cursor: pointer;
				box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
				background-color: var(--light);
				border:solid var(--color) 2px;
				border-radius: 50%;
				outline: none;
			  }
			  div[slider] > input[type=range]::-ms-thumb {
				pointer-events: all;
				width: 28px;
				height: 28px;
				border-radius: 0px;
				border: 0 none;
				background: red;
			  }
			   
			  div[slider] > input[type=range]::-moz-range-thumb {
				pointer-events: all;
				width: 28px;
				height: 28px;
				border-radius: 0px;
				border: 0 none;
				background: red;
			  }
			   
			  div[slider] > input[type=range]::-webkit-slider-thumb {
				pointer-events: all;
				width: 28px;
				height: 28px;
				border-radius: 0px;
				border: 0 none;
				background: red;
				-webkit-appearance: none;
			  }
			   
			  div[slider] > input[type=range]::-ms-fill-lower {
				background: transparent;
				border: 0 none;
			  }
			   
			  div[slider] > input[type=range]::-ms-fill-upper {
				background: transparent;
				border: 0 none;
			  }
			  [slider] > input[type=range] {
				position: absolute;
				pointer-events: none;
				-webkit-appearance: none;
				z-index: 3;
				height: 14px;
				top: -2px;
				width: 100%;
				-ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
				filter: alpha(opacity=0);
				-moz-opacity: 0;
				-khtml-opacity: 0;
				opacity: 0;
			  }
			   
			  div[slider] > input[type=range]::-ms-track {
				-webkit-appearance: none;
				background: transparent;
				color: transparent;
			  }
			   
			  div[slider] > input[type=range]::-moz-range-track {
				-moz-appearance: none;
				background: transparent;
				color: transparent;
			  }
			   
			  div[slider] > input[type=range]:focus::-webkit-slider-runnable-track {
				background: transparent;
				border: transparent;
			  }
			   
			  div[slider] > input[type=range]:focus {
				outline: none;
			  }
			  div[slider] > input[type=range]::-ms-tooltip {
				display: none;
			  }
			   
			  [slider] > div > [sign] {
				opacity: 0;
				position: absolute;
				margin-left: -11px;
				top: -39px;
				z-index:3;
				background-color: var(--color);
				color: #fff;
				width: 28px;
				height: 28px;
				border-radius: 28px;
				-webkit-border-radius: 28px;
				align-items: center;
				-webkit-justify-content: center;
				justify-content: center;
				text-align: center;
			  }
			   
			  [slider] > div > [sign]:after {
				position: absolute;
				content: '';
				left: 0;
				border-radius: 16px;
				top: 19px;
				border-left: 14px solid transparent;
				border-right: 14px solid transparent;
				border-top-width: 16px;
				border-top-style: solid;
				border-top-color: var(--color);
			  }
			   
			  [slider] > div > [sign] > span {
				font-size: 12px;
				font-weight: 700;
				line-height: 28px;
			  }
			   
			  [slider]:hover > div > [sign] {
				opacity: 1;
			  }
		`,`                      <div slider id="slider-distance">
		<div>
		  <div inverse-left style="width:70%;"></div>
		  <div inverse-right style="width:70%;"></div>
		  <div range style="left:30%;right:40%;"></div>
		  <span thumb style="left:30%;"></span>
		  <span thumb style="left:60%;"></span>
		  <div sign style="left:30%;">
			<span id="value">30</span>
		  </div>
		  <div sign style="left:60%;">
			<span id="value">60</span>
		  </div>
		</div>
		<input type="range" tabindex="0" value="30" max="100" min="0" step="1" oninput="
		this.value=Math.min(this.value,this.parentNode.childNodes[5].value-1);
		var value=(100/(parseInt(this.max)-parseInt(this.min)))*parseInt(this.value)-(100/(parseInt(this.max)-parseInt(this.min)))*parseInt(this.min);
		var children = this.parentNode.childNodes[1].childNodes;
		children[1].style.width=value+'%';
		children[5].style.left=value+'%';
		children[7].style.left=value+'%';children[11].style.left=value+'%';
		children[11].childNodes[1].innerHTML=this.value;" />
	   
		<input type="range" tabindex="0" value="60" max="100" min="0" step="1" oninput="
		this.value=Math.max(this.value,this.parentNode.childNodes[3].value-(-1));
		var value=(100/(parseInt(this.max)-parseInt(this.min)))*parseInt(this.value)-(100/(parseInt(this.max)-parseInt(this.min)))*parseInt(this.min);
		var children = this.parentNode.childNodes[1].childNodes;
		children[3].style.width=(100-value)+'%';
		children[5].style.right=(100-value)+'%';
		children[9].style.left=value+'%';children[13].style.left=value+'%';
		children[13].childNodes[1].innerHTML=this.value;" />
	  </div>`);
			break;
		case "DateTime":
				return createInput('DateTime',``)

			break;

	}
}

module.exports = {setup:(app)=>{
	app.addRoute("/scripts/funinput.js",(req,res)=>{
		res.send(`
class HTMLInterface extends HTMLElement{constructor(){super();this.attachShadow({mode: 'open'})}}
${inputs.join(';')}`)
	})
	app.createInput = createInput
	app.importInput = importInput
},}