'use strict';

const { KEY_LENGHT, VALID_OPERATIONS } = require('../assets/config');
/* 
  Usage cases:
  <storage operation> <key> <flags> <exptime> <bytes> [noreply]\r\ndata\r\n
  cas <key> <flags> <exptime> <bytes> <cas unique> [noreply]\r\ndata\r\n
  <retrieval operation> <key>*\r\n 
  */
class Parser {
  // constructor() {}
  /**
   * Checks if the input sent by the user is valid
   * @param  {string} input  string sent bye the client
   * @returns {(Object|boolean)} Object with the operation and the rest of the input or false if the operation is invalid
   */
  parseInput(input) {
    const operationRegex = /(.+?)(?= )/;
    const possibleOperation = operationRegex.exec(input)[0];
    const operation = this.checkOperation(possibleOperation);
    if (operation) {
      switch (operation) {
        case 'get':
        case 'gets':
          // Retrieval operation
          return this.checkRetrievalOperationInput(operation, input);
        default:
          // Storage operation
          return this.checkStorageOperationInput(operation, input);
      }
    } else {
      // Invalid Operation
      return false;
    }
  }

  /**
   * Checks if the given input string has valid information for the given retrieval operation
   * @param  {string} operation string containing the operation
   * @param  {string} input string sent by the client with the supposed keys
   * @returns {Object|boolean} Parsed object with all the information extracted from the input string if the keys are okay, if they aren't, false
   */
  checkRetrievalOperationInput(operation, input) {
    const keys = this.separateKeys(operation, input);
    if (this.areKeysValid(keys)) {
      return this.buildParsedObject(operation, keys);
    }
    return false;
  }

  /**
   * Separate the supposed keys and the operation from the input string into a new array containing all the supposed keys
   * @param  {string} operation  string containing the operation
   * @param  {string} input  string sent by the client with the supposed keys
   * @returns {Array} Array containing all the supposed keys
   */
  separateKeys(operation, input) {
    const splitKeysFromOperation = new RegExp(`[^${operation}](.+)`);
    const splittedInput = input.match(splitKeysFromOperation);
    const keys = splittedInput[1].trim().split(' ');
    return keys;
  }

  /**
   * Checks if the given keys are valid ones
   * @param  {Arrray} keys  Array containing all the supposed keys
   * @returns {boolean} True if the keys are valid ones, if they aren't, false
   */
  areKeysValid(keys) {
    for (let key of keys) {
      if (!this.isKeyValid(key)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Checks if the given input string has valid information for the given storage operation
   * @param  {string} operation string containing the operation
   * @param  {string} input string sent by the client with the supposed parameters and data
   * @returns {Object|boolean} Parsed object with all the information extracted from the input string if the data and params are okay, if they aren't, false
   */
  checkStorageOperationInput(operation, input) {
    const [params, data] = this.separateParamsFromData(operation, input);
    if (this.areValidParamsAndData(operation, params, data)) {
      return this.buildParsedObject(operation, params, data);
    }
    return false;
  }

  /**
   * Separate the parameters from the data in the input string
   * @param  {string} operation  string containing the operation
   * @param  {string} input  string containing the input arrived to the server
   * @returns {Array} Array containing an Array with the params and a String with the data
   */
  separateParamsFromData(operation, input) {
    const splitParamsFromData = new RegExp(
      `[^${operation}](.+?)\\r\\n(.*)\\r\\n`
    );
    const splittedInput = input.match(splitParamsFromData);
    const params = splittedInput[1].trim().split(' ');
    const data = splittedInput[2];
    /* If its a set, add or replace operation the params will be: key, flags, exptime, bytes, [noreply] which is optional
      Or if its a cas operation they will be: key, flags, exptime, bytes, cas unique, [noreply] which is optional
      Or if its an append or preppend operation they will be: key, bytes, [noreply] which is optional*/
    return [params, data];
  }

  /**
   * Checks if the given params and data are valid
   * @param  {string} operation  string containing the operation
   * @param  {Array} params  Array containing the supposed parameters
   * @param  {string} data  string containing the supposed data
   * @returns {boolean} True if the params and data are valid ones, if they aren't, false
   */
  areValidParamsAndData(operation, params, data) {
    let bytesPosition = 0;

    switch (operation) {
      case 'set':
      case 'add':
      case 'replace':
      case 'cas':
        bytesPosition = 3;
        if (
          !this.isKeyValid(params[0]) ||
          !this.areFlagsValid(params[1]) ||
          !this.isExpTimeValid(params[2]) ||
          !this.areBytesValid(params[bytesPosition])
        ) {
          return false;
        }

        if (operation === 'cas' && !this.isCasValid(params[4])) return false;
        break;
      case 'append':
      case 'prepend':
        bytesPosition = 1;
        if (
          !this.isKeyValid(params[0]) ||
          !this.areBytesValid(params[bytesPosition])
        )
          return false;
        break;
    }
    if (!this.doBytesMatchWithData(data, params[bytesPosition])) {
      return false;
    }
    return true;
  }

  /**
   * Checks if the bytes match with the given data
   * @param  {string} data  string containing the supposed data
   * @param  {string} bytes  string containing the supposed bytes
   * @returns {boolean} True if the lenght of the data is equal to the given bytes, if it isn't, false
   */
  doBytesMatchWithData(data, bytes) {
    const parsedBytes = parseInt(bytes);
    return data.length === parsedBytes ? true : false;
  }

  /**
   * Checks if the given cas is valid
   * @param  {string} cas  string containing the supposed cas
   * @returns {boolean} True if its a valid number, if it isn't, false
   */
  isCasValid(cas) {
    const parsedCas = parseInt(cas);
    return !Number.isNaN(parsedCas) ? true : false;
  }

  /**
   * Checks if the given bytes are valid
   * @param  {string} bytes  string containing the supposed bytes of the data
   * @returns {boolean} True if its positive and a valid number, if it isn't, false
   */
  areBytesValid(bytes) {
    const parsedBytes = parseInt(bytes);
    return !Number.isNaN(parsedBytes) && parsedBytes >= 0 ? true : false;
  }

  /**
   * Checks if the given ExpTime is valid
   * @param  {string} expTime  string containing the supposed ExpTime in seconds
   * @returns {boolean} True if its a valid number and less than 30 days in seconds, if it isn't, false
   */
  isExpTimeValid(expTime) {
    const parsedExpTime = parseInt(expTime);
    return !Number.isNaN(parsedExpTime) && parsedExpTime <= 60 * 60 * 24 * 30
      ? true
      : false;
  }

  /**
   * Checks if the given key is valid
   * @param  {string} key  string containing the supposed key
   * @returns {boolean} True if the string's lenght is less than or exactly 250, if it isn't, false
   */
  isKeyValid(key) {
    return key.length <= KEY_LENGHT ? true : false;
  }

  /**
   * Checks if the given flags are a positive number
   * @param  {string} flags  string containing the supposed flags
   * @returns {boolean} True if the number passes the check, if it doesn't, false
   */
  areFlagsValid(flags) {
    const parsedFlags = parseInt(flags);
    return !Number.isNaN(parsedFlags) && parsedFlags >= 0 ? true : false;
  }

  /**
   * Checks if the given operation is a valid one
   * @param  {string} possibleOperation  string containing the possible operation to check
   * @returns {(string|boolean)} The operation's name if the given supposed operation is valid, if it isn't, false
   */
  checkOperation(possibleOperation) {
    const indexOfOperation = VALID_OPERATIONS.indexOf(possibleOperation);
    if (indexOfOperation !== -1) {
      const operation = VALID_OPERATIONS[indexOfOperation];
      return operation;
    } else {
      return false;
    }
  }

  /**
   * Generates the parsed object for the given operation
   * @param  {string} operation string containing the operation
   * @param  {Array} params or keys containing the storage operation params or the retrieval operation keys
   * @param  {string} data  string containing the data sent by the user
   * @returns {(string|boolean)} The operation's name if the given supposed operation is valid, if it isn't, false
   */
  buildParsedObject(operation, params, data) {
    const parsedObject = {
      operation,
    };
    switch (operation) {
      case 'get':
      case 'gets':
        parsedObject.keys = params;
        break;
      case 'set':
      case 'add':
      case 'replace':
      case 'cas':
        parsedObject.data = data;
        parsedObject.key = params[0];
        parsedObject.flags = params[1];
        parsedObject.expTime = params[2];
        parsedObject.bytes = params[3];
        if (operation === 'cas') {
          parsedObject.casUnique = params[4];
          if (params.length > 5) {
            parsedObject.noReply = true;
          }
          break;
        }
        if (params.length > 4) {
          parsedObject.noReply = true;
        }
        break;
      case 'append':
      case 'prepend':
        parsedObject.key = params[0];
        parsedObject.bytes = params[1];
        if (params.length > 2) {
          parsedObject.noReply = true;
        }
        break;
    }
    return parsedObject;
  }
}

module.exports = Parser;
// const setString =
//   'set myKey 0 2592000 360 [noreply]\r\n{"glossary":{"title":"example glossary","GlossDiv":{"title":"S","GlossList":{"GlossEntry":{"ID":"SGML","SortAs":"SGML","GlossTerm":"Standard Generalized Markup Language","Acronym":"SGML","Abbrev":"ISO 8879:1986","GlossDef":{"para":"A meta-markup language, used to create markup languages such as DocBook.","GlossSeeAlso":["GML","XML"]},"GlossSee":"markup"}}}}}\r\n';

// const appendString =
//   'append myKey 360 [noreply]\r\n{"glossary":{"title":"example glossary","GlossDiv":{"title":"S","GlossList":{"GlossEntry":{"ID":"SGML","SortAs":"SGML","GlossTerm":"Standard Generalized Markup Language","Acronym":"SGML","Abbrev":"ISO 8879:1986","GlossDef":{"para":"A meta-markup language, used to create markup languages such as DocBook.","GlossSeeAlso":["GML","XML"]},"GlossSee":"markup"}}}}}\r\n';

// const prependString =
//   'prepend myKey 360\r\n{"glossary":{"title":"example glossary","GlossDiv":{"title":"S","GlossList":{"GlossEntry":{"ID":"SGML","SortAs":"SGML","GlossTerm":"Standard Generalized Markup Language","Acronym":"SGML","Abbrev":"ISO 8879:1986","GlossDef":{"para":"A meta-markup language, used to create markup languages such as DocBook.","GlossSeeAlso":["GML","XML"]},"GlossSee":"markup"}}}}}\r\n';

// const getsString =
//   'gets key2 thisisanotherbigKey thisIsAkEEYYY_kasda keyToo_big_231_14\r\n';

// const getString =
//   'get key2key2key2key2key2key2key2key2key2key2key2key2key2key2key2key2key2key2key2key2key2key2key2key2key2key2key2key2key2keyasdasdadasdasdasddasdjljqwoidjqiwodalskdjasldjaso1idjqwkdnaslkdjasdiqwjdopqwidjqwpodnmalkjlkasjdlaksjdlasdjiqnwdasdnalskdajsldaisjd thisisanotherbigKey thisIsAkEEYYY_kasda keyToo_big_231_14\r\n';

// const par = new Parser();
// console.log(par.parseInput(getString));
