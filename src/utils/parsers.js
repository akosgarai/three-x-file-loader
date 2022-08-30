const StringUtils = require('./string');

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
}
