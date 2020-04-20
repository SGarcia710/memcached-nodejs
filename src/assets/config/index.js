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

module.exports = {
  PORT,
  KEY_LENGHT,
  VALID_OPERATIONS,
  DEFAULT_MAX_TTL,
  DEFAULT_PURGE_INTERVAL,
  DEFAULT_ENTRIES_LIMIT,
};
