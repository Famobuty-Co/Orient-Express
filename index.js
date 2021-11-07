const fs = require("fs");
const path = require("path");
const SQL = require("./src/shinjuku");

const debug = require("./src/extra/console");

const {include} = require("./src/extra/static")

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
					html = e
				};
				return html
				`))
				OrientHTML = translate(orient,app,options)
			}catch(e){
				debug.error(e);
			}
			
			return OrientHTML
		}catch(e){
			debug.error(e);
			return OrientHTML
		}
	},
	sql:SQL,
}

orient.help = debug.help

orient.acces = require("./src/acess")

orient.express = require("./src/apps/express")
orient.fast = require("./src/apps/fast")

module.exports = orient