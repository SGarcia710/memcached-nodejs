'use strict';

require('dotenv').config();

// Server consts
const PORT = process.env.PORT;
// Parser consts
const KEY_LENGHT = 250;
const VALID_OPERATIONS = [
  'get',
  'gets',
  'set',
  'add',
  'replace',
  'append',
  'prepend',
  'cas',
];
// LRU Cache consts
const DEFAULT_MAX_TTL = '30d';
const DEFAULT_PURGE_INTERVAL = '10d';
const DEFAULT_ENTRIES_LIMIT = 100;

// Memcached's errors strings
const INVALID_COMMAND = 'ERROR\r\n';
const client_error = (error) => `CLIENT_ERROR ${error}\r\n`;
const server_error = (error) => `SERVER_ERROR ${error}\r\n`;

// Memcached's storage responses strings
const REPLY_STORED = 'STORED\r\n';
const REPLY_NOT_STORED = 'NOT_STORED\r\n';
const REPLY_EXISTS = 'EXISTS\r\n';
const REPLY_NOT_FOUND = 'NOT_FOUND\r\n';

// Memcached's retrieval reponse string
const REPLY_END = 'END\r\n';

module.exports = {
  PORT,
  KEY_LENGHT,
  VALID_OPERATIONS,
  DEFAULT_MAX_TTL,
  DEFAULT_PURGE_INTERVAL,
  DEFAULT_ENTRIES_LIMIT,
  INVALID_COMMAND,
  client_error,
  server_error,
  REPLY_STORED,
  REPLY_NOT_STORED,
  REPLY_EXISTS,
  REPLY_NOT_FOUND,
  REPLY_END,
};
