class assets{
	entrypoint = {

	}
	constructor(){

	}
	addEntry(entrypoint,src){
		if( ! this.entrypoint[entrypoint] ){
			this.entrypoint[entrypoint] = {
				link:[],
				script:[],
			}
		}
		var ext = src.split(".")
		ext = ext[ext.length-1].toLowerCase()
		switch(ext){
			case "js":
				this.entrypoint[entrypoint].script.push(src)
			case "css":
				this.entrypoint[entrypoint].link.push(src)
		}
	}
	scripter(src){
		return `<script src="${src}"></script>`
	}
	linker(src){
		return `<link href="${src}" rel="stylesheet" />`
	}
	entry_script(entrypoint){
		return this.entrypoint[entrypoint].script.map(this.scripter)
	}
	entry_link(entrypoint){
		return this.entrypoint[entrypoint].link.map(this.linker)
	}
}

module.exports = {
	assets
}