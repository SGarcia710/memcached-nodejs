'use strict';

const { Socket } = require('net');

class TCPClient extends Socket {
  constructor(port, host) {
    super();
    this.options = { port, host };

    this.connect(this.options);
    this._startListening();
  }

  _startListening() {
    this.on('data', (chunk) => {
      console.log(`Data received from the server: ${chunk.toString()}`);
      client.end();
    });

    this.on('end', () => {
      console.log('Requested an end to the TCP connection');
    });
  }

  sendOperation(operation) {
    this.write(operation);
  }
}

module.exports = TCPClient;
