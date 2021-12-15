var { AutomateBuilder } = require("./automate")
const {loadFile} = require('../extra/static')
const path = require('path')

const HTMLParse = new AutomateBuilder

var htmlcode = []

var twigcodestart = HTMLParse.addToken("{%","startcode",[HTMLParse.ALL])
var twigcodeend = HTMLParse.addToken("%}","endcode",[twigcodestart],[0])
var twigvarstart = HTMLParse.addToken("{{","startvar",[HTMLParse.ALL])
var twigvarend = HTMLParse.addToken("}}","endvar",[twigvarstart],[0])
		
var HTMLdecalre = HTMLParse.addToken("<!DOCTYPE html>","HTMLdecalre",[0])
var htmlstart = [0,twigvarend,twigcodeend,HTMLdecalre,-1]
htmlcode.push(HTMLdecalre)

var HTMLcommentstart = HTMLParse.addToken("<!","HTMLcommentstart",htmlstart)
var HTMLcomment = HTMLParse.addToken(/[a-z; ]/i,"HTMLcomment",[HTMLcommentstart,-1])
var HTMLcommentend = HTMLParse.addToken(">","HTMLcommentend",[HTMLcomment])

htmlstart.push(HTMLcommentend)
htmlcode.push(HTMLcommentstart)
htmlcode.push(HTMLcomment)
htmlcode.push(HTMLcommentend)

var HTMLtagstart = HTMLParse.addToken(/<[a-z]/i,"HTMLtagstart",htmlstart)
var HTMLtag = HTMLParse.addToken(/[^>]/i,"HTMLtag",[HTMLtagstart,-1])
var HTMLtagend = HTMLParse.addToken(">","HTMLtagend",[HTMLtag,HTMLtagstart])

htmlstart.push(HTMLtagend)
htmlcode.push(HTMLtagstart)
htmlcode.push(HTMLtag)
htmlcode.push(HTMLtagend)

var HTMLEndtagstart = HTMLParse.addToken(/<\/[a-z]/i,"HTMLEndtagstart",htmlstart)
var HTMLEndtag = HTMLParse.addToken(/[a-z;0-9]/i,"HTMLEndtag",[HTMLEndtagstart,-1])
var HTMLEndtagend = HTMLParse.addToken(">","HTMLEndtagend",[HTMLEndtagstart,HTMLEndtag])

htmlstart.push(HTMLEndtagend)
htmlcode.push(HTMLEndtagstart)
htmlcode.push(HTMLEndtag)
htmlcode.push(HTMLEndtagend)

// var HTMLcode = HTMLParse.addToken(/<[a-z]*(-[a-z]*)?([ ;\n;\r;\t]*([a-z]*(=("?[^ ]*"?))?)?)*>/,"HTMLcode",htmlstart)
// var HTMLcontent = HTMLParse.addToken(/[ ;\n;\t;\r;\s;\w\:\-\+\=\&\*]/i,"htmlcontent",[
var HTMLcontent = HTMLParse.addToken(/[^{^<]/i,"htmlcontent",[
	twigvarend,twigcodeend,HTMLcommentend,HTMLtagend,-1,HTMLEndtagend
],[HTMLEndtagstart])
// twigstrat.push(HTMLcontent,HTMLcode)
htmlcode.push(HTMLcontent)

var indentspace = HTMLParse.addToken(/[ ;\n;\t;\r;^\s]/,"indent",[twigcodestart,twigvarstart],[twigvarend,twigcodeend])

var arraycodestart = [twigcodestart,twigvarstart,indentspace]
var arraycodeend = [indentspace,twigvarend,twigcodeend]

var twigvarnamestart = HTMLParse.addToken(/[a-z]/i,"varnamestart",arraycodestart)
var twigvarnamecontent = HTMLParse.addToken(/[a-z;0-9;\.]/i,"varnamecontent",[twigvarnamestart,-1],arraycodeend)

var twigvalueStart = []
var twigvalueEnd = []

var twigNumber = HTMLParse.addToken(/[0-9;\.]/i,"Number",[-1])
twigvalueStart.push(twigNumber)
twigvalueEnd.push(twigNumber)

var twigStringstart = HTMLParse.addToken(/[";']/,"Stringstart",arraycodestart)
var twigStringcontent = HTMLParse.addToken(/[^"]/i,"Stringcontent",[twigStringstart,-1])
var twigStringend = HTMLParse.addToken(/[";']/,"Stringend",[twigStringcontent],[indentspace])

twigvalueStart.push(twigStringstart)
twigvalueEnd.push(twigStringend)

var twigparametersstart = HTMLParse.addToken("(","parametersstart",[twigvarnamecontent,1],twigvalueStart)
var twigparametersend = HTMLParse.addToken(")","parametersend",[twigvarnamecontent,-1,twigparametersstart],arraycodeend)

arraycodeend.push(twigparametersend)

var twigobjectsend = HTMLParse.addToken("}","objectsend",twigvalueEnd,arraycodeend)
var twigobjectsstart = HTMLParse.addToken("{","objectsstart",[twigvarnamecontent,twigparametersstart],[twigobjectsend])

twigvalueStart.push(twigobjectsstart)
twigvalueEnd.push(twigobjectsend)

var twigobjectskey = HTMLParse.addToken(/[a-z;0-9]/i,"objectskey",[twigobjectsstart,-1])
var twigobjectsassign = HTMLParse.addToken(":","objectsassing",[twigobjectskey],twigvalueStart)
var twigobjectsseparator = HTMLParse.addToken(",","objectsseparator",twigvalueEnd,[twigobjectskey,twigobjectsend])

var twigBlockStart = HTMLParse.addToken("block","twigBlockStart",[twigcodestart,indentspace],[twigvarnamestart])
var twigBlockEnd = HTMLParse.addToken("endblock","twigBlockEnd",[twigcodestart,indentspace],[twigcodeend])


var twigIFStart = HTMLParse.addToken("if","twigIFStart",[twigcodestart,indentspace],[twigvarnamestart])
var twigELSE = HTMLParse.addToken("else","twigELSE",[twigcodestart,indentspace],[twigcodeend])
var twigIFEnd = HTMLParse.addToken("endif","twigIFEnd",[twigcodestart,indentspace],[twigcodeend])

var twigTemplate = HTMLParse.addToken("template","twigTemplate",[twigcodestart,indentspace],[twigcodeend])

var twigStyle = HTMLParse.addToken("style","twigStyle",[twigcodestart,indentspace],[twigcodeend])
var twigScript = HTMLParse.addToken("script","twigScript",[twigcodestart,indentspace],[twigcodeend])

regroup = [
	[twigStringstart,twigStringcontent,twigStringend],
	[HTMLcommentstart,HTMLcomment,HTMLcommentend],
	[HTMLEndtagstart,HTMLEndtag,HTMLEndtagend],
	[HTMLtagstart,HTMLtag,HTMLtagend],
	[twigvarnamestart,twigvarnamecontent],
	[twigobjectskey],
	[twigobjectsstart,twigobjectsend],
	[HTMLcontent],
]
var env = {}
function execute(code,option,_env){
	var blocks = new Map()
	var templates = new Set()

	
	var html = []
	var temps = new Map()
	var curentfxName = null
	var curentfxArgs = new Set()
	var localcontent = html

	execute.env = _env||{
		blocks,
		templates,
		vars:option,
		ifs:new Array,
		localcontent
	}

	execute.env.template = null
	execute.env.localcontent = []

	HTMLParse.execute(code,regroup,{
		"twigTemplate":()=>{curentfxName = "template"},
		"twigBlockStart":()=>{curentfxName = "createBlock"},
		"twigBlockEnd":()=>{curentfxName = "appendBlock"},
		"twigIFStart":()=>{curentfxName = "if"},
		"twigELSE":()=>{curentfxName = "else"},
		"twigELSE":()=>{curentfxName = "else"},
		"twigScript":()=>{curentfxName = "script"},
		"twigStyle":()=>{curentfxName = "style"},
		"endcode":()=>{
			if(curentfxName){
				env[curentfxName](...curentfxArgs)
				curentfxArgs.clear()
				curentfxName = null
			}
		},
		"startcode":()=>{},
		"startvar":()=>{
		},
		"varnamestart":(text)=>{
			if(execute.env.vars && execute.env.vars[text] != undefined){
				_var = execute.env.vars[text]
				text = _var
			}
			if(curentfxName){
				curentfxArgs.add(text)
			}else{
				execute.env.localcontent.push(text)
			}
		},
		"endvar":()=>{
		},
		"indent":()=>{},
		default:(text,token)=>{
			if(twigvalueStart.includes(token.stat)){
				curentfxArgs.add(text)
			}else{
				execute.env.localcontent.push(text)
			}
		},
	})
	console.log(execute.env.blocks)
	if(execute.env.template){
		console.log(code)
		return execute(execute.env.template.content,execute.env.vars,execute.env)
	}else{
		return execute.env.localcontent.join('')
	}
}
env.if = function(condition){
	console.log(condition)
	execute.env.ifs.push({
		condition,
		true:[],
		false:[],
		parent :execute.env.localcontent,
	})
	execute.env.localcontent = execute.env.ifs[execute.env.ifs.length-1].true
}
env.else = function(condition){
	execute.env.localcontent = execute.env.ifs[execute.env.ifs.length-1].false
}
env.endif = function(condition){
	var _if = execute.env.ifs.pop()
	console.log(_if)
	var value = _if.false
	var condition = false
	try{
		condition = eval(_if.condition)
	}catch{
		condition = _if.condition
	}
	console.log(condition)
	if(condition){
		value = _if.true
	}
	execute.env.localcontent = _if.parent
	execute.env.localcontent.push(value.join(''))
}
env.style = function(file){
	var _path = path.join(env.path,file.slice(1,-1))
	var content = loadFile(_path)
	execute.env.localcontent.push(`<style>${content}</style>`)
}
env.script = function(file){
	var _path = path.join(env.path,file.slice(1,-1))
	var content = loadFile(_path)
	execute.env.localcontent.push(`<script>${content}</script>`)
}
env.template = function(file){
	console.log(env.path)
	var _path = path.join(env.path,file.slice(1,-1))
	var content = loadFile(_path)
	// console.log(content,_path)
	execute.env.template = {
		content,
	}
}
env.createBlock = function(name){
	execute.env.currentBlock = {
		array:[],name,parent:execute.env.localcontent,
	}
	execute.env.localcontent = execute.env.currentBlock.array
}
env.appendBlock = function(){

	var block = execute.env.currentBlock
	if(execute.env.blocks.get(execute.env.currentBlock.name)){
		block = execute.env.blocks.get(execute.env.currentBlock.name)
	}else{
		execute.env.blocks.set(execute.env.currentBlock.name,execute.env.currentBlock)
		console.log("add to blocks :",execute.env.currentBlock.name)
	}
	execute.env.currentBlock.parent.push(block.array.join(''))
	execute.env.localcontent = execute.env.currentBlock.parent
	execute.env.currentBlock = null
}
function setEnvPath(path){
	env.path = path
}
module.exports = {
	execute,env,setEnvPath
}