const net = require('net');
const port = 1212;
const server = net.createServer();
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const serialPort = new SerialPort('/dev/ttyUSB0', { baudRate: 1000000}); // BaudRate need to the same!
const parser = new Readline();
serialPort.pipe(parser);

server.listen(port, () => {
    console.log('opened server on', server.address());
});

server.on('connection', function (socket) {

    socket.setEncoding('utf8');

    socket.setTimeout(800000, function () {
        console.log('Socket timed out');
    });

    socket.on('data', function (data) {

        serialPort.write(Buffer.from(JSON.parse(data), 'utf-8'));

        var is_kernel_buffer_full = socket.write('Data ::' + data);
        if (is_kernel_buffer_full) {
            console.log('Data was flushed successfully from kernel buffer i.e written successfully!');
        } else {
            socket.pause();
        }

    });

    socket.on('drain', function () {
        console.log('write buffer is empty now .. u can resume the writable stream');
        socket.resume();
    });

    socket.on('error', function (error) {
        console.log('Error : ' + error);
    });

    socket.on('timeout', function () {
        console.log('Socket timed out !');
        socket.end('Timed out!');
    });

    socket.on('end', function (data) {
        console.log('Socket ended from other end!');
        console.log('End data : ' + data);
    });

    socket.on('close', function (error) {
        var bread = socket.bytesRead;
        var bwrite = socket.bytesWritten;
        console.log('Bytes read : ' + bread);
        console.log('Bytes written : ' + bwrite);
        console.log('Socket closed!');
        if (error) {
            console.log('Socket was closed coz of transmission error');
        }
    });

    setTimeout(function () {
        var isdestroyed = socket.destroyed;
        console.log('Socket destroyed:' + isdestroyed);
        socket.destroy();
    }, 1200000);

});
