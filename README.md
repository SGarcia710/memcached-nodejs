# Memcached Server - Work in progress

This repo contains a Memcached implementation with JavaScript. It listens for new connections on a given TCP port. You can find the part of the protocol implemented [here](https://github.com/SGarcia710/memcached-nodejs/blob/master/docs/protocol.txt). The **full** protocol can be found in the [references](#references) at the end of this document.

**Note:** This only a little piece of the Memcached protocol.

## About

Memcached is an in-memory key-value store for small chunks of arbitrary data (strings, objects) from results of database calls, API calls, or page rendering.

You can find more about Memcached in the [references](#references) at the end of this document.

## Requirements

- **Nodejs** version >= 12.16.1 LTS

## Dependencies

- [**ms**](https://www.npmjs.com/package/ms): This package is used for handling with time using friendly time formats.
- [**dotenv**](https://www.npmjs.com/package/dotenv): This package is used to read environment variables.
- [**Jest**](https://www.npmjs.com/package/jest): This package is used for unit testing the software.
- [**uuid**](https://www.npmjs.com/package/uuid): This package is used to generate random and unique strings for the casUnique key.

## Installation

In order to start the server you will have to run the following commands in your console:

```

$ git clone https://github.com/SGarcia710/memcached-nodejs

$ cd memcached-nodejs

$ npm i

```

Now you will have to create a `.env` file at the root of the memcached server folder indicating the TCP `port`.

```

SERVER_PORT = 9000
SERVER_DOMAIN = localhost

```

As default, if the server doesn't receive the `port` through the `.env` file, it will use `8080`.

After everything is seted up, you just have to run `npm start` at the root of the project and the server is going to listen requests at the given port.

## Usage

These are two ways to use the server, throught command line or with the client. Here you will be examples to use both.

#### Command line

When you have started the server, it will listen any connection through the setted up TCP `port`. You can use it through the command line using the following command:

```

$ printf "set myKey 0 300 4 [noreply]\r\ndata\r\n" | nc localhost 8080

```

#### Client

There is a simple TCP client to send operations to the server. This is how you can use it:

```
const TCPClient = require('./utils/client')
const { PORT } = require('./src/assets/config');

const client  =  new  TCPClient(PORT, 'localhost');
client.sendOperation('set key 0 0 4 [noreply]\r\ndata\r\n');
client.sendOperation('add key2 0 0 4\r\ndata\r\n');
```

It will simply log the server response.

You can check the **available** commands and usage [here](https://github.com/SGarcia710/memcached-nodejs/blob/master/docs/protocol.txt).

## Tests

### Unit tests

The Memcached logical functions and the parser for the client's input have a set of Unit tests made with Jest. In order to run the tests you have to run `npm test` at the `root` of the project's folder.

### Load tests

TODO

## References

- Memcached's official webpage: [https://memcached.org/](https://memcached.org/)

- JavaScript documentation style guide: [https://jsdoc.app/](https://jsdoc.app/)

- JavaScript namin conventions: [https://www.robinwieruch.de/javascript-naming-conventions](https://www.robinwieruch.de/javascript-naming-conventions)

- LRU Cache: [https://github.com/SGarcia710/lru-cache-js](https://github.com/SGarcia710/lru-cache-js)

- TCP Server: [https://github.com/SGarcia710/tcp-server-nodejs](https://github.com/SGarcia710/tcp-server-nodejs)

- The full protocol specification: [https://github.com/memcached/memcached/blob/master/doc/protocol.txt](https://github.com/memcached/memcached/blob/master/doc/protocol.txt)

- Jest cheatsheet: [https://devhints.io/jest](https://devhints.io/jest)
