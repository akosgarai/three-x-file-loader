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
	// MeshNormal node parser based on the assim implementation: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L509-L544
	meshNormalNode(fullText, mesh) {
		let result = {
			valueLength: 0,
			lines: 0,
			mesh: mesh,
		};
		let head = this.headOfDataObject(fullText);
		result.valueLength += head.valueLength;
		result.lines += head.lines;
		// read the number of normals
		let count = StringUtils.readInteger(fullText.substring(result.valueLength));
		result.valueLength += count.valueLength;
		result.lines += count.lines;
	},
}
