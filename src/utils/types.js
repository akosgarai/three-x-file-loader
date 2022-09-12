class ExportedNode {
	constructor(nodeDataDefault) {
		this.valueLength = 0;
		this.lines = 0;
		this.nodeData = nodeDataDefault;
	}

	updateExport(subExport) {
		this.valueLength += subExport.valueLength;
		this.lines += subExport.lines;
	}
};
class Vector3 {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
};
class Vector2 {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
};
class Color {
	constructor(r, g, b) {
		this.r = r;
		this.g = g;
		this.b = b;
	}
};
class Material {
	constructor() {
		this.name = '';
		this.color = new Color(0, 0, 0);
		this.shininess = 0;
		this.specular = new Color(0, 0, 0);
		this.emissive = new Color(0, 0, 0);
		// textureFileName
		this.map = '';
		// normalMapFileName
		this.normalMap = '';
		this.normalScale = new Vector2(1, 1);
		// bumpMapFileName
		this.bumpMap = '';
		this.bumpScale = 1;
		// emissiveMapFileName
		this.emissiveMap = '';
		// lightMapFileName
		this.lightMap = '';
	}
};
class Scene {
	constructor() {
		this.materials = [];
		this.meshes = [];
	}
};
// https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileHelper.h#L59-L62
class Face {
	constructor() {
		this.indices = [];
	}
}
// https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileHelper.h#L112-L144
class Mesh {
	constructor() {
		this.name = '';
		// Normal vectors Vector3
		this.normals = [];
		// Normal face indices
		this.normalFaces = [];
		// Vertex positions Vector3
		this.vertices = [];
		// Vertex face indices
		this.vertexFaces = [];

	}
};
module.exports = {
	Color,
	ExportedNode,
	Material,
	Vector2,
	Vector3,
};
