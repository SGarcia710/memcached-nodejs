'use strict';

const LRU = require('../utils/lru-cache');

class Memcached {
  constructor() {
    this.lruCache = new LRU();
  }
}

module.exports = Memcached;
