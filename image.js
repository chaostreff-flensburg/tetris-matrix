/*
 * This Codebase is a mess :)
 * Most of the mess is from Alexander 'Pfannkuchensack' Eichhorn
 * Thanks for the great npm packages: tetris-engine, gamepad, serialport, cli-color
 * In use Arduino Uno + 384 WS2812B. Communication wokrs over Serial. RPi/Laptop -> usb ->  Uno
 */

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const port = new SerialPort('/dev/ttyUSB1', { baudRate: 1000000}); // BaudRate need to the same!
const getPixels = require('get-pixels');
const src = `Images/Pokemon.png`;

// Game Field x y
const areaHeight = 16;
const areaWidth = 24;

const parser = new Readline();
port.pipe(parser);

parser.on('data', line => {
	console.log(line);
});

port.on('error', function(err) {
    console.log('Error: ', err.message)
});

var buf = [];
var tmp = [];
var k = 0;

// Mapping your LED Matrix to x and y of the GameField
function matrix_mapping(x, y)
{
	let matrix_array = [
		[0,47,48,95,96,143,144,191,192,239,240,287,288,335,336,383],
		[1,46,49,94,97,142,145,190,193,238,241,286,289,334,337,382],
		[2,45,50,93,98,141,146,189,194,237,242,285,290,333,338,381],
		[3,44,51,92,99,140,147,188,195,236,243,284,291,332,339,380],
		[4,43,52,91,100,139,148,187,196,235,244,283,292,331,340,379],
		[5,42,53,90,101,138,149,186,197,234,245,282,293,330,341,378],
		[6,41,54,89,102,137,150,185,198,233,246,281,294,329,342,377],
		[7,40,55,88,103,136,151,184,199,232,247,280,295,328,343,376],
		[8,39,56,87,104,135,152,183,200,231,248,279,296,327,344,375],
		[9,38,57,86,105,134,153,182,201,230,249,278,297,326,345,374],
		[10,37,58,85,106,133,154,181,202,229,250,277,298,325,346,373],
		[11,36,59,84,107,132,155,180,203,228,251,276,299,324,347,372],
		[12,35,60,83,108,131,156,179,204,227,252,275,300,323,348,371],
		[13,34,61,82,109,130,157,178,205,226,253,274,301,322,349,370],
		[14,33,62,81,110,129,158,177,206,225,254,273,302,321,350,369],
		[15,32,63,80,111,128,159,176,207,224,255,272,303,320,351,368],
		[16,31,64,79,112,127,160,175,208,223,256,271,304,319,352,367],
		[17,30,65,78,113,126,161,174,209,222,257,270,305,318,353,366],
		[18,29,66,77,114,125,162,173,210,221,258,269,306,317,354,365],
		[19,28,67,76,115,124,163,172,211,220,259,268,307,316,355,364],
		[20,27,68,75,116,123,164,171,212,219,260,267,308,315,356,363],
		[21,26,69,74,117,122,165,170,213,218,261,266,309,314,357,362],
		[22,25,70,73,118,121,166,169,214,217,262,265,310,313,358,361],
		[23,24,71,72,119,120,167,168,215,216,263,264,311,312,359,360],
		];
		return matrix_array[x][y];
}

setTimeout(start, 1000);





function start()
{
	setInterval(function ()
    {
		/*for(let y = 0; y < areaHeight; y++) {
			for(let x = 0; x < areaWidth; x++) {
				let lnr  = matrix_mapping(x,y);
				//tmp[lnr] = [Math.random()*255|0,Math.random()*255|0,Math.random()*255|0];
				//tmp[lnr] = [255,0,0];
			}
		}*/
		getPixels(src, function(err, pixels) {
			if(err) {
				console.log("Bad image path");
				return;
			}
		
			for (let y = 0; y < pixels.shape[0]; y++) {
				for (let x = 0; x < pixels.shape[1]; x++) {
					let lnr  = matrix_mapping(x,y);
					if(pixels.get(x, y, 3) != 0)
						tmp[lnr] = [pixels.get(x, y, 0), pixels.get(x, y, 1),pixels.get(x, y, 2)];
					else
						tmp[lnr] = [255,255,255];
				}
			}
		});

		tmp.forEach(function(werte) {
			buf[k] = werte[0];
			buf[k+1] = werte[1];
			buf[k+2] = werte[2];
			k = k + 3;
		});

		// Block to Heap
		port.write(Buffer.from(buf));

		buf = [];
		tmp = [];
		k = 0;

	}, 2000);
}
