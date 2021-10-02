# Orient-Express
fast way to build web site

const orient = require("../Orient-Express");
const app = orient.express({
	"/":"$orient.acces.orient()",
	"/css/style.css":"$orient.acces.free",
  /* set page and route */
	"port":8080,
	"sql":{
		"host": "localhost",
		"user": "root",
		"password": "",
		"database":"Famobuty",
		"tables":{
			"User":{
				"username" : "VARCHAR(255)",
				"firstname" : "VARCHAR(255)",
				"lastname" : "VARCHAR(255)",
				"email" : "VARCHAR(255)",
				"phonenumber" : "VARCHAR(255)",
				"password" : "VARCHAR(255)"
			},
      /* create your db with json */
		},
	},
	"shortcut":{
		"script":"$"
	},
	"libs":{
    /*variables et librairies*/
	}
})
app.login()
