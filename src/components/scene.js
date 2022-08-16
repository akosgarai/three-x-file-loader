const Node = require('./node');

module.exports = class Scene {
	rootNode;
	globalMeshes;
	globalMaterials;

	constructor() {
		this.rootNode = null;
		this.globalMeshes = [];
		this.globalMaterials = [];
	}

	addMesh(mesh) {
		this.globalMeshes.push(mesh);
	}

	addMaterial(material) {
		this.globalMaterials.push(material);
	}

	setRootNode(node) {
		this.rootNode = node;
	}
}
