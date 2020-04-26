'use strict';

const { Socket } = require('net');

class TCPClient extends Socket {
  constructor(port, host) {
    super();
    this.options = { port, host };

    this.connect(this.options);
    this._startListening();
  }

  /**
   * Makes the client starts listening data from the server
   */
  _startListening() {
    this.on('data', (chunk) => {
      console.log(`Data received from the server: ${chunk.toString()}`);
      client.end();
    });

    this.on('end', () => {
      console.log('Requested an end to the TCP connection');
    });
  }
  /**
   * Lets the client send operations to the server
   * @param {string} operation string with the operation to send to the server
   */
  sendOperation(operation) {
    this.write(operation);
  }
}

module.exports = TCPClient;
