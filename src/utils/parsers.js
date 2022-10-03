const StringUtils = require('./string');
const Types = require('./types');

module.exports = {
	// headOfDataObject parser function. Input is the full text of the rest of the model file.
	// It reads the next token with the StringUtils.getNextToken function to a variable called headToken.
	// If the headToken.token is the '{', it updates the headToken.token to empty string and returns the headToken.
	// Otherwise, it reads the next token to a variable called openNode
	// if openNode.token is '{', it  increases the headToken.valueLength by the value of openNode.valueLength and
	// increases the headToken.lines by the value of openNode.lines and returns the headToken.
	headOfDataObject: function(fullText) {
		let headToken = StringUtils.getNextToken(fullText);
		if (headToken.nodeData === '{') {
			headToken.nodeData = '';
			return headToken;
		}
		let openNode = StringUtils.getNextToken(fullText.substring(headToken.valueLength));
		if (openNode.nodeData === '{') {
			headToken.valueLength += openNode.valueLength;
			headToken.lines += openNode.lines;
			return headToken;
		}
		throw 'Opening brace expected.';
	},
	// template node parser function. Input is the full text of the rest of the model file.
	// First it reads the head of the node with the headOfDataObject function to a variable called head.
	// Then it reads the next token to a variable called guid.
	// It reads the next token until it finds the closing brace.
	// It throws 'Unexpected end of file reached while parsing template definition' if the read token is empty string.
	templateNode: function(fullText) {
		let templateNode = new Types.ExportedNode(null);
		templateNode.updateExport(this.headOfDataObject(fullText));
		templateNode.updateExport(StringUtils.getNextToken(fullText.substring(templateNode.valueLength)));
		while (true) {
			const token = StringUtils.getNextToken(fullText.substring(templateNode.valueLength));
			templateNode.updateExport(token);
			if (token.nodeData === '') {
				throw 'Unexpected end of file reached while parsing template definition.';
			}
			if (token.nodeData === '}') {
				break;
			}
		}
		return templateNode;
	},
	// Parse a texture filename definition based on the assimp xfile parser logic
	// example content: '{\n"texture/SSR06_Born2_dif.png";\n}'
	textureFilenameNode: function(fullText) {
		let node = new Types.ExportedNode('');
		// ignore the whitespaces
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText));
		// read the opening brace with the headOfDataObject function
		node.updateExport(this.headOfDataObject(fullText.substring(node.valueLength)));
		// ignore the whitespaces
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		// Extract the texture filename from the material definition with the readString StringUtil function
		const textureFilename = StringUtils.readString(fullText.substring(node.valueLength));
		node.nodeData = textureFilename.nodeData;
		// increase the readUntil counter by the length of the read string
		node.valueLength += textureFilename.valueLength;
		// throw exception if the next character is not a semi-colon.
		if (fullText[node.valueLength] != ';') {
			throw 'Unexpected token while parsing texture filename.';
		}
		// increase the readUntil counter by the length of the semi-colon
		node.valueLength += 1;
		// ignore the whitespaces
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		// throw exception if the next token is not a closing brace.
		const closingBrace = StringUtils.getNextToken(fullText.substring(node.valueLength));
		if (closingBrace.nodeData != '}') {
			throw 'Unexpected token while parsing texture filename.';
		}
		// increase the readUntil counter by the length of the closing brace
		node.updateExport(closingBrace);
		return node;
	},
	// Parse a material object definition based on the assimp xfile parser logic
	// The assimp implementation is located in this link: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L655-L692
	materialNode: function(fullText) {
		let node = new Types.ExportedNode(null);
		let materialName = this.headOfDataObject(fullText);
		// if the material name is empty, generate a unique name prefixed with the string 'material_'
		if (materialName.nodeData === '') {
			materialName.nodeData = 'material_' + fullText.substring(materialName.valueLength).length;
		}
		node.nodeData = new Types.Material();
		node.nodeData.name = materialName.nodeData;
		node.updateExport(materialName);

		// ignore the whitespaces
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));

		// Extract the diffuse color from the material definition with the readRGBA StringUtil function
		const diffuseColor = StringUtils.readRGBA(fullText.substring(node.valueLength));
		// increase the node.valueLength counter by the length of the read RGBA string
		node.updateExport(diffuseColor);
		// Set the diffuse color of the material
		node.nodeData.color = new Types.Color(diffuseColor.nodeData.r, diffuseColor.nodeData.g, diffuseColor.nodeData.b);
		// Remove the white spaces and the separator characters that might be present.
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));

		// ignore the whitespaces
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));

		// Extract the shininess value from the material definition with the readFloat StringUtil function
		const shininess = StringUtils.readFloat(fullText.substring(node.valueLength));
		// increase the node.valueLength counter by the length of the read float string
		node.updateExport(shininess);
		// Set the shininess value of the material
		node.nodeData.shininess = shininess.nodeData;
		// Remove the white spaces and the separator characters that might be present.
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));

		// ignore the whitespaces
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));

		// Extract the specular color from the material definition with the readRGB StringUtil function
		const specularColor = StringUtils.readRGB(fullText.substring(node.valueLength));
		// increase the node.valueLength counter by the length of the read RGBA string
		node.updateExport(specularColor);
		// Set the specular color of the material
		node.nodeData.specular = new Types.Color(specularColor.nodeData.r, specularColor.nodeData.g, specularColor.nodeData.b);
		// Remove the white spaces and the separator characters that might be present.
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));

		// ignore the whitespaces
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));

		// Extract the emissive color from the material definition with the readRGB StringUtil function
		const emissiveColor = StringUtils.readRGB(fullText.substring(node.valueLength));
		// increase the node.valueLength counter by the length of the read RGBA string
		node.updateExport(emissiveColor);
		// Set the emissive color of the material
		node.nodeData.emissive = new Types.Color(emissiveColor.nodeData.r, emissiveColor.nodeData.g, emissiveColor.nodeData.b);
		// Remove the white spaces and the separator characters that might be present.
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));

		while (true) {
			let nextToken = StringUtils.getNextToken(fullText.substring(node.valueLength));
			node.updateExport(nextToken);
			if (nextToken.nodeData == '') {
				throw 'Unexpected end of file reached while parsing material';
			} else if (nextToken.nodeData == '}') {
				break;
			// handle the 'TextureFilename' token. Some exporters write "TextureFileName" instead.
			} else if (nextToken.nodeData == 'TextureFilename' || nextToken.nodeData == 'TextureFileName') {
				const textureName = this.textureFilenameNode(fullText.substring(node.valueLength));
				node.updateExport(textureName);
				node.nodeData.map = textureName.nodeData;
			// handle the 'NormalmapFilename' token. Some exporters write "NormalmapFileName" instead.
			} else if (nextToken.nodeData == 'NormalmapFilename' || nextToken.nodeData == 'NormalmapFileName') {
				const textureName = this.textureFilenameNode(fullText.substring(node.valueLength));
				node.updateExport(textureName);
				node.nodeData.normalMap = textureName.nodeData;
				// default to normalScale of Vector2(2,2)
				node.nodeData.normalScale = new Types.Vector2(2, 2);
			// handle the 'BumpmapFilename' token. Some exporters write "BumpmapFileName" instead.
			} else if (nextToken.nodeData == 'BumpmapFilename' || nextToken.nodeData == 'BumpmapFileName' || nextToken.nodeData == 'BumpMapFilename') {
				const textureName = this.textureFilenameNode(fullText.substring(node.valueLength));
				node.updateExport(textureName);
				node.nodeData.bumpMap = textureName.nodeData;
				// default to bumpScale of 1
				node.nodeData.bumpScale = 1;
			// handle the 'EmissiveMapFilename' token. Some exporters write "EmissiveMapFileName" instead.
			} else if (nextToken.nodeData == 'EmissiveMapFilename' || nextToken.nodeData == 'EmissiveMapFileName') {
				const textureName = this.textureFilenameNode(fullText.substring(node.valueLength));
				node.updateExport(textureName);
				node.nodeData.emissiveMap = textureName.nodeData;
			// handle the 'LightMapFilename' token. Some exporters write "LightMapFileName" instead.
			} else if (nextToken.nodeData == 'LightMapFilename' || nextToken.nodeData == 'LightMapFileName') {
				const textureName = this.textureFilenameNode(fullText.substring(node.valueLength));
				node.updateExport(textureName);
				node.nodeData.lightMap = textureName.nodeData;
			} else {
				throw 'Unexpected token while parsing material: ' + nextToken.nodeData;
			}
		}
		return node;
	},
	// MeshNormal node parser based on the assimp implementation: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L509-L544
	meshNormalNode(fullText, mesh) {
		let node = new Types.ExportedNode(mesh);
		let head = this.headOfDataObject(fullText);
		node.updateExport(head);
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		// read the number of normals
		let count = StringUtils.readInteger(fullText.substring(node.valueLength));
		node.updateExport(count);
		// Remove the white spaces and the separator characters that might be present.
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		// read the normals
		for (let i = 0; i < count.nodeData; i++) {
			let normal = StringUtils.readVector3(fullText.substring(node.valueLength));
			node.updateExport(normal);
			node.nodeData.normals.push(normal.nodeData);
			// Remove the white spaces and the separator characters that might be present.
			node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
			node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		}
		// read the number of faces.
		let numFaces = StringUtils.readInteger(fullText.substring(node.valueLength));
		node.updateExport(numFaces);
		if (numFaces.nodeData != node.nodeData.vertexFaces.length) {
			throw 'Normal face count does not match vertex face count.';
		}
		// Remove the white spaces and the separator characters that might be present.
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		if (numFaces.nodeData > 0) {
			// read the face indices
			for (let i = 0; i < numFaces.nodeData; i++) {
				const numIndices = StringUtils.readInteger(fullText.substring(node.valueLength));
				node.updateExport(numIndices);
				node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
				node.nodeData.normalFaces.push(new Types.Face());
				for (let j = 0; j < numIndices.nodeData; j++) {
					let index = StringUtils.readInteger(fullText.substring(node.valueLength));
					node.updateExport(index);
					node.nodeData.normalFaces[i].indices.push(index.nodeData);
					node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
				}
				// Remove the white spaces and the separator characters that might be present.
				node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
				node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
			}
			// Remove the white spaces and the separator characters that might be present.
			node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		}
		// The next token should be the closing brace
		let nextToken = StringUtils.getNextToken(fullText.substring(node.valueLength));
		node.updateExport(nextToken);
		if (nextToken.nodeData != '}') {
			throw 'Unexpected token while parsing mesh normals: ' + nextToken.nodeData;
		}
		return node;
	},
	// MeshTextureCoords node parser based on the assimp implementation: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L547-L563
	meshTextureCoordsNode(fullText, mesh) {
		let node = new Types.ExportedNode(mesh);
		let head = this.headOfDataObject(fullText);
		node.updateExport(head);
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		// read the number of texture coordinates
		const count = StringUtils.readInteger(fullText.substring(node.valueLength));
		node.updateExport(count);
		if (count.nodeData != node.nodeData.vertices.length) {
			throw 'Texture coordinate count does not match vertex face count.';
		}
		// Remove the white spaces and the separator characters that might be present.
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		for (let i = 0; i < count.nodeData; i++) {
			let uv = StringUtils.readVector2(fullText.substring(node.valueLength));
			node.updateExport(uv);
			node.nodeData.texCoords.push(uv.nodeData);
			// Remove the white spaces and the separator characters that might be present.
			node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
			node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		}
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		// The next token should be the closing brace
		let nextToken = StringUtils.getNextToken(fullText.substring(node.valueLength));
		node.updateExport(nextToken);
		if (nextToken.nodeData != '}') {
			throw 'Unexpected token while parsing mesh texture coords: ' + nextToken.nodeData;
		}
		return node;
	},
	// MeshVertexColors node parser based on the assimp implementation: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L566-L593
	meshVertexColorsNode(fullText, mesh) {
		let node = new Types.ExportedNode(mesh);
		let head = this.headOfDataObject(fullText);
		node.updateExport(head);
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		// read the number of colors
		const count = StringUtils.readInteger(fullText.substring(node.valueLength));
		node.updateExport(count);
		if (count.nodeData != node.nodeData.vertices.length) {
			throw 'Vertex color count does not match vertex count';
		}
		// Remove the white spaces and the separator characters that might be present.
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		for (let i = 0; i < count.nodeData; i++) {
			const index = StringUtils.readInteger(fullText.substring(node.valueLength));
			node.updateExport(index);
			if (index.nodeData >= node.nodeData.vertices.length) {
				throw 'Vertex color index out of bounds';
			}
			node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
			node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
			const color = StringUtils.readRGBA(fullText.substring(node.valueLength));
			node.updateExport(color);
			node.nodeData.colors[index.nodeData] = color.nodeData;
			// Remove the white spaces and the separator characters that might be present.
			node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
			node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		}
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		// The next token should be the closing brace
		let nextToken = StringUtils.getNextToken(fullText.substring(node.valueLength));
		node.updateExport(nextToken);
		if (nextToken.nodeData != '}') {
			throw 'Unexpected token while parsing mesh vertex colors: ' + nextToken.nodeData;
		}
		return node;
	},
	// MeshMaterialListNode based on the assimp implementation: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L596-L652
	meshMaterialListNode(fullText, mesh) {
		let node = new Types.ExportedNode(mesh);
		let head = this.headOfDataObject(fullText);
		node.updateExport(head);
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		// read the number of materials
		const count = StringUtils.readInteger(fullText.substring(node.valueLength));
		node.updateExport(count);
		// Remove the white spaces and the separator characters that might be present.
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		// read non triangulated face material index count
		const numMatIndices = StringUtils.readInteger(fullText.substring(node.valueLength));
		node.updateExport(numMatIndices);
		// Remove the white spaces and the separator characters that might be present.
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		// some models have a material index count of 1... to be able to read them we
		// replicate this single material index on every face
		if (numMatIndices.nodeData != node.nodeData.vertexFaces.length && numMatIndices.nodeData != 1){
			throw 'Per-Face material index count does not match face count';
		}
		// read per-face material indices
		for (let i = 0; i < numMatIndices.nodeData; i++) {
			const index = StringUtils.readInteger(fullText.substring(node.valueLength));
			node.updateExport(index);
			node.nodeData.faceMaterials.push(index.nodeData);
			// Remove the white spaces and the separator characters that might be present.
			node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
			node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		}
		// in certain versions, the face indices end with two semicolons.
		if (node.valueLength < fullText.length && fullText[node.valueLength] == ';') {
			// handle the second semicolon with increasing the value length
			node.valueLength++;
		}
		// Remove the white spaces and the separator characters that might be present.
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		// if there was only a single material index, replicate it on all faces
		while (node.nodeData.faceMaterials.length < node.nodeData.vertexFaces.length) {
			node.nodeData.faceMaterials.push(node.nodeData.faceMaterials[node.nodeData.faceMaterials.length-1]);
		}
		// read following data objects
		while (true) {
			let nextToken = StringUtils.getNextToken(fullText.substring(node.valueLength));
			node.updateExport(nextToken);
			if (nextToken.nodeData == '') {
				throw 'Unexpected end of file while parsing mesh material list';
			} else if (nextToken.nodeData == '}') {
				break;
			} else if (nextToken.nodeData == '{') {
				// In this case we have a material referenced by name
				const materialName = StringUtils.getNextToken(fullText.substring(node.valueLength));
				node.updateExport(materialName);
				const material = new Types.Material();
				material.name = materialName.nodeData;
				material.isReference = true;
				node.nodeData.materials.push(material);
				node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
				const closingBrace = StringUtils.getNextToken(fullText.substring(node.valueLength));
				node.updateExport(closingBrace);
				if (closingBrace.nodeData != '}') {
					throw 'Unexpected token while parsing mesh material list: ' + closingBrace.nodeData;
				}
				node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
			} else if (nextToken.nodeData == 'Material') {
				// inlined material
				const material = this.materialNode(fullText.substring(node.valueLength));
				node.updateExport(material);
				node.nodeData.materials.push(material.nodeData);
				node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
			} else if (nextToken.nodeData == ';') {
				// ignore semicolons
				node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
			} else {
				// ignore unknown data objects
				node.updateExport(this.unknownNode(fullText.substring(node.valueLength)));
			}
		}
		return node;
	},
	// UnknowDataObjectParser based on the assimp implementation: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L869-L895
	unknownNode(fullText) {
		const node = new Types.ExportedNode(null);
		const exceptionMessage = 'Unexpected end of file while parsing unknown data object';
		let depth = 0;
		// find the opening brace
		while (true) {
			const nextToken = StringUtils.getNextToken(fullText.substring(node.valueLength));
			node.updateExport(nextToken);
			if (nextToken.nodeData == '') {
				throw exceptionMessage;
			} else if (nextToken.nodeData == '{') {
				depth++;
				break;
			}
		}
		// find the closing brace
		while (depth > 0) {
			const nextToken = StringUtils.getNextToken(fullText.substring(node.valueLength));
			node.updateExport(nextToken);
			if (nextToken.nodeData == '') {
				throw exceptionMessage;
			} else if (nextToken.nodeData == '{') {
				depth++;
			} else if (nextToken.nodeData == '}') {
				depth--;
			}
		}
		return node;
	},
	// SkinWeightsNode Parser based on the assimp implementation: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L448-L495
	skinWeightsNode(fullText, mesh) {
		let node = new Types.ExportedNode(mesh);
		const head = this.headOfDataObject(fullText);
		node.updateExport(head);
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		const name = StringUtils.readString(fullText.substring(node.valueLength));
		node.updateExport(name);
		let bone = new Types.Bone();
		bone.name = name.nodeData;
		// Remove the white spaces and the separator characters that might be present.
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		// read the number of bones
		const numBones = StringUtils.readInteger(fullText.substring(node.valueLength));
		node.updateExport(numBones);
		// Remove the white spaces and the separator characters that might be present.
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		// read the bone indices
		for (let i = 0; i < numBones.nodeData; i++) {
			const boneIndex = StringUtils.readInteger(fullText.substring(node.valueLength));
			node.updateExport(boneIndex);
			const boneWeight = new Types.BoneWeight();
			boneWeight.boneIndex = boneIndex.nodeData;
			bone.boneWeights.push(boneWeight);
			// Remove the white spaces and the separator characters that might be present.
			node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
			node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		}
		// read the vertex weights
		for (let i = 0; i < numBones.nodeData; i++) {
			const vertexWeight = StringUtils.readFloat(fullText.substring(node.valueLength));
			node.updateExport(vertexWeight);
			bone.boneWeights[i].weight = vertexWeight.nodeData;
			// Remove the white spaces and the separator characters that might be present.
			node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
			node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		}
		// The next 16 floats are the bone offset matrix
		for (let i = 0; i < 16; i++) {
			const matrixValue = StringUtils.readFloat(fullText.substring(node.valueLength));
			node.updateExport(matrixValue);
			bone.offsetMatrix.push(matrixValue.nodeData);
			// Remove the separator character.
			node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		}
		// After the offset matrix, there is a semicolon.
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		// Remove the whitespaces.
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		// The next token should be the closing brace
		let nextToken = StringUtils.getNextToken(fullText.substring(node.valueLength));
		node.updateExport(nextToken);
		if (nextToken.nodeData != '}') {
			throw 'Unexpected token while parsing mesh skin weights node: ' + nextToken.nodeData;
		}
		// Update the mesh with the bone
		node.nodeData.bones.push(bone);
		return node;
	},
	// Mesh Node parser based on the assimp implementation: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L389-L445
	meshNode(fullText) {
		const meshName = this.headOfDataObject(fullText);
		let mesh = new Types.Mesh();
		mesh.name = meshName.nodeData;
		let node = new Types.ExportedNode(null);
		node.updateExport(meshName);
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		// Read the vertex count
		const vertexCount = StringUtils.readInteger(fullText.substring(node.valueLength));
		node.updateExport(vertexCount);
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		// read vertexCount.nodeData vertices into an array with the StringUtils.readVector3 function
		for (let i = 0; i < vertexCount.nodeData; i++) {
			const vertex = StringUtils.readVector3(fullText.substring(node.valueLength));
			node.updateExport(vertex);
			mesh.vertices.push(vertex.nodeData);
			// After the vector3, there is a semicolon.
			node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
			// Remove the whitespaces.
			node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		}
		// read the number of faces to a variable with the StringUtils.readInteger function
		const faceCount = StringUtils.readInteger(fullText.substring(node.valueLength));
		node.updateExport(faceCount);
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		for (let i = 0; i < faceCount.nodeData; i++) {
			const face = new Types.Face();
			const numIndices = StringUtils.readInteger(fullText.substring(node.valueLength));
			node.updateExport(numIndices);
			// the number is followed by a colon
			node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
			// read the indices
			for (let j = 0; j < numIndices.nodeData; j++) {
				const index = StringUtils.readInteger(fullText.substring(node.valueLength));
				node.updateExport(index);
				face.indices.push(index.nodeData);
				// Remove the separator character.
				node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
			}
			mesh.vertexFaces.push(face);
			// Remove the separator character, go to next character.
			node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
			node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		}
		// read following data objects
		while (true) {
			let nextToken = StringUtils.getNextToken(fullText.substring(node.valueLength));
			node.updateExport(nextToken);
			if (nextToken.nodeData == '') {
				throw 'Unexpected end of file while parsing mesh';
			} else if (nextToken.nodeData == '}') {
				break;
			} else if (nextToken.nodeData == 'MeshNormals') {
				const meshNormals = this.meshNormalNode(fullText.substring(node.valueLength), mesh);
				node.updateExport(meshNormals);
				mesh = meshNormals.nodeData;
			} else if (nextToken.nodeData == 'MeshTextureCoords') {
				const meshTextureCoords = this.meshTextureCoordsNode(fullText.substring(node.valueLength), mesh);
				node.updateExport(meshTextureCoords);
				mesh = meshTextureCoords.nodeData;
			} else if (nextToken.nodeData == 'MeshVertexColors') {
				const meshVertexColors = this.meshVertexColorsNode(fullText.substring(node.valueLength), mesh);
				node.updateExport(meshVertexColors);
				mesh = meshVertexColors.nodeData;
			} else if (nextToken.nodeData == 'MeshMaterialList') {
				const meshMaterialList = this.meshMaterialListNode(fullText.substring(node.valueLength), mesh);
				node.updateExport(meshMaterialList);
				mesh = meshMaterialList.nodeData;
			} else if (nextToken.nodeData == 'VertexDuplicationIndices') {
				// It is ignored by assimp, so we will ignore it too.
				node.updateExport(this.unknownNode(fullText.substring(node.valueLength)));
			} else if (nextToken.nodeData == 'XSkinMeshHeader') {
				// It is ignored by assimp, so we will ignore it too.
				node.updateExport(this.unknownNode(fullText.substring(node.valueLength)));
			} else if (nextToken.nodeData == 'SkinWeights') {
				const skinWeights = this.skinWeightsNode(fullText.substring(node.valueLength), mesh);
				node.updateExport(skinWeights);
				mesh = skinWeights.nodeData;
			} else {
				node.updateExport(this.unknownNode(fullText.substring(node.valueLength)));
			}
		}
		node.nodeData = mesh;
		return node;
	},
	// AnimTicksPerSecondNode parser based on the assimp implementation: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L695-L699
	animTicksPerSecondNode(fullText) {
		const node = new Types.ExportedNode(null);
		const head = this.headOfDataObject(fullText);
		node.updateExport(head);
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		const ticksPerSecond = StringUtils.readInteger(fullText.substring(node.valueLength));
		node.updateExport(ticksPerSecond);
		node.nodeData = ticksPerSecond.nodeData;
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		// The next token should be the closing brace
		const nextToken = StringUtils.getNextToken(fullText.substring(node.valueLength));
		node.updateExport(nextToken);
		if (nextToken.nodeData != '}') {
			throw 'Unexpected token while parsing aminTicksPerSecond node: ' + nextToken.nodeData;
		}
		return node;
	},
	// TransformationMatrixNode parser based on the assimp implementation: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L361-L386
	transformationMatrixNode(fullText) {
		const node = new Types.ExportedNode(null);
		const head = this.headOfDataObject(fullText);
		node.updateExport(head);
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		const matrix = [];
		for (let i = 0; i < 16; i++) {
			const value = StringUtils.readFloat(fullText.substring(node.valueLength));
			node.updateExport(value);
			matrix.push(value.nodeData);
			node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		}
		node.nodeData = matrix;
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		// The next token should be the closing brace
		const nextToken = StringUtils.getNextToken(fullText.substring(node.valueLength));
		node.updateExport(nextToken);
		if (nextToken.nodeData != '}') {
			throw 'Unexpected token while parsing transformationMatrix node: ' + nextToken.nodeData;
		}
		return node;
	},
	animationKeyNode(fullText, boneAnim) {
		const node = new Types.ExportedNode(boneAnim);
		const head = this.headOfDataObject(fullText);
		node.updateExport(head);
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		const keyType = StringUtils.readInteger(fullText.substring(node.valueLength));
		node.updateExport(keyType);
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		const numberOfKeys = StringUtils.readInteger(fullText.substring(node.valueLength));
		node.updateExport(numberOfKeys);
		node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));

		for (let i = 0; i < numberOfKeys.nodeData; i++) {
			const key = {};
			const time = StringUtils.readInteger(fullText.substring(node.valueLength));
			node.updateExport(time);
			node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));

			const readCount = StringUtils.readInteger(fullText.substring(node.valueLength));
			switch (keyType.nodeData) {
				case 0:
					// Rotation keys
					// The rotation keys are stored as quaternions
					const quaternion = new Types.TimedArray(4);
					node.updateExport(readCount);
					if (readCount.nodeData != 4) {
						throw 'Invalid number of arguments for quaternion key in animation';
					}
					node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
					quaternion.time = time.nodeData;
					for (let j = 0; j < readCount.nodeData; j++) {
						const value = StringUtils.readFloat(fullText.substring(node.valueLength));
						node.updateExport(value);
						quaternion.data.push(value.nodeData);
						node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
					}
					// It might be followed by multiple separators (;,)
					node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
					node.nodeData.rotationKeys.push(quaternion);
					break;
				case 1:
					// scale vector keys
					const scaleVector = new Types.TimedArray(3);
					node.updateExport(readCount);
					if (readCount.nodeData != 3) {
						throw 'Invalid number of arguments for scale vector in animation';
					}
					node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
					scaleVector.time = time.nodeData;
					for (let j = 0; j < readCount.nodeData; j++) {
						const value = StringUtils.readFloat(fullText.substring(node.valueLength));
						node.updateExport(value);
						scaleVector.data.push(value.nodeData);
						node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
					}
					// It might be followed by multiple separators (;,)
					node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
					node.nodeData.scaleKeys.push(scaleVector);
					break;
				case 2:
					// position vector keys
					const positionVector = new Types.TimedArray(3);
					node.updateExport(readCount);
					if (readCount.nodeData != 3) {
						throw 'Invalid number of arguments for position vector in animation';
					}
					node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
					positionVector.time = time.nodeData;
					for (let j = 0; j < readCount.nodeData; j++) {
						const value = StringUtils.readFloat(fullText.substring(node.valueLength));
						node.updateExport(value);
						positionVector.data.push(value.nodeData);
						node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
					}
					// It might be followed by multiple separators (;,)
					node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
					node.nodeData.positionKeys.push(positionVector);
					break;
				case 3:
				case 4:
					const matrix = new Types.TimedArray(16);
					node.updateExport(readCount);
					if (readCount.nodeData != 16) {
						throw 'Invalid number of arguments for matrix in animation';
					}
					node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
					matrix.time = time.nodeData;
					for (let j = 0; j < readCount.nodeData; j++) {
						const value = StringUtils.readFloat(fullText.substring(node.valueLength));
						node.updateExport(value);
						matrix.data.push(value.nodeData);
						node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
					}
					// It might be followed by multiple separators (;,)
					node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
					node.nodeData.matrixKeys.push(matrix);
					break;
				default:
					throw 'Invalid animation type';
			}
			node.updateExport(StringUtils.testForSeparator(fullText.substring(node.valueLength)));
			node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		}
		// The next token should be the closing brace
		const nextToken = StringUtils.getNextToken(fullText.substring(node.valueLength));
		node.updateExport(nextToken);
		if (nextToken.nodeData != '}') {
			throw 'Unexpected token while parsing animationKey node: ' + nextToken.nodeData;
		}
		return node;
	},
	animationNode(fullText, animation) {
		const node = new Types.ExportedNode(animation);
		const head = this.headOfDataObject(fullText);
		node.updateExport(head);
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		const boneAnimation = new Types.AnimBone();
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		while (true) {
			let nextToken = StringUtils.getNextToken(fullText.substring(node.valueLength));
			node.updateExport(nextToken);
			if (nextToken.nodeData == '') {
				throw 'Unexpected end of file while parsing animation node';
			} else if (nextToken.nodeData == '}') {
				break;
			} else if (nextToken.nodeData == 'AnimationKey') {
				const animationKey = this.animationKeyNode(fullText.substring(node.valueLength), boneAnimation);
				node.updateExport(animationKey);
				node.nodeData.boneAnimations.push(animationKey.nodeData);
				node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
			} else if (nextToken.nodeData == 'AnimationOptions') {
				// It is ignored by assimp, so we will ignore it too.
				node.updateExport(this.unknownNode(fullText.substring(node.valueLength)));
			} else if (nextToken.nodeData == '{') {
				node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
				const animName = StringUtils.getNextToken(fullText.substring(node.valueLength));
				node.updateExport(animName);
				boneAnimation.name = animName.nodeData;
				node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
				// The next token should be the closing brace
				const nameCloseBrace = StringUtils.getNextToken(fullText.substring(node.valueLength));
				node.updateExport(nameCloseBrace);
				if (nameCloseBrace.nodeData != '}') {
					throw 'Unexpected token while parsing animation node: ' + nameCloseBrace.nodeData;
				}
				node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
			} else {
				node.updateExport(this.unknownNode(fullText.substring(node.valueLength)));
			}
			node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		}
		return node;
	},
	animationSetNode(fullText) {
		const node = new Types.ExportedNode(null);
		const head = this.headOfDataObject(fullText);
		node.updateExport(head);
		let animation = new Types.Animation();
		animation.name = head.nodeData;
		node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		while (true) {
			let nextToken = StringUtils.getNextToken(fullText.substring(node.valueLength));
			node.updateExport(nextToken);
			if (nextToken.nodeData == '') {
				throw 'Unexpected end of file while parsing animationSet node';
			} else if (nextToken.nodeData == '}') {
				break;
			} else if (nextToken.nodeData == 'Animation') {
				const animationNode = this.animationNode(fullText.substring(node.valueLength), animation);
				node.updateExport(animationNode);
				animation = animationNode.nodeData;
				node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
			} else {
				node.updateExport(this.unknownNode(fullText.substring(node.valueLength)));
			}
			node.updateExport(StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
		}
		node.nodeData = animation;
		return node;
	},
}
