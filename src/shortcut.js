shortcut = {
	parse:function(value,shortcut,app){
		if(typeof value != "string") return value
		switch (value[0]) {
			case (shortcut.script||this.script):{
				value = value.slice(1)
				try{
					value = eval(value)
				}catch{
					value = orient.execute(value,{app})
				}
				//eval(value.slice(1))
			}break;
		}
		return value
	},
	script:"$",
}
module.exports = shortcut