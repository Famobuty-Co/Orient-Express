const fs = require("fs");
const path = require("path");


const debug = require("./src/extra/console");

const {include} = require("./src/extra/static")
const orient = require('./src/orient/index')

orient.help = debug.help

const randint = (a,b)=>~~(a+(Math.random()*(b-a)))

Object.defineProperty(orient,'free_port',{
	get:()=>{
		return `${randint(8,9)}${randint(0,9)}${randint(0,9)}${randint(0,9)}`
	},
})

orient.acces = require("./src/acess")
orient.websocket = require("./src/socket")

orient.class = require("./src/apps/class")
orient.express = require("./src/apps/express")
orient.fast = require("./src/apps/fast")

module.exports = orient