'use strict';

const { Socket } = require('net');

class TCPClient extends Socket {
  constructor(port, host) {
    super();
    this.options = { port, host };
  }

  onData(chunk) {
    this.on('data', chunk);
  }

  // startListening() {
  //   this.on('data', (chunk) => {
  //     console.log(`Data received from the server: ${chunk.toString()}.`);
  //     client.end();
  //     return chunk;
  //   });

  //   this.on('end', () => {
  //     console.log('Requested an end to the TCP connection');
  //   });
  // }

  sendOperation(operation) {
    this.connect(this.options, () => {
      // console.info('TCP connection established with the server.');
      // console.info('Data sent: ', operation);
      this.write(operation);
    });
  }
}

module.exports = TCPClient;

// const client = new Socket();
// client.connect({ port: port, host: host }, function () {
//   console.log('TCP connection established with the server.');
//   const [key, value] = process.argv.slice(2);
//   const object = { key, value };
//   client.write(JSON.stringify(object));
// });

// client.on('data', function (chunk) {
//   console.log(`Data received from the server: ${chunk.toString()}.`);

//   client.end();
// });

// client.on('end', function () {
//   console.log('Requested an end to the TCP connection');
// });
