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
	describe('meshNormalNode', () => {
		const expectedFace = new Types.Face();
		expectedFace.indices = [0, 1, 2];
		const testData = [
			{
				fullText: '{1;\n 0.0,0.0,0.0;,\n 1;\n 3,0,1,2;,}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertexFaces = [expectedFace];
					return mesh;
				})(),
				expected: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.normals = [new Types.Vector3(0, 0, 0)];
					mesh.normalFaces = [expectedFace];
					mesh.vertexFaces = [expectedFace];
					const nodeData = new Types.ExportedNode(mesh);
					nodeData.valueLength = 34;
					nodeData.lines = 3;
					return nodeData;
				})(),
			},
			{
				fullText: '{1;\n 0.0,0.0,0.0;,\n 0;}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertexFaces = [];
					return mesh;
				})(),
				expected: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.normals = [new Types.Vector3(0, 0, 0)];
					mesh.normalFaces = [];
					mesh.vertexFaces = [];
					const nodeData = new Types.ExportedNode(mesh);
					nodeData.valueLength = 23;
					nodeData.lines = 2;
					return nodeData;
				})(),
			},
			{
				fullText: '{\n8;                    // define 8 normals\n0.576350;0.574350;-0.574350;,\n-0.816497;0.408248;-0.408248;,\n-0.576350;0.574350;0.574350;,\n0.816497;0.408248;0.408248;,\n0.574350;-0.574350;-0.576350;,\n-0.408248;-0.408248;-0.816497;,\n-0.574350;-0.574350;0.576350;,\n0.408248;-0.408248;0.816497;;\n12;                   // For the 12 faces,\n3;0,1,2;,             // define the normals\n3;0,2,3;,\n3;0,4,5;,\n3;0,5,1;,\n3;1,5,6;,\n3;1,6,2;,\n3;2,6,7;,\n3;2,7,3;,\n3;3,7,4;,\n3;3,4,0;,\n3;4,7,6;,\n3;4,6,5;;\n}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					// length matching the number of faces
					mesh.vertexFaces = [expectedFace,expectedFace,expectedFace,expectedFace,expectedFace,expectedFace,expectedFace,expectedFace,expectedFace,expectedFace,expectedFace,expectedFace];
					return mesh;
				})(),
				expected: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.normals = [
						new Types.Vector3(0.576350, 0.574350, -0.574350),
						new Types.Vector3(-0.816497, 0.408248, -0.408248),
						new Types.Vector3(-0.576350, 0.574350, 0.574350),
						new Types.Vector3(0.816497, 0.408248, 0.408248),
						new Types.Vector3(0.574350, -0.574350, -0.576350),
						new Types.Vector3(-0.408248, -0.408248, -0.816497),
						new Types.Vector3(-0.574350, -0.574350, 0.576350),
						new Types.Vector3(0.408248, -0.408248, 0.816497),
					];
					mesh.normalFaces = [
						(() => { const face = new Types.Face(); face.indices.push(0); face.indices.push(1); face.indices.push(2); return face;})(),
						(() => { const face = new Types.Face(); face.indices.push(0); face.indices.push(2); face.indices.push(3); return face;})(),
						(() => { const face = new Types.Face(); face.indices.push(0); face.indices.push(4); face.indices.push(5); return face;})(),
						(() => { const face = new Types.Face(); face.indices.push(0); face.indices.push(5); face.indices.push(1); return face;})(),
						(() => { const face = new Types.Face(); face.indices.push(1); face.indices.push(5); face.indices.push(6); return face;})(),
						(() => { const face = new Types.Face(); face.indices.push(1); face.indices.push(6); face.indices.push(2); return face;})(),
						(() => { const face = new Types.Face(); face.indices.push(2); face.indices.push(6); face.indices.push(7); return face;})(),
						(() => { const face = new Types.Face(); face.indices.push(2); face.indices.push(7); face.indices.push(3); return face;})(),
						(() => { const face = new Types.Face(); face.indices.push(3); face.indices.push(7); face.indices.push(4); return face;})(),
						(() => { const face = new Types.Face(); face.indices.push(3); face.indices.push(4); face.indices.push(0); return face;})(),
						(() => { const face = new Types.Face(); face.indices.push(4); face.indices.push(7); face.indices.push(6); return face;})(),
						(() => { const face = new Types.Face(); face.indices.push(4); face.indices.push(6); face.indices.push(5); return face;})(),
					];
					mesh.vertexFaces = [expectedFace,expectedFace,expectedFace,expectedFace,expectedFace,expectedFace,expectedFace,expectedFace,expectedFace,expectedFace,expectedFace,expectedFace];
					const nodeData = new Types.ExportedNode(mesh);
					nodeData.valueLength = 486;
					nodeData.lines = 23;
					return nodeData;
				})(),
			},
		];
		// missing vertexData
		// missing closing bracket
		const wrongTestData = [
			{
				fullText: '{1;\n 0.0,0.0,0.0;,\n 1;\n 3,0,1,2;,}',
				mesh: new Types.Mesh(),
				exception: 'Normal face count does not match vertex face count.',
			},
			{
				fullText: '{1;\n 0.0,0.0,0.0;,\n 1;\n 3,0,1,2;,',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertexFaces = [expectedFace];
					return mesh;
				})(),
				exception: 'Unexpected token while parsing mesh normals: ',
			},
			{
				fullText: '{1;\n 0.0,0.0,0.0;,\n 1;\n 3,0,1,2;,wrongsymbol}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertexFaces = [expectedFace];
					return mesh;
				})(),
				exception: 'Unexpected token while parsing mesh normals: wrongsymbol',
			},
		];
		test('General test', () => {
			testData.forEach(({fullText, mesh, expected}) => {
				const nodeData = Parsers.meshNormalNode(fullText, mesh);
				expect(nodeData).toEqual(expected);
			} );
			wrongTestData.forEach(({fullText, mesh}) => {
				expect(() => Parsers.meshNormalNode(fullText, mesh)).toThrow();
			} );
		} );
	});
	describe('meshTextureCoordsNode', () => {
		const dummyVertex = new Types.Vector3(0,0,0);
		const testData = [
			{
				fullText: '{1;\n 1.000000;0.000000;;}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertices = [dummyVertex];
					return mesh;
				})(),
				expected: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertices = [dummyVertex];
					mesh.texCoords = [new Types.Vector2(1,0)];
					const nodeData = new Types.ExportedNode(mesh);
					nodeData.valueLength = 25;
					nodeData.lines = 1;
					return nodeData;
				})(),
			},
			{
				fullText: '{8;\n 0.000000;1.000000;\n0.000000;0.000000;\n1.000000;0.000000;\n 1.000000;1.000000;\n 0.000000;1.000000;\n 0.000000;0.000000;\n 1.000000;0.000000;\n 1.000000;1.000000;;}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertices = [dummyVertex, dummyVertex, dummyVertex, dummyVertex, dummyVertex, dummyVertex, dummyVertex, dummyVertex];
					return mesh;
				})(),
				expected: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertices = [dummyVertex, dummyVertex, dummyVertex, dummyVertex, dummyVertex, dummyVertex, dummyVertex, dummyVertex];
					mesh.texCoords = [new Types.Vector2(0,1),new Types.Vector2(0,0),new Types.Vector2(1,0),new Types.Vector2(1,1),new Types.Vector2(0,1),new Types.Vector2(0,0),new Types.Vector2(1,0),new Types.Vector2(1,1)];
					const nodeData = new Types.ExportedNode(mesh);
					nodeData.valueLength = 163;
					nodeData.lines = 8;
					return nodeData;
				})(),
			},
		];
		const wrongTestData = [
			{
				fullText: '{1;\n 1.000000;0.000000;;}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertices = [dummyVertex, dummyVertex];
					return mesh;
				})(),
				exception: 'Texture coordinate count does not match vertex face count.',
			},
			{
				fullText: '{1;\n 1.000000;0.000000;;',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertices = [dummyVertex];
					return mesh;
				})(),
				exception: 'Unexpected token while parsing mesh texture coords: ',
			},
			{
				fullText: '{1;\n 1.000000;0.000000;;wrongsymbol}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertices = [dummyVertex];
					return mesh;
				})(),
				exception: 'Unexpected token while parsing mesh texture coords: wrongsymbol',
			},
		];
		test('General test', () => {
			testData.forEach(({fullText, mesh, expected}) => {
				const nodeData = Parsers.meshTextureCoordsNode(fullText, mesh);
				expect(nodeData).toEqual(expected);
			} );
			wrongTestData.forEach(({fullText, mesh}) => {
				expect(() => Parsers.meshTextureCoordsNode(fullText, mesh)).toThrow();
			} );
		} );
	});
	describe('meshVertexColorsNode', () => {
		const dummyVertex = new Types.Vector3(0,0,0);
		const testData = [
			{
				fullText: '{1;\n0;0.0,0.0,0.0,0.0;,}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertices = [dummyVertex];
					return mesh;
				})(),
				expected: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.colors = {
						0: new Types.Color(0, 0, 0),
					};
					mesh.vertices = [dummyVertex];
					const nodeData = new Types.ExportedNode(mesh);
					nodeData.valueLength = 24;
					nodeData.lines = 1;
					return nodeData;
				})(),
			},
			{
				fullText: '{2;\n0;1.0,1.0,1.0,0.0;,\n1;0.0,0.0,0.0,0.0;,}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertices = [dummyVertex, dummyVertex];
					return mesh;
				})(),
				expected: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.colors = {
						0: new Types.Color(1, 1, 1),
						1: new Types.Color(0, 0, 0),
					};
					mesh.vertices = [dummyVertex, dummyVertex];
					const nodeData = new Types.ExportedNode(mesh);
					nodeData.valueLength = 44;
					nodeData.lines = 2;
					return nodeData;
				})(),
			},
			{
				fullText: '{2;\n1;1.0,1.0,1.0,0.0;,\n0;0.0,0.0,0.0,0.0;,}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertices = [dummyVertex, dummyVertex];
					return mesh;
				})(),
				expected: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.colors = {
						0: new Types.Color(0, 0, 0),
						1: new Types.Color(1, 1, 1),
					};
					mesh.vertices = [dummyVertex, dummyVertex];
					const nodeData = new Types.ExportedNode(mesh);
					nodeData.valueLength = 44;
					nodeData.lines = 2;
					return nodeData;
				})(),
			},
		];
		// missing vertexData
		// missing closing bracket
		const wrongTestData = [
			{
				fullText: '{1;\n0;0.0,0.0,0.0,0.0;,}',
				mesh: new Types.Mesh(),
				exception: 'Normal face count does not match vertex face count.',
			},
			{
				fullText: '{1;\n1;0.0,0.0,0.0,0.0;,}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertices = [dummyVertex];
					return mesh;
				})(),
				exception: 'Vertex color index out of bounds',
			},
			{
				fullText: '{1;\n0;0.0,0.0,0.0,0.0;,',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertices = [dummyVertex];
					return mesh;
				})(),
				exception: 'Unexpected token while parsing mesh vertex colors: ',
			},
			{
				fullText: '{1;\n0;0.0,0.0,0.0,0.0;,wrongsymbol}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertices = [dummyVertex];
					return mesh;
				})(),
				exception: 'Unexpected token while parsing mesh vertex colors: wrongsymbol',
			},
		];
		test('General test', () => {
			testData.forEach(({fullText, mesh, expected}) => {
				const nodeData = Parsers.meshVertexColorsNode(fullText, mesh);
				expect(nodeData).toEqual(expected);
			} );
			wrongTestData.forEach(({fullText, mesh}) => {
				expect(() => Parsers.meshVertexColorsNode(fullText, mesh)).toThrow();
			} );
		} );
	});
	describe('unknownNode', () => {
		// testData is an array of objects with the following properties:
		// - fullText: the full text of the rest of the model file
		// - expected: the expected result of the templateNode parser function
		const testData = [
			{
				fullText: '{}',
				expected: {
					valueLength: '{}'.length,
					lines: 0,
				},
			},
			{
				fullText: 'DataNode {}',
				expected: {
					valueLength: 'DataNode {}'.length,
					lines: 0,
				},
			},
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
			{
				fullText: '{2;\n0;1.0,1.0,1.0,0.0;,\n1;0.0,0.0,0.0,0.0;,}',
				expected: {
					valueLength: '{2;\n0;1.0,1.0,1.0,0.0;,\n1;0.0,0.0,0.0,0.0;,}'.length,
					lines: 2,
				},
			},
			{
				fullText: '{\n1.000000;1.000000;1.000000;1.000000;;\n34.560001;\n0.577350;0.577350;0.577350;;\n0.000000;0.000000;0.000000;;\nTextureFilename {\n"texture/SSR06_Born2_dif.png";\n}\nBumpMapFilename {\n"texture/SSR06_Born2_bp_base.png";\n}\n}',
				expected: {
					valueLength: '{\n1.000000;1.000000;1.000000;1.000000;;\n34.560001;\n0.577350;0.577350;0.577350;;\n0.000000;0.000000;0.000000;;\nTextureFilename {\n"texture/SSR06_Born2_dif.png";\n}\nBumpMapFilename {\n"texture/SSR06_Born2_bp_base.png";\n}\n}'.length,
					lines: 11,
				},
			},
		];
		const wrongTestData = [
			'',
			'{2;\n0;1.0,1.0,1.0,0.0;,\n1;0.0,0.0,0.0,0.0;,',
		];
		test('General test', () => {
			testData.forEach(({fullText, expected}) => {
				const result = Parsers.unknownNode(fullText);
				expect(result.valueLength).toEqual(expected.valueLength);
				expect(result.lines).toEqual(expected.lines);
				expect(result.nodeData).toEqual(null);
			} );
			wrongTestData.forEach(wrongTest => {
				expect(() => Parsers.unknownNode(wrongTest)).toThrow('Unexpected end of file while parsing unknown data object');
			} );
		} );
	});
	describe('meshMaterialListNode', () => {
		const testData = [
			{
				fullText: '{\n2;\n12;\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n1,\n1,\n1,\n1;;\n{RedMaterial}\n{GreenMaterial}\n}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertexFaces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
					return mesh;
				})(),
				expected: {
					valueLength: '{\n2;\n12;\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n1,\n1,\n1,\n1;;\n{RedMaterial}\n{GreenMaterial}\n}'.length,
					lines: 17,
					mesh: (() => {
						const mesh = new Types.Mesh();
						mesh.name = 'mesh_0';
						mesh.vertexFaces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
						mesh.faceMaterials = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1];
						mesh.materials = [
							(() => {
								const mat = new Types.Material();
								mat.name = 'RedMaterial';
								mat.isReference = true;
								return mat;
							})(),
							(() => {
								const mat = new Types.Material();
								mat.name = 'GreenMaterial';
								mat.isReference = true;
								return mat;
							})(),
						];
						return mesh;
					})(),
				},
			},
			{
				fullText: '{\n2;\n12;\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n1,\n1,\n1,\n1;;\nMaterial {\n1.000000;1.000000;1.000000;1.000000;;\n9.999999;\n0.000000;0.000000;0.000000;;\n0.000000;0.000000;0.000000;;\n\nTextureFilename {\n"zippo.png";\n}\n}\n{GreenMaterial}\n}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertexFaces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
					return mesh;
				})(),
				expected: {
					valueLength: '{\n2;\n12;\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n1,\n1,\n1,\n1;;\nMaterial {\n1.000000;1.000000;1.000000;1.000000;;\n9.999999;\n0.000000;0.000000;0.000000;;\n0.000000;0.000000;0.000000;;\n\nTextureFilename {\n"zippo.png";\n}\n}\n{GreenMaterial}\n}'.length,
					lines: 26,
					mesh: (() => {
						const mesh = new Types.Mesh();
						mesh.name = 'mesh_0';
						mesh.vertexFaces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
						mesh.faceMaterials = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1];
						mesh.materials = [
							(() => {
								const mat = new Types.Material();
								mat.isReference = false;
								mat.color = new Types.Color(1, 1, 1);
								mat.map = 'zippo.png';
								mat.name = 'material_160';
								mat.shininess = 9.999999;
								return mat;
							})(),
							(() => {
								const mat = new Types.Material();
								mat.name = 'GreenMaterial';
								mat.isReference = true;
								return mat;
							})(),
						];
						return mesh;
					})(),
				},
			},
			{
				// Ignoring the semicolon after the last material
				fullText: '{\n2;\n12;\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n1,\n1,\n1,\n1;;\nMaterial {\n1.000000;1.000000;1.000000;1.000000;;\n9.999999;\n0.000000;0.000000;0.000000;;\n0.000000;0.000000;0.000000;;\n\nTextureFilename {\n"zippo.png";\n}\n};\n{GreenMaterial}\n}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertexFaces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
					return mesh;
				})(),
				expected: {
					valueLength: '{\n2;\n12;\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n1,\n1,\n1,\n1;;\nMaterial {\n1.000000;1.000000;1.000000;1.000000;;\n9.999999;\n0.000000;0.000000;0.000000;;\n0.000000;0.000000;0.000000;;\n\nTextureFilename {\n"zippo.png";\n}\n};\n{GreenMaterial}\n}'.length,
					lines: 26,
					mesh: (() => {
						const mesh = new Types.Mesh();
						mesh.name = 'mesh_0';
						mesh.vertexFaces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
						mesh.faceMaterials = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1];
						mesh.materials = [
							(() => {
								const mat = new Types.Material();
								mat.isReference = false;
								mat.color = new Types.Color(1, 1, 1);
								mat.map = 'zippo.png';
								mat.name = 'material_161';
								mat.shininess = 9.999999;
								return mat;
							})(),
							(() => {
								const mat = new Types.Material();
								mat.name = 'GreenMaterial';
								mat.isReference = true;
								return mat;
							})(),
						];
						return mesh;
					})(),
				},
			},
			{
				// unknown node has to be skipped.
				fullText: '{\n2;\n12;\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n1,\n1,\n1,\n1;;\n{RedMaterial}\n{GreenMaterial}\n WrongNode { WrongNode,\nContent }\n}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertexFaces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
					return mesh;
				})(),
				expected: {
					valueLength: '{\n2;\n12;\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n1,\n1,\n1,\n1;;\n{RedMaterial}\n{GreenMaterial}\n WrongNode { WrongNode,\nContent }\n}'.length,
					lines: 19,
					mesh: (() => {
						const mesh = new Types.Mesh();
						mesh.name = 'mesh_0';
						mesh.vertexFaces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
						mesh.faceMaterials = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1];
						mesh.materials = [
							(() => {
								const mat = new Types.Material();
								mat.name = 'RedMaterial';
								mat.isReference = true;
								return mat;
							})(),
							(() => {
								const mat = new Types.Material();
								mat.name = 'GreenMaterial';
								mat.isReference = true;
								return mat;
							})(),
						];
						return mesh;
					})(),
				},
			},
			{
				// handle single material index.
				fullText: '{\n1;\n1;\n0;;\n{RedMaterial}\n}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertexFaces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
					return mesh;
				})(),
				expected: {
					valueLength: '{\n1;\n1;\n0;;\n{RedMaterial}\n}'.length,
					lines: 5,
					mesh: (() => {
						const mesh = new Types.Mesh();
						mesh.name = 'mesh_0';
						mesh.vertexFaces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
						mesh.faceMaterials = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
						mesh.materials = [
							(() => {
								const mat = new Types.Material();
								mat.name = 'RedMaterial';
								mat.isReference = true;
								return mat;
							})(),
						];
						return mesh;
					})(),
				},
			},
			{
				// handle no face data.
				fullText: '{\n1;\n0;\n{RedMaterial}\n}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					return mesh;
				})(),
				expected: {
					valueLength: '{\n1;\n0;\n{RedMaterial}\n}'.length,
					lines: 4,
					mesh: (() => {
						const mesh = new Types.Mesh();
						mesh.name = 'mesh_0';
						mesh.materials = [
							(() => {
								const mat = new Types.Material();
								mat.name = 'RedMaterial';
								mat.isReference = true;
								return mat;
							})(),
						];
						return mesh;
					})(),
				},
			},
		];
		const wrongData = [
			{
				fullText: '{\n2;\n12;\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n1,\n1,\n1,\n1;;\n{RedMaterial}\n{GreenMaterial}\n}',
				mesh: new Types.Mesh(),
				exception: 'Per-Face material index count does not match face count',
			},
			{
				fullText: '{\n2;\n12;\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n1,\n1,\n1,\n1;;',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertexFaces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
					return mesh;
				})(),
				exception: 'Unexpected end of file while parsing mesh material list',
			},
			{
				fullText: '{\n2;\n12;\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n0,\n1,\n1,\n1,\n1;;\nMaterial {\n1.000000;1.000000;1.000000;1.000000;;\n9.999999;\n0.000000;0.000000;0.000000;;\n0.000000;0.000000;0.000000;;\n\nTextureFilename {\n"zippo.png";\n}\n}\n{GreenMaterial wrong\n}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					mesh.vertexFaces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
					return mesh;
				})(),
				exception: 'Unexpected token while parsing mesh material list: wrong',
			},
		];
		test('General test', () => {
			testData.forEach(({fullText, mesh, expected}) => {
				const result = Parsers.meshMaterialListNode(fullText, mesh);
				expect(result.valueLength).toEqual(expected.valueLength);
				expect(result.lines).toEqual(expected.lines);
				expect(result.nodeData).toEqual(expected.mesh);
			} );
			wrongData.forEach(({fullText, mesh, exception}) => {
				expect(() => Parsers.meshMaterialListNode(fullText, mesh)).toThrow(exception);
			} );
		} );
	});
	describe('skinWeightsNode', () => {
		const testData = [
			{
				fullText: '{\n"swName";\n1;\n1;\n1.000000;\n1.000000,0.000000,0.000000,0.000000,0.000000,-0.000000,-1.000000,0.000000,0.000000,1.000000,-0.000000,0.000000,0.000000,0.000000,6.600000,1.000000;;\n}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					return mesh;
				})(),
				expected: {
					valueLength: '{\n"swName";\n1;\n1;\n1.000000;\n1.000000,0.000000,0.000000,0.000000,0.000000,-0.000000,-1.000000,0.000000,0.000000,1.000000,-0.000000,0.000000,0.000000,0.000000,6.600000,1.000000;;\n}'.length,
					lines: 6,
					mesh: (() => {
						const mesh = new Types.Mesh();
						const bone = new Types.Bone();
						bone.name = 'swName';
						const boneWeight = new Types.BoneWeight();
						boneWeight.boneIndex = 1;
						boneWeight.weight = 1.000000;
						bone.boneWeights = [boneWeight];
						bone.offsetMatrix = [1.000000,0.000000,0.000000,0.000000,0.000000,-0.000000,-1.000000,0.000000,0.000000,1.000000,-0.000000,0.000000,0.000000,0.000000,6.600000,1.000000];
						mesh.bones = [bone];
						mesh.name = 'mesh_0';
						return mesh;
					})(),
				},
			},
			{
				fullText: '{\n"swName";\n2;\n1,\n2;\n1.000000,\n1.000000;\n1.000000,0.000000,0.000000,0.000000,0.000000,-0.000000,-1.000000,0.000000,0.000000,1.000000,-0.000000,0.000000,0.000000,0.000000,6.600000,1.000000;;\n}',
				mesh: (() => {
					const mesh = new Types.Mesh();
					mesh.name = 'mesh_0';
					return mesh;
				})(),
				expected: {
					valueLength: '{\n"swName";\n2;\n1,\n2;\n1.000000,\n1.000000;\n1.000000,0.000000,0.000000,0.000000,0.000000,-0.000000,-1.000000,0.000000,0.000000,1.000000,-0.000000,0.000000,0.000000,0.000000,6.600000,1.000000;;\n}'.length,
					lines: 8,
					mesh: (() => {
						const mesh = new Types.Mesh();
						const bone = new Types.Bone();
						bone.name = 'swName';
						const bW01 = new Types.BoneWeight();
						bW01.boneIndex = 1;
						bW01.weight = 1.000000;
						const bW02 = new Types.BoneWeight();
						bW02.boneIndex = 2;
						bW02.weight = 1.000000;
						bone.boneWeights = [bW01, bW02];
						bone.offsetMatrix = [1.000000,0.000000,0.000000,0.000000,0.000000,-0.000000,-1.000000,0.000000,0.000000,1.000000,-0.000000,0.000000,0.000000,0.000000,6.600000,1.000000];
						mesh.bones = [bone];
						mesh.name = 'mesh_0';
						return mesh;
					})(),
				},
			},
		];
		const wrongData = [
			{
				fullText: '{\n"swName";\n2;\n1,\n2;\n1.000000,\n1.000000;\n1.000000,0.000000,0.000000,0.000000,0.000000,-0.000000,-1.000000,0.000000,0.000000,1.000000,-0.000000,0.000000,0.000000,0.000000,6.600000,1.000000;;\nSomethingWrong here }',
				mesh: new Types.Mesh(),
				exception: 'Unexpected token while parsing mesh skin weights node: SomethingWrong',
			},
		];
		test('General test', () => {
			testData.forEach(({fullText, mesh, expected}) => {
				const result = Parsers.skinWeightsNode(fullText, mesh);
				expect(result.valueLength).toEqual(expected.valueLength);
				expect(result.lines).toEqual(expected.lines);
				expect(result.nodeData).toEqual(expected.mesh);
			} );
			wrongData.forEach(({fullText, mesh, exception}) => {
				expect(() => Parsers.skinWeightsNode(fullText, mesh)).toThrow(exception);
			} );
		} );
	});
	describe('meshNode', () => {
		const testData = [
			{
				fullText: 'MyMeshName {\n3;\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;;\n2;\n3;0,1,2;;\n3;0,1,2;;\n}',
				expected: {
					valueLength: 'MyMeshName {\n3;\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;;\n2;\n3;0,1,2;;\n3;0,1,2;;\n}'.length,
					lines: 8,
					mesh: (() => {
						const mesh = new Types.Mesh();
						mesh.name = 'MyMeshName';
						mesh.vertices = [
							new Types.Vector3(1.000000, 0.000000, 0.000000),
							new Types.Vector3(1.000000, 0.000000, 0.000000),
							new Types.Vector3(1.000000, 0.000000, 0.000000),
						];
						const face1 = new Types.Face();
						face1.indices = [0, 1, 2];
						const face2 = new Types.Face();
						face2.indices = [0, 1, 2];
						mesh.vertexFaces = [face1, face2];
						return mesh;
					})(),
				},
			},
			{
				fullText: 'MyMeshName {\n3;\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;;\n2;\n3;0,1,2;;\n3;0,1,2;;\nMeshNormals {\n3;\n 0.0;0.0;0.0;,\n 0.0;0.0;0.0;,\n 0.0;0.0;0.0;,\n 2;\n 3,0,1,2;,\n 3,0,1,2;;}\n}',
				expected: {
					valueLength: 'MyMeshName {\n3;\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;;\n2;\n3;0,1,2;;\n3;0,1,2;;\nMeshNormals {\n3;\n 0.0;0.0;0.0;,\n 0.0;0.0;0.0;,\n 0.0;0.0;0.0;,\n 2;\n 3,0,1,2;,\n 3,0,1,2;;}\n}'.length,
					lines: 16,
					mesh: (() => {
						const mesh = new Types.Mesh();
						mesh.name = 'MyMeshName';
						mesh.vertices = [
							new Types.Vector3(1.000000, 0.000000, 0.000000),
							new Types.Vector3(1.000000, 0.000000, 0.000000),
							new Types.Vector3(1.000000, 0.000000, 0.000000),
						];
						const face1 = new Types.Face();
						face1.indices = [0, 1, 2];
						const face2 = new Types.Face();
						face2.indices = [0, 1, 2];
						mesh.vertexFaces = [face1, face2];
						mesh.normalFaces = [face1, face2];
						mesh.normals = [new Types.Vector3(0, 0, 0), new Types.Vector3(0, 0, 0), new Types.Vector3(0, 0, 0)];
						return mesh;
					})(),
				},
			},
			{
				fullText: 'MyMeshName {\n3;\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;;\n2;\n3;0,1,2;;\n3;0,1,2;;\nMeshTextureCoords {3;\n 0.000000;1.000000;\n0.000000;0.000000;\n1.000000;1.000000;;\n}\n}',
				expected: {
					valueLength: 'MyMeshName {\n3;\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;;\n2;\n3;0,1,2;;\n3;0,1,2;;\nMeshTextureCoords {3;\n 0.000000;1.000000;\n0.000000;0.000000;\n1.000000;1.000000;;\n}\n}'.length,
					lines: 13,
					mesh: (() => {
						const mesh = new Types.Mesh();
						mesh.name = 'MyMeshName';
						mesh.vertices = [
							new Types.Vector3(1.000000, 0.000000, 0.000000),
							new Types.Vector3(1.000000, 0.000000, 0.000000),
							new Types.Vector3(1.000000, 0.000000, 0.000000),
						];
						const face1 = new Types.Face();
						face1.indices = [0, 1, 2];
						const face2 = new Types.Face();
						face2.indices = [0, 1, 2];
						mesh.vertexFaces = [face1, face2];
						mesh.texCoords = [
							new Types.Vector2(0.000000, 1.000000),
							new Types.Vector2(0.000000, 0.000000),
							new Types.Vector2(1.000000, 1.000000),
						];
						return mesh;
					})(),
				},
			},
			{
				fullText: 'MyMeshName {\n3;\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;;\n2;\n3;0,1,2;;\n3;0,1,2;;\nMeshVertexColors {3;\n0;1.0,1.0,1.0,0.0;,\n1;0.0,0.0,0.0,0.0;,\n2;0.0,0.0,0.0,0.0;,}\n}',
				expected: {
					valueLength: 'MyMeshName {\n3;\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;;\n2;\n3;0,1,2;;\n3;0,1,2;;\nMeshVertexColors {3;\n0;1.0,1.0,1.0,0.0;,\n1;0.0,0.0,0.0,0.0;,\n2;0.0,0.0,0.0,0.0;,}\n}'.length,
					lines: 12,
					mesh: (() => {
						const mesh = new Types.Mesh();
						mesh.name = 'MyMeshName';
						mesh.vertices = [
							new Types.Vector3(1.000000, 0.000000, 0.000000),
							new Types.Vector3(1.000000, 0.000000, 0.000000),
							new Types.Vector3(1.000000, 0.000000, 0.000000),
						];
						const face1 = new Types.Face();
						face1.indices = [0, 1, 2];
						const face2 = new Types.Face();
						face2.indices = [0, 1, 2];
						mesh.vertexFaces = [face1, face2];
						mesh.colors = {
							0: new Types.Color(1.0, 1.0, 1.0, 0.0),
							1: new Types.Color(0.0, 0.0, 0.0, 0.0),
							2: new Types.Color(0.0, 0.0, 0.0, 0.0),
						};
						return mesh;
					})(),
				},
			},
			{
				fullText: 'MyMeshName {\n3;\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;;\n2;\n3;0,1,2;;\n3;0,1,2;;\nMeshMaterialList {\n2;\n2;\n0,\n1;;\n{RedMaterial}\n{GreenMaterial}\n}\n}',
				expected: {
					valueLength: 'MyMeshName {\n3;\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;;\n2;\n3;0,1,2;;\n3;0,1,2;;\nMeshMaterialList {\n2;\n2;\n0,\n1;;\n{RedMaterial}\n{GreenMaterial}\n}\n}'.length,
					lines: 16,
					mesh: (() => {
						const mesh = new Types.Mesh();
						mesh.name = 'MyMeshName';
						mesh.vertices = [
							new Types.Vector3(1.000000, 0.000000, 0.000000),
							new Types.Vector3(1.000000, 0.000000, 0.000000),
							new Types.Vector3(1.000000, 0.000000, 0.000000),
						];
						const face1 = new Types.Face();
						face1.indices = [0, 1, 2];
						const face2 = new Types.Face();
						face2.indices = [0, 1, 2];
						mesh.vertexFaces = [face1, face2];
						mesh.faceMaterials = [0, 1];
						mesh.materials = [
							(() => {
								const mat = new Types.Material();
								mat.name = 'RedMaterial';
								mat.isReference = true;
								return mat;
							})(),
							(() => {
								const mat = new Types.Material();
								mat.name = 'GreenMaterial';
								mat.isReference = true;
								return mat;
							})(),
						];
						return mesh;
					})(),
				},
			},
			{
				fullText: 'MyMeshName {\n3;\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;;\n2;\n3;0,1,2;;\n3;0,1,2;;\nVertexDuplicationIndices {\n2;\n2;\n0,\n1;;\n{RedMaterial}\n{GreenMaterial}\n}\nXSkinMeshHeader {\n2;\n2;\n0,\n1;;\n{RedMaterial}\n{GreenMaterial}\n}\nUnknownNode {\n2;\n2;\n0,\n1;;\n{RedMaterial}\n{GreenMaterial}\n}\n}',
				expected: {
					valueLength: 'MyMeshName {\n3;\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;;\n2;\n3;0,1,2;;\n3;0,1,2;;\nVertexDuplicationIndices {\n2;\n2;\n0,\n1;;\n{RedMaterial}\n{GreenMaterial}\n}\nXSkinMeshHeader {\n2;\n2;\n0,\n1;;\n{RedMaterial}\n{GreenMaterial}\n}\nUnknownNode {\n2;\n2;\n0,\n1;;\n{RedMaterial}\n{GreenMaterial}\n}\n}'.length,
					lines: 32,
					mesh: (() => {
						const mesh = new Types.Mesh();
						mesh.name = 'MyMeshName';
						mesh.vertices = [
							new Types.Vector3(1.000000, 0.000000, 0.000000),
							new Types.Vector3(1.000000, 0.000000, 0.000000),
							new Types.Vector3(1.000000, 0.000000, 0.000000),
						];
						const face1 = new Types.Face();
						face1.indices = [0, 1, 2];
						const face2 = new Types.Face();
						face2.indices = [0, 1, 2];
						mesh.vertexFaces = [face1, face2];
						return mesh;
					})(),
				},
			},
			{
				fullText: 'MyMeshName {\n3;\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;;\n2;\n3;0,1,2;;\n3;0,1,2;;\nSkinWeights {\n"swName";\n1;\n1;\n1.000000;\n1.000000,0.000000,0.000000,0.000000,0.000000,-0.000000,-1.000000,0.000000,0.000000,1.000000,-0.000000,0.000000,0.000000,0.000000,6.600000,1.000000;;\n}\n}',
				expected: {
					valueLength: 'MyMeshName {\n3;\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;;\n2;\n3;0,1,2;;\n3;0,1,2;;\nSkinWeights {\n"swName";\n1;\n1;\n1.000000;\n1.000000,0.000000,0.000000,0.000000,0.000000,-0.000000,-1.000000,0.000000,0.000000,1.000000,-0.000000,0.000000,0.000000,0.000000,6.600000,1.000000;;\n}\n}'.length,
					lines: 15,
					mesh: (() => {
						const mesh = new Types.Mesh();
						mesh.name = 'MyMeshName';
						mesh.vertices = [
							new Types.Vector3(1.000000, 0.000000, 0.000000),
							new Types.Vector3(1.000000, 0.000000, 0.000000),
							new Types.Vector3(1.000000, 0.000000, 0.000000),
						];
						const face1 = new Types.Face();
						face1.indices = [0, 1, 2];
						const face2 = new Types.Face();
						face2.indices = [0, 1, 2];
						mesh.vertexFaces = [face1, face2];
						const bone = new Types.Bone();
						bone.name = 'swName';
						const boneWeight = new Types.BoneWeight();
						boneWeight.boneIndex = 1;
						boneWeight.weight = 1.000000;
						bone.boneWeights = [boneWeight];
						bone.offsetMatrix = [1.000000,0.000000,0.000000,0.000000,0.000000,-0.000000,-1.000000,0.000000,0.000000,1.000000,-0.000000,0.000000,0.000000,0.000000,6.600000,1.000000];
						mesh.bones = [bone];
						return mesh;
					})(),
				},
			},
		];
		const wrongData = [
			{
				fullText: 'MyMeshName {\n3;\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;,\n1.000000;0.000000;0.000000;;\n2;\n3;0,1,2;;\n3;0,1,2;;\nSkinWeights {\n"swName";\n1;\n1;\n1.000000;\n1.000000,0.000000,0.000000,0.000000,0.000000,-0.000000,-1.000000,0.000000,0.000000,1.000000,-0.000000,0.000000,0.000000,0.000000,6.600000,1.000000;;\n}',
				exception: 'Unexpected end of file while parsing mesh',
			},
		];
		test('General test', () => {
			testData.forEach(({fullText, expected}) => {
				const result = Parsers.meshNode(fullText);
				expect(result.valueLength).toEqual(expected.valueLength);
				expect(result.lines).toEqual(expected.lines);
				expect(result.nodeData).toEqual(expected.mesh);
			} );
			wrongData.forEach(({fullText, exception}) => {
				expect(() => Parsers.meshNode(fullText)).toThrow(exception);
			} );
		});
	});
	describe('animTicksPerSecondNode', () => {
		const testData = [
			{
				fullText: '{\n1;\n}',
				expected: {
					valueLength: '{\n1;\n}'.length,
					lines: 2,
					animTicksPerSecond: 1,
				},
			},
			{
				fullText: '{\n10;\n}',
				expected: {
					valueLength: '{\n10;\n}'.length,
					lines: 2,
					animTicksPerSecond: 10,
				},
			},
			{
				fullText: '{\n10,\n}',
				expected: {
					valueLength: '{\n10,\n}'.length,
					lines: 2,
					animTicksPerSecond: 10,
				},
			},
		];
		const wrongData = [
			{
				fullText: '{\n10,\nWrong',
				exception: 'Unexpected token while parsing aminTicksPerSecond node: Wrong',
			},
		];
		test('General test', () => {
			testData.forEach(({fullText, expected}) => {
				const result = Parsers.animTicksPerSecondNode(fullText);
				expect(result.valueLength).toEqual(expected.valueLength);
				expect(result.lines).toEqual(expected.lines);
				expect(result.nodeData).toEqual(expected.animTicksPerSecond);
			} );
			wrongData.forEach(({fullText, exception}) => {
				expect(() => Parsers.animTicksPerSecondNode(fullText)).toThrow(exception);
			} );
		});
	});
});
