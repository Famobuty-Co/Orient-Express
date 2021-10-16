# Orient-Express

The fast way to build your websites.
```
const orient = require("../Orient-Express");
const app = orient.express({
  /* set page and route */
	"/":"$orient.acces.orient()",
	"/css/style.css":"$orient.acces.free",
	"port":8080,
  /* create your db with json */
	"database":{
		"name":"Famobuty",
		"tables":{
			"User":{
				"username" : "VARCHAR(255)",
				"firstname" : "VARCHAR(255)",
				"lastname" : "VARCHAR(255)",
				"email" : "VARCHAR(255)",
				"phonenumber" : "VARCHAR(255)",
				"password" : "VARCHAR(255)"
			},
		},
	},
	"shortcut":{
		"script":"$"
	},
	"libs":{
  	  /* set inside variables librairies*/
	}
})
app.login()//start all server
```
## Summary
[Documentation](#docs)

## Docs
### Webserver Docs
If you start with OrientExpress, or want to find example and explaination over a config or function, you can open the docs as a web server
```
$ npm run docs
```
If this command not work, please feedback the error.
### Dynamic Docs
You can use this commande during your coding to get help about the current variable in parametre
```
orient.help()
```

