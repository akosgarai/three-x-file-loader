import * as Parsers from '../utils/parsers.js';
import * as StringUtils from '../utils/string.js';
import * as Types from '../utils/types.js';

class TextParser {

	// It contains the text of the .X file
	fileContent;
	// It points to the index of the lastly processed file content.
	readUntil;
	// It stores the processed line numbers.
	lineNumber;
	// It stores the Scene data.
	exportScene;

	constructor(text) {
		this.fileContent = text;
		this.readUntil = 0;
		this.lineNumber = 0;
		// the first line is the format definition. Not connected to the model content.
		this.readUntil += StringUtils.readUntilEndOfLine(this.fileContent.substring(this.readUntil));
		this.lineNumber++;

		this.exportScene = new Types.Scene();
	}

	parse() {
		while (this.readUntil < this.fileContent.length) {
			const objectName = StringUtils.getNextToken(this.fileContent.substring(this.readUntil));
			this.readUntil += objectName.valueLength;
			this.lineNumber += objectName.lines;
			if (objectName.nodeData == '') {
				break;
			}
			this._parseObjectBasedOnName(objectName.nodeData);
			const skipped = StringUtils.readUntilNextNonWhitespace(this.fileContent.substring(this.readUntil));
			this.readUntil += skipped.valueLength;
			this.lineNumber += skipped.lines;
		}
		this._filterHierarchy(this.exportScene.rootNode);
		return this.exportScene;
	}

	_parseObjectBasedOnName(objectName) {
		switch (objectName) {
			case 'template':
				this._parseTemplateObject();
				break;
			case 'Frame':
				this._parseFrameObject();
				break;
			case 'Mesh':
				this._parseMeshObject();
				break;
			case 'AnimTicksPerSecond':
				this._parseAnimTicksPerSecondObject();
				break;
			case 'AnimationSet':
				this._parseAnimationSetObject();
				break;
			case 'Material':
				this._parseMaterialObject();
				break;
			case '}':
				break;
			default:
				this._parseUnknownObject();
				break;
		}
	}

	_parseTemplateObject() {
		const template = Parsers.templateNode(this.fileContent.substring(this.readUntil));
		this.readUntil += template.valueLength;
		this.lineNumber += template.lines;
	}
	_parseFrameObject() {
		const frame = Parsers.frameNode(this.fileContent.substring(this.readUntil));
		this.readUntil += frame.valueLength;
		this.lineNumber += frame.lines;
		if (this.exportScene.rootNode == null) {
			this.exportScene.rootNode = frame.nodeData;
		} else {
			// We already have a root node. We need to create a new root node and add the previous root node as a child.
			// Name the new root node as '$dummy_root', as it is called in the assimp implementation.
			// If the root node is the dummy root, then we can just add the new frame as a child.
			if (this.exportScene.rootNode.name == '$dummy_root') {
			} else {
				// We need to create a new root node.
				const newRoot = new Types.Node(null);
				newRoot.name = '$dummy_root';
				this.exportScene.rootNode.parent = newRoot;
				newRoot.childrenNodes.push(this.exportScene.rootNode);
				this.exportScene.rootNode = newRoot;
			}
			frame.nodeData.parentNode = this.exportScene.rootNode;
			this.exportScene.rootNode.childrenNodes.push(frame.nodeData);
		}
	}
	// parse a mesh object definition based on the assimp xfile parser.
	// The assimp implementation is located in this link: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L389-L445
	// The mesh has to be base on THREE.Mesh.
	_parseMeshObject(parentNode) {
		const mesh = Parsers.meshNode(this.fileContent.substring(this.readUntil));
		this.readUntil += mesh.valueLength;
		this.lineNumber += mesh.lines;
		this.exportScene.meshes.push(mesh.nodeData);
	}
	// Parse a material object definition based on the assimp xfile parser logic
	// The assimp implementation is located in this link: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L655-L692
	// The extracted material is stored in this.exportScene.materials
	_parseMaterialObject() {
		const material = Parsers.materialNode(this.fileContent.substring(this.readUntil));
		this.readUntil += material.valueLength;
		this.lineNumber += material.lines;
		this.exportScene.materials.push(material.nodeData);
	}
	_parseAnimTicksPerSecondObject() {
		const animTicksPerSecond = Parsers.animTicksPerSecondNode(this.fileContent.substring(this.readUntil));
		this.readUntil += animTicksPerSecond.valueLength;
		this.lineNumber += animTicksPerSecond.lines;
		this.exportScene.animTicksPerSecond = animTicksPerSecond.nodeData;
	}
	_parseAnimationSetObject() {
		const animationSet = Parsers.animationSetNode(this.fileContent.substring(this.readUntil));
		this.readUntil += animationSet.valueLength;
		this.lineNumber += animationSet.lines;
		this.exportScene.animations.push(animationSet.nodeData);
	}
	_parseUnknownObject() {
		const unknown = Parsers.unknownNode(this.fileContent.substring(this.readUntil));
		this.readUntil += unknown.valueLength;
		this.lineNumber += unknown.lines;
	}
	// Filters the imported hierarchy for some degenerated cases that some exporters produce.
	// if the node has just a single unnamed child containing a mesh, remove
	// the anonymous node between. The 3DSMax kwXport plugin seems to produce this
	// mess in some cases
	_filterHierarchy(parentNode) {
		if (parentNode.childrenNodes.length == 1 && parentNode.meshes.length == 0) {
			const childNode = parentNode.childrenNodes[0];
			if (childNode.name == '' && childNode.meshes.length > 0) {
				// transfer its meshes to the parent node
				for (let i = 0; i < childNode.meshes.length; i++) {
					parentNode.meshes.push(childNode.meshes[i]);
				}
				// transfer the transformations as well.
				// pNode->mTrafoMatrix = pNode->mTrafoMatrix * child->mTrafoMatrix;
				let multipliedMatrix = [];
				for (let i = 0; i < 4; i++) {
					for (let j = 0; j < 4; j++) {
						multipliedMatrix[i * 4 + j] = 0;
						for (let k = 0; k < 4; k++) {
							multipliedMatrix[i * 4 + j] += parentNode.trafoMatrix[i * 4 + k] * childNode.trafoMatrix[k * 4 + j];
						}
					}
				}
				parentNode.trafoMatrix = multipliedMatrix;
				parentNode.childrenNodes = [];
			}
		}
		// recurse for all children
		for (let i = 0; i < parentNode.childrenNodes.length; i++) {
			this._filterHierarchy(parentNode.childrenNodes[i]);
		}
	}
}
export {
	TextParser,
};
