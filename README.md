# Memcached Server - Work in progress

This repo contains a Memcached implementation with JavaScript. It listens for new connections on a given TCP port. You can find the part of the protocol implemented [here](https://github.com/SGarcia710/memcached-nodejs/blob/master/docs/protocol.txt). The **full** protocol can be found in the [references](#references) at the end of this document.

**Note:** This only a little piece of the Memcached protocol.

## About

Memcached is an in-memory key-value store for small chunks of arbitrary data (strings, objects) from results of database calls, API calls, or page rendering.

You can find more about Memcached in the [references](#references) at the end of this document.

## Requirements

- **Nodejs** version >= 12.16.1 LTS

## Dependencies

TODO

## Installation

In order to start the server you will have to run the following commands in your console:

```
$ git clone https://github.com/SGarcia710/memcached-nodejs
$ cd memcached-nodejs
$ npm i
```

Now you will have to create a `.env` file at the root of the memcached server folder indicating the TCP `port`.

```
PORT = 9000
```

As default, if the server doesn't receive the `port` through the `.env` file, it will use `8080`.

## Usage

There are two ways to test the server, throught command line or with the client. Here you will be examples to use both.

#### Command line

When you have started the server, it will listen any connection through the setted up TCP `port`. You can use it through the command line using the following command:

```
$ printf "set myKey 0 300 4 [noreply]\r\ndata\r\n" | nc localhost 8080
```

#### Client

TODO

You can check the **available** commands [here](https://github.com/SGarcia710/memcached-nodejs/blob/master/docs/protocol.txt).

## Tests

### Integration tests

TODO

### Unit tests

TODO

### Load tests

TODO

## References

- Memcached's official webpage: [https://memcached.org/](https://memcached.org/)
- JavaScript documentation style guide: [https://jsdoc.app/](https://jsdoc.app/)
- JavaScript namin conventions: [https://www.robinwieruch.de/javascript-naming-conventions](https://www.robinwieruch.de/javascript-naming-conventions)
- LRU Cache: [https://github.com/SGarcia710/lru-cache-js](https://github.com/SGarcia710/lru-cache-js)
- TCP Server: [https://github.com/SGarcia710/tcp-server-nodejs](https://github.com/SGarcia710/tcp-server-nodejs)
- The full protocol specification: [https://github.com/memcached/memcached/blob/master/doc/protocol.txt](https://github.com/memcached/memcached/blob/master/doc/protocol.txt)
