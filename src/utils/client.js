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

const client = new TCPClient(8080, 'localhost');
client.sendOperation('set ana 0 0 4 [noreply]\r\ndata\r\n');
client.sendOperation('set camila 0 0 4 [noreply]\r\ndata\r\n');

module.exports = TCPClient;
