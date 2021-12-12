class Annotation extends String{
	#name = null
	#values = []
	constructor(text){
		super(text)
		var array = text.split(' ')
		this.#name = array[0]
		this.#values = array.slice(1)
	}
	getAnnotationName(){
		return this.#name
	}
	getAnnotationValues(){
		return this.#values
	}
}
class Annotations extends Array{
	constructor(args){
		super(args.length||args)
		if(args.forEach)
			args.forEach((x,n)=>{
				this[n] = new Annotation(x)
			})
	}
	find(annotation){
		return super.find(x=>{
			if(x instanceof Annotation){
				return x.getAnnotationName() == annotation
			}else{
				return false
			}
		})
	}
}


function getAnnotations(obj){
	var annotations;
	switch(typeof obj){
		case "function":
			annotations = obj.toString()
				.match(/\{(\n)*(((\s| )*)?\"([^"])*"\n?)+/i)[0]
				.match(/".*"/)
				.map(x=>
					x.replace(/"/g,"")
				)
			break;
		case "object":
			annotations = Object.keys(obj)
			break;
	}
	return new Annotations(annotations)
}

function Annoted(clazz){
	var instanceClazz = new clazz
	clazz._instance = instanceClazz
	clazz.getAnnotations = function(field){
		var that = instanceClazz[field]||instanceClazz
		// var annotation = that.toString().match(/\{(\n)*(((\s| )*)?\"([^"])*"\n?)+/i)[0].match(/".*"/)
		var annotations = getAnnotations(that)
		// console.log(annotation)
		return annotations
	}
	var methods = clazz.toString().match(/([a-z;A-Z][\w\d]*( )*)\(/g)
		var _methods = []
		methods.forEach(method=>{
			if(instanceClazz[method.slice(0,-1)])
				_methods.push(method.slice(0,-1))
		})
	clazz.getMethods = function(){
		return _methods
	}
	clazz.getAnnotedMethods = function(){
		return _methods.filter(x=>{
			var e = this.getAnnotations(x)
			return e.length
		})
	}
	return clazz
}

function addAnnotation(clazz,annotation){
	switch(typeof clazz){
		case "function":
			start = clazz.toString().split("{")[0]
			var annoted = start +"{\n"+ `"${annotation}"\n` + clazz.toString().split("{").slice(1)
			break;
	}
	fx = new Function(`return ${annoted}`)()
	return fx
}

module.exports = {Annoted,addAnnotation,Annotation}