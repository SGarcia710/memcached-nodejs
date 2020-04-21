'use strict';

const {
  KEY_LENGHT,
  VALID_OPERATIONS,
  INVALID_COMMAND,
  server_error,
} = require('../assets/config');
/* 
  Usage cases:
  <storage operation> <key> <flags> <exptime> <bytes> [noreply]\r\ndata\r\n
  cas <key> <flags> <exptime> <bytes> <cas unique> [noreply]\r\ndata\r\n
  <retrieval operation> <key>*\r\n 
  */
class Parser {
  /**
   * Checks if the input sent by the user is valid
   * @param  {string} input  string sent bye the client
   * @returns {(Object|Error)} Object with the operation and the rest of the input or Error if the operation is invalid
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
          try {
            return this.checkRetrievalOperationInput(operation, input);
          } catch (error) {
            throw new Error(server_error(error.message));
          }
        default:
          // Storage operation
          try {
            return this.checkStorageOperationInput(operation, input);
          } catch (error) {
            throw new Error(server_error(error.message));
          }
      }
    } else {
      // Invalid Operation
      throw new Error(INVALID_COMMAND);
    }
  }

  /**
   * Checks if the given input string has valid information for the given retrieval operation
   * @param  {string} operation string containing the operation
   * @param  {string} input string sent by the client with the supposed keys
   * @returns {Object|Error} Parsed object with all the information extracted from the input string if the keys are okay, if they aren't, Error
   */
  checkRetrievalOperationInput(operation, input) {
    const keys = this.separateKeys(operation, input);

    try {
      this.areKeysValid(keys);
    } catch (error) {
      throw new Error(error.message);
    }
    return this.buildParsedObject(operation, keys);
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
   * @returns {boolean|Error} True if the keys are valid ones, if they aren't, Error
   */
  areKeysValid(keys) {
    for (let key of keys) {
      try {
        this.isKeyValid(key);
      } catch (error) {
        throw new Error(error.message);
      }
    }
    return true;
  }

  /**
   * Checks if the given input string has valid information for the given storage operation
   * @param  {string} operation string containing the operation
   * @param  {string} input string sent by the client with the supposed parameters and data
   * @returns {Object|Error} Parsed object with all the information extracted from the input string if the data and params are okay, if they aren't, Error
   */
  checkStorageOperationInput(operation, input) {
    const [params, data] = this.separateParamsFromData(operation, input);

    try {
      this.areValidParamsAndData(operation, params, data);
    } catch (error) {
      throw new Error(error.message);
    }
    return this.buildParsedObject(operation, params, data);
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
   * @returns {boolean|Error} True if the params and data are valid ones, if they aren't, Error
   */
  areValidParamsAndData(operation, params, data) {
    let bytesPosition = 0;

    switch (operation) {
      case 'set':
      case 'add':
      case 'replace':
      case 'cas':
        bytesPosition = 3;
        try {
          this.isKeyValid(params[0]);
          this.areFlagsValid(params[1]);
          this.isExpTimeValid(params[2]);
          this.areBytesValid(params[bytesPosition]);
          if (operation === 'cas') {
            this.isCasValid(params[4]);
          }
        } catch (error) {
          throw new Error(error.message);
        }

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
    try {
      this.doBytesMatchWithData(data, params[bytesPosition]);
    } catch (error) {
      throw new Error(error.message);
    }
    return true;
  }

  /**
   * Checks if the bytes match with the given data
   * @param  {string} data  string containing the supposed data
   * @param  {string} bytes  string containing the supposed bytes
   * @returns {boolean|Error} True if the lenght of the data is equal to the given bytes, if it isn't, Error
   */
  doBytesMatchWithData(data, bytes) {
    const parsedBytes = parseInt(bytes);
    if (data.length === parsedBytes) {
      return true;
    }
    throw new Error('The given bytes must match with the data lenght');
  }

  /**
   * Checks if the given cas is valid
   * @param  {string} cas  string containing the supposed cas
   * @returns {boolean|Error} True if its a valid number, if it isn't, Error
   */
  isCasValid(cas) {
    const parsedCas = parseInt(cas);
    if (!Number.isNaN(parsedCas)) {
      return true;
    }
    throw new Error('Bytes must be a number');
  }

  /**
   * Checks if the given bytes are valid
   * @param  {string} bytes  string containing the supposed bytes of the data
   * @returns {boolean|Error} True if its positive and a valid number, if it isn't, Error
   */
  areBytesValid(bytes) {
    const parsedBytes = parseInt(bytes);
    if (!Number.isNaN(parsedBytes)) {
      if (parsedBytes >= 0) {
        return true;
      }
      throw new Error('Bytes must be >= 0');
    }
    throw new Error('Bytes must be a number');
  }

  /**
   * Checks if the given ExpTime is valid
   * @param  {string} expTime  string containing the supposed ExpTime in seconds
   * @returns {boolean|Error} True if its a valid number and less than 30 days in seconds, if it isn't, Error
   */
  isExpTimeValid(expTime) {
    const parsedExpTime = parseInt(expTime);
    if (!Number.isNaN(parsedExpTime)) {
      if (parsedExpTime <= 60 * 60 * 24 * 30) {
        return true;
      }
      throw new Error('ExpTime must be <= 60 * 60 * 24 * 30 (30 days)');
    }
    throw new Error('ExpTime must be a number');
  }

  /**
   * Checks if the given key is valid
   * @param  {string} key  string containing the supposed key
   * @returns {boolean|Error} True if the string's lenght is less than or exactly 250, if it isn't, Error
   */
  isKeyValid(key) {
    if (key.length <= KEY_LENGHT) {
      return true;
    }
    throw new Error('Keys cannot exceed 250 characters as lenght');
  }

  /**
   * Checks if the given flags are a positive number
   * @param  {string} flags  string containing the supposed flags
   * @returns {boolean|Error} True if the number passes the check, if it doesn't, Error
   */
  areFlagsValid(flags) {
    const parsedFlags = parseInt(flags);
    if (!Number.isNaN(parsedFlags)) {
      if (parsedFlags >= 0) {
        return true;
      }
      throw new Error('Flags must be a positive number');
    }
    throw new Error('Flags must be a number');
  }

  /**
   * Checks if the given operation is a valid one
   * @param  {string} possibleOperation  string containing the possible operation to check
   * @returns {(string|boolean)} operation's name if the given supposed operation is valid, if it isn't, false
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
   * @returns {Object} object with all the parsed Data exactracted from the input string sent by the client
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
        parsedObject.flags = parseFloat(params[1]);
        parsedObject.expTime = parseInt(params[2]);
        parsedObject.bytes = parseInt(params[3]);
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
        parsedObject.data = data;
        parsedObject.key = params[0];
        parsedObject.bytes = parseInt(params[1]);
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
//   'get key2key2key2key2key2key2key2key2key2keya2key2key2key2keykey2key2key2key2key2key2key2key2key2key2key2key2key2key2key2keyasdasdadasdasdasddasdjljqwoidjqiwodalskdjasldjaso1idjqwkdnaslkdjasdiqwjdopqwidjqwpodnmalkjlkasjdlaksjdlasdjiqnwdasdnalskdajsldaisjd thisisanotherbigKey thisIsAkEEYYY_kasda keyToo_big_231_14\r\n';

// const par = new Parser();

// try {
//   console.log(par.parseInput(setString));
// } catch (error) {
//   console.log(error.message);
// }
