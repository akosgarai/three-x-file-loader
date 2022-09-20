const Types = require('./types');

describe('Types', () => {
	describe('ExportedNode', () => {
		test('updateExport', () => {
			const testData = [
				{
					expectedValueLength: 0,
					expectedLines: 0,
				},
				{
					expectedValueLength: 1,
					expectedLines: 0,
				},
				{
					expectedValueLength: 5,
					expectedLines: 1,
				},
				{
					expectedValueLength: 5,
					expectedLines: 1,
				},
			];
			testData.forEach((data) => {
				const node = new Types.ExportedNode(0);
				expect(node.nodeData).toBe(0);
				const node2 = new Types.ExportedNode(null);
				expect(node2.nodeData).toBe(null);
				node2.valueLength = data.expectedValueLength;
				node2.lines = data.expectedLines;
				node.updateExport(node2);
				expect(node.nodeData).toBe(0);
				expect(node.valueLength).toBe(data.expectedValueLength);
				expect(node.lines).toBe(data.expectedLines);
			});
		});
	});
	describe('Vector3', () => {
		test('constructor', () => {
			const testData = [
				{ x: 0, y: 0, z: 0 },
				{ x: 1, y: 2, z: 3 },
				{ x: -1, y: -2, z: -3 },
				{ x: 1.1, y: 2.2, z: 3.3 },
			];
			testData.forEach((data) => {
				const vector = new Types.Vector3(data.x, data.y, data.z);
				expect(vector.x).toBe(data.x);
				expect(vector.y).toBe(data.y);
				expect(vector.z).toBe(data.z);
			});
		});
	});
	describe('Vector2', () => {
		test('constructor', () => {
			const testData = [
				{ x: 0, y: 0 },
				{ x: 1, y: 2 },
				{ x: -1, y: -2 },
				{ x: 1.1, y: 2.2 },
			];
			testData.forEach((data) => {
				const vector = new Types.Vector2(data.x, data.y);
				expect(vector.x).toBe(data.x);
				expect(vector.y).toBe(data.y);
			});
		});
	});
	describe('Color', () => {
		test('constructor', () => {
			const testData = [
				{ r: 0, g: 0, b: 0 },
				{ r: 1, g: 1, b: 1 },
				{ r: 0.5, g: 0.5, b: 0.5 },
				{ r: 0.1, g: 0.5, b: 0.9 },
			];
			testData.forEach((data) => {
				const color = new Types.Color(data.r, data.g, data.b);
				expect(color.r).toBe(data.r);
				expect(color.g).toBe(data.g);
				expect(color.b).toBe(data.b);
			});
		});
	});
	describe('Material', () => {
		test('constructor', () => {
			const material = new Types.Material();
			expect(material.color).toBeInstanceOf(Types.Color);
			expect(material.color.r).toBe(0);
			expect(material.color.g).toBe(0);
			expect(material.color.b).toBe(0);
			expect(material.shininess).toBe(0);
			expect(material.specular).toBeInstanceOf(Types.Color);
			expect(material.specular.r).toBe(0);
			expect(material.specular.g).toBe(0);
			expect(material.specular.b).toBe(0);
			expect(material.emissive).toBeInstanceOf(Types.Color);
			expect(material.emissive.r).toBe(0);
			expect(material.emissive.g).toBe(0);
			expect(material.emissive.b).toBe(0);
			expect(material.map).toBe('');
			expect(material.normalMap).toBe('');
			expect(material.normalScale).toBeInstanceOf(Types.Vector2);
			expect(material.normalScale.x).toBe(1);
			expect(material.normalScale.y).toBe(1);
			expect(material.bumpMap).toBe('');
			expect(material.bumpScale).toBe(1);
			expect(material.emissiveMap).toBe('');
			expect(material.lightMap).toBe('');
			expect(material.isReference).toBe(false);
		});
	});
	describe('Scene', () => {
		test('constructor', () => {
			const scene = new Types.Scene();
			expect(scene.materials).toBeInstanceOf(Array);
			expect(scene.materials.length).toBe(0);
			expect(scene.meshes).toBeInstanceOf(Array);
			expect(scene.meshes.length).toBe(0);
		});
	});
	describe('Face', () => {
		test('constructor', () => {
			const face = new Types.Face();
			expect(face.indices).toBeInstanceOf(Array);
			expect(face.indices.length).toBe(0);
		});
	});
	describe('Mesh', () => {
		test('constructor', () => {
			const mesh = new Types.Mesh();
			expect(mesh.name).toBe('');
			expect(mesh.normals).toBeInstanceOf(Array);
			expect(mesh.normals.length).toBe(0);
			expect(mesh.normalFaces).toBeInstanceOf(Array);
			expect(mesh.normalFaces.length).toBe(0);
			expect(mesh.vertices).toBeInstanceOf(Array);
			expect(mesh.vertices.length).toBe(0);
			expect(mesh.vertexFaces).toBeInstanceOf(Array);
			expect(mesh.vertexFaces.length).toBe(0);
			expect(mesh.numTexCoords).toBe(0);
			expect(mesh.texCoords).toBeInstanceOf(Array);
			expect(mesh.texCoords.length).toBe(0);
			expect(mesh.numColors).toBe(0);
			expect(mesh.colors).toBeInstanceOf(Object);
			expect(Object.keys(mesh.colors).length).toBe(0);
			expect(mesh.faceMaterials).toBeInstanceOf(Array);
			expect(mesh.faceMaterials.length).toBe(0);
			expect(mesh.materials).toBeInstanceOf(Array);
			expect(mesh.materials.length).toBe(0);
		});
	});
});
