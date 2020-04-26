'use strict';

const Memcached = require('../../src/memcached');
const {
  REPLY_STORED,
  REPLY_NOT_FOUND,
  REPLY_EXISTS,
} = require('../../src/assets/config/');

const mocks = [
  {
    operation: 'cas',
    key: 'key9',
    data: 'data9',
    flags: 1.2,
    bytes: 5,
    expTime: 0,
    noReply: true,
    casUnique: 'anything',
  },
  {
    operation: 'cas',
    key: 'key1',
    data: 'data1new',
    flags: 2.2,
    bytes: 8,
    expTime: 0,
    noReply: false,
  },
  {
    operation: 'cas',
    key: 'key2',
    data: 'data2new',
    flags: 3.2,
    bytes: 8,
    expTime: 0,
    noReply: true,
  },
  {
    operation: 'cas',
    key: 'key3',
    data: 'data3new',
    flags: 3.2,
    bytes: 5,
    expTime: 0,
    noReply: true,
    casUnique: 'anything',
  },
];

const memcached = new Memcached();

beforeAll(() => {
  memcached.handleOperation({
    operation: 'set',
    key: 'key1',
    data: 'data1',
    flags: 1.2,
    bytes: 5,
    expTime: 0,
    noReply: true,
  });
  memcached.handleOperation({
    operation: 'set',
    key: 'key2',
    data: 'data2',
    flags: 2.2,
    bytes: 5,
    expTime: 0,
    noReply: true,
  });
  memcached.handleOperation({
    operation: 'set',
    key: 'key3',
    data: 'data3',
    flags: 3.2,
    bytes: 5,
    expTime: 0,
    noReply: true,
  });
});

describe('Cas command', () => {
  describe('Cas to a non existing key', () => {
    it('should returns NOT_FOUND\\r\\n"', () => {
      const casResponse = memcached.handleOperation(mocks[0]);
      expect(casResponse).toEqual(REPLY_NOT_FOUND);
    });
  });
  describe('Cas to an existing key', () => {
    it('should returns STORED\\r\\n', () => {
      const casUniqueForMatch = memcached.lruCache.getEntry(mocks[1].key, true)
        .value.cas;
      const casResponse = memcached.handleOperation({
        ...mocks[1],
        casUnique: casUniqueForMatch,
      });
      expect(casResponse).toEqual(REPLY_STORED);
    });
  });
  describe('Cas to an existing key with noreply', () => {
    it('should returns false', () => {
      const casUniqueForMatch = memcached.lruCache.getEntry(mocks[2].key, true)
        .value.cas;
      const casResponse = memcached.handleOperation({
        ...mocks[2],
        casUnique: casUniqueForMatch,
      });
      expect(casResponse).toEqual(false);
    });
  });
  describe('Cas to an existing key but not matching the casUnique', () => {
    it('should returns false', () => {
      const casResponse = memcached.handleOperation(mocks[3]);
      expect(casResponse).toEqual(REPLY_EXISTS);
    });
  });
});
