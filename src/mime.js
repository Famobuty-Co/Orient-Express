
const mime = {
	types:{},
	lookup : function(path, fallback) {
		var ext = path.replace(/^.*[\.\/\\]/, '').toLowerCase();
		return this.types[ext] || fallback || this.default_type;
	},
	define:function(map){
		for (var type in map) {
			var exts = map[type];
			for (var i = 0; i < exts.length; i++) {
				this.types[exts[i]] = type;
			}
		}
	},
}
mime.define(require('./types.json'))
mime.default_type = this.default_type

module.exports = mime