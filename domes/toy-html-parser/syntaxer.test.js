const { HTMLSyntaticalParser } = require('./syntaxer')
const { HTMLLexicalParser } = require('./lexer')

const syntaxer = new HTMLSyntaticalParser()
const lexer = new HTMLLexicalParser(syntaxer)

const testHTML = `<html maaa=a >waring<head><title>cool</title>xyh</head><body><img src="a" /></body></html>`

for (let c of testHTML) {
  lexer.receiveInput(c)
}


console.log(JSON.stringify(syntaxer.getOutput(), null, 2))