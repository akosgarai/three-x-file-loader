import Types from './types';

module.exports = {
	// https://en.cppreference.com/w/cpp/string/byte/isspace
	isSpace : function( currChar) {
		const countAsSpace = [' ', '\f', '\n', '\r', '\t', '\v'];
		return countAsSpace.indexOf(currChar) > -1;
	},
	readInteger: function(fullText) {
		let result = new Types.ExportedNode(0);
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
			result.nodeData = result.nodeData * 10 + currentDigit;
			++result.valueLength;
		}
		if (isNegative) {
			result.nodeData = -1*result.nodeData;
		}

		return result;
	},
	// read a floating point number. Input is the full text of the rest of the model file.
	// The output is an object with the value and the length of the text read.
	// The value is the floating point number.
	// The length is the number of characters read.
	readFloat: function(fullText) {
		let result = new Types.ExportedNode(0);
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
			result.nodeData = result.nodeData * 10 + currentDigit;
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
				result.nodeData = result.nodeData + decimal * currentDigit;
				decimal = decimal * 0.1;
				++result.valueLength;
			}
		}
		if (isNegative) {
			result.nodeData = -1*result.nodeData;
		}
		return result;
	},
	// readRGBA function reads 4 floating point numbers from the input.
	// As the THREE.Color only has a constructor that takes 3 floats, the fourth is ignored.
	// The output is an object with the Types.Color and the length of the text read.
	readRGBA: function(fullText) {
		let result = new Types.ExportedNode(new Types.Color());
		let rColorComponentData = this.readFloat(fullText);
		// increase the result.valueLength by the length of the read data.
		result.updateExport(rColorComponentData);
		// separator character.
		result.valueLength += 1;
		// read the green component.
		let gColorComponentData = this.readFloat(fullText.substring(result.valueLength));
		// increase the result.valueLength by the length of the read data.
		result.updateExport(gColorComponentData);
		result.valueLength += 1;
		// read the blue component.
		let bColorComponentData = this.readFloat(fullText.substring(result.valueLength));
		// increase the result.valueLength by the length of the read data.
		result.updateExport(bColorComponentData);
		result.valueLength += 1;
		// read the alpha component.
		// increase the result.valueLength by the length of the read data.
		result.updateExport(this.readFloat(fullText.substring(result.valueLength)));
		// set the color.
		result.nodeData = new Types.Color(rColorComponentData.nodeData, gColorComponentData.nodeData, bColorComponentData.nodeData);
		result.updateExport(this.testForSeparator(fullText.substring(result.valueLength)));
		return result;
	},
	// readRGB function reads 3 floating point numbers from the input.
	// The output is an object with the Types.Color and the length of the text read.
	readRGB: function(fullText) {
		let result = new Types.ExportedNode(new Types.Color());
		let rColorComponentData = this.readFloat(fullText);
		// increase the result.valueLength by the length of the read data.
		result.updateExport(rColorComponentData);
		// separator character.
		result.valueLength += 1;
		// read the green component.
		let gColorComponentData = this.readFloat(fullText.substring(result.valueLength));
		// increase the result.valueLength by the length of the read data.
		result.updateExport(gColorComponentData);
		result.valueLength += 1;
		// read the blue component.
		let bColorComponentData = this.readFloat(fullText.substring(result.valueLength));
		// increase the result.valueLength by the length of the read data.
		result.updateExport(bColorComponentData);
		result.valueLength += 1;
		// set the color.
		result.nodeData = new Types.Color(rColorComponentData.nodeData, gColorComponentData.nodeData, bColorComponentData.nodeData);
		result.updateExport(this.testForSeparator(fullText.substring(result.valueLength)));
		return result;
	},
	// readString function reads a string from the input. The input has to be prefixed and suffixed with the '"' character.
	// The output is an object with the string and the length of the text read.
	readString: function(fullText) {
		let result = new Types.ExportedNode('');
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
			result.nodeData += currentChar;
			++result.valueLength;
		}
		throw 'Unterminated string.';
	},
	// readVector3 function reads 3 floating point numbers from the input.
	// The output is an object with the Types.Vector3 and the length of the text read.
	readVector3: function(fullText) {
		let result = new Types.ExportedNode(new Types.Vector3());
		let xComponentData = this.readFloat(fullText);
		// increase the result.valueLength by the length of the read data.
		result.updateExport(xComponentData);
		result.valueLength += 1;
		result.nodeData.x = xComponentData.nodeData;
		let yComponentData = this.readFloat(fullText.substring(result.valueLength));
		// increase the result.valueLength by the length of the read data.
		result.updateExport(yComponentData);
		result.valueLength += 1;
		result.nodeData.y = yComponentData.nodeData;
		let zComponentData = this.readFloat(fullText.substring(result.valueLength));
		result.updateExport(zComponentData);
		result.valueLength += 1;
		result.nodeData.z = zComponentData.nodeData;
		return result;
	},
	// readVector2 function reads 2 floating point numbers from the input.
	// The output is an object with the Types.Vector2 and the length of the text read.
	readVector2: function(fullText) {
		let result = new Types.ExportedNode(new Types.Vector2());
		let xComponentData = this.readFloat(fullText);
		// increase the result.valueLength by the length of the read data.
		result.updateExport(xComponentData);
		result.valueLength += 1;
		result.nodeData.x = xComponentData.nodeData;
		let yComponentData = this.readFloat(fullText.substring(result.valueLength));
		// increase the result.valueLength by the length of the read data.
		result.updateExport(yComponentData);
		result.valueLength += 1;
		result.nodeData.y = yComponentData.nodeData;
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
	},
	// readUntilNextNonWhitespace function reads the input until the next non-whitespace character.
	// Returns an ExportedNode without any data.
	readUntilNextNonWhitespace: function(fullText) {
		let result = new Types.ExportedNode(null);
		while (true) {
			while (result.valueLength < fullText.length && this.isSpace(fullText[result.valueLength])) {
				if (fullText[result.valueLength] == '\n') {
					result.lines++;
				}
				result.valueLength++;
			}
			if (result.valueLength >= fullText.length) {
				return result;
			}
			// ignore the comments
			if ((fullText[result.valueLength] == '/' && fullText[result.valueLength + 1] == '/') || fullText[result.valueLength] == '#') {
				result.valueLength += this.readUntilEndOfLine(fullText.substring(result.valueLength));
				result.lines++;
			} else {
				break;
			}
		}
		return result;
	},
	// getNextToken function reads the input until the end of the next token.
	// Returns an ExportedNode without the token string as nodeData.
	getNextToken: function(fullText) {
		let result = new Types.ExportedNode('');
		result.updateExport(this.readUntilNextNonWhitespace(fullText));
		while (result.valueLength < fullText.length && !this.isSpace(fullText[result.valueLength])) {
			// either keep token delimiters when already holding a token, or return if first valid char
			const delimiters = [';', '}', '{', ','];
			if (delimiters.indexOf(fullText[result.valueLength]) > -1) {
				if (!result.nodeData.length) {
					result.nodeData = result.nodeData + fullText[result.valueLength];
					++result.valueLength;
				}
				break; // stop for delimiter
			}
			result.nodeData = result.nodeData + fullText[result.valueLength];
			++result.valueLength;
		}
		return result;
	},
	// tests and possibly consumes a separator char, but does nothing if there was no separator
	testForSeparator: function(fullText) {
		// ignore the whitespaces
		let skipped = this.readUntilNextNonWhitespace(fullText);
		if (fullText[skipped.valueLength] == ',' || fullText[skipped.valueLength] == ';') {
			skipped.valueLength++;
		}
		return skipped;
	}
};
