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
