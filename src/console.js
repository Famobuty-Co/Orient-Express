debug = true
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
	if(debug)
	console.info("(i)\n",...args,"\n\n")
}
function explain(...args){
	if(debug)
	console.info("(i)\n",...args,"\n\n")
}
module.exports = {
	error,
	log,
	info,
	explain
}