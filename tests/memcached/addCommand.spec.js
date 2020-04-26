'use strict';

const Memcached = require('../../src/memcached');
const { REPLY_STORED, REPLY_NOT_STORED } = require('../../src/assets/config/');

const mocks = [
  {
    operation: 'add',
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
    operation: 'add',
    key: 'key1',
    data: 'data3',
    flags: 3.2,
    bytes: 5,
    expTime: 0,
    noReply: true,
  },
];

const memcached = new Memcached();

describe('Add command', () => {
  describe('Add new data', () => {
    it('should returns STORED\\r\\n', () => {
      const addResponse = memcached.handleOperation(mocks[0]);
      expect(addResponse).toEqual(REPLY_STORED);
    });
  });
  describe('Add new data with no reply', () => {
    it('should returns false', () => {
      const addResponse = memcached.handleOperation(mocks[1]);
      expect(addResponse).toEqual(false);
    });
  });
  describe('Add new data with an existing key', () => {
    it('should returns NOT_STORED\\r\\n', () => {
      const addResponse = memcached.handleOperation(mocks[2]);
      expect(addResponse).toEqual(REPLY_NOT_STORED);
    });
  });
});
