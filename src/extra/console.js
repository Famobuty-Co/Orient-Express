debug = true
Reset = "\x1b[0m"
Bright = "\x1b[1m"
Dim = "\x1b[2m"
Underscore = "\x1b[4m"
Blink = "\x1b[5m"
Reverse = "\x1b[7m"
Hidden = "\x1b[8m"

FgBlack = "\x1b[30m"
FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgYellow = "\x1b[33m"
FgBlue = "\x1b[34m"
FgMagenta = "\x1b[35m"
FgCyan = "\x1b[36m"
FgWhite = "\x1b[37m"

BgBlack = "\x1b[40m"
BgRed = "\x1b[41m"
BgGreen = "\x1b[42m"
BgYellow = "\x1b[43m"
BgBlue = "\x1b[44m"
BgMagenta = "\x1b[45m"
BgCyan = "\x1b[46m"
BgWhite = "\x1b[47m"
function trace(pre="",bg,fg,...fonts){
	return message=>(debug)?console.trace(`${bg}${fg}${fonts.join('')}${pre}\n${message||''}${Reset}`):false
}
function text(pre="",bg,fg,...fonts){
	return message=>(debug)?console.log(`${bg}${fg}${fonts.join('')}${pre}\n${message||''}${Reset}`):false
}
function waring(...args){
	if(debug)
	console.waring("/!\\\n",...args,"\n\n")
}
function error(...args){
	if(debug)
	console.error("(i)\n",...args,"\n\n")
}
function log(...args){
	if(debug)
	console.log(...args)
}
function info(...args){
	
	console.info("(i)\n",...args,"\n\n")
}
function explain(...args){
	if(debug)
	console.info("(i)\n",...args,"\n\n")
}
function help(data){
	var explain = {}
	explain.type = typeof data
	explain.comments = data.toString().match(/\/\*.*\*\/|\/\/.*/)
	debug.explain(explain)
	return explain
}
module.exports = {
	debug,
	log,
	explain,
	help,
	error:trace(BgRed,FgWhite,Bright),
	warn:text("/!\\",BgYellow,FgBlack,Bright,Underscore),
	succes:text("",BgGreen,FgWhite,Bright),
	info:text("(i)",BgBlue,FgWhite,Bright,Underscore),
}