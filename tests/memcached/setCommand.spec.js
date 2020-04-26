'use strict';

const Memcached = require('../../src/memcached');
const { REPLY_STORED } = require('../../src/assets/config/');

const mocks = [
  {
    operation: 'set',
    key: 'key1',
    data: 'data1',
    flags: 1.2,
    bytes: 5,
    expTime: 0,
    noReply: false,
  },
  {
    operation: 'set',
    key: 'key2',
    data: 'data2',
    flags: 2.2,
    bytes: 5,
    expTime: 0,
    noReply: true,
  },
  {
    operation: 'set',
    key: 'key1',
    data: 'data3',
    flags: 3.2,
    bytes: 5,
    expTime: 0,
    noReply: true,
  },
];

const memcached = new Memcached();

describe('Set command', () => {
  describe('Set data', () => {
    it('should returns STORED\\r\\n', () => {
      const setResponse = memcached.handleOperation(mocks[0]);
      expect(setResponse).toEqual(REPLY_STORED);
    });
  });
  describe('Set data with no reply', () => {
    it('should returns false', () => {
      const setResponse = memcached.handleOperation(mocks[1]);
      expect(setResponse).toEqual(false);
    });
  });
  describe('Set data with an existing key', () => {
    it('should returns the new data for that key when user gets it', () => {
      memcached.handleOperation(mocks[2]);
      const getResponse = memcached.retrievalHandler(['key1'], false);
      expect(getResponse).toEqual('VALUE key1 3.2 5\r\ndata3\r\nEND\r\n');
    });
  });
});
