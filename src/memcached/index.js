'use strict';

const uuid = require('uuid/v4');
const LRU = require('../utils/lru-cache');
const {
  REPLY_STORED,
  REPLY_NOT_STORED,
  REPLY_EXISTS,
  REPLY_NOT_FOUND,
} = require('../assets/config');

class Memcached {
  constructor() {
    this.lruCache = new LRU();
  }

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
          this.append(parsedObject.key, parsedObject.data, parsedObject.bytes)
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
          this.prepend(parsedObject.key, parsedObject.data, parsedObject.bytes)
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
      case 'get':
      case 'gets':
    }
  }

  /**
   * Generates an unique cas key.
   * @returns {string} containing random unique Cas
   */
  generateUniqueCas() {
    return uuid();
  }

  /**
   * Transforms exptime to LRUCache format (ms not seconds)
   * @param {Number} expTime in seconds
   * @returns {Number} expTime in ms.
   */
  expTimeToMs(expTimeInSeconds) {
    return expTimeInSeconds * 1000;
  }

  /**
   * Stores data in the cache.
   * @param  {string} key entry's key
   * @param  {string} data entry's main data
   * @param  {float} flags positive number
   * @param  {Number} bytes data's lenght
   * @param  {Number} expTime entry's time to live
   */
  set(key, data, flags, bytes, expTime) {
    const dataObject = {
      data,
      flags,
      bytes,
      cas: generateUniqueCas(),
    };
    this.lruCache.addEntry(key, dataObject, expTimeToMs(expTime));
  }

  /**
   * Stores data in the cache, but only if the cache doesn't already hold data for this key.
   * @param  {string} key entry's key
   * @param  {string} data entry's main data
   * @param  {float} flags positive number
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
        cas: generateUniqueCas(),
      };
      this.lruCache.addEntry(key, dataObject, expTimeToMs(expTime));
      return true;
    } else {
      return false;
    }
  }

  /**
   * Stores data in the cache, but only if the cache does already hold data for this key.
   * @param  {string} key entry's key
   * @param  {string} data entry's main data
   * @param  {float} flags positive number
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
        cas: generateUniqueCas(),
      };
      this.lruCache.addEntry(key, dataObject, expTimeToMs(expTime));
      return true;
    } else {
      return false;
    }
  }

  /**
   * Adds data to an existing key after existing data
   * @param  {string} key entry's key
   * @param  {string} suffixData suffix to append to the data
   * @param  {Number} bytes data's lenght
   * @returns {boolean} true if the cache has data for the given key and it updated it corretly, or false if it doesn't.
   */
  append(key, suffixData, bytes) {
    if (this.lruCache.has(key)) {
      const actualEntryData = this.lruCache.getEntry(key, true);
      const newEntryData = {
        ...actualEntryData,
        bytes: actualEntryData + bytes,
        data: actualEntryData.data + suffixData,
        cas: this.generateUniqueCas(),
      };
      this.lruCache.updateEntry(key, newEntryData);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Adds data to an existing key before existing data
   * @param  {string} key entry's key
   * @param  {string} prefixData prefix to append to the data
   * @param  {integer} bytes data's lenght
   * @returns {boolean} true if the cache has data for the given key and it replaced the entry corretly, or false if it doesn't.
   */
  prepend(key, prefixData, bytes) {
    if (this.lruCache.has(key)) {
      const actualEntryData = this.lruCache.getEntry(key, true);
      const newEntryData = {
        ...actualEntryData,
        bytes: actualEntryData + bytes,
        data: prefixData + actualEntryData.data,
        cas: this.generateUniqueCas(),
      };
      this.lruCache.updateEntry(key, newEntryData);
      return true;
    } else {
      return false;
    }
  }
}

module.exports = Memcached;
