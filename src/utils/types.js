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
		// is reference flag - if true, the material is given only by name
		this.isReference = false;
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
		this.name = '';	//mName
		// Normal vectors Vector3
		this.normals = [];	//mNormals
		// Normal face indices
		this.normalFaces = [];	//mNormFaces
		// Vertex positions Vector3
		this.vertices = [];	//mPositions
		// Vertex face indices
		this.vertexFaces = [];	//mPosFaces
		// number of texture coordinates
		this.numTexCoords = 0;	//mNumTextures
		// Texture coordinates Vector2
		this.texCoords = [];	//mTexCoords
		// number of colors
		this.numColors = 0;	//mNumColorSets
		// vertex colors
		this.colors = {};	//mColors
		// face materials
		this.faceMaterials = [];	//mFaceMaterials
		// materials
		this.materials = [];	//mMaterials
	}
};
module.exports = {
	Color,
	ExportedNode,
	Face,
	Material,
	Mesh,
	Scene,
	Vector2,
	Vector3,
};
