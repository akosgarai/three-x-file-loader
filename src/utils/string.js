const THREE = require('three');

module.exports = {
	// https://en.cppreference.com/w/cpp/string/byte/isspace
	isSpace : function( currChar) {
		const countAsSpace = [' ', '\f', '\n', '\r', '\t', '\v'];
		return countAsSpace.indexOf(currChar) > -1;
	},
	readInteger: function(fullText) {
		let result = {
			value: 0,
			valueLength: 0,
		};
		let isNegative = false;

		if (fullText[result.valueLength] == '-') {
			isNegative = true;
			++result.valueLength;
		}
		if (isNaN(parseInt(fullText[result.valueLength], 10))) {
			throw 'Number expected.'
		}
		while (result.valueLength < fullText.length) {
			let currentDigit = parseInt(fullText[result.valueLength], 10);
			if (isNaN(currentDigit)) {
				break;
			}
			result.value = result.value * 10 + currentDigit;
			++result.valueLength;
		}
		if (isNegative) {
			result.value = -1*result.value;
		}

		return result;
	},
	// read a floating point number. Input is the full text of the rest of the model file.
	// The output is an object with the value and the length of the text read.
	// The value is the floating point number.
	// The length is the number of characters read.
	readFloat: function(fullText) {
		let result = {
			value: 0,
			valueLength: 0,
		};
		let isNegative = false;
		if (fullText[result.valueLength] == '-') {
			isNegative = true;
			++result.valueLength;
		}
		if (isNaN(parseInt(fullText[result.valueLength], 10))) {
			throw 'Number expected.'
		}
		while (result.valueLength < fullText.length) {
			let currentDigit = parseInt(fullText[result.valueLength], 10);
			if (isNaN(currentDigit)) {
				break;
			}
			result.value = result.value * 10 + currentDigit;
			++result.valueLength;
		}
		if (fullText[result.valueLength] == '.') {
			++result.valueLength;
			let decimal = 0.1;
			while (result.valueLength < fullText.length) {
				let currentDigit = parseInt(fullText[result.valueLength], 10);
				if (isNaN(currentDigit)) {
					break;
				}
				result.value = result.value + decimal * currentDigit;
				decimal = decimal * 0.1;
				++result.valueLength;
			}
		}
		if (isNegative) {
			result.value = -1*result.value;
		}
		return result;
	},
	// readRGBA function reads 4 floating point numbers from the input.
	// As the THREE.Color only has a constructor that takes 3 floats, the fourth is ignored.
	// The output is an object with the THREE.Color and the length of the text read.
	readRGBA: function(fullText) {
		let result = {
			value: new THREE.Color(),
			valueLength: 0,
		};
		let rColorComponentData = this.readFloat(fullText);
		// increase the result.valueLength by the length of the read data.
		result.valueLength += rColorComponentData.valueLength+1;
		// read the green component.
		let gColorComponentData = this.readFloat(fullText.substring(result.valueLength));
		// increase the result.valueLength by the length of the read data.
		result.valueLength += gColorComponentData.valueLength+1;
		// read the blue component.
		let bColorComponentData = this.readFloat(fullText.substring(result.valueLength));
		// increase the result.valueLength by the length of the read data.
		result.valueLength += bColorComponentData.valueLength+1;
		// read the alpha component.
		let aColorComponentData = this.readFloat(fullText.substring(result.valueLength));
		// increase the result.valueLength by the length of the read data.
		result.valueLength += aColorComponentData.valueLength;
		// set the color.
		result.value.setRGB(rColorComponentData.value, gColorComponentData.value, bColorComponentData.value);
		return result;
	},
	// readString function reads a string from the input. The input has to be prefixed and suffixed with the '"' character.
	// The output is an object with the string and the length of the text read.
	readString: function(fullText) {
		let result = {
			value: '',
			valueLength: 0,
		};
		if (fullText[result.valueLength] != '"') {
			throw 'String expected.'
		}
		++result.valueLength;
		while (result.valueLength < fullText.length) {
			let currentChar = fullText[result.valueLength];
			if (currentChar == '"') {
				++result.valueLength;
				return result;
			}
			result.value += currentChar;
			++result.valueLength;
		}
		throw 'Unterminated string.';
	},
	// readVector3 function reads 3 floating point numbers from the input.
	// The output is an object with the THREE.Vector3 and the length of the text read.
	readVector3: function(fullText) {
		let result = {
			value: new THREE.Vector3(),
			valueLength: 0,
		};
		let xComponentData = this.readFloat(fullText);
		// increase the result.valueLength by the length of the read data.
		result.valueLength += xComponentData.valueLength+1;
		result.value.x = xComponentData.value;
		let yComponentData = this.readFloat(fullText.substring(result.valueLength));
		// increase the result.valueLength by the length of the read data.
		result.valueLength += yComponentData.valueLength+1;
		result.value.y = yComponentData.value;
		let zComponentData = this.readFloat(fullText.substring(result.valueLength));
		result.valueLength += zComponentData.valueLength+1;
		result.value.z = zComponentData.value;
		return result;
	},
	// readUntilEndOfLine function reads the input until the end of the line.
	// The output is the number of characters until the end of the line.
	readUntilEndOfLine: function(fullText) {
		let result = 0;
		while (result < fullText.length) {
			let currentChar = fullText[result];
			if (currentChar == '\n' || currentChar == '\r') {
				return ++result;
			}
			++result;
		}
		throw 'Unterminated line.';
	}
};
