/*
 * This Codebase is a mess :)
 * Most of the mess is from Alexander 'Pfannkuchensack' Eichhorn
 * Thanks for the great npm packages: tetris-engine, gamepad, serialport, cli-color
 * In use Arduino Uno + 384 WS2812B. Communication wokrs over Serial. RPi/Laptop -> usb ->  Uno
 */

let Engine = require('tetris-engine').Engine;
let gamepad = require("gamepad");

const debug = false; // Want Timings for Debug?
const co = true; // Want Console Tetris output ?
const conly = true // Want only Console Tetris ?
if(!conly) {
	const SerialPort = require('serialport')
	const Readline = require('@serialport/parser-readline')
	//const port = new SerialPort('/dev/ttyACM1', { baudRate: 1000000}); // BaudRate need to the same!
	const port = new SerialPort('/dev/ttyUSB0', { baudRate: 1000000}); // BaudRate need to the same!
	const parser = new Readline()
	port.pipe(parser)
}
// Game Field x y
const areaHeight = 16;
const areaWidth = 24;



gamepad.init()
// Color for Console
if(co || conly) { var clc = require("cli-color"); }

// https://www.npmjs.com/package/gamepad
// Basic code for running. Need Update for better handling
// Create a game loop and poll for events
setInterval(gamepad.processEvents, 16);
// Scan for new gamepads as a slower rate
setInterval(gamepad.detectDevices, 500);

// All commands work then the Buttons is pressed down ones.
// so if you want go fast down, press many times. @todo
// Keys Values for USB Classic Nintendo Controller, need change for another Controller maybe

let movedownint = false;
let moveleftint = false;
let moverightint = false;

// Listen for move events on all gamepads
gamepad.on("move", function (id, axis, value) {
	/*console.log("move", {
		id: id,
		axis: axis,
		value: value,
	});*/
	if(axis == 1 && value == 1)
		movedownint = setInterval(function() {	game.moveDown(); }, 200);
	else if(axis == 0 && value == -1)
		moveleftint = setInterval(function() {	game.moveLeft(); }, 200);
	else if(axis == 0 && value == 1)
		moverightint = setInterval(function() {	game.moveRight(); }, 200);
});

// Listen for button up events on all gamepads
gamepad.on("up", function (id, num) {
	/*console.log("up", {
		id: id,
		num: num,
	});
	*/
	if(axis == 1 && value == 1)
		clearInterval(movedownint);
	else if(axis == 0 && value == -1)
		clearInterval(moveleftint);
	else if(axis == 0 && value == 1)
		clearInterval(moverightint);
});

// Listen for button down events on all gamepads
gamepad.on("down", function (id, num) {
	if(num == 1)
		game.rotate();
	else if(num == 0)
		game.rotateBack();
	else if(num == 9)
		game.start();
	else if(num == 8)
		game.pause();
});

function done() {}

// Change is ready?
let change = false
if(!conly) {
	// Das hier war die Lösung für das Problem vom Aufhängen vom Arduino
	// Had long time search for this solution!
	parser.on('data', line => {
		change = false;
	});
}

// https://github.com/petelinmn/tetris-engine
let renderFunc = (gameState) => {
	if(debug) {console.time("gameState");}
	// Jump over this State cause Device is not ready!
	if(change)
		return;
	change = true;
	if(co) { var colpaint = ''; }
	let buf = [];
	let tmp = [];
	let k = 0;
	gameState.body.forEach(function(row,x) {
		row.forEach(function(col,y) {
			// Terminal
			if(co) 
			{ 
				if(col.val == 1)
					colpaint = colpaint + '' +  color_for_terminal(get_color_to_shape(col.cssClasses[2]), '1');
				else if(col.val == 2)
					colpaint = colpaint + '' +  color_for_terminal(get_color_to_shape(col.cssClasses[3]), '2');
				else
					colpaint = colpaint + '' +  col.val;
			}
			// Game
			if(!conly) { 
				if(col.val == 1)
				{
					let lnr  = matrix_mapping(x,y);
					tmp[lnr] = get_color_to_shape(col.cssClasses[2]);
				}
				else if(col.val == 2)
				{
					let lnr  = matrix_mapping(x,y);
					tmp[lnr] = get_color_to_shape(col.cssClasses[3]);
				}
				else
				{
					let lnr  = matrix_mapping(x,y);
					tmp[lnr] = [0,0,0];
				}
			}
		});
		if(co) { console.log(colpaint); }
		if(co) { colpaint = ''; }
	});
	if(!conly) { 
		tmp.forEach(function(werte, nr) {
			buf[k] = werte[0];
			buf[k+1] = werte[1];
			buf[k+2] = werte[2];
			k = k + 3;
		});
		writeAndDrain(Buffer.from(buf), changer); 
	}
	else {
		change = false;
	}
	if(debug) {console.timeEnd("gameState");}
};

function writeAndDrain (data, callback) {
	if(debug) {console.time("SerialWrite");}
	port.write(data)
	port.drain(callback)
}

function changer()
{
	if(debug) {console.timeEnd("SerialWrite");}
}

// Color Mapping for the LED // Orange dont work really well :(
function get_color_to_shape(shape)
{
	switch(shape) {
		case 'IShape':
			return [0,0,255];
		case 'ZShape':
			return [255,0,0];
		case 'LShape':
			return [0,255,0];
		case 'TShape':
			return [255,255,0];
		case 'OShape':
			return [255,0,255];
		case 'SShape':
			return [0,255,255];
		case 'JShape':
			return [255,140,0];
	}
}
// @todo: Terminal Color dont work cause of change from one Value of a Color to three
// Terminal Color Thema
function color_for_terminal(color, val)
{
	return clc.green(val);
	switch(color) {
		case 0:
			return clc.blue(val);
		case 1:
			return clc.red(val);
		case 2:
			return clc.green(val);
		case 3:
			return clc.yellow(val);
		case 4:
			return clc.magenta(val);
		case 5:
			return clc.cyan(val);
		case 6:
			return clc.redBright(val);
	}
}
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
// Start the Engine
let game = new Engine(
	areaHeight, 
	areaWidth, 
	renderFunc
);

game.start();

// Level 1: 1 Sec
let firstLevelInterval = 1000;
setInterval(() => {
	game.moveDown();
}, firstLevelInterval);