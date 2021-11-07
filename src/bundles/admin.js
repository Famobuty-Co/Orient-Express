const { Form } = require("./form");
const { Component,create, Document } = require("./ui");
const { Template } = require("./template");

class AdminPanel {
	static username = "root"
	static password = ""
	dashboard = new AdminPage()
	constructor(data){
		this.session = {
			username:data.user||AdminPanel.username,
			password:data.password||AdminPanel.password
		}
	}
	Panel(){
		return this.dashboard
	}
	Login(){
		var f = new Form({
			username:AdminPanel.username,password:AdminPanel.password,
		})
		f.setMethod('POST')
		return f
	}
	async toPage(req){
		return new Promise(async (resolve)=>{
			var res = this.Login()
			if(req.method=="POST"){
				var body = await req.getBody()
				if(body.username == this.session.username && body.password == this.session.password){
					res = this.Panel()
				}
			}
			resolve(res)
		})
	}
}
class AdminTemplate extends Template{
	constructor(){
		super()
		var nav = create("div")
		var content = create("div")
		var service = create("div")
		this.append(nav)
		this.append(content)
		this.append(service)
		// this.grid("'navbar navbar'3em 'service content'auto / 250px auto")
		this.grid.addLine([nav,nav],"3em")
		service.style.width = "250px"
		this.grid.addLine([service,content])
		// this.grid.addRow(service)
		// this.grid.addRow(content)
		
		// nav.setName("navbar")
		// content.setName("content")
		// service.setName("service")
		this.service = service
		this.content = content
		this.navbar = nav
	}
}
class AdminPage extends Document{
	constructor(){
		super()
		this.template = new AdminTemplate()
		this.append(this.template)
	}
}
const AcessType = require("../acess");
module.exports = {
	AdminPanel,
	setup:(app)=>{
		app.createAdminPanel = (name)=>{
			var ad = new AdminPanel({})
			app.method("default",`/${name||"admin"}`,AcessType.create((req,res)=>{
				ad.toPage(req).then(html=>res.send(html))
			}))
			return ad.dashboard
		}
	},
}