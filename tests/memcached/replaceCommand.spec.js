'use strict';

const Memcached = require('../../src/memcached');
const { REPLY_STORED, REPLY_NOT_STORED } = require('../../src/assets/config/');

const mocks = [
  {
    operation: 'replace',
    key: 'key1',
    data: 'data1',
    flags: 1.2,
    bytes: 5,
    expTime: 0,
    noReply: false,
  },
  {
    operation: 'add',
    key: 'key2',
    data: 'data2',
    flags: 2.2,
    bytes: 5,
    expTime: 0,
    noReply: true,
  },
  {
    operation: 'replace',
    key: 'key2',
    data: 'data3',
    flags: 3.2,
    bytes: 5,
    expTime: 0,
    noReply: false,
  },
  {
    operation: 'replace',
    key: 'key2',
    data: 'data4',
    flags: 4.2,
    bytes: 5,
    expTime: 0,
    noReply: true,
  },
];

const memcached = new Memcached();

describe('Replace command', () => {
  describe('Replace non existing key', () => {
    it('should returns NOT_STORED\\r\\n"', () => {
      const replaceResponse = memcached.handleOperation(mocks[0]);
      expect(replaceResponse).toEqual(REPLY_NOT_STORED);
    });
  });
  describe('Replace existing key', () => {
    it('should returns STORED\\r\\n', () => {
      memcached.handleOperation(mocks[1]);
      const replaceResponse = memcached.handleOperation(mocks[2]);
      expect(replaceResponse).toEqual(REPLY_STORED);
    });
  });
  describe('Replace existing key with noreply', () => {
    it('should returns false', () => {
      const replaceResponse = memcached.handleOperation(mocks[3]);
      expect(replaceResponse).toEqual(false);
    });
  });
});
