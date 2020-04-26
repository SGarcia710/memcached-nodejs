'use strict';

const Parser = require('../../src/utils/parser');
const { client_error, INVALID_COMMAND } = require('../../src/assets/config/');

const mocks = [
  {
    operation: 'get',
    keys: ['thisIsAKey', 'sebastian', 'thisIsAnotherKey'],
  },
  {
    operation: 'gets',
    keys: ['thisIsAKey', 'moove-it', 'thisIsAnotherKey'],
  },
];

const parser = new Parser();

describe('Parser with Retrieval commands', () => {
  describe('The client sends an invalid operation', () => {
    it('Should throws ERROR\\r\\n', () => {
      function throwError() {
        parser.parseInput('notAnOperation myKey anotherKey\r\n');
      }
      expect(throwError).toThrowError(new Error(INVALID_COMMAND));
    });
  });
  describe('Check the command was send with at least one key', () => {
    describe('The client sends a get operation without keys', () => {
      it('Should throws CLIENT_ERROR Retrieval commands must be sent with at least one key\\r\\n', () => {
        function throwError() {
          parser.parseInput('get\r\n');
        }
        expect(throwError).toThrowError(
          new Error(
            client_error(
              'Retrieval commands must be sent with at least one key'
            )
          )
        );
      });
    });
    describe('The client sends a gets operation without keys', () => {
      it('Should throws CLIENT_ERROR Retrieval commands must be sent with at least one key\\r\\n', () => {
        function throwError() {
          parser.parseInput('gets\r\n');
        }
        expect(throwError).toThrowError(
          new Error(
            client_error(
              'Retrieval commands must be sent with at least one key'
            )
          )
        );
      });
    });
  });
  describe('Check the keys are valid', () => {
    describe('The client sends a get operation with invalid keys', () => {
      it('Should throws CLIENT ERROR Keys cannot exceed 250 characters as lenght\\r\\n', () => {
        function throwError() {
          parser.parseInput(
            'get thisKeyIsLargerThanTheMaxiumCharactersAllowedthisKeyIsLargerThanTheMaxiumCharactersAllowedthisKeyIsLarthithisKeyIsLargerThanTheMaxiumCharactersAllowedthisKeyIsLargerThanTheMaxiumCharactersAllowedsKeyIsLargerThanTheMaxiumCharactersAllowedgerThanTheMaxiumCharactersAllowedthisKeyIsLargerThanTheMaxiumCharactersAllowed validKey\r\n'
          );
        }
        expect(throwError).toThrowError(
          new Error(client_error('Keys cannot exceed 250 characters as lenght'))
        );
      });
    });
    describe('The client sends a gets operation with invalid keys', () => {
      it('Should throws CLIENT ERROR Keys cannot exceed 250 characters as lenght\\r\\n', () => {
        function throwError() {
          parser.parseInput(
            'gets thisKeyIsLargerThanTheMaxiumCharactersAllowedthisKeyIsLargerThanTheMaxiumCharactersAllowedthisKeyIsLarthithisKeyIsLargerThanTheMaxiumCharactersAllowedthisKeyIsLargerThanTheMaxiumCharactersAllowedsKeyIsLargerThanTheMaxiumCharactersAllowedgerThanTheMaxiumCharactersAllowedthisKeyIsLargerThanTheMaxiumCharactersAllowed validKey\r\n'
          );
        }
        expect(throwError).toThrowError(
          new Error(client_error('Keys cannot exceed 250 characters as lenght'))
        );
      });
    });
  });
  describe('Its returning the right parsedObject', () => {
    describe('The client sends a get command', () => {
      it('Should returns the first mock', () => {
        const parsedObject = JSON.stringify(
          parser.parseInput('get thisIsAKey sebastian thisIsAnotherKey\r\n')
        );
        expect(parsedObject).toEqual(JSON.stringify(mocks[0]));
      });
    });
    describe('The client sends a gets command', () => {
      it('Should returns the second mock', () => {
        const parsedObject = JSON.stringify(
          parser.parseInput('gets thisIsAKey moove-it thisIsAnotherKey\r\n')
        );
        expect(parsedObject).toEqual(JSON.stringify(mocks[1]));
      });
    });
  });
});
