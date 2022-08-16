const Node = require('./node');

const someClass = class Whatever {};

describe('Node', () => {
	describe('Constructor', () => {
		test('Data with parent not set', () => {
			const n = new Node();
			expect(n.name).toBe('');
			expect(n.parentNode).toBe(null);
			expect(n.childrenNodes).toStrictEqual([]);
		});
		test('Data with not relevant parent', () => {
			const parentCandidates = ['', 12, {}, [], someClass];
			parentCandidates.forEach(parent => {
				const n = new Node(parent);
				expect(n.name).toBe('');
				expect(n.parentNode).toBe(null);
				expect(n.childrenNodes).toStrictEqual([]);
			});
		});
		test('Data with a Node parent', () => {
			const parent = new Node();
			const n = new Node(parent);
			expect(n.name).toBe('');
			expect(n.parentNode).toBe(parent);
			expect(n.childrenNodes).toStrictEqual([]);
		});
	});
	describe('_isNode', () => {
		test('General test', () => {
			const notValidParents = ['', 12, {}, [], someClass];
			const n = new Node();
			notValidParents.forEach(parent => {
				expect(n._isNode(parent)).toBe(false);
			});
			expect(n._isNode(new Node())).toBe(true);
		});
	});
	describe('addChildren', () => {
		test('General test', () => {
			const notValidChildren = ['', 12, {}, [], someClass];
			const n = new Node();
			const currentLength = n.childrenNodes.length;
			notValidChildren.forEach(child => {
				n.addChildren(child);
				expect(n.childrenNodes.length).toBe(currentLength);
			});
			const validChildren = [new Node(), new Node(), new Node(), new Node()];
			validChildren.forEach((child, index) => {
				n.addChildren(child);
				expect(n.childrenNodes.length).toBe(currentLength + index + 1);
			});
		});
	});
});
