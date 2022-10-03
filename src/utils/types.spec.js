const Types = require('./types');

const someClass = class Whatever {};

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
			expect(scene.animations).toBeInstanceOf(Array);
			expect(scene.animations.length).toBe(0);
			expect(scene.animTicksPerSecond).toBe(0);
		});
	});
	describe('Face', () => {
		test('constructor', () => {
			const face = new Types.Face();
			expect(face.indices).toBeInstanceOf(Array);
			expect(face.indices.length).toBe(0);
		});
	});
	describe('BoneWeight', () => {
		test('constructor', () => {
			const bw = new Types.BoneWeight();
			expect(bw.weight).toBe(null);
			expect(bw.boneIndex).toBe(null);
		});
	});
	describe('Bone', () => {
		test('constructor', () => {
			const bone = new Types.Bone();
			expect(bone.name).toBe(null);
			expect(bone.boneWeights).toBeInstanceOf(Array);
			expect(bone.boneWeights.length).toBe(0);
			expect(bone.offsetMatrix).toBeInstanceOf(Array);
			expect(bone.offsetMatrix.length).toBe(0);
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
			expect(mesh.bones).toBeInstanceOf(Array);
			expect(mesh.bones.length).toBe(0);
		});
	});
	describe('TimedArray', () => {
		const testData = [ 3, 4, 16 ];
		test('constructor', () => {
			testData.forEach((data) => {
				const ta = new Types.TimedArray(data);
				expect(ta.dataLength).toBe(data);
				expect(ta.data).toBeInstanceOf(Array);
				expect(ta.data.length).toBe(0);
				expect(ta.time).toBe(null);
			} );
		});
	});
	describe('AnimBone', () => {
		test('constructor', () => {
			const ab = new Types.AnimBone();
			expect(ab.name).toBe('');
			expect(ab.positionKeys).toBeInstanceOf(Array);
			expect(ab.positionKeys.length).toBe(0);
			expect(ab.rotationKeys).toBeInstanceOf(Array);
			expect(ab.rotationKeys.length).toBe(0);
			expect(ab.scaleKeys).toBeInstanceOf(Array);
			expect(ab.scaleKeys.length).toBe(0);
			expect(ab.matrixKeys).toBeInstanceOf(Array);
			expect(ab.matrixKeys.length).toBe(0);
		});
	});
	describe('Animation', () => {
		test('constructor', () => {
			const anim = new Types.Animation();
			expect(anim.name).toBe('');
			expect(anim.boneAnimations).toBeInstanceOf(Array);
			expect(anim.boneAnimations.length).toBe(0);
		});
	});
	describe('Node', () => {
		describe('Constructor', () => {
			test('Data with parent not set', () => {
				const n = new Types.Node();
				expect(n.name).toBe('');
				expect(n.parentNode).toBe(null);
				expect(n.childrenNodes).toStrictEqual([]);
			});
			test('Data with not relevant parent', () => {
				const parentCandidates = ['', 12, {}, [], someClass];
				parentCandidates.forEach(parent => {
					const n = new Types.Node(parent);
					expect(n.name).toBe('');
					expect(n.parentNode).toBe(null);
					expect(n.childrenNodes).toStrictEqual([]);
				});
			});
			test('Data with a Node parent', () => {
				const parent = new Types.Node();
				const n = new Types.Node(parent);
				expect(n.name).toBe('');
				expect(n.parentNode).toBe(parent);
				expect(n.childrenNodes).toStrictEqual([]);
			});
		});
		describe('_isNode', () => {
			test('General test', () => {
				const notValidParents = ['', 12, {}, [], someClass];
				const n = new Types.Node();
				notValidParents.forEach(parent => {
					expect(n._isNode(parent)).toBe(false);
				});
				expect(n._isNode(new Types.Node())).toBe(true);
			});
		});
		describe('addChildren', () => {
			test('General test', () => {
				const notValidChildren = ['', 12, {}, [], someClass];
				const n = new Types.Node();
				const currentLength = n.childrenNodes.length;
				notValidChildren.forEach(child => {
					n.addChildren(child);
					expect(n.childrenNodes.length).toBe(currentLength);
				});
				const validChildren = [new Types.Node(), new Types.Node(), new Types.Node(), new Types.Node()];
				validChildren.forEach((child, index) => {
					n.addChildren(child);
					expect(n.childrenNodes.length).toBe(currentLength + index + 1);
				});
			});
		});
	});
});
