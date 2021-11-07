const datatypes = require('./datatype')

function SQLparser(sql){
	var cmds = sql.split(';')
	var sql_O = {
		tables:[],
	}
	cmds.forEach(cmd=>{
		cmd = cmd.split(' ')
		switch(cmd[0].toLowerCase()){
			case "create":{
				if(cmd[1].toLowerCase() == "table"){
					var t = {}
					t.name = cmd[2].split('(')[0]
					var line = cmd.slice(cmd.find((a)=>{a=="("})).join(' ')
					t.row = line.split(/\,[\r\n\t]*/).map(x=>{
						x = x.trim().split(' ');
						var typ = x[1].match(/[a-z]*/ig)[0]
						if(datatypes[typ]){
							return {name:x[0],type:x[1]}
						}
					}).reduce((p,o)=>{if(o)p.push(o);return p},[])
					sql_O.tables.push(t)
				}
			}break;
		}
	})
	return sql_O
}
function Objectparser(tables){
	var _tables = []
	for(var table in tables){
		var _table = {}
		_table.name = table
		_table.row = Object.keys(tables[table]).map(x=>{
			var tp = tables[table][x]
			if(!datatypes[tp])tp = "INTEGER"
			return {
				name:x,
				type:tp
			}
		})
		_tables.push(_table)
	}
	return _tables
}
function Classparser(clazz){
	var table = {}
	table.clazz = clazz
	table.name = clazz.name||clazz.constructor.name
	var extend = clazz.toString().split('{')[0].split('extends').slice(1).join('extends')
	var dclar = clazz.toString().split("constructor")[0].split('{').slice(1).join('{')
	dclar = dclar.replace(/\n|\r/g,";").replace(/;/,";").split(";").map(x=>x.trim())
	dclar = dclar.map(w=>{
		w = w.split('=')
		var name = w[0].trim()
		var value = w.slice(1).join('=').trim()
		var type = /^new /g.test(value)?value.split(/^new /).slice(1).join('new ').split(/[^a-z]/ig)[0]:(typeof eval(value))
		switch(type){
			case "string" : type = "varchar"; break;
			case "number" : type = "float"; break;
		}
		return {
			value,name,type
		}
	})
	if(extend){
		extend = {
			name:extend.toLowerCase(),
			value:`new ${extend}()`,
			type:extend,
		}
		dclar.push(extend)
	}
	table.row = dclar.reduce((p,o)=>{if(o.name){p.push(o)};return p},[])
	return table
}

module.exports = {
	Objectparser,
	SQLparser,
	Classparser
}