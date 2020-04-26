'use strict';

const Memcached = require('../../src/memcached');
const { REPLY_STORED, REPLY_NOT_FOUND } = require('../../src/assets/config/');

const mocks = [
  {
    operation: 'prepend',
    key: 'key9',
    data: 'data1',
    bytes: 5,
    noReply: false,
  },
  {
    operation: 'prepend',
    key: 'key1',
    data: 'data4',
    bytes: 5,
    noReply: false,
  },
  {
    operation: 'prepend',
    key: 'key2',
    data: 'data5',
    bytes: 5,
    noReply: true,
  },
  {
    operation: 'prepend',
    key: 'key1',
    data: 'data6',
    bytes: 5,
    noReply: true,
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
});

describe('Prepend command', () => {
  describe('Prepend to a non existing key', () => {
    it('should returns NOT_FOUND\\r\\n"', () => {
      const appendResponse = memcached.handleOperation(mocks[0]);
      expect(appendResponse).toEqual(REPLY_NOT_FOUND);
    });
  });
  describe('Prepend to an existing key', () => {
    it('should returns STORED\\r\\n', () => {
      const appendResponse = memcached.handleOperation(mocks[1]);
      expect(appendResponse).toEqual(REPLY_STORED);
    });
  });
  describe('Prepend to an existing key with noreply', () => {
    it('should returns false', () => {
      const appendResponse = memcached.handleOperation(mocks[2]);
      expect(appendResponse).toEqual(false);
    });
  });
  describe('Prepend is concatenating the new data before the existing one', () => {
    it('should returns false', () => {
      memcached.handleOperation(mocks[3]);
      const getResponse = memcached.retrievalHandler(['key1'], false);
      expect(getResponse).toEqual(
        'VALUE key1 1.2 15\r\ndata6data4data1\r\nEND\r\n'
      );
    });
  });
});
