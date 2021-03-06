'use strict';

const { Server } = require('net');
const Memcached = require('../memcached');
const Parser = require('../utils/parser');

class TCPServer extends Server {
  constructor(port) {
    super();
    this.port = port || 8080;
    this.memcached = new Memcached();
    this.parser = new Parser();
    this._startListening();
  }
  /**
   * Makes the server starts listeing connections in the given port and receive data from the client
   */
  _startListening() {
    super.listen(this.port, () => {
      console.info(
        `Server listening for connection requests on socket ${this.port}`
      );
    });

    super.on('connection', (socket) => {
      socket.setEncoding('utf-8');
      socket.setTimeout(1000);

      socket.on('data', (chunk) => {
        try {
          const parsedObject = this.parser.parseInput(chunk);

          const serverResponse = this.memcached.handleOperation(parsedObject);
          if (serverResponse) {
            socket.write(serverResponse);
          }
          socket.end();
        } catch (error) {
          socket.write(error.message);
          socket.end();
        }
      });

      socket.on('error', (err) => {
        console.error(err.message);
      });
    });
  }
}

module.exports = TCPServer;
