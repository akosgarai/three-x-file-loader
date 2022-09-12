const Parsers = require('./parsers');
const Types = require('./types');

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
				const result = Parsers.headOfDataObject(fullText);
				expect(result.valueLength).toEqual(expected.valueLength);
				expect(result.lines).toEqual(expected.lines);
				expect(result.nodeData).toEqual(expected.token);
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
				const result = Parsers.templateNode(fullText);
				expect(result.valueLength).toEqual(expected.valueLength);
				expect(result.lines).toEqual(expected.lines);
				expect(result.nodeData).toEqual(null);
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
			{fullText: '{"filename.png";', exception: 'Unexpected token while parsing texture filename.'},
		];
		test('General test', () => {
			testData.forEach(({fullText, expected}) => {
				const result = Parsers.textureFilenameNode(fullText);
				expect(result.valueLength).toEqual(expected.valueLength);
				expect(result.lines).toEqual(expected.lines);
				expect(result.nodeData).toEqual(expected.fileName);
			} );
			wrongTestData.forEach(({fullText, exception}) => {
				expect(() => Parsers.textureFilenameNode(fullText)).toThrow(exception);
			} );
		} );
	});
	describe('materialNode', () => {
		const testData = [
			{
				fullText: ' {\n    1.000000;1.000000;1.000000;1.000000;;\n    9.999999;\n    0.000000;0.000000;0.000000;;\n    0.000000;0.000000;0.000000;;\n\n    TextureFilename {\n     "zippo.png";\n    }\n   }\n',
				expected: {
					valueLength: 176,
					lines: 9,
					nodeData: (() => {
						const material = new Types.Material();
						material.name = 'material_175';
						material.color = new Types.Color(1, 1, 1);
						material.shininess = 9.999999;
						material.specular = new Types.Color(0, 0, 0);
						material.emissive = new Types.Color(0, 0, 0);
						material.map = 'zippo.png';
						return material;
					})(),
				},
			},
			{
				fullText: 'MyMaterialName {\n    1.000000;1.000000;1.000000;1.000000;;\n    9.999999;\n    0.000000;0.000000;0.000000;;\n    0.000000;0.000000;0.000000;;\n\n    TextureFilename {\n     "zippo.png";\n    }\n   }\n',
				expected: {
					valueLength: 190,
					lines: 9,
					nodeData: (() => {
						const material = new Types.Material();
						material.name = 'MyMaterialName';
						material.color = new Types.Color(1, 1, 1);
						material.shininess = 9.999999;
						material.specular = new Types.Color(0, 0, 0);
						material.emissive = new Types.Color(0, 0, 0);
						material.map = 'zippo.png';
						return material;
					})(),
				},
			},
			{
				fullText: '{\n     1.000000;1.000000;1.000000;1.000000;;\n     34.560001;\n     0.577350;0.577350;0.577350;;\n     0.000000;0.000000;0.000000;;\n    TextureFilename {\n       "texture/SSR06_Born2_dif.png";\n     }\n	 BumpMapFilename {\n       "texture/SSR06_Born2_bp_base.png";\n     }\n    }\n',
				expected: {
					valueLength: 270,
					lines: 11,
					nodeData: (() => {
						const material = new Types.Material();
						material.name = 'material_270';
						material.color = new Types.Color(1, 1, 1);
						material.shininess = 34.560001;
						material.specular = new Types.Color(0.577350, 0.577350, 0.577350);
						material.emissive = new Types.Color(0, 0, 0);
						material.map = 'texture/SSR06_Born2_dif.png';
						material.bumpMap = 'texture/SSR06_Born2_bp_base.png';
						material.bumpScale = 1;
						return material;
					})(),
				},
			},
			{
				fullText: '{\n     1.000000;1.000000;1.000000;1.000000;;\n     34.560001;\n     0.577350;0.577350;0.577350;;\n     0.000000;0.000000;0.000000;;\n    TextureFilename {\n       "texture/SSR06_Born2_dif.png";\n     }\n NormalmapFileName {\n       "texture/SSR06_Born2_bp_base.png";\n     }\n    }\n',
				expected: {
					valueLength: 271,
					lines: 11,
					nodeData: (() => {
						const material = new Types.Material();
						material.name = 'material_271';
						material.color = new Types.Color(1, 1, 1);
						material.shininess = 34.560001;
						material.specular = new Types.Color(0.577350, 0.577350, 0.577350);
						material.emissive = new Types.Color(0, 0, 0);
						material.map = 'texture/SSR06_Born2_dif.png';
						material.normalMap = 'texture/SSR06_Born2_bp_base.png';
						material.normalScale = new Types.Vector2(2, 2);
						return material;
					})(),
				},
			},
			{
				fullText: '{\n     1.000000;1.000000;1.000000;1.000000;;\n     34.560001;\n     0.577350;0.577350;0.577350;;\n     0.000000;0.000000;0.000000;;\n    TextureFilename {\n       "texture/SSR06_Born2_dif.png";\n     }\n EmissiveMapFilename {\n       "texture/SSR06_Born2_bp_base.png";\n     }\n    }\n',
				expected: {
					valueLength: 273,
					lines: 11,
					nodeData: (() => {
						const material = new Types.Material();
						material.name = 'material_273';
						material.color = new Types.Color(1, 1, 1);
						material.shininess = 34.560001;
						material.specular = new Types.Color(0.577350, 0.577350, 0.577350);
						material.emissive = new Types.Color(0, 0, 0);
						material.map = 'texture/SSR06_Born2_dif.png';
						material.emissiveMap = 'texture/SSR06_Born2_bp_base.png';
						return material;
					})(),
				},
			},
			{
				fullText: '{\n     1.000000;1.000000;1.000000;1.000000;;\n     34.560001;\n     0.577350;0.577350;0.577350;;\n     0.000000;0.000000;0.000000;;\n    TextureFilename {\n       "texture/SSR06_Born2_dif.png";\n     }\n LightMapFilename {\n       "texture/SSR06_Born2_bp_base.png";\n     }\n    }\n',
				expected: {
					valueLength: 270,
					lines: 11,
					nodeData: (() => {
						const material = new Types.Material();
						material.name = 'material_270';
						material.color = new Types.Color(1, 1, 1);
						material.shininess = 34.560001;
						material.specular = new Types.Color(0.577350, 0.577350, 0.577350);
						material.emissive = new Types.Color(0, 0, 0);
						material.map = 'texture/SSR06_Born2_dif.png';
						material.lightMap = 'texture/SSR06_Born2_bp_base.png';
						return material;
					})(),
				},
			},
		];
		const wrongTestData = [
			{fullText: '{\n    1.000000;1.000000;1.000000;1.000000;;\n    9.999999;\n    0.000000;0.000000;0.000000;;\n    0.000000;0.000000;0.000000;;\n\n', exception: 'Unexpected end of file reached while parsing material'},
			{fullText: '{\n  1.000000;1.000000;1.000000;1.000000;;\n  9.999999;\n  0.000000;0.000000;0.000000;;\n  0.000000;0.000000;0.000000;;\n\n  WrongName {\n    "zippo.png";\n   }\n}', exception: 'Unexpected token while parsing material: WrongName'},
		];
		test('General test', () => {
			testData.forEach(({fullText, expected}) => {
				const material = Parsers.materialNode(fullText);
				expect(material.valueLength).toEqual(expected.valueLength);
				expect(material.lines).toEqual(expected.lines);
				expect(material.nodeData).toEqual(expected.nodeData);
			} );
			wrongTestData.forEach(({fullText, exception}) => {
				expect(() => Parsers.materialNode(fullText)).toThrow(exception);
			} );
		} );
	});
});
