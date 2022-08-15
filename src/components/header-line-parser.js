module.exports = class HeaderLineParser {

	constructor(line) {
		this._parseHeaderLine(line);
	}

	/*
	 * Format example: 'xof 0303txt 0032'
	 **/
	_parseHeaderLine(headerLine) {
		if (typeof headerLine !== 'string') {
			throw 'Line is not string.';
		}
		if (!headerLine.startsWith('xof ')) {
			throw 'Header mismatch, file is not an XFile.';
		}
		this._fileMajorVersion = headerLine[4] + '' + headerLine[5];
		this._fileMinorVersion = headerLine[6] + '' + headerLine[7];
		this._fileFormat = headerLine.substring(8, 12);
		switch (this._fileFormat) {
			case 'txt ':
				this._fileCompressed = false;
				this._fileBinary = false;
				break;
			case 'bin ':
				this._fileCompressed = false;
				this._fileBinary = true;
				break;
			case 'tzip':
				this._fileCompressed = true;
				this._fileBinary = false;
				break;
			case 'bzip':
				this._fileCompressed = true;
				this._fileBinary = true;
				break;
			default:
				throw 'Unsupported x-file format: ' + this._fileFormat;
		}
	}
}
