const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const serialPort = new SerialPort('/dev/ttyUSB0', {baudRate: 1000000}); // BaudRate need to the same!
const parser = new Readline();

io.set('origins', '*:*');
http.listen(3000, "127.0.0.1");

serialPort.pipe(parser);

io.on('connection', function (socket) {
    socket.on('message', function (data) {
        console.log(data);
        serialPort.write(Buffer.from(JSON.parse(data), 'utf-8'));
    });
    socket.on('disconnect', function () {});
});
