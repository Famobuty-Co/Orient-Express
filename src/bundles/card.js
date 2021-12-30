const {create, Component} = require("./ui")
const mime = require("../mime/mime")
const { url } = require("../extra/static")

class Card extends Component{
	constructor(data,options){
		super("div")
		this.classList.add('card')
		Object.keys(data).forEach(label=>{
			if(typeof options[label] == "object" && options[label] == null)return
			if(url.test(data[label])){
				var m = mime.lookup(data[label])
				if(/image/.test(m)){
					var thumbnail = create("img")
					this.append(thumbnail)
					thumbnail.setAttribute("src",data[label])
					thumbnail.classList.add(label)
				}else{
					var more = create("button",{
						text:"more",
					})
					more.addEventListener("click",`location.assign('${data[label]}')`)
					this.append(more)
					more.classList.add(label)
				}
			}else{
				this.addData(label,data[label])
			}
		})
	}
	addData(text,data){
		var div = create("div")
		div.classList.add(text)
		var label = create("label",data)
		label.setAttribute('name',text)
		div.append(label)
		this.append(div)
	}
	setAction(action){
		this.setAttribute("action",action)
	}
	static create(data){
		return new Card(data)
	}
}
class Grid extends Component{
	constructor(){
		super("div")
		this.classList.add('grid')
		this.style.display = "flex"
		this.style.flexWrap = "wrap"
	}
	add(card){
		this.append(card)
	}
	static create(cards,options = {}){
		var card = new Grid()
		cards.forEach(x=>{
			var s = new Card(x,options)
			card.add(s)
		})
		return card
	}
}
module.exports = {Card,setup:(app)=>{
	app.createGrid = Grid.create
	app.createCard = Card.create
},}