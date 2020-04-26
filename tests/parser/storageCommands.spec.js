'use strict';

const Parser = require('../../src/utils/parser');
const { client_error, INVALID_COMMAND } = require('../../src/assets/config/');

const mocks = [
  {
    operation: 'set',
    data: 'data',
    key: 'thisIsAKey',
    flags: 1.2,
    expTime: 2592000,
    bytes: 4,
    noReply: false,
  },
  {
    operation: 'append',
    data: 'sebastian',
    key: 'thisIsAKey',
    bytes: 9,
    noReply: false,
  },
  {
    operation: 'cas',
    data: 'moove-it.com',
    key: 'thisIsAKey',
    flags: 9.2,
    expTime: 1999,
    bytes: 12,
    casUnique: 'thisIsACasUniqueKey',
    noReply: false,
  },
  {
    operation: 'add',
    data: 'data',
    key: 'thisIsAKey',
    flags: 1.2,
    expTime: 2592000,
    bytes: 4,
    noReply: true,
  },
  {
    operation: 'prepend',
    data: 'sebastian',
    key: 'thisIsAKey',
    bytes: 9,
    noReply: true,
  },
  {
    operation: 'cas',
    data: 'moove-it.com',
    key: 'thisIsAKey',
    flags: 9.2,
    expTime: 1999,
    bytes: 12,
    casUnique: 'thisIsACasUniqueKey',
    noReply: true,
  },
];

const parser = new Parser();

describe('Parser with Storage commands', () => {
  describe('The client sends an invalid operation', () => {
    it('Should throws ERROR\\r\\n', () => {
      function throwError() {
        parser.parseInput('jojo myKey 1\r\ndata\r\n');
      }
      expect(throwError).toThrowError(new Error(INVALID_COMMAND));
    });
  });
  describe('Check there are enough parameters', () => {
    describe('The client sends set, add or replace command with less than the minium parameters', () => {
      it('Should throws CLIENT_ERROR Missing parameters\\r\\n', () => {
        function throwError() {
          parser.parseInput('set myKey 1\r\ndata\r\n');
        }
        expect(throwError).toThrowError(client_error('Missing parameters'));
      });
    });
    describe('The client sends append or prepend command with less than the minium parameters', () => {
      it('Should throws CLIENT_ERROR Missing parameters\\r\\n', () => {
        function throwError() {
          parser.parseInput('prepend myKey\r\ndata\r\n');
        }
        expect(throwError).toThrowError(client_error('Missing parameters'));
      });
    });
    describe('The client sends cas command with less than the minium parameters', () => {
      it('Should throws CLIENT_ERROR Missing parameters\\r\\n', () => {
        function throwError() {
          parser.parseInput('cas myKey 2.1 2 2\r\ndata\r\n');
        }
        expect(throwError).toThrowError(client_error('Missing parameters'));
      });
    });
    describe('The client sends set, add or replace command with less than the minium parameters and the noreply at the end', () => {
      it('Should throws CLIENT_ERROR Missing parameters\\r\\n', () => {
        function throwError() {
          parser.parseInput('replace myKey 1 [noreply]\r\ndata\r\n');
        }
        expect(throwError).toThrowError(client_error('Missing parameters'));
      });
    });
    describe('The client sends append or prepend command with less than the minium parameters and the noreply at the end', () => {
      it('Should throws CLIENT_ERROR Missing parameters\\r\\n', () => {
        function throwError() {
          parser.parseInput('prepend myKey [noreply]\r\ndata\r\n');
        }
        expect(throwError).toThrowError(client_error('Missing parameters'));
      });
    });
    describe('The client sends cas command with less than the minium parameters and the noreply at the end', () => {
      it('Should throws CLIENT_ERROR Missing parameters\\r\\n', () => {
        function throwError() {
          parser.parseInput('cas myKey 2.1 2 2 [noreply]\r\ndata\r\n');
        }
        expect(throwError).toThrowError(client_error('Missing parameters'));
      });
    });
    describe('The client sends set, add or replace command with an invalid noreply', () => {
      it('Should throws CLIENT_ERROR Invalid noreply\\r\\n', () => {
        function throwError() {
          parser.parseInput('add myKey 2.1 2 2 asdasdNoReply]\r\ndata\r\n');
        }
        expect(throwError).toThrowError(client_error('Invalid noreply'));
      });
    });
    describe('The client sends append or prepend command with an invalid noreply', () => {
      it('Should throws CLIENT_ERROR Invalid noreply\\r\\n', () => {
        function throwError() {
          parser.parseInput('append myKey 4 asdasdNoReply]\r\ndata\r\n');
        }
        expect(throwError).toThrowError(client_error('Invalid noreply'));
      });
    });
    describe('The client sends cas command with an invalid noreply', () => {
      it('Should throws CLIENT_ERROR Invalid noreply\\r\\n', () => {
        function throwError() {
          parser.parseInput(
            'cas myKey 2.1 2 2 anyCasUniqueKey asdasdNoReply]\r\ndata\r\n'
          );
        }
        expect(throwError).toThrowError(client_error('Invalid noreply'));
      });
    });
    describe('The client sends set, add or replace command with more than the maximum parameters', () => {
      it('Should throws CLIENT_ERROR Too many parameters\r\n', () => {
        function throwError() {
          parser.parseInput('set myKey 1.2 3 4 [noreply] asd\r\ndata\r\n');
        }
        expect(throwError).toThrowError(client_error('Too many parameters'));
      });
    });
    describe('The client sends append or prepend command with more than the maximum parameters', () => {
      it('Should throws CLIENT_ERROR Too many parameters\r\n', () => {
        function throwError() {
          parser.parseInput('append myKey 4 [noreply] asd\r\ndata\r\n');
        }
        expect(throwError).toThrowError(client_error('Too many parameters'));
      });
    });
    describe('The client sends cas command with more than the maximum parameters', () => {
      it('Should throws CLIENT_ERROR Too many parameters\r\n', () => {
        function throwError() {
          parser.parseInput(
            'cas myKey 4.2 1999 4 anyCasUniqueKey [noreply] asd\r\ndata\r\n'
          );
        }
        expect(throwError).toThrowError(client_error('Too many parameters'));
      });
    });
  });
  describe('Check the parameters and data are valid', () => {
    describe('The client sends a key with larger than 250 characters', () => {
      it('Should throws CLIENT_ERROR Keys cannot exceed 250 characters as lenght\\r\\n', () => {
        function throwError() {
          parser.parseInput(
            'set thisKeyIsLargerThanTheMaxiumCharactersAllowedthisKeyIsLargerThanTheMaxiumCharactersAllowedthisKeyIsLarthithisKeyIsLargerThanTheMaxiumCharactersAllowedthisKeyIsLargerThanTheMaxiumCharactersAllowedsKeyIsLargerThanTheMaxiumCharactersAllowedgerThanTheMaxiumCharactersAllowedthisKeyIsLargerThanTheMaxiumCharactersAllowed 1.2 3000 4\r\ndata\r\n'
          );
        }
        expect(throwError).toThrowError(
          new Error(client_error('Keys cannot exceed 250 characters as lenght'))
        );
      });
    });
    describe('The client sends non-numeric flags', () => {
      it('Should throws CLIENT_ERROR Flags must be a number\\r\\n', () => {
        function throwError() {
          parser.parseInput(
            'set thisIsAKey thisIsAnInvalidFlag 3000 4\r\ndata\r\n'
          );
        }
        expect(throwError).toThrowError(
          new Error(client_error('Flags must be a number'))
        );
      });
    });
    describe('The client sends negative flags', () => {
      it('Should throws CLIENT_ERROR Flags must be a positive number\\r\\n', () => {
        function throwError() {
          parser.parseInput('set thisIsAKey -1 3000 4\r\ndata\r\n');
        }
        expect(throwError).toThrowError(
          new Error(client_error('Flags must be a positive number'))
        );
      });
    });
    describe('The client sends a non-numeric ExpTime', () => {
      it('Should throws CLIENT_ERROR ExpTime must be a number\\r\\n', () => {
        function throwError() {
          parser.parseInput('set thisIsAKey 1.2 invalidExpTime 4\r\ndata\r\n');
        }
        expect(throwError).toThrowError(
          new Error(client_error('ExpTime must be a number'))
        );
      });
    });
    describe('The client sends an ExpTime bigger than 30 days', () => {
      it('Should throws CLIENT_ERROR ExpTime must be <= 60 * 60 * 24 * 30 (30 days)\\r\\n', () => {
        function throwError() {
          parser.parseInput('set thisIsAKey 1.2 2592001 4\r\ndata\r\n');
        }
        expect(throwError).toThrowError(
          new Error(
            client_error('ExpTime must be <= 60 * 60 * 24 * 30 (30 days)')
          )
        );
      });
    });
    describe('The client sends non-numeric Bytes', () => {
      it('Should throws CLIENT_ERROR Bytes must be a number\\r\\n', () => {
        function throwError() {
          parser.parseInput('add thisIsAKey 1.2 100 invalidBytes\r\ndata\r\n');
        }
        expect(throwError).toThrowError(
          new Error(client_error('Bytes must be a number'))
        );
      });
    });
    describe('The client sends negative Bytes', () => {
      it('Should throws CLIENT_ERROR Bytes must be >= 0\\r\\n', () => {
        function throwError() {
          parser.parseInput('set thisIsAKey 1.2 2592000 -8\r\ndata\r\n');
        }
        expect(throwError).toThrowError(
          new Error(client_error('Bytes must be >= 0'))
        );
      });
    });
    describe("The client sends Bytes that doesnt match with the data's lenght", () => {
      it('Should throws CLIENT_ERROR The given bytes must match with the data lenght\\r\\n', () => {
        function throwError() {
          parser.parseInput('set thisIsAKey 1.2 2592000 1000\r\ndata\r\n');
        }
        expect(throwError).toThrowError(
          new Error(
            client_error('The given bytes must match with the data lenght')
          )
        );
      });
    });
  });
  describe('Its returning the right parsedObject', () => {
    describe('The client sends a set, add or replace command', () => {
      it('Should returns the 1st mock', () => {
        const parsedObject = JSON.stringify(
          parser.parseInput('set thisIsAKey 1.2 2592000 4\r\ndata\r\n')
        );
        expect(parsedObject).toEqual(JSON.stringify(mocks[0]));
      });
    });
    describe('The client sends an append or prepend command', () => {
      it('Should returns the 2nd mock', () => {
        const parsedObject = JSON.stringify(
          parser.parseInput('append thisIsAKey 9\r\nsebastian\r\n')
        );

        expect(parsedObject).toEqual(JSON.stringify(mocks[1]));
      });
    });
    describe('The client sends a cas command', () => {
      it('Should returns the 3rd mock', () => {
        const parsedObject = JSON.stringify(
          parser.parseInput(
            'cas thisIsAKey 9.2 1999 12 thisIsACasUniqueKey\r\nmoove-it.com\r\n'
          )
        );
        expect(parsedObject).toEqual(JSON.stringify(mocks[2]));
      });
    });
    describe('The client sends a set, add or replace command with noreply', () => {
      it('Should returns the 4th mock', () => {
        const parsedObject = JSON.stringify(
          parser.parseInput(
            'add thisIsAKey 1.2 2592000 4 [noreply]\r\ndata\r\n'
          )
        );
        expect(parsedObject).toEqual(JSON.stringify(mocks[3]));
      });
    });
    describe('The client sends an append or prepend command with noreply', () => {
      it('Should returns the 5th mock', () => {
        const parsedObject = JSON.stringify(
          parser.parseInput('prepend thisIsAKey 9 [noreply]\r\nsebastian\r\n')
        );

        expect(parsedObject).toEqual(JSON.stringify(mocks[4]));
      });
    });
    describe('The client sends a cas command with noreply', () => {
      it('Should returns the 6th mock', () => {
        const parsedObject = JSON.stringify(
          parser.parseInput(
            'cas thisIsAKey 9.2 1999 12 thisIsACasUniqueKey [noreply]\r\nmoove-it.com\r\n'
          )
        );
        expect(parsedObject).toEqual(JSON.stringify(mocks[5]));
      });
    });
  });
});
