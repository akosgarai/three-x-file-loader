const Parsers = require('./parsers');

describe('Parsers', () => {
	describe('headOfDataObject', () => {
		// testData is an array of objects with the following properties:
		// - fullText: the full text of the rest of the model file
		// - expected: the expected result of the headOfDataObject parser function
		const testData = [
			{
				fullText: '{',
				expected: {'token': '', 'valueLength': 1, 'lines': 0},
			},
			{
				fullText: 'testToken {',
				expected: {'token': 'testToken', 'valueLength': 11, 'lines': 0},
			},
			{
				fullText: 'testToken{',
				expected: {'token': 'testToken', 'valueLength': 10, 'lines': 0},
			},
			{
				fullText: ' testToken{',
				expected: {'token': 'testToken', 'valueLength': 11, 'lines': 0},
			},
			{
				fullText: ' \n testToken{',
				expected: {'token': 'testToken', 'valueLength': 13, 'lines': 1},
			},
		];
		const wrongTestData = ['token ', 'token token', 'token token{', 'token token {'];
		test('General test', () => {
			testData.forEach(({fullText, expected}) => {
				expect(Parsers.headOfDataObject(fullText)).toEqual(expected);
			} );
			wrongTestData.forEach(wrongTest => {
				expect(() => Parsers.headOfDataObject(wrongTest)).toThrow('Opening brace expected.');
			});
		});
	});
	describe('templateNode', () => {
		// testData is an array of objects with the following properties:
		// - fullText: the full text of the rest of the model file
		// - expected: the expected result of the templateNode parser function
		const testData = [
			{
				fullText: 'ColorRGBA {\n <35ff44e0-6c7c-11cf-8f52-0040333594a3>\n FLOAT red;\n FLOAT green;\n FLOAT blue;\n FLOAT alpha;\n }',
				expected: {
					valueLength: 'ColorRGBA {\n <35ff44e0-6c7c-11cf-8f52-0040333594a3>\n FLOAT red;\n FLOAT green;\n FLOAT blue;\n FLOAT alpha;\n }'.length,
					lines: 6,
				},
			},
			{
				fullText: ' TextureFilename {\n <a42790e1-7810-11cf-8f52-0040333594a3>\n STRING filename;\n}\n',
				expected: {
					valueLength: ' TextureFilename {\n <a42790e1-7810-11cf-8f52-0040333594a3>\n STRING filename;\n}'.length,
					lines: 3,
				},
			},
		];
		const wrongTestData = [
			' ColorRGBA {\n <35ff44e0-6c7c-11cf-8f52-0040333594a3>',
			'ColorRGBA {\n <35ff44e0-6c7c-11cf-8f52-0040333594a3>\n FLOAT red;\n FLOAT green;\n FLOAT blue;\n FLOAT alpha;'
		];
		test('General test', () => {
			testData.forEach(({fullText, expected}) => {
				expect(Parsers.templateNode(fullText)).toEqual(expected);
			} );
			wrongTestData.forEach(wrongTest => {
				expect(() => Parsers.templateNode(wrongTest)).toThrow('Unexpected end of file reached while parsing template definition.');
			} );
		} );
	});
	describe('textureFilenameNode', () => {
		// testData is an array of objects with the following properties:
		// - fullText: the full text of the rest of the model file
		// - expected: the expected result of the textureFilenameNode parser function
		const testData = [
			{
				fullText: '{\n"filename.png";\n}\n',
				expected: {
					valueLength: '{\n"filename.png";\n}'.length,
					lines: 2,
					fileName: 'filename.png',
				},
			},
			{
				fullText: '{ \n  "filename.png";\n}\n',
				expected: {
					valueLength: '{ \n  "filename.png";\n}'.length,
					lines: 2,
					fileName: 'filename.png',
				},
			},
			{
				fullText: '\n{\n   "filename.png";\n}\n',
				expected: {
					valueLength: '\n{\n   "filename.png";\n}'.length,
					lines: 3,
					fileName: 'filename.png',
				},
			},
		];
		const wrongTestData = [
			{fullText: '{"filename.png"', exeption: 'Unexpected token while parsing texture filename.'},
			{fullText: '{ "filename.png"\n', exception: 'Unexpected token while parsing texture filename.'},
			{fullText: '{"filename.png"\n}\n', exception: 'Unexpected token while parsing texture filename.'},
			{fullText: '{filename.png"\n}\n', exception: 'String expected.'},
			{fullText: '{"filename.png', exception: 'Unterminated string.'},
			{fullText: '{"filename.png"', exception: 'Unexpected token while parsing texture filename.'},
		];
		test('General test', () => {
			testData.forEach(({fullText, expected}) => {
				expect(Parsers.textureFilenameNode(fullText)).toEqual(expected);
			} );
			wrongTestData.forEach(({fullText, exception}) => {
				expect(() => Parsers.textureFilenameNode(fullText)).toThrow(exception);
			} );
		} );
	});
});
