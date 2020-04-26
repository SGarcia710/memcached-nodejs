'use strict';

const Memcached = require('../../src/memcached');
const { REPLY_END } = require('../../src/assets/config/');

const mocks = [
  {
    operation: 'get',
    keys: ['thisOneDoesntExist', 'thisOneDoesntExistToo'],
  },
  {
    operation: 'get',
    keys: ['key1', 'thisOneDoesntExist'],
  },
  {
    operation: 'get',
    keys: ['key1', 'key2', 'key3'],
  },
];

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

const memcached = new Memcached();

describe('Get command', () => {
  describe('Get non existing keys', () => {
    it('should returns END\\r\\n', () => {
      const getResponse = memcached.handleOperation(mocks[0]);
      expect(getResponse).toEqual(REPLY_END);
    });
  });
  describe('Get existing key with a non existing key ', () => {
    it('should returns the existing key only', () => {
      const getResponse = memcached.handleOperation(mocks[1]);
      expect(getResponse).toEqual('VALUE key1 1.2 5\r\ndata1\r\nEND\r\n');
    });
  });
  describe('Get various existing keys', () => {
    it('should returns all the requested keys', () => {
      const getResponse = memcached.handleOperation(mocks[2]);
      expect(getResponse).toEqual(
        'VALUE key1 1.2 5\r\ndata1\r\nVALUE key2 2.2 5\r\ndata2\r\nVALUE key3 3.2 5\r\ndata3\r\nEND\r\n'
      );
    });
  });
});
