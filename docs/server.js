const orient = require("../index");

const app = orient.express({
	"port":9000,
	"shortcut":{
		"script":"$",
	},
	"database":{
		name:"docs/database",
		"tables":{
			"User":{
				"username" : "VARCHAR(255)",
				"password" : "VARCHAR(255)"
			},
		}
	},
	"/":"$orient.acces.free",
})
orient.help(app)
app.on('ready',()=>{
	console.log('start')
	console.log(app.database.tables.User)
	app.browser("docs/index.html")
})

app.login()