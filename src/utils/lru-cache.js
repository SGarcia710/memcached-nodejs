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
        ? setInterval(this.purgeExpiredEntries.bind(this), purgeInterval)
        : null;
  }

  now() {
    return Date.now();
  }

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

  // This function checks if the given key its expired or not
  check(key) {
    return this.expires.get(key) > this.now();
  }

  purgeExpiredEntries() {
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

  // Get entry from cache map and update with that entry the head of the Doubly LinkedList
  getEntry(key) {
    if (this.cache.has(key) && this.check(key)) {
      const entry = this.cache.get(key);
      // Entry removed from it's position and cache
      this.removeEntry(entry);
      // Move entry to the head of Doubly LinkedList to make it MRU
      this.addEntryToTop(entry);

      // return entry.value;
      return entry.value;
    }

    // The entry key doesn't exist or its expired on the cache.
    return -1;
  }

  addEntry(key, value, entryTTL) {
    if (this.cache.has(key)) {
      // If they key already exist, just update the value and move it to top
      let entry = this.cache.get(key);
      entry.value = value;
      this.removeEntry(entry);
      this.addEntryToTop(entry);
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
    // create the expiration time
    this.expires.set(
      key,
      this.now() +
        (entryTTL && ms(entryTTL) < this.maxTTL ? ms(entryTTL) : this.maxTTL)
    );
  }

  // Add Entry to head of Doubly LinkedList
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

  // Remove Entry from the Doubly LinkedList
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

  clearCache() {
    this.start = null;
    this.end = null;
    this.cache.clear();
    this.expires.clear();
  }

  // Invokes the callback function with every entry of the chain and the index of the entry.
  forEach(callback) {
    let entry = this.start;
    let counter = 0;
    while (entry) {
      callback(entry, counter);
      entry = entry.right;
      counter++;
    }
  }

  // To iterate over LRU with a 'for...of' loop
  *[Symbol.iterator]() {
    let entry = this.head;
    while (entry) {
      yield entry;
      entry = entry.next;
    }
  }
}

module.exports = LRU;
