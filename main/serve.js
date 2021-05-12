const WebSocket = require('ws')

const startWS = function () {
  return new WebSocket.Server({ port: 3030 });
}

module.exports = startWS