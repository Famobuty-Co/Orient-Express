const App = require("./app")
const shortcut = require('../shortcut')
const AcessType = require('../acess')
const bundles = require('../bundles/bundles')

class ExpressApp extends App{
	constructor(data = {}){
		super()
		this.shortcut = data.shortcut||{}
		this.port = data.port
		for(var key in data){
			var value = shortcut.parse(data[key],this.shortcut,this)
			if(key.startsWith('/')){
				console.log(key,value)
				if(typeof value=="function"){
					this.use(key,value)
				}else if(typeof value=="object"){
					for(var method in value){
						this.method(method,key,value[method])
					}
				}
			}else{
				switch(key.toLowerCase()){
					case "error":
						this.errorPage = value;
					break;
					case "sql":
					case "database":
						this.database = SQL.createConnection(value);
					break;
					case "template":
						this.template = value
						var nav = this.template.nav||{}
						var mth = AcessType.acces[data.requestMethode||'orient']()
						for (var item of nav){
							for(var method in mth){
								this.method(method,`/${item}`,mth[method])
							}
						}
						var forms = this.template.forms||[]
						for (var item of forms){
							this.method("default",`/${value.url||"admin"}`,AcessType.acces.create((req,res)=>{
								ad.toPage(req).then(html=>res.send(html))
							}))
						}
					break;
					case "libs":
						for(var lib in value){
							var obj = {}
							if(typeof value[lib] == "object"){
								for(var _var in value[lib]){
									obj[_var] = shortcut.parse(value[lib][_var],this.shortcut,this)
								}
							}else{
								obj = shortcut.parse(value[lib],this.shortcut)||value
							}
							
							bundles.use(lib,obj)
						}
					break;
					case "assets":
						this.assets = new assets(value)
						this.entry_script = this.assets.entry_script
						this.entry_link = this.assets.entry_link
					break;
					case "admin":
					case "administrator":
						var ad = new bundles.AdminPanel(value)
						this.method("default",`/${value.url||"admin"}`,AcessType.acces.create((req,res)=>{
							ad.toPage(req).then(html=>res.send(html))
						}))
					break;
				}
			}
		}
	}
}
module.exports = function(data){
	return new ExpressApp(data)
}