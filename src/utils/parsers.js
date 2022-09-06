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
		if (headToken.token === '{') {
			headToken.token = '';
			return headToken;
		}
		let openNode = StringUtils.getNextToken(fullText.substring(headToken.valueLength));
		if (openNode.token === '{') {
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
		const head = this.headOfDataObject(fullText);
		const guid = StringUtils.getNextToken(fullText.substring(head.valueLength));
		let node = {
			valueLength: head.valueLength + guid.valueLength,
			lines: guid.lines + head.lines,
		};
		while (true) {
			const token = StringUtils.getNextToken(fullText.substring(node.valueLength));
			node.valueLength += token.valueLength;
			node.lines += token.lines;
			if (token.token === '') {
				throw 'Unexpected end of file reached while parsing template definition.';
			}
			if (token.token === '}') {
				break;
			}
		}
		return node;
	},
	// Parse a texture filename definition based on the assimp xfile parser logic
	// example content: '{\n"texture/SSR06_Born2_dif.png";\n}'
	textureFilenameNode: function(fullText) {
		let node = {
			valueLength: 0,
			lines: 0,
			fileName: '',
		};
		// ignore the whitespaces
		let skipped = StringUtils.readUntilNextNonWhitespace(fullText);
		node.valueLength += skipped.value;
		node.lines += skipped.lines;
		// read the opening brace with the headOfDataObject function
		let head = this.headOfDataObject(fullText.substring(node.valueLength));
		node.valueLength += head.valueLength;
		node.lines += head.lines;
		// ignore the whitespaces
		skipped = StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength));
		node.valueLength += skipped.value;
		node.lines += skipped.lines;
		// Extract the texture filename from the material definition with the readString StringUtil function
		const textureFilename = StringUtils.readString(fullText.substring(node.valueLength));
		node.fileName = textureFilename.value;
		// increase the readUntil counter by the length of the read string
		node.valueLength += textureFilename.valueLength;
		// throw exception if the next character is not a semi-colon.
		if (fullText[node.valueLength] != ';') {
			throw 'Unexpected token while parsing texture filename.';
		}
		// increase the readUntil counter by the length of the semi-colon
		node.valueLength += 1;
		// ignore the whitespaces
		skipped = StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength));
		node.valueLength += skipped.value;
		node.lines += skipped.lines;
		// throw exception if the next token is not a closing brace.
		const closingBrace = StringUtils.getNextToken(fullText.substring(node.valueLength));
		if (closingBrace.token != '}') {
			throw 'Unexpected token while parsing texture filename.';
		}
		// increase the readUntil counter by the length of the closing brace
		node.valueLength += closingBrace.valueLength;
		node.lines += closingBrace.lines;
		return node;
	},
	// Parse a material object definition based on the assimp xfile parser logic
	// The assimp implementation is located in this link: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L655-L692
	materialNode: function(fullText) {
		let node = {
			valueLength: 0,
			lines: 0,
			material: null,
		};
		let materialName = this.headOfDataObject(fullText);
		// if the material name is empty, generate a unique name prefixed with the string 'material_'
		if (materialName.token === '') {
			materialName.token = 'material_' + fullText.substring(materialName.valueLength).length;
		}
		node.material = new Types.Material();
		node.material.name = materialName.token;
		node.valueLength += materialName.valueLength;
		node.lines += materialName.lines;

		// ignore the whitespaces
		let skipped = StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength));
		node.valueLength += skipped.value;
		node.lines += skipped.lines;

		// Extract the diffuse color from the material definition with the readRGBA StringUtil function
		const diffuseColor = StringUtils.readRGBA(fullText.substring(node.valueLength));
		// increase the node.valueLength counter by the length of the read RGBA string
		node.valueLength += diffuseColor.valueLength;
		// Set the diffuse color of the material
		node.material.color = new Types.Color(diffuseColor.value.r, diffuseColor.value.g, diffuseColor.value.b);
		// Remove the white spaces and the separator characters that might be present.
		let skip = StringUtils.testForSeparator(fullText.substring(node.valueLength));
		node.valueLength += skip.value;
		node.lines += skip.lines;

		// ignore the whitespaces
		skipped = StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength));
		node.valueLength += skipped.value;
		node.lines += skipped.lines;

		// Extract the shininess value from the material definition with the readFloat StringUtil function
		const shininess = StringUtils.readFloat(fullText.substring(node.valueLength));
		// increase the node.valueLength counter by the length of the read float string
		node.valueLength += shininess.valueLength;
		// Set the shininess value of the material
		node.material.shininess = shininess.value;
		// Remove the white spaces and the separator characters that might be present.
		skip = StringUtils.testForSeparator(fullText.substring(node.valueLength));
		node.valueLength += skip.value;
		node.lines += skip.lines;

		// ignore the whitespaces
		skipped = StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength));
		node.valueLength += skipped.value;
		node.lines += skipped.lines;

		// Extract the specular color from the material definition with the readRGB StringUtil function
		const specularColor = StringUtils.readRGB(fullText.substring(node.valueLength));
		// increase the node.valueLength counter by the length of the read RGBA string
		node.valueLength += specularColor.valueLength;
		// Set the specular color of the material
		node.material.specular = new Types.Color(specularColor.value.r, specularColor.value.g, specularColor.value.b);
		// Remove the white spaces and the separator characters that might be present.
		skip = StringUtils.testForSeparator(fullText.substring(node.valueLength));
		node.valueLength += skip.value;
		node.lines += skip.lines;

		// ignore the whitespaces
		skipped = StringUtils.readUntilNextNonWhitespace(fullText.substring(node.valueLength));
		node.valueLength += skipped.value;
		node.lines += skipped.lines;

		// Extract the emissive color from the material definition with the readRGB StringUtil function
		const emissiveColor = StringUtils.readRGB(fullText.substring(node.valueLength));
		// increase the node.valueLength counter by the length of the read RGBA string
		node.valueLength += emissiveColor.valueLength;
		// Set the emissive color of the material
		node.material.emissive = new Types.Color(emissiveColor.value.r, emissiveColor.value.g, emissiveColor.value.b);
		// Remove the white spaces and the separator characters that might be present.
		skip = StringUtils.testForSeparator(fullText.substring(node.valueLength));
		node.valueLength += skip.value;
		node.lines += skip.lines;

		while (true) {
			let nextToken = StringUtils.getNextToken(fullText.substring(node.valueLength));
			node.valueLength += nextToken.valueLength;
			node.lines += nextToken.lines;
			if (nextToken.token == '') {
				throw 'Unexpected end of file reached while parsing material';
			} else if (nextToken.token == '}') {
				break;
			// handle the 'TextureFilename' token. Some exporters write "TextureFileName" instead.
			} else if (nextToken.token == 'TextureFilename' || nextToken.token == 'TextureFileName') {
				const textureName = this.textureFilenameNode(fullText.substring(node.valueLength));
				node.valueLength += textureName.valueLength;
				node.lines += textureName.lines;
				node.material.map = textureName.fileName;
			// handle the 'NormalmapFilename' token. Some exporters write "NormalmapFileName" instead.
			} else if (nextToken.token == 'NormalmapFilename' || nextToken.token == 'NormalmapFileName') {
				const textureName = this.textureFilenameNode(fullText.substring(node.valueLength));
				node.valueLength += textureName.valueLength;
				node.lines += textureName.lines;
				node.material.normalMap = textureName.fileName;
				// default to normalScale of Vector2(2,2)
				node.material.normalScale = new Types.Vector2(2, 2);
			// handle the 'BumpmapFilename' token. Some exporters write "BumpmapFileName" instead.
			} else if (nextToken.token == 'BumpmapFilename' || nextToken.token == 'BumpmapFileName' || nextToken.token == 'BumpMapFilename') {
				const textureName = this.textureFilenameNode(fullText.substring(node.valueLength));
				node.valueLength += textureName.valueLength;
				node.lines += textureName.lines;
				node.material.bumpMap = textureName.fileName;
				// default to bumpScale of 1
				node.material.bumpScale = 1;
			// handle the 'EmissiveMapFilename' token. Some exporters write "EmissiveMapFileName" instead.
			} else if (nextToken.token == 'EmissiveMapFilename' || nextToken.token == 'EmissiveMapFileName') {
				const textureName = this.textureFilenameNode(fullText.substring(node.valueLength));
				node.valueLength += textureName.valueLength;
				node.lines += textureName.lines;
				node.material.emissiveMap = textureName.fileName;
			// handle the 'LightMapFilename' token. Some exporters write "LightMapFileName" instead.
			} else if (nextToken.token == 'LightMapFilename' || nextToken.token == 'LightMapFileName') {
				const textureName = this.textureFilenameNode(fullText.substring(node.valueLength));
				node.valueLength += textureName.valueLength;
				node.lines += textureName.lines;
				node.material.lightMap = textureName.fileName;
			} else {
				throw 'Unexpected token while parsing material: ' + nextToken.token;
			}
		}
		return node;
	}
}
