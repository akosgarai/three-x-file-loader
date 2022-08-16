module.exports = class Node {

	name;
	parentNode;
	childrenNodes;

	constructor(parentNode) {
		this.name = '';
		this.parentNode = null;
		this.childrenNodes = [];

		if (this._isNode(parentNode)) {
			this.parentNode = parentNode;
		}
	}

	_isNode(nodeCandidate) {
		return typeof nodeCandidate === 'object' && nodeCandidate.constructor.name == 'Node';
	}

	addChildren(childNode) {
		if (this._isNode(childNode)) {
			this.childrenNodes.push(childNode);
		}
	}
}
