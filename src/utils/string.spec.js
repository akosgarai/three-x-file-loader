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
});
