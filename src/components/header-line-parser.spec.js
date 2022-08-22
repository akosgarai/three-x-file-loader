const HeaderLineParser = require('./header-line-parser');

describe('Header Parser', () => {
	describe('Validation', () => {
		test('Throws exception for not strings', () => {
			const lines = [
				1, [], {}, 1.33, NaN
			];
			lines.forEach((line, index) => {
				expect(() => { new HeaderLineParser(line); }).toThrow('Line is not string.');
			});
		});
		test('Throws exception for invalid magic word', () => {
			const lines = [
				'xoff 0303txt 0032', 'fox 0303txt 0032', 'xoff0303txt 0032', 'xof0303txt 0032',
			];
			lines.forEach((line, index) => {
				expect(() => { new HeaderLineParser(line); }).toThrow('Header mismatch, file is not an XFile.');
			});
		});
		test('Throws exception for invalid format', () => {
			const formats = [
				'txtt ', 'txt', 'txx ',
				'binn ', 'bin', 'bii ',
				'bzp ', 'bzii', 'bzpp',
				'tzp ', 'tzii', 'tzpp',
			];
			formats.forEach((format, index) => {
				const line = 'xof 3030'+format+'0032';
				expect(() => { new HeaderLineParser(line); }).toThrow('Unsupported x-file format: '+format.substring(0, 4));
			});
		});
	});
	describe('Valid Data', () => {
		const magicWord = 'xof ';
		const versionNumbers = [
			{major : '03', minor: '03'},
		];
		const formats = ['txt ', 'bin ', 'tzip', 'bzip'];
		formats.forEach((format, fIndex) => {
			versionNumbers.forEach((version, vIndex) => {
				const headerLine = ''+magicWord+''+version.major+''+version.minor+''+format+'0032';
				test('Constructor', () => {
					expect(() => { new HeaderLineParser(headerLine); }).not.toThrow('Header mismatch, file is not an XFile.');
					expect(() => { new HeaderLineParser(headerLine); }).not.toThrow('Unsupported x-file format: '+format);
				})
				test('Extracted data', () => {
					const parsed = new HeaderLineParser(headerLine);
					expect(parsed._fileMajorVersion).toBe(version.major);
					expect(parsed._fileMinorVersion).toBe(version.minor);
					expect(parsed._fileFormat).toBe(format);
				})
			});
		});
	});
});
