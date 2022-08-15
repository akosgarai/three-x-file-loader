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
});
