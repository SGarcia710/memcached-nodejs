'use strict';

const Memcached = require('../../src/memcached');
const { REPLY_END } = require('../../src/assets/config/');

const mocks = [
  {
    operation: 'gets',
    keys: ['thisOneDoesntExist', 'thisOneDoesntExistToo'],
  },
  {
    operation: 'gets',
    keys: ['key1', 'thisOneDoesntExist'],
  },
  {
    operation: 'gets',
    keys: ['key1', 'key2', 'key3'],
  },
];

let casArray = [];

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
  for (let i = 0; i < 3; i++) {
    casArray.push(
      memcached.lruCache.getEntry(mocks[2].keys[i], true).value.cas
    );
  }
});

const memcached = new Memcached();

describe('Gets command', () => {
  describe('Gets non existing keys', () => {
    it('should returns END\\r\\n', () => {
      const getResponse = memcached.handleOperation(mocks[0]);
      expect(getResponse).toEqual(REPLY_END);
    });
  });
  describe('Gets existing key with a non existing key ', () => {
    it('should returns the existing key only with its respective casUnique Key', () => {
      const getResponse = memcached.handleOperation(mocks[1]);
      expect(getResponse).toEqual(
        `VALUE key1 1.2 5 [${casArray[0]}]\r\ndata1\r\nEND\r\n`
      );
    });
  });
  describe('Gets various existing keys', () => {
    it('should returns all the requested keys with their respective casUnique Key', () => {
      const getResponse = memcached.handleOperation(mocks[2]);
      expect(getResponse).toEqual(
        `VALUE key1 1.2 5 [${casArray[0]}]\r\ndata1\r\nVALUE key2 2.2 5 [${casArray[1]}]\r\ndata2\r\nVALUE key3 3.2 5 [${casArray[2]}]\r\ndata3\r\nEND\r\n`
      );
    });
  });
});
