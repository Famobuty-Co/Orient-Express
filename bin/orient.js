#!/usr/bin/env node
const CONFIG = /^(-*c)(onfig)?=([a-z;\.;\/]\.json)$/

const { execSync } = require('child_process')
const FS = require("fs")
const path = require('path')
const orient = require('../index')
const cli = require('../src/cli')
const { addAnnotation, Annotation } = require('../src/extra/annoted')
const console = require("../src/extra/console")
const { createClass, stringify } = require('../src/extra/static')
const shinjuku = require('../src/shinjuku')

var config = {
	file:cli.argv.find(x=>CONFIG.test(x))||"app.json",
	assign:function(obj,objChanges){
		var assignOn = (Oldobj,newObj)=>{
			for(var field in newObj){
				if(typeof newObj[field] == "object"){
					Oldobj[field] = assignOn(Oldobj[field]||{},newObj[field])
				}else{
					Oldobj[field] = newObj[field]
				}
			}
			return Oldobj
		}
		return assignOn(obj,objChanges)
	},
	stringify:function(obj){
		var str = Object.keys(obj).map(x=>`"${x}":${
			typeof obj[x] == "object"?
				this.stringify(obj[x]):
				typeof obj[x] == "boolean" || typeof obj[x] == "number"?
					obj[x]:'"'+obj[x]+'"'
			}`).join(",")
		return `{${str}}`
	},
	readConfig:function(){
		var obj
		if(FS.existsSync(this.file)){
			obj = FS.readFileSync(this.file,{encoding:'utf8', flag:'r'})
			obj = eval(`obj = ${obj}`)
		}else{
			obj = {}
		}
		return obj
	},
	write:function(objChanges){
		var obj = this.readConfig()
		obj = this.assign(obj,objChanges)
		var str = this.stringify(obj)
		FS.writeFileSync(this.file,str)
	},
	addRoute:function(ctrls){
		var route = ctrls.url.startsWith("/")?"/"+ctrls.url:ctrls.url
		var method = `${ctrls.type}(${ctrls.file})`
		var obj = {}
		obj[route] = method
		this.write(obj)
	},
	addEntity:function(data){
		var obj = {}
		obj.database = {
			tables:{},
		}
		obj.database.tables[data.name] = data.fields
		this.write(obj)
	},
	start:function(){
		var app = this.readConfig()
		var cmd = app.main
		if(!cmd){
			
		}
		execSync(`npm start ${cmd}`)
	}
}

function separateCase(cases,args){
	if(FS.existsSync("./package.json")){
		cases.class(args)
	}else{
		cases.fast(args)
	}
}

function utils_fast(args,home="/"){
	var app = orient.fast("app")
	var type = args.get("acess")||"free"
	app.addRoute(home,orient.acess[type])
	app.login(args.get("port")||orient.free_port)
	if(args.get("show"))app.browser()
	return app
}

function fast(args){
	return new Promise((resolve)=>{
		utils_fast(args)
	})
}
function _module(args){
	return new Promise((resolve)=>{
		const app = orient.fast("app")
		var type = args.get("acess")||"free"
		app.login(args.get("port")||orient.free_port)
		if(args.get("show"))app.browser()
		var isStyled = args.get("style")
		const data = {
			home:args.get("home")||"/",
			title:args.get("title")||args.get("module")||"orient module app",
			style:isStyled?`<link rel='stylesheet' type='text/css' media='screen' href='${isStyled||"main.css"}'>`:"<style></style>",
			module:args.get("module")||"main.js",
		}
		const html = `<!DOCTYPE html><html><head><meta charset='utf-8'><meta http-equiv='X-UA-Compatible' content='IE=edge'>
		<title>${data.title}</title>
		<meta name='viewport' content='width=device-width, initial-scale=1'>
		${data.style}
		<script>
		const styles = document.styleSheets.item(0)
		</script>
		</head>
		<body>
			<script type="module" src='${data.module}'></script>
		</body></html>`
		app.addRoute(data.home,(req,res)=>{
			if(req.originalUrl == "/"){
				res.send(html)
			}else{
				orient.acess[type](req,res)
			}
		})
	})
}
function _class(args){
	if(FS.existsSync("./package.json")){
		config.file = "./package.json"
		switch(args.getIndex(1)){
			case "init":
				config.write({
					scripts:{
						orient:"orient class",
					},
				})
				FS.mkdirSync("src")
				FS.mkdirSync("src/templates")
				FS.mkdirSync("src/components")
				FS.mkdirSync("src/controllers")
				FS.mkdirSync("src/entities")
				break;
			case "make:":
				console.log("\t\t:controller")
				console.log("\t\t:crud")
				console.log("\t\t:entity")
				break;
			case "make:controller":
				return new Promise(async (resolve)=>{
					var name = await cli.question("Choose Controller Name : \n")
					var controller = orient.class.createController(name);
					controller.setRoute(name)
					var routeName;
					while(routeName = await cli.question("Create new Route Name : \n")){
						var filename = await cli.question("Choose HTML File Name:\n")
						filename +=".html"
						if(!FS.existsSync(filename)){
							FS.writeFileSync(path.join("src","templates",filename),`<!DOCTYPE html>
<html lang="FR-fr">
	<head>
		<title>${routeName}</title>
		<meta charset="UTF-8" />
	</head>
	<body>
		<h1>${routeName}</h1>
	</body>
</html>`)
						}
						controller.createPage(routeName,filename);
					}
					if(!FS.existsSync(name+".js")){
						FS.writeFileSync(path.join("src","controllers",name+".js"),controller.toString())
					}
					
					resolve()
				})
			case "make:component":
				return new Promise(async (resolve)=>{
					var name = await cli.question("Choose Component Name : \n")
					console.log(`create controller ${name}`)
					resolve()
				})
			case "make:entity":
				return new Promise(async (resolve)=>{
					var entity = {
						name:"",
						class:{},
					}
					entity.name = await cli.question("Choose Entity Name : \n")
					var fieldName;
					while(fieldName = await cli.question("Create new Entity Field Name : \n")){
						var type = await cli.question("Choose Entity Field Type : (String|Date|Float|Integer|Number|Boolean|<Table>)\n")
						entity.class[fieldName] = {
							annotation:`field ${fieldName} ${type}`,
							get:new Function(`"return ${type}";return this._${fieldName}`),
							set:new Function("value",`"arguments ${type}";this._${fieldName} = value`),
						}
					}
					entity.entity = createClass(entity.class,entity.name)
					FS.writeFileSync(`src/entities/${entity.name}.js`,entity.entity+";modules.exports = "+entity.name)
					resolve()
				})
			case "make:crud":
				var entity = args.getIndex(2)
				if(entity){
					var controller = orient.class.createController(entity);
					controller.setRoute(entity);
					controller.createPage("new",`/${entity}/new.html`,""
					
					)
					controller.createPage("read",`/${entity}/read.html`,
					`{this.app.database.tables.person.findfirstname("jean")}`
					
					)
					controller.createPage("update",`/${entity}/update.html`,
					)
					controller.createPage("delete",`/${entity}/delete.html`,
					)
				}else{
					console.alert("please choose a entity orient class make:entity")
				}
				break;
			default:
				return new Promise((resolve)=>{
					var app = orient.class("app")
					app.setTemplates("src/templates")
					app.setComponents("src/components")
					app.setControllers("src/controllers")
					app.setEntities("src/entities")
					console.log("class app")
					app.login(args.get("port")||orient.free_port)
					console.log(args,args.has("show"))
					if(args.has("show")){
						console.log("open in browser")
						app.browser()
					}
				})
		}
	}else{
		console.alert("can't find package.json\nplease tape `npm init` or `npm init -y`")
	}
	return;
}

cli.add(fast)
cli.add(/module/,_module)
cli.add(/class/,_class)
cli.add(/D(ata)?B(ase)?/i,function(args){
	console.log(".help to get help")
	return new Promise(async (resolve)=>{
		var database = shinjuku.createConnection({
			name:"db",
		})
		database.on("connected",async ()=>{
			var shin;
			do{
				shin = await cli.question("shinjuku => ")
				database.exec(shin)
			}while(shin != "\q")
			resolve()
		})
	})
})

cli.execute(true)

// CMDS.add(/init/,function init(args){
// 	/* init project */
// 	if(FS.existsSync("./package.json")){
// 		config.file = "./package.json"
// 		config.write({
// 			scripts:{
// 				orient:"orient start",
// 			},
// 		})
// 		FS.mkdirSync("public")
// 		FS.mkdirSync("components")
// 		FS.mkdirSync("controllers")
// 	}else{
// 		const ctrls = {
// 			name:path.parse(FS.realpathSync("./")).name,
// 			version:"0.0.01",
// 			description:"",
// 			main:"index.js",
// 		}
// 		new Promise(x=>{
// 			readline.question(`Choose a name for your package (e.g. ${ctrls.name}):`, rslt => {
// 				ctrls.name = rslt||ctrls.name
// 				readline.question(`Set version for your package? (${ctrls.version})`, rslt => {
// 					ctrls.version = rslt||ctrls.version
// 					readline.question(`Write a description : ?`, rslt => {
// 						ctrls.description = rslt||ctrls.description
// 						readline.question(`Choose a name for your main file? (${ctrls.main})`, rslt => {
// 							ctrls.main = rslt||ctrls.main
// 							readline.question(`${congif.stringify(ctrls)} (yes)`, rslt => {
// 								if(/y(es)?/ig.test(rslt)){
// 									config.write(ctrls)
// 								}
// 								readline.close()
// 							})
// 						})
// 					})
// 				})
// 			})
// 		})
// 	}
// })

// CMDS.add(/fast/,function fast(args){
// 	/* fast app */
// 	var parser = new parserArgs(args)
// 	var app = orient.fast("app")
// 	var type = parser.get("acces")||"free"
// 	console.log(type)
// 	app.addRoute("/",orient.acces[type])
// 	app.login(orient.free_port)
// 	app.browser()
// 	return true
// })

// CMDS.add(/build =?(apache|node)?/,function build(args){
// 	/* Create a build Version and generate File who's not existes */
// 	return true
// })

// CMDS.add(/create/,function create(args){
// 	/* Create a build Version and generate File who's not existes */
// 	return true
// })

// CMDS.add(/make:route/,async function makeController(args){
// 	/* Create a route from define controlle or create a new controller */
// 	var ctrls = {
// 		name:args[1],
// 		url:"/"+args[1],
// 		type:"$orient.acess.orient",
// 		file:"/"+args[1]+".html",
// 	} 
// 	new Promise(x=>{
// 		readline.question(`Choose a name for your controller class (e.g. ${ctrls.name}):`, rslt => {
// 			ctrls.name = rslt||ctrls.name
// 			readline.question(`Choose a route for your controller? (${ctrls.url})`, rslt => {
// 				ctrls.url = rslt||ctrls.url
// 				readline.question(`Choose a file to render by the controller? (${ctrls.file})`, rslt => {
// 					ctrls.file = rslt||ctrls.file

// 					readline.question(`Would you create subpage for this controller? (no)`, rslt => {
// 						if(/y(es)?/ig.test(rslt)){
// 						}
// 						config.addRoute(ctrls)
// 						console.log(ctrls)
// 						readline.close()
// 					})
// 				})
// 			})
// 		})
// 	})
// })

// CMDS.add(/make:(entity|table)/,async function makeController(args){
// 	/* Create a route from define controlle or create a new controller */
// 	var ctrls = {
// 		name:args[1],
// 		fields:{},
// 	} 
// 	new Promise(x=>{
// 		readline.question(`Choose a name for your Entity class (e.g. ${ctrls.name}):`, rslt => {
// 			ctrls.name = rslt||ctrls.name
// 			var rsl = true
// 			var txt = "New property name (press <return> to stop adding fields):"
// 			var fx = ()=>{
// 				readline.question(txt, rslt => {
// 					rsl = rslt||false
// 					if(rsl){
// 						txt = "Add another property? Enter the property name (or press <return> to stop adding fields):"
// 						var fieldName = rslt
// 						readline.question(`Field type (enter ? to see all types) [string]:`, rslt => {
// 							var fieldType = rslt||"string"
// 							readline.question(`Can this field be null in the database (nullable) (yes/no) [no]:`, rslt => {
// 								var fieldDefault = /y(es)?/ig.test(rslt)
// 								ctrls.fields[fieldName] = fieldType
// 								fx()
// 							})
// 						})
// 					}else{
// 						readline.close()
// 						config.addEntity(ctrls)
// 						console.log(ctrls)
// 					}
// 					})
// 			}
// 			fx()
// 		})
// 	})
// })
// CMDS.set(/serv/,()=>{

// })
// console.log("help?",argv.some(arg=>HELP.test(arg)))