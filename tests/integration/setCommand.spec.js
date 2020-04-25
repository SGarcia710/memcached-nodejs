/*
Feature: Check the Set command
    Check its returning the desired reponse.

Scenario: Test the Set command
 Given The server socket is running
 And The client sends the request string
 Then I should see "STORED\r\n"
 */

const { PORT, HOST } = require('../../src/assets/config');
const TCPServer = require('../../src/server');
const TCPClient = require('../../src/utils/client');

let server, client;

beforeAll(() => {
  server = new TCPServer(PORT);
  client = new TCPClient(PORT, null);
});
afterAll(() => {
  // client.end();
  server.close();
});
afterEach(() => {});

describe('When the user want to use Set command', () => {
  describe('And wants to store data', () => {
    it('Then the server responses with "STORED\\r\\n"', () => {
      client.sendOperation('set key 1.1 3 4\r\n1234\r\n');
      const callback = (data) => {
        expect(data.toString()).toEqual('STORED\r\n');
      };
      client.onData(callback);
      // client.end();
    });
  });
});
