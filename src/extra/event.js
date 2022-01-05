class CallBack{
	#callbacks = new Set
	constructor(callback){
		if(callback)
			this.append(callback)
	}
	append(callback){
		this.#callbacks.add(callback)
	}
	call(...args){
		this.#callbacks.forEach(callback=>{
			callback(...args)
		})
	}

}

class Event{
	register(event){
		this.on(event,()=>{})
	}
	on(event,callback){
		this["on"+event] = new CallBack(callback)
	}
	addEventListener(event,callback){
		if(!this["on"+event]){
			this["on"+event] = new CallBack()
		}
		this["on"+event].append(callback)
	}
	dispatchEvent(event){
		this["on"+event.name].call(event)
	}
}
module.exports = {Event}