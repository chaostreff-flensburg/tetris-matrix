/*
 * This is the a simple websocket client. We used it to verify that our server accepts connections and receives messages
 * This was build by Alexander Eichhorn and Aaron Schroeder.
 */
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', function open() {
    ws.send('something');
});

ws.on('message', function incoming(data) {
    console.log(data);
});
