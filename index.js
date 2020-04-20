const TCPServer = require('./src/server');
const { PORT } = require('./src/assets/config');

const server = new TCPServer(PORT);
