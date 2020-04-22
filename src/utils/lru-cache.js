'use strict';

// https://www.npmjs.com/package/ms
const ms = require('ms');
const {
  DEFAULT_MAX_TTL,
  DEFAULT_PURGE_INTERVAL,
  DEFAULT_ENTRIES_LIMIT,
} = require('../assets/config');

class Node {
  constructor(key, value, left = null, right = null) {
    this.key = key;
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

class LRU {
  constructor(entriesLimit, maxTTL, purgeInterval) {
    this.entriesLimit = entriesLimit || DEFAULT_ENTRIES_LIMIT;
    this.start = null;
    this.end = null;
    this.cache = new Map();
    this.expires = new Map();

    this.maxTTL = maxTTL ? this.ms(maxTTL) : this.ms(DEFAULT_MAX_TTL);

    purgeInterval = purgeInterval
      ? this.ms(purgeInterval)
      : this.ms(DEFAULT_PURGE_INTERVAL);

    this.purgeInterval =
      purgeInterval < Infinity
        ? setInterval(this._purgeExpiredEntries.bind(this), purgeInterval)
        : null;
  }

  /**
   * Returns the actual date in ms
   * @returns {integer} actual date in ms
   */
  now() {
    return Date.now();
  }

  /**
   * Returns the given time to live in ms
   * @param {integer|string} ttl the time to live for the element to save in ms or using ms library syntax
   * @returns {integer} actual date in ms
   */
  ms(ttl) {
    switch (typeof ttl) {
      case 'string':
        ttl = ms(ttl);
        break;
      case 'number':
        ttl = Math.floor(ttl);
        break;
      default:
        break;
    }
    return ttl > 0 ? ttl : this.maxTTL;
  }

  /**
   * Checks if the cache has the given key and its valid
   * @param {string} key The supposed item's key
   * @returns {boolean} True if this item exists and its valid or false if its not
   */
  has(key) {
    // If a key its already expired, it can be safely replaced/updated, because it will be purged anyways.
    return this.cache.has(key) && this.expires.get(key) > this.now();
  }

  /**
   * Checks if the given key its expired or not
   * @param {string} key The supposed item's key
   * @returns {boolean} True if this item its valid or false if its not
   */
  check(key) {
    return this.expires.get(key) > this.now();
  }

  /**
   * Purges the expired keys in the cache
   * @returns {Array} Array containing the purged keys
   */
  _purgeExpiredEntries() {
    const now = this.now();
    let keys = new Set();

    // Getting the Expired's Entries keys
    for (let pair of this.expires) {
      if (pair[1] <= now) {
        keys.add(pair[0]);
      }
    }

    for (let key of keys) {
      // Delete every expired entry
      this.removeEntry(this.cache.get(key));
      this.cache.delete(key);
      this.expires.delete(key);
    }
    // Return the Expired's Entries keys
    return keys;
  }

  /**
   * Gets entry from cache map and update with that entry the head of the Doubly LinkedList
   * @param {string} key supposed key to fetch
   * @param {boolean} noUpdate true to indicate the cache to dont move this entry to the head of the doubly linked list
   * @returns {object|boolean} object with the item's value or false if it doesnt exist or its expired on the cache
   */
  getEntry(key, noUpdate) {
    if (this.cache.has(key) && this.check(key)) {
      const entry = this.cache.get(key);
      if (!noUpdate) {
        // This is a normal getEntry
        // Entry gets removed from it's position and cache
        this.removeEntry(entry);
        // And its moved to the head of Doubly Linked List to make it MRU
        this.addEntryToTop(entry);
      }

      return entry.value;
    }

    // The entry key doesn't exist or its expired on the cache.
    return false;
  }

  /**
   * Updates the value for an existing entry in the cache, and move it to top
   * @param {string} key entry's key
   * @param {any} value entry's value
   */
  updateEntry(key, value) {
    let entry = this.cache.get(key);
    entry.value = value;
    this.removeEntry(entry);
    this.addEntryToTop(entry);
  }

  /**
   * Add a new entry to the cache or updates it if it already exists (included the expiration time)
   * @param {string} key entry's key
   * @param {Object} value entry's value
   * @param {string} entryTTL entry's time to live
   */
  addEntry(key, value, entryTTL) {
    if (this.cache.has(key)) {
      // If they key already exist, just update the value and move it to top
      this.updateEntry(key, value);
    } else {
      // If its a new key
      const newEntry = new Node(key, value);
      if (this.cache.size === this.entriesLimit) {
        // If the cache has reached the maximum size, it needs to make space for the new entry.
        this.cache.delete(this.end.key);
        this.removeEntry(this.end);
        this.addEntryToTop(newEntry);
      } else {
        // If cache has space
        this.addEntryToTop(newEntry);
      }
      // Update the cache map
      this.cache.set(key, newEntry);
    }
    // Create or update the expiration time
    this.expires.set(
      key,
      this.now() +
        (entryTTL && ms(entryTTL) < this.maxTTL ? ms(entryTTL) : this.maxTTL)
    );
  }

  /**
   * Add Entry to head of Doubly LinkedList
   * @param {Object} entry entry object to save
   */
  addEntryToTop(entry) {
    entry.right = this.start;
    entry.left = null;
    if (this.start !== null) {
      this.start.left = entry;
    }
    this.start = entry;
    if (this.end == null) {
      this.end = this.start;
    }
  }

  /**
   * Remove Entry from the Doubly LinkedList
   * @param {Object} entry entry object to remove
   */
  removeEntry(entry) {
    if (entry.left !== null) {
      entry.left.right = entry.right;
    } else {
      this.start = entry.right;
    }

    if (entry.right !== null) {
      entry.right.left = entry.left;
    } else {
      this.end = entry.left;
    }
  }

  /**
   * Resets the cache
   */
  clearCache() {
    this.start = null;
    this.end = null;
    this.cache.clear();
    this.expires.clear();
  }

  // /**
  //  * TODO
  //  * Invokes the callback function with each element on the cache
  //  * @param {Function} callback to excecute
  //  */
  // forEach(callback) {
  //   let entry = this.start;
  //   let counter = 0;
  //   while (entry) {
  //     callback(entry, counter);
  //     entry = entry.right;
  //     counter++;
  //   }
  // }

  /**
   * To iterate over LRU with a 'for...of' loop
   */
  *[Symbol.iterator]() {
    let entry = this.head;
    while (entry) {
      yield entry;
      entry = entry.next;
    }
  }
}

module.exports = LRU;
