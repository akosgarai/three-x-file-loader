const Scene = require('./scene');

const mockClass = class Whatever {};
describe('Scene', () => {
	describe('Constructor', () => {
		test('General Test', () => {
			const s = new Scene();
			expect(s.rootNode).toBe(null);
			expect(s.globalMeshes).toStrictEqual([]);
			expect(s.globalMaterials).toStrictEqual([]);
		});
	});
	describe('addMaterial', () => {
		test('General Test', () => {
			const testMaterials = [ new mockClass(), new mockClass(), new mockClass(), new mockClass()];
			const s = new Scene();
			testMaterials.forEach((mat, index) => {
				s.addMaterial(mat);
				expect(s.globalMaterials.length).toBe(index+1);
			});
		});
	});
	describe('addMesh', () => {
		test('General Test', () => {
			const testMeshes = [ new mockClass(), new mockClass(), new mockClass(), new mockClass()];
			const s = new Scene();
			testMeshes.forEach((msh, index) => {
				s.addMesh(msh);
				expect(s.globalMeshes.length).toBe(index+1);
			});
		});
	});
	describe('setRootNode', () => {
		test('General Test', () => {
			const testNodes = [ new mockClass(), new mockClass(), new mockClass(), new mockClass()];
			const s = new Scene();
			testNodes.forEach((node, index) => {
				s.setRootNode(node);
				expect(s.rootNode).toBe(node);
			});
		});
	});
});
