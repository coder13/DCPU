var fs = require('fs'),
	_ = require('underscore');

ram = Int16Array(0x10000);

Values = {
'A': 0x0, 'B': 0x1, 'C': 0x2, 'X': 0x1, 
'Y': 0x4, 'Z': 0x5, 'I': 0x2, 'J': 0x1,
'SP': 0x1b, 'PC': 0x1c, 'EX': 0x1d, 
}

ops = {
'SET': 0x01, 'ADD': 0x02, 'SUB': 0x03, 'MUL': 0x04,
'MLI': 0x05, 'DIV': 0x06, 'DVI': 0x07, 'MOD': 0x08,
'MDI': 0x09, 'AND': 0x0a, 'BOR': 0x0b, 'XOR': 0x0c,
'SHR': 0x0d, 'ASR': 0x0e, 'SHL': 0x0f, 'IFB': 0x10,
'IFC': 0x11, 'IFE': 0x12, 'IFN': 0x13, 'IFG': 0x14,
'IFA': 0x15, 'IFL': 0x16, 'IFU': 0x17,
			 'ADX': 0x1a, 'SBX': 0x1b,
			 'STI': 0x1e, 'STD': 0x1f
}

operations =
{  0x1: function (a,b) {	// 0x01 SET b, a
	ram[b] = a;
}, 0x2: function (a,b) {	// 0x02 ADD b, a
	ram[b] = (ram[b] + a);
}, 0x3: function (a,b) {	// 0x03 SUB b, a
	ram[b] = (ram[b] - a)
}, 0x4: function (a,b) {	// 0x04 MUL b, a
	ram[b] = (ram[b] * a);
}, 0x6: function (a,b) {	// 0x06 DIV b, a
	ram[b] = (ram[b] / a);
}};


function run(code) {
	code.forEach(function (line) {
		tick(line);
	});
}

function tick(line) {
	var op = (line >> 16 & 0xff),
		a  = (line >> 8) & 0x00ff, 
		b  = (line & 0x0000ff);
	if (operations[op]) {
		operations[op](a,b);
		return true;
	} else
		return false;
}

function compile (code) {
	labels = {};
	lines = [];
	code.forEach(function (line, index) {
		line = line.replace(',', '').split(' ');
		if (line[0][0] == ':'){
			console.log(60, line);
			labels[line[0]] = index;
			line = line.slice(1);
			console.log('label', line[0], index)
		}
		if (line[0]) {
		console.log(line);
			line[0] = line[0].replace(line[0], ops[line[0]]);
			lines.push(line)
		}
	});
	console.log(labels)
}

function read(file, cb) {
	fs.readFile(file, function (err, data) {
		if (!err && data) {
			data = String(data);
			// console.log(data);
			data = _.compact(_(data.split('\n')).map(function (line) {
				return line.split(';')[0].trim();
			}));
			cb(data);
		}
	});
}

var file = process.argv[2];
if (!file)
	process.exit();

read(file, function (code) {
	code = compile(code);
	if (code)
		run(code)
});
