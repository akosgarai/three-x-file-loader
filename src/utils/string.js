module.exports = {
	// https://en.cppreference.com/w/cpp/string/byte/isspace
	isSpace : function( currChar) {
		const countAsSpace = [' ', '\f', '\n', '\r', '\t', '\v'];
		return countAsSpace.indexOf(currChar) > -1;
	},
	readInteger: function(fullText) {
		let result = {
			value: 0,
			valueLength: 0,
		};
		let isNegative = false;

		if (fullText[result.valueLength] == '-') {
			isNegative = true;
			++result.valueLength;
		}
		if (isNaN(parseInt(fullText[result.valueLength], 10))) {
			throw 'Number expected.'
		}
		while (result.valueLength < fullText.length) {
			let currentDigit = parseInt(fullText[result.valueLength], 10);
			if (isNaN(currentDigit)) {
				break;
			}
			result.value = result.value * 10 + currentDigit;
			++result.valueLength;
		}
		if (isNegative) {
			result.value = -1*result.value;
		}

		return result;
	},
};
