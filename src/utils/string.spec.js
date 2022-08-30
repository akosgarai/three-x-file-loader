const StringUtils = require('./string');
const THREE = require('three');

describe('String Utils', () => {
	describe('isSpace', () => {
		test('whitespace characters', () => {
			const countAsSpace = [' ', '\f', '\n', '\r', '\t', '\v'];
			countAsSpace.forEach(spaceCharacter => {
				expect(StringUtils.isSpace(spaceCharacter)).toBe(true);
			});
		});
		test('not whitespace characters', () => {
			const countAsNotSpace = ['a', 'b', '.', '1', '/', '\\'];
			countAsNotSpace.forEach(notSpaceCharacter => {
				expect(StringUtils.isSpace(notSpaceCharacter)).toBe(false);
			});
		});
	});
	describe('readInteger', () => {
		const testDataInt = [
			{
				text: '10a',
				expectedInt: 10,
				expectedLen: 2,
			},
			{
				text: '0',
				expectedInt: 0,
				expectedLen: 1,
			},
			{
				text: '1',
				expectedInt: 1,
				expectedLen: 1,
			},
			{
				text: '-1',
				expectedInt: -1,
				expectedLen: 2,
			},
		];
		const testDataNotInt = ['wrong', '-wrong', ''];
		test('General Tests', () => {
			testDataInt.forEach(item => {
				const result = StringUtils.readInteger(item.text);
				expect(result.value).toBe(item.expectedInt);
				expect(result.valueLength).toBe(item.expectedLen);
			});
			testDataNotInt.forEach(item => {
				expect(() => { StringUtils.readInteger(item); }).toThrow('Number expected.');
			});
		});
	});
	// Testcase for the readFloat function.
	describe('readFloat', () => {
		// test data definition for 8 test cases. array of objects with the following properties:
		// text: the text to read
		// expectedValue: the expected value of the read float
		// expectedLen: the expected length of the read float
		const testDataFloat = [
			{
				text: '10.0',
				expectedValue: 10.0,
				expectedLen: 4,
			},
			{
				text: '0.0',
				expectedValue: 0.0,
				expectedLen: 3,
			},
			{
				text: '1.0',
				expectedValue: 1.0,
				expectedLen: 3,
			},
			{
				text: '-1.0',
				expectedValue: -1.0,
				expectedLen: 4,
			},
			{
				text: '1.0001',
				expectedValue: 1.0001,
				expectedLen: 6,
			},
			{
				text: '1.0001bob',
				expectedValue: 1.0001,
				expectedLen: 6,
			},
			{
				text: '1',
				expectedValue: 1,
				expectedLen: 1,
			},
			{
				text: '-1',
				expectedValue: -1,
				expectedLen: 2,
			},
		];
		// Testcases for not float values.
		const testDataNotFloat = ['wrong', '-wrong', ''];
		test('General Tests', () => {
			testDataFloat.forEach(item => {
				const result = StringUtils.readFloat(item.text);
				expect(result.value).toBe(item.expectedValue);
				expect(result.valueLength).toBe(item.expectedLen);
			} );
			testDataNotFloat.forEach(item => {
				expect(() => { StringUtils.readFloat(item); }).toThrow('Number expected.');
			});
		});
	});
	// Testcase for the readRGBA function.
	describe('readRGBA', () => {
		// Test data array for the testcases. Each testcase is an object with the following properties:
		// text: the text to read. Example: '1.000000;1.000000;1.000000;1.000000;;'
		// expectedValue: the expected value of the read RGBA. A THREE.Color object with the x, y, z values of the read RGBA.
		// expectedLen: the expected length of the read RGBA.
		const testDataRGBA = [
			{
				text: '1.000000;1.000000;1.000000;1.000000;;',
				expectedValue: new THREE.Color(1.0, 1.0, 1.0),
				expectedLen: 35,
			},
			{
				text: '0.000000;0.000000;0.000000;0.000000;;',
				expectedValue: new THREE.Color(0.0, 0.0, 0.0),
				expectedLen: 35,
			},
			{
				text: '1.000000;0.000000;0.000000;0.000000;;',
				expectedValue: new THREE.Color(1.0, 0.0, 0.0),
				expectedLen: 35,
			},
			{
				text: '0.000000;1.000000;0.000000;0.000000;;',
				expectedValue: new THREE.Color(0.0, 1.0, 0.0),
				expectedLen: 35,
			},
		];
		// Testcases for not RGBA values.
		const testDataNotRGBA = ['1.000;wrong;1.0;1.0;;', '-wrong;1.00;1.00;1.00;;', '.'];
		test('General Tests', () => {
			testDataRGBA.forEach(item => {
				const result = StringUtils.readRGBA(item.text);
				expect(result.value.r).toBe(item.expectedValue.r);
				expect(result.value.g).toBe(item.expectedValue.g);
				expect(result.value.b).toBe(item.expectedValue.b);
				expect(result.valueLength).toBe(item.expectedLen);
			} );
			testDataNotRGBA.forEach(item => {
				expect(() => { StringUtils.readRGBA(item); }).toThrow('Number expected.');
			} );
		});
	});
	// Testcase for the readString function.
	describe('readString', () => {
		// Test data array for the testcases. Each testcase is an object with the following properties:
		// text: the text to read. Example: '"it counts as a string"'
		// expectedValue: the expected value of the read string.
		// expectedLen: the expected length of the read string (included the " suffix and prefix).
		const testDataString = [
			{
				text: '"it counts as a string"',
				expectedValue: 'it counts as a string',
				expectedLen: 23,
			},
			{
				text: '"1234567890"',
				expectedValue: '1234567890',
				expectedLen: 12,
			},
			{
				text: '"12345 67890 is a string"',
				expectedValue: '12345 67890 is a string',
				expectedLen: 25,
			},
			{
				text: '""',
				expectedValue: '',
				expectedLen: 2,
			},
		];
		// Testcases for not string values.
		const testDataNotStringPrefixMissing = ['wrong"', '-wrong"', ' "'];
		const testDataNotStringSuffixMissing = ['"wrong', '"-wrong', '" '];
		test('General Tests', () => {
			testDataString.forEach(item => {
				const result = StringUtils.readString(item.text);
				expect(result.value).toBe(item.expectedValue);
				expect(result.valueLength).toBe(item.expectedLen);
			} );
			testDataNotStringPrefixMissing.forEach(item => {
				expect(() => { StringUtils.readString(item); }).toThrow('String expected.');
			} );
			testDataNotStringSuffixMissing.forEach(item => {
				expect(() => { StringUtils.readString(item); }).toThrow('Unterminated string.');
			} );
		});
	});
	// Testcase for the readVector3 function.
	describe('readVector3', () => {
		// Test data array for the testcases. Each testcase is an object with the following properties:
		// text: the text to read. Example: '1.000000;1.000000;1.000000;,'
		// expectedValue: the expected value of the read vector. A THREE.Vector3 object with the x, y, z values of the read vector.
		// expectedLen: the expected length of the read vector.
		const testDataVector3 = [
			{
				text: '1.000000;1.000000;1.000000;,',
				expectedValue: new THREE.Vector3(1.0, 1.0, 1.0),
				expectedLen: 27,
			},
			{
				text: '0.577350;-0.578350;-0.579350;,',
				expectedValue: new THREE.Vector3(0.577350, -0.578350, -0.579350),
				expectedLen: 29,
			},
			{
				text: '-0.576350;-0.575350;0.574350;,',
				expectedValue: new THREE.Vector3(-0.576350, -0.575350, 0.574350),
				expectedLen: 29,
			},
			{
				text: '-0.577350;-0.577350;-0.577350;,',
				expectedValue: new THREE.Vector3(-0.577350, -0.577350, -0.577350),
				expectedLen: 30,
			},
		];
		// Testcases for not vector values.
		const testDataNotVector = ['1.0;wr1.0;1.0;', 'wrong1.0;1.0;1.0;,', '1.0;-wrong1.0;1.0;,', '1.0;1.0;'];
		test('General Tests', () => {
			testDataVector3.forEach(item => {
				const result = StringUtils.readVector3(item.text);
				expect(result.value.x).toBe(item.expectedValue.x);
				expect(result.value.y).toBe(item.expectedValue.y);
				expect(result.value.z).toBe(item.expectedValue.z);
				expect(result.valueLength).toBe(item.expectedLen);
			} );
			testDataNotVector.forEach(item => {
				expect(() => { StringUtils.readVector3(item); }).toThrow('Number expected.');
			} );
		});
	});
	// Testcase for the readUntilEndOfLine function.
	describe('readUntilEndOfLine', () => {
		// Test data array for the testcases. Each testcase is an object with the following properties:
		// text: the text to read. Example: 'whatever;goes;here;;\n';
		// expectedLen: the length until the end of the line.
		const testDataUntilEndOfLine = [
			{
				text: '\n',
				expectedLen: 1,
			},
			{
				text: '1\n',
				expectedLen: 2,
			},
			{
				text: 'whatever;goes;here;;\n',
				expectedLen: 21,
			},
			{
				text: 'goes;here;;\n',
				expectedLen: 12,
			},
		];
		// Testcases for not terminated line values.
		const testDataNotTerminatedLine = ['whatever;goes;here;;', 'whatever;goes;here', '1.0;1.1;1.2;'];
		test('General Tests', () => {
			testDataUntilEndOfLine.forEach(item => {
				const result = StringUtils.readUntilEndOfLine(item.text);
				expect(result).toBe(item.expectedLen);
			} );
			testDataNotTerminatedLine.forEach(item => {
				expect(() => { StringUtils.readUntilEndOfLine(item); }).toThrow('Unterminated line.');
			} );
		});
	});
	// Testcase for the StringUtils.readUntilNextNonWhitespace function.
	describe('readUntilNextNonWhitespace', () => {
		// Test data array for the testcases. Each testcase is an object with the following properties:
		// text: the text to read. Example: 'whatever;goes;here;;\n';
		// expectedLen: the length until the next not whitespace or comment block character.
		// expectedLines: the expected number of lines read.
		const testDataUntilNextNonWhitespace = [
			{
				text: '\n',
				expectedLen: 1,
				expectedLines: 1,
			},
			{
				text: '1\n',
				expectedLen: 0,
				expectedLines: 0,
			},
			{
				text: '\n1',
				expectedLen: 1,
				expectedLines: 1,
			},
			{
				text: ' \n1',
				expectedLen: 2,
				expectedLines: 1,
			},
			{
				text: '\n 1',
				expectedLen: 2,
				expectedLines: 1,
			},
			{
				text: 'whatever;goes;here;;\n',
				expectedLen: 0,
				expectedLines: 0,
			},
			{
				text: '\n \n a',
				expectedLen: 4,
				expectedLines: 2,
			},
			{
				text: '\n#whatever;goes;here;;\nnot a comment\n',
				expectedLen: 23,
				expectedLines: 2,
			},
			{
				text: '\n#whatever;goes;here;;\n // comment\nnot a comment\n',
				expectedLen: 35,
				expectedLines: 3,
			},
		];
		test('General Tests', () => {
			testDataUntilNextNonWhitespace.forEach(item => {
				const result = StringUtils.readUntilNextNonWhitespace(item.text);
				expect(result.value).toBe(item.expectedLen);
				expect(result.lines).toBe(item.expectedLines);
			} );
		} );
	});
});
