export default class XFileLoader {

	constructor ( manager, texloader ) {
		this.manager = ( manager !== undefined ) ? manager : new THREE.DefaultLoadingManager();
		this.texloader = ( texloader !== undefined ) ? texloader : new THREE.TextureLoader();

		this._fileLoaderUrl = '';
		this._options = {};
		this._fileBinary = false;
		this._fileCompressed = false;
	}

	_setArgOption( _arg) {
		if ( !_arg ) {
			throw 'Missing arguments.';
		}
		if (_arg[0]) {
			this._fileLoaderUrl = _arg[0];
		}
		if (_arg[0]) {
			this.options = _arg[1];
		}
	}


	load( _arg, onLoad, onProgress, onError ) {
		this._setArgOption( _arg );
		const loader = new THREE.FileLoader( this.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.load( this._fileLoaderUrl, ( response ) => {
			this._parse( response, onLoad );
		}, onProgress, onError );
	}

	_parse( data, onLoad ) {
		this._parseHeaderLine(data);
		this.onLoad = onLoad;
		//const binData = this.ensureBinary( data );
		//this._data = this.ensureString( data );
		if (!this._fileCompressed && !this._fileBinary) {
			return this._fileParseAscii();
		}
		throw 'Unsupported file format.'
	}

	/*
	 * Format example: 'xof 0303txt 0032'
	 **/
	_parseHeaderLine(response) {
		const firstLine = (response.split(/\r?\n/))[0];
		if (!firstLine.startsWith('xof ')) {
			throw 'Header mismatch, file is not an XFile.';
		}
		this._fileMajorVersion = firstLine[4] + '' + firstLine[5]
		this._fileMinorVersion = firstLine[6] + '' + firstLine[7]
		this._fileFormat = firstLine.substring(8, 12);
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
