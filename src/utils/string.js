import { ExportedNode, Color, Vector3, Vector2 } from './types';

// https://en.cppreference.com/w/cpp/string/byte/isspace
function isSpace( currChar) {
	const countAsSpace = [' ', '\f', '\n', '\r', '\t', '\v'];
	return countAsSpace.indexOf(currChar) > -1;
}
function readInteger(fullText) {
	let result = new ExportedNode(0);
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
}
// read a floating point number. Input is the full text of the rest of the model file.
// The output is an object with the value and the length of the text read.
// The value is the floating point number.
// The length is the number of characters read.
function readFloat(fullText) {
	let result = new ExportedNode(0);
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
}
// readRGBA function reads 4 floating point numbers from the input.
// As the THREE.Color only has a constructor that takes 3 floats, the fourth is ignored.
// The output is an object with the Color and the length of the text read.
function readRGBA(fullText) {
	let result = new ExportedNode(new Color());
	let rColorComponentData = readFloat(fullText);
	// increase the result.valueLength by the length of the read data.
	result.updateExport(rColorComponentData);
	// separator character.
	result.valueLength += 1;
	// read the green component.
	let gColorComponentData = readFloat(fullText.substring(result.valueLength));
	// increase the result.valueLength by the length of the read data.
	result.updateExport(gColorComponentData);
	result.valueLength += 1;
	// read the blue component.
	let bColorComponentData = readFloat(fullText.substring(result.valueLength));
	// increase the result.valueLength by the length of the read data.
	result.updateExport(bColorComponentData);
	result.valueLength += 1;
	// read the alpha component.
	// increase the result.valueLength by the length of the read data.
	result.updateExport(readFloat(fullText.substring(result.valueLength)));
	// set the color.
	result.nodeData = new Color(rColorComponentData.nodeData, gColorComponentData.nodeData, bColorComponentData.nodeData);
	result.updateExport(testForSeparator(fullText.substring(result.valueLength)));
	return result;
}
// readRGB function reads 3 floating point numbers from the input.
// The output is an object with the Color and the length of the text read.
function readRGB(fullText) {
	let result = new ExportedNode(new Color());
	let rColorComponentData = readFloat(fullText);
	// increase the result.valueLength by the length of the read data.
	result.updateExport(rColorComponentData);
	// separator character.
	result.valueLength += 1;
	// read the green component.
	let gColorComponentData = readFloat(fullText.substring(result.valueLength));
	// increase the result.valueLength by the length of the read data.
	result.updateExport(gColorComponentData);
	result.valueLength += 1;
	// read the blue component.
	let bColorComponentData = readFloat(fullText.substring(result.valueLength));
	// increase the result.valueLength by the length of the read data.
	result.updateExport(bColorComponentData);
	result.valueLength += 1;
	// set the color.
	result.nodeData = new Color(rColorComponentData.nodeData, gColorComponentData.nodeData, bColorComponentData.nodeData);
	result.updateExport(testForSeparator(fullText.substring(result.valueLength)));
	return result;
}
// readString function reads a string from the input. The input has to be prefixed and suffixed with the '"' character.
// The output is an object with the string and the length of the text read.
function readString(fullText) {
	let result = new ExportedNode('');
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
}
// readVector3 function reads 3 floating point numbers from the input.
// The output is an object with the Vector3 and the length of the text read.
function readVector3(fullText) {
	let result = new ExportedNode(new Vector3());
	let xComponentData = readFloat(fullText);
	// increase the result.valueLength by the length of the read data.
	result.updateExport(xComponentData);
	result.valueLength += 1;
	result.nodeData.x = xComponentData.nodeData;
	let yComponentData = readFloat(fullText.substring(result.valueLength));
	// increase the result.valueLength by the length of the read data.
	result.updateExport(yComponentData);
	result.valueLength += 1;
	result.nodeData.y = yComponentData.nodeData;
	let zComponentData = readFloat(fullText.substring(result.valueLength));
	result.updateExport(zComponentData);
	result.valueLength += 1;
	result.nodeData.z = zComponentData.nodeData;
	return result;
}
// readVector2 function reads 2 floating point numbers from the input.
// The output is an object with the Vector2 and the length of the text read.
function readVector2(fullText) {
	let result = new ExportedNode(new Vector2());
	let xComponentData = readFloat(fullText);
	// increase the result.valueLength by the length of the read data.
	result.updateExport(xComponentData);
	result.valueLength += 1;
	result.nodeData.x = xComponentData.nodeData;
	let yComponentData = readFloat(fullText.substring(result.valueLength));
	// increase the result.valueLength by the length of the read data.
	result.updateExport(yComponentData);
	result.valueLength += 1;
	result.nodeData.y = yComponentData.nodeData;
	return result;
}
// readUntilEndOfLine function reads the input until the end of the line.
// The output is the number of characters until the end of the line.
function readUntilEndOfLine(fullText) {
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
// readUntilNextNonWhitespace function reads the input until the next non-whitespace character.
// Returns an ExportedNode without any data.
function readUntilNextNonWhitespace(fullText) {
	let result = new ExportedNode(null);
	while (true) {
		while (result.valueLength < fullText.length && isSpace(fullText[result.valueLength])) {
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
			result.valueLength += readUntilEndOfLine(fullText.substring(result.valueLength));
			result.lines++;
		} else {
			break;
		}
	}
	return result;
}
// getNextToken function reads the input until the end of the next token.
// Returns an ExportedNode without the token string as nodeData.
function getNextToken(fullText) {
	let result = new ExportedNode('');
	result.updateExport(readUntilNextNonWhitespace(fullText));
	while (result.valueLength < fullText.length && !isSpace(fullText[result.valueLength])) {
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
}
// tests and possibly consumes a separator char, but does nothing if there was no separator
function testForSeparator(fullText) {
	// ignore the whitespaces
	let skipped = readUntilNextNonWhitespace(fullText);
	if (fullText[skipped.valueLength] == ',' || fullText[skipped.valueLength] == ';') {
		skipped.valueLength++;
	}
	return skipped;
}
export {
	isSpace,
	readInteger,
	readFloat,
	readRGBA,
	readRGB,
	readString,
	readVector3,
	readVector2,
	readUntilEndOfLine,
	readUntilNextNonWhitespace,
	getNextToken,
	testForSeparator,
};
