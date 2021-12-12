class AutomateString{
	chars = []
	get length(){
		return this.chars.length;
	}
	constructor(str){
		this.chars = str.split('')
	}
	cursor = 0
	next(){
		return this.cursor>=this.length?null:this.chars[this.cursor++]
	}
	last(){
		return this.chars[this.cursor-1]
	}
	hasNext(){
		return this.cursor<=this.length&&(this.chars[this.cursor])
	}
	forEach(callback){
		var c = this.next()
		while(this.hasNext()){
			callback(c,this)
			c = this.next()
		}
		callback(c,this)
		callback(null,this)
		return 
	}
	static concat(...args){var e = new AutomateString("");e.chars = args;return e}
}
class AutomateBase {
	static ETAT_INITIAL = 0
	static REJECT = false
	static ACCPET = true
	translate(entree){
		if(!(entree instanceof AutomateString))
			entree = new AutomateString(entree)
		return entree
	}
}
class Automate extends AutomateBase{
	#acceptates = []
	#tokenstats = []
	#transitions = []
	#alphabet = []
	constructor(transitions,alphabet,acceptates,tokenstats){
		console.log(this)
		this.#transitions = transitions
		this.#alphabet = alphabet
		this.#acceptates = acceptates
		this.#tokenstats = tokenstats||[]
	}
	#isToken(etat){
		return this.#tokenstats.includes(etat)
	}
	#isAcceptate(etat){
		return this.#acceptates.includes(etat)
	}
	#tokenls = []
	analayser(entree){
		console.log(this,entree)
		this.#tokenls = []
		entree = this.translate(entree)
		var tokenTemp = ""
		var stat = Automate.ETAT_INITIAL
		var c = entree.next()
		while(c!=null){
			var t = this.#alphabet.find(x=>{
				return (x.test)?x.test(c):x==c
			})
			var i = this.#alphabet.indexOf(t)
			if(!this.#transitions[stat])
				throw `not transitions at stat ${stat} for ${c} index = ${i} | search = ${t}`
			if(this.#transitions[stat][i] == undefined)
				throw `not transitions at stat ${stat} for ${c} index = ${i} | search = ${t} \n just have ${this.#transitions[stat]}`
			var e = this.#transitions[stat][i]
			//console.log(e,stat,i)
			if(e == null){
				return Automate.REJECT
			}
			if(this.#isToken(stat)){
				this.#tokenls.push({
					value:tokenTemp+c,
					stat
				})
				c = entree.last()
				tokenTemp = ""
			}else{
				tokenTemp += c
			}
			stat = e
			c = entree.next()
		}
		if(this.#isAcceptate(stat)){return Automate.ACCPET}else{return Automate.REJECT}
	}
	getTokens(){
		return this.#tokenls
	}
	#builder = new AutomateBuilder
	addToken(input,output){
		this.#builder.addToken(input,output)
	}

}
class AutomateBuilder extends AutomateBase{
	ALL = -2
	ME = -1
	#reconizeToken = []
	getBestToken(token,last){
		var proba = this.showToken(token)
		proba = proba.filter(t=>{
			return t.stats.includes(last?.stat)
		})
		proba = proba.filter(t=>{
			var i = t.input
			if(i instanceof RegExp){
				return i.exec(token)[0] == token
			}else{
				return i == token
			}
		})
		// console.log(proba)
		return proba[0]
	}
	showToken(token){
		var test = typeof token == "number"?t=>{
			return t.stat == token
		}:t=>{
			var i = t.input
			if(i instanceof RegExp){
				return i.test(token)&&! token.split(i).join('').length
			}else{
				return i == token
			}
		}
		return this.#reconizeToken.filter(test)
	}
	addToken(input,output,stats = [0],after = [],){
		var token = {input,output,stats}
		token.stat = this.#reconizeToken.length
		if(stats.includes(-1)){
			token.stats.push(token.stat)
		}
		this.#reconizeToken.push(token)
		after.forEach(n=>{
			this.#reconizeToken[n].stats.push(token.stat)
		})
		return token.stat
	}
	debug = false
	getToken(token,stat){
		var find = this.#reconizeToken.find(t=>{
			var i = t.input
			// if(t.output == "htmlcontent"){
			// 	console.log(t.stats,stat)
			// }
			var c = ! t.stats.includes(stat) && !t.stats.includes(-2)
			if( c )
				return false
			if(i instanceof RegExp){
				return i.test(token)&&! token.split(i).join('').length
			}else{
				return i == token
			}
		})
		if(this.debug)
			console.log(this.#reconizeToken.filter(x=>
				(x.input instanceof RegExp)?x.input.test(token)&&! token.split(x.input).join('').length:x.input == token
				))
		// if(find)
			// console.log(find,find.stats.includes(stat))
		return find
	}
	recognize(entree){
		entree = this.translate(entree)
		var stat = AutomateBase.ETAT_INITIAL
		var tokensLS = []
		var culsym = ""
		var token;
		// var c = entree.next()
		entree.forEach(c=>{
		if(token = this.getToken(culsym,stat)){ 
				// console.log(token,stat)
				tokensLS.push({
					input:culsym,
					output:token.output,
					stat:token.stat,
					token,
				})
				stat = token.stat
				culsym = ""
			}
			if(c)
				culsym += c
		})
		tokensLS.push({
			input:culsym,
			output:-1,
			stat,
		})
		tokensLS.clean = function(){
			return this.reduce((p,o)=>{
				if(o.input.length>0)p.push(o.input)
				return p
			},[])
		}
		return tokensLS
	}
	regroup(text,groups = []){
		var parsed = this.recognize(text)
		groups = groups.map(x=>x.map(y=>this.#reconizeToken[y].output||y))
		var output = ""
		var t = "",_out=""
		var s = 0
		var n = 1
		var last = null
		var regroup = []
		text = parsed.reduce((p,o)=>{
			var g = groups.find((g)=>g.includes(output))
			var gn = groups.find((g)=>g.includes(o.output))
// gn == undefined ? output == o.output : g==gn
			if( gn != undefined && g==gn ){
				t += o.input
				regroup.push(o)
				n++
			}else{
				var token_correction = this.getBestToken(t,last)
				if(token_correction){
					s = token_correction.stat
					_out = token_correction.output
				}
				last = {
					last,
					input:t,
					output:_out,
					stat:s,
					n,
					regroup
				}
				p.push(last)
				t = o.input
				_out = o.output
				s = o.stat
				n = 1
				regroup = [o]
			}
			output = o.output

			return p
		},[])
		text.push({
			input:t,
			stat:s/n,
			n
		})
		text.clean = function(){
			return this.reduce((p,o)=>{
				if(o.input.length>0)p.push(o.input)
				return p
			},[])
		}
		return text
	}
	execute(text,regroup,actions){
		var groups = this.regroup(text,regroup)
		// console.log(groups)
		groups.forEach(x=>{
			var fx = x.output
			fx = typeof fx == "function"?fx:actions[fx]
			fx = fx||actions.default
			if(fx && x){
				fx(x.input,x)
			}else{
				console.log(x.input)
			}
		})
	}
}
module.exports = {
	Automate,AutomateBuilder
}