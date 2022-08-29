const StringUtils = require('./string');

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
});
