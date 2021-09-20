const { Form } = require("./form");

function arianne(){
	
}
class AdminPanel {
	static username = "root"
	static password = ""
	constructor(data){
		this.session = {
			username:data.user||AdminPanel.username,
			password:data.password||AdminPanel.password
		}
	}
	Panel(){
		return "You are connected"
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

module.exports = {
	AdminPanel
}