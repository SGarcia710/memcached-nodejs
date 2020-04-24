'use strict';

const { v4: uuid } = require('uuid');
const LRU = require('../utils/lru-cache');
const {
  REPLY_STORED,
  REPLY_NOT_STORED,
  REPLY_EXISTS,
  REPLY_NOT_FOUND,
  REPLY_END,
} = require('../assets/config');

// const mocks = [
//   {
//     key: 'key1',
//     data: 'data1',
//     flags: 1.2,
//     bytes: 5,
//     expTime: 0,
//   },
//   {
//     key: 'key2',
//     data: 'data2',
//     flags: 2.2,
//     bytes: 5,
//     expTime: 0,
//   },
//   {
//     key: 'key3',
//     data: 'data3',
//     flags: 3.2,
//     bytes: 5,
//     expTime: 0,
//   },
// ];

class Memcached {
  constructor() {
    this.lruCache = new LRU();

    // this._init();
  }

  // _init() {
  //   for (let e of mocks) {
  //     this.set(e.key, e.data, e.flags, e.bytes, e.expTime);
  //   }
  // }

  /**
   * Handles the operation contained in the parsed Object.
   * @param  {Object} parsedObject Object containing all the data for execute some function.
   * @returns {string} string containing all the reponse for the client
   */
  handleOperation(parsedObject) {
    switch (parsedObject.operation) {
      case 'set':
        this.set(
          parsedObject.key,
          parsedObject.data,
          parsedObject.flags,
          parsedObject.bytes,
          parsedObject.expTime
        );
        if (parsedObject.noReply) {
          return false;
        } else {
          return REPLY_STORED;
        }
      case 'add':
        if (
          this.add(
            parsedObject.key,
            parsedObject.data,
            parsedObject.flags,
            parsedObject.bytes,
            parsedObject.expTime
          )
        ) {
          if (parsedObject.noReply) {
            return false;
          } else {
            return REPLY_STORED;
          }
        } else {
          return REPLY_NOT_STORED;
        }

      case 'replace':
        if (
          this.replace(
            parsedObject.key,
            parsedObject.data,
            parsedObject.flags,
            parsedObject.bytes,
            parsedObject.expTime
          )
        ) {
          if (parsedObject.noReply) {
            return false;
          } else {
            return REPLY_STORED;
          }
        } else {
          return REPLY_NOT_STORED;
        }
      case 'append':
        if (
          this.handleDataConcatenation(
            parsedObject.key,
            parsedObject.data,
            parsedObject.bytes,
            false
          )
        ) {
          if (parsedObject.noReply) {
            return false;
          } else {
            return REPLY_STORED;
          }
        } else {
          return REPLY_NOT_FOUND;
        }
      case 'prepend':
        if (
          this.handleDataConcatenation(
            parsedObject.key,
            parsedObject.data,
            parsedObject.bytes,
            true
          )
        ) {
          if (parsedObject.noReply) {
            return false;
          } else {
            return REPLY_STORED;
          }
        } else {
          return REPLY_NOT_FOUND;
        }
      case 'cas':
        const casAnswer = this.cas(
          parsedObject.key,
          parsedObject.flags,
          parsedobject.expTime,
          parsedObject.bytes,
          parsedObject.data,
          parsedobject.casUnique
        );
        if (casAnswer === true) {
          if (parsedObject.noReply) {
            return false;
          } else {
            return REPLY_STORED;
          }
        }
        return casAnswer;
      case 'get':
        return this.retrievalHandler(parsedObject.keys, false);
      case 'gets':
        return this.retrievalHandler(parsedObject.keys, true);
    }
  }

  /**
   * Generates an unique cas key.
   * @returns {string} containing random unique Cas
   */
  _generateUniqueCas() {
    return uuid();
  }

  /**
   * Transforms exptime to LRUCache format (ms not seconds)
   * @param {Number} expTime in seconds
   * @returns {Number} expTime in ms.
   */
  _expTimeToMs(expTimeInSeconds) {
    return expTimeInSeconds * 1000;
  }

  /**
   * Stores data in the cache.
   * @param  {string} key entry's key
   * @param  {string} data entry's main data
   * @param  {float} flags positive decimal number
   * @param  {Number} bytes data's lenght
   * @param  {Number} expTime entry's time to live
   */
  set(key, data, flags, bytes, expTime) {
    const dataObject = {
      data,
      flags,
      bytes,
      cas: this._generateUniqueCas(),
    };
    this.lruCache.addEntry(key, dataObject, this._expTimeToMs(expTime));
  }

  /**
   * Stores data in the cache, but only if the cache doesn't already hold data for this key.
   * @param  {string} key entry's key
   * @param  {string} data entry's main data
   * @param  {float} flags positive decimal number
   * @param  {Number} bytes data's lenght
   * @param  {Number} expTime entry's time to live
   * @returns {boolean} true if the cache doesn't have data for the given key and it added it correctly, or false if it does.
   */
  add(key, data, flags, bytes, expTime) {
    if (!this.lruCache.has(key)) {
      const dataObject = {
        data,
        flags,
        bytes,
        cas: this._generateUniqueCas(),
      };
      this.lruCache.addEntry(key, dataObject, this._expTimeToMs(expTime));
      return true;
    } else {
      return false;
    }
  }

  /**
   * Stores data in the cache, but only if the cache does already hold data for this key.
   * @param  {string} key entry's key
   * @param  {string} data entry's main data
   * @param  {Number} flags positive decimal number
   * @param  {Number} bytes data's lenght
   * @param  {Number} expTime entry's time to live
   * @returns {boolean} true if the cache has data for the given key and it replaced the entry corretly, or false if it doesn't.
   */
  replace(key, data, flags, bytes, expTime) {
    if (this.lruCache.has(key)) {
      const dataObject = {
        data,
        flags,
        bytes,
        cas: this._generateUniqueCas(),
      };
      this.lruCache.addEntry(key, dataObject, this._expTimeToMs(expTime));
      return true;
    } else {
      return false;
    }
  }

  /**
   * Adds data to an existing key after or before its data
   * @param  {string} key entry's key
   * @param  {string} newData the new data to concat to the existing data
   * @param  {Number} bytes new data's lenght
   * @param  {boolean} isPrepend true to tells the function to concat the new data before the existing data, false to do it after the existing data
   * @returns {boolean} true if the cache has data for the given key and it updated it corretly, or false if it doesn't.
   */
  handleDataConcatenation(key, newData, bytes, isPrepend) {
    if (this.lruCache.has(key)) {
      const actualEntryData = this.lruCache.getEntry(key, true);
      const newEntryData = {
        ...actualEntryData,
        bytes: actualEntryData + bytes,
        cas: this._generateUniqueCas(),
      };
      if (isPrepend) {
        newEntryData.data = newData + actualEntryData.data;
      } else {
        newEntryData.data = actualEntryData.data + newData;
      }
      this.lruCache.updateEntry(key, newEntryData);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Replaces the data only if no one else has updated it since the last fetch
   * @param  {string} key entry's key
   * @param  {Number} flags positive decimal number
   * @param  {Number} expTime entry's time to live
   * @param  {Number} bytes data's lenght
   * @param  {string} data entry's main data
   * @param  {string} casUnique entry's unique key (version key)
   * @returns {boolean} true if the cache has data for the given key, the casUnique matchs and the entry was replaced the corretly, or false if it doesn't.
   */
  cas(key, flags, expTime, bytes, data, casUnique) {
    if (this.lruCache.has(key)) {
      const actualEntryData = this.lruCache.getEntry(key, true);
      if (actualEntryData.cas === casUnique) {
        const dataObject = {
          data,
          flags,
          bytes,
          cas: this._generateUniqueCas(),
        };
        this.lruCache.addEntry(key, dataObject, this._expTimeToMs(expTime));
        // The entry exists and it also has the same cas key sent by the client (same cas key means same data version)
        return true;
      } else {
        // Entry was modified since the last fetch (diferent cas key means different data version)
        return REPLY_EXISTS;
      }
    } else {
      // The key doesnt match with any entry in the cache
      return REPLY_NOT_FOUND;
    }
  }

  /**
   * Retrieves data from cache for get and gets method
   * @param  {string} key entry/ies key/s
   * @param  {boolean} isGets true to concat the casUnique in each line of data
   * @returns {string} string with the lines of data found
   */
  retrievalHandler(keys, isGets) {
    let entriesFound = [];
    for (let key of keys) {
      if (this.lruCache.has(key)) {
        entriesFound.push(this.lruCache.getEntry(key));
      }
    }
    if (entriesFound.length) {
      return this._generateRetrievalOutput(entriesFound, isGets);
    } else {
      return REPLY_END;
    }
  }

  /** Generates the output for the get and gets commands
   * @param {Array} entries array with the entries to send to the client
   * @param {boolean} withCas true if the casUnique its needed in the output (for gets command)
   * @returns {string} string with the output for the client
   */
  _generateRetrievalOutput(entries, withCas) {
    let outputString = '';
    for (let entry of entries) {
      if (withCas) {
        outputString = outputString.concat(
          `VALUE ${entry.key} ${entry.value.flags} ${entry.value.bytes} [${entry.value.cas}]\r\n${entry.value.data}\r\n`
        );
      }
      outputString = outputString.concat(
        `VALUE ${entry.key} ${entry.value.flags} ${entry.value.bytes}\r\n${entry.value.data}\r\n`
      );
    }
    outputString = outputString.concat(REPLY_END);
    return outputString;
  }
}

module.exports = Memcached;
