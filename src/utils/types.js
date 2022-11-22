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
class BoneWeight {
	constructor() {
		this.weight = null; // mWeight
		this.boneIndex = null; // mVertex
	}
}
class Bone {
	constructor() {
		this.name = null; // mName
		this.boneWeights = []; // mWeights
		this.offsetMatrix = []; // mOffsetMatrix
	}
}
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
		this.rootNode = null;
		this.materials = [];
		this.meshes = [];
		this.animations = [];
		this.animTicksPerSecond = 0;
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
		// bones
		this.bones = [];	//mBones
	}
};
// https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileHelper.h#L177-L180
// Possible to use for quaternions also.
class TimedArray {
	constructor(length) {
		this.dataLength = length;
		this.time = null;
		this.data = [];
	}
};
// https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileHelper.h#L182-L189
// either three separate key sequences for position, rotation, scaling
// or a combined key sequence of transformation matrices.
class AnimBone {
	constructor() {
		this.name = '';	//mBoneName
		this.positionKeys = [];	//mPosKeys
		this.rotationKeys = [];	//mRotKeys
		this.scaleKeys = [];	//mScaleKeys
		this.matrixKeys = [];	//mTrafoKeys
	}
};
// https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileHelper.h#L192-L200
class Animation {
	constructor() {
		this.name = '';	//mName
		// array of AnimBones.
		this.boneAnimations = [];	//mAnims
	}
};
// https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileHelper.h#L146-L175
class Node {
	constructor(parentNode) {
		this.name = '';
		this.parentNode = null;
		this.childrenNodes = [];
		this.meshes = [];
		this.transformation = [];	//mTrafoMatrix

		if (this._isNode(parentNode)) {
			this.parentNode = parentNode;
		}
	}

	_isNode(nodeCandidate) {
		return typeof nodeCandidate === 'object' && nodeCandidate !== null && nodeCandidate.constructor.name == 'Node';
	}

	addChildren(childNode) {
		if (this._isNode(childNode)) {
			this.childrenNodes.push(childNode);
		}
	}
}
export {
	AnimBone,
	Animation,
	Bone,
	BoneWeight,
	Color,
	ExportedNode,
	Face,
	Material,
	Mesh,
	Node,
	Scene,
	TimedArray,
	Vector2,
	Vector3,
};
