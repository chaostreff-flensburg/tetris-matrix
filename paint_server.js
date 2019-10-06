/*
 * This is the a simple websocket server to allow clients to send ArrayBuffers the pixel matrix directly.
 * A sample client can be found in 'client.js' though the message is only sent as string.
 * Feel free to implement your own client.
 * Currently Server.on('message') expects a message to be an ArrayBuffer which holds integer values (colors r, g and b separately) for each pixel.
 * The ArrayBuffer length is 384 (number of pixels) * 3 (color channels r, g, b) = 1152;
 * This was build by Alexander Eichhorn and Aaron Schroeder.
 */

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const WebSocket = require('ws');
const serialPort = new SerialPort('/dev/ttyUSB0', {baudRate: 1000000}); // BaudRate need to the same!
const parser = new Readline();

const wss = new WebSocket.Server({
    host: '10.0.39.227',
    port: 3000
});

serialPort.pipe(parser);

parser.on('data', line => {
    console.log(line);
});

serialPort.on('error', function (err) {
    console.log('Error: ', err.message)
});


wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        console.log(message.length);
        serialPort.write(message);
        serialPort.drain();
    });
});
