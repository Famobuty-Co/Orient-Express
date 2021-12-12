const { AutomateBuilder } = require("./automate")

const Controller = new AutomateBuilder
defineClass = Controller.addToken("class ","defineClass")
className = Controller.addToken(/a-z/gi,"className",[defineClass])
className = Controller.addToken(/a-z/gi,"methodeName",[defineClass])
openObject = Controller.addToken(/ *{/gi,"openObject",[className])
openAnotation = Controller.addToken('"',"openAnotation",[openObject])