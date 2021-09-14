class Event{
	on(event,callback){
		this["on"+event] = callback
	}

}
module.exports = {Event}