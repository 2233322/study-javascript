function HTMLLexicalParser(syntaxer){
  let state = data;
  let token = null;
  let attribute = null;

  this.receiveInput = function (char) {
    if (state == null) {
      throw new Error('there is a error');
    } else {
      state = state(char)
    }
  }

  function data(c){
    switch (c) {
      case '&': 
        return characterReferenceInData;

      // 如果是'<'进入开始标签
      case '<':
        return tagOpen;
      default:
        emitToken(c);
        return data
    }
  }

  function characterReferenceInData (c) {
    console.log('characterReferenceInData:', c);
  }

  function tagOpen (c) {
    if (c === '/') {
      return endTagOpen
    };

    if (/[a-zA-z]/.test(c)) {
      token = new StartTagToken();
      token.name = c.toLowerCase();
      return tagName;
    }

    error(c)
  }

  function tagName (c) {
    // 如果是'/' 进入自闭合标签
    if (c === '/') {
      return selfClosingTag;
    }

    // 空格换行 进入属性名称
    if (/[\t \f\n]/.test(c)) {
      return beforeAttributeName;
    }

    if (c === '>') {
      emitToken(token);
      return data;
    }

    if (/[a-zA-Z]/.test(c)) {
      token.name += c.toLowerCase();
      return tagName;
    }
  }

  function beforeAttributeName (c) {
    if (/[\t \f\n]/.test(c)) {
      return beforeAttributeName;
    }

    if (c === '/') {
      return selfClosingTag;
    }

    if (c === '>') {
      emitToken(token);
      return data;
    }

    if (/["'<]/.test(c)) {
      return error(c);
    }

    //属性名
    attribute = new Attribute();
    attribute.name = c.toLowerCase();
    attribute.value = '';
    return attributeName;
  }

  function attributeName(c) {
    if (c === '/') {
      token[attribute.name] = attribute.name;
      return selfClosingTag;
    }

    if (c == '=') {
      return beforeAttributeValue;
    }

    if (/[\t \f\n]/.test(c)) {
      return beforeAttributeName;
    }

    attribute.name += c.toLowerCase();
    return attributeName;
  }

  function beforeAttributeValue (c) {
    if (c === '"') {
      return attributeValueDoubleQuoted;
    }

    if (c === "'") {
      return attributeValueSingleQuoted;
    }

    if (/[\t \f\n]/.test(c)) {
      return beforeAttributeValue;
    }

    attribute.value += c;
    return attributeValueUnqutoted;
  }

  function attributeValueDoubleQuoted (c) {
    if (c === '"') {
      token[attribute.name] = attribute.value;
      return beforeAttributeName;
    }

    attribute.value += c;
    return attributeValueDoubleQuoted;
  }

  function attributeValueSingleQuoted (c) {
    if (c === "'") {
      token[attribute.name] = attribute.value;
      return beforeAttributeName;
    }
    attribute.value += c;
    return attributeValueSingleQuoted;
  }

  function attributeValueUnqutoted (c) {
    if (/[\t \f\n]/.test(c)) {
      token[attribute.name] = attribute.value;
      return beforeAttributeName;
    }
    attribute.value += c;
    return attributeValueUnqutoted;
  }



  function selfClosingTag (c) {
    if (c === '>') {
      emitToken(token);
      endToken = new EndTagToken();
      token.name = c.toLowerCase();
      emitToken(endToken);
      return data;
    }
  }

  function endTagOpen (c) {
    if (/[a-zA-Z]/.test(c)) {
      token = new EndTagToken();
      token.name = c.toLowerCase();
      return tagName;
    }

    if (c === '>') {
      return error(c)
    }
  } 

  function emitToken (token) {
    syntaxer.receiveInput(token)
  }

  function error (c) {
    console.log(`warn: unexpected char '${c}'`);
  }
}

class StartTagToken {};

class EndTagToken {};

class Attribute {};

module.exports = {
  StartTagToken,
  EndTagToken,
  HTMLLexicalParser,
}