// const debug = require("../extra/console");
// const SQL = require("../shinjuku");
const TWIG = require('./twig')
/*
const orient = {
	extends:function (file){
		return include(file)
	},
	include:function(file,params){
		var content = loadFile(file)
		if(!file)return null
		content = orient.parse(content,params);
		return content
	},
	sql : SQL,
	execute : (OrientJS,options = {})=>{
	if(!options.request)options.request = {}
	if(!options.response)options.response = {}
	if(!options.app){
		options.app = options.request.app||options.response.app||orient
	}
	var libs = orient.libs
	if(options.app.database){
		libs[options.app.database.name] = options.app.database.tables||options.app.database
	}
	console.log("Entry : ",OrientJS,libs)
	OrientJS = (new Function("orient","app","libs",
	`var _echo_msg = [];
	const echo = (...value)=>{_echo_msg.push(...value);};
	with(libs){
		${OrientJS}
	};
	return _echo_msg.join('')`))(orient,options,libs);
	return OrientJS
},
parse : function(OrientHTML="",options={}){
	var startBlock = /<\?orient/
	var endBlock = /\?>/
	try{

		OrientHTML = OrientHTML.split(startBlock)
		OrientJS = OrientHTML.slice(1).map(w=>w.split(endBlock)[0])
		
		OrientJS = OrientJS.map(x=>{
			return this.execute(x,options)
		})
		
		OrientHTML = OrientHTML.map((w,n)=>{
			if(n==0)return w
			w = w.split(endBlock)
			w[0] = OrientJS[n-1]
			return w.join('')
		}).join('')
		try{
			var app = (options.request||options.response||orient).app
			
			translate = (new Function("orient","app","options",`
			try{
				with(orient){
					libs = orient.libs
					if(app.database)
						libs[app.database.name] = app.database.tables
					with(libs){
						with(app){
							with(options){
								html = \`${OrientHTML}\`
							}
						}
					}
				}
			}catch(e){
				console.log(e)
				html = e.toString()
			};
			return html
			`))
			OrientHTML = translate(orient,app,options)
		}catch(e){
			debug.error(e);
		}
		console.log(OrientHTML)
		return OrientHTML
	}catch(e){
		debug.error(e);
		return OrientHTML
	}
},
}
*/
const orient = {
	
	parse:function (OrientHTML="",options={},env) {
		// console.log(OrientHTML)
		// orient.automateOrientHTML.analayser(OrientHTML)
		env = env||{}
		env.path = env.path ||"./"
		TWIG.setEnvPath(env.path)
		return TWIG.execute(OrientHTML,options)
	},
}

/* Parser OrientHTML */

// orient.alphabet = ["<","?",">","{","}","#","%","o","r","i","e","n","t","/",/[a-z]/,/[0-9]/,/./]
// orient.transitions = [
// 	//< ,? ,> ,{ ,} ,# ,% ,o ,r ,i ,e ,n ,t ,/ ,s ,d , .
// 	 [1 ,0 ,0 ,2 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 , 0],//1 = tag[0],2 = insert[0]
// 	 [0 ,3 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,17,0 , 0],//3 = tag[1],17 = html
// 	 [0 ,0 ,0 ,4 ,0 ,5 ,6 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 , 0],//4 = insert_str,5 = insert_comment,6 = insert_code
// 	 [0 ,0 ,0 ,0 ,0 ,0 ,0 ,10,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 , 0],//10 = tagName[1]
// 	 [4 ,4 ,4 ,4 ,7 ,4 ,4 ,4 ,4 ,4 ,4 ,4 ,4 ,4 ,4 ,4 , 4],//7 = varend --------------------------------------- [Var]
// 	 [5 ,5 ,5 ,5 ,5 ,8 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 , 5],//8 = commentend --------------------------------------- [Comment]
// 	 [6 ,6 ,6 ,6 ,6 ,6 ,9 ,6 ,6 ,6 ,6 ,6 ,6 ,6 ,6 ,6 , 6],//9 = codeend --------------------------------------- [Code]
// 	 [4 ,4 ,4 ,4 ,0 ,4 ,4 ,4 ,4 ,4 ,4 ,4 ,4 ,4 ,4 ,4 , 4],//--------------------------------------- [VarEnd]
// 	 [5 ,5 ,5 ,5 ,0 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 , 5],//--------------------------------------- [CommentEnd]
// 	 [6 ,6 ,6 ,6 ,0 ,6 ,6 ,6 ,6 ,6 ,6 ,6 ,6 ,6 ,6 ,6 , 6],//--------------------------------------- [CodeEnd]
// 	 [0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,11,0 ,0 ,0 ,0 ,0 ,0 ,0 , 0],//11 = tagName[2]
// 	 [0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,12,0 ,0 ,0 ,0 ,0 ,0 , 0],//12 = tagName[3]
// 	 [0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,13,0 ,0 ,0 ,0 ,0 , 0],//13 = tagName[4]
// 	 [0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,14,0 ,0 ,0 ,0 , 0],//14 = tagName[5]
// 	 [0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,15,15,0 ,0 , 0],//15 = tagName
// 	 [15,16,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],//--------------------------------------- [tagName]
// 	 [15,15,0 ,15,15,15,15,15,15,15,15,15,15,15,15,15,15],//--------------------------------------- [tagNameEnd]
// 	 [17,17,18,2 ,17,17,17,17,17,17,17,17,17,17,17,17,17],//--------------------------------------- [html]
// 	 [1 ,0 ,0 ,2 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ],//--------------------------------------- [htmlEnd]
// ]
// orient.acceptates = [0,]
// orient.tokenstats = [18,16,9,8,7]

// orient.automateOrientHTML = new Automate(orient.transitions,orient.alphabet,orient.acceptates,orient.tokenstats)


module.exports = orient