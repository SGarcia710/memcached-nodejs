'use strict';

const { Server } = require('net');
const Memcached = require('../memcached');

class TCPServer extends Server {
  constructor(port) {
    super();
    this.port = port || 8080;
    this.memcached = new Memcached();
    this.startListening();
  }

  startListening() {
    super.listen(this.port, () => {
      console.info(
        `Server listening for connection requests on socket localhost:${this.port}`
      );
    });

    super.on('connection', (socket) => {
      socket.setEncoding('utf-8');
      socket.setTimeout(1000);

      socket.on('data', (chunk) => {
        console.log(`Data received from client: ${JSON.stringify(chunk)}`);
        socket.end();
      });
      socket.write('We got ya!');

      socket.on('error', (err) => {
        console.log(`Error: ${err}`);
      });
    });
  }
}

module.exports = TCPServer;
