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
    this.startListening();
  }

  startListening() {
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
          if (parsedObject) {
            console.log(
              `Data received from client: ${JSON.stringify(parsedObject)}`
            );
          } else {
            console.log('Invalid data');
          }
        } catch (error) {
          socket.write(error.message);
        }
        socket.end();
      });

      socket.on('error', (err) => {
        console.log(`Error: ${err}`);
      });
    });
  }
}

module.exports = TCPServer;
