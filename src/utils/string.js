module.exports = {
	// https://en.cppreference.com/w/cpp/string/byte/isspace
	isSpace : function( currChar) {
		const countAsSpace = [' ', '\f', '\n', '\r', '\t', '\v'];
		return countAsSpace.indexOf(currChar) > -1;
	},
};
