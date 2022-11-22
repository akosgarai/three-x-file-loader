import { HeaderLineParser } from './components/header-line-parser.js';
import { TextParser } from './components/text-parser.js';

export default class XFileLoader {

	constructor ( manager, texloader ) {
		this.manager = ( manager !== undefined ) ? manager : new THREE.DefaultLoadingManager();
		this.texloader = ( texloader !== undefined ) ? texloader : new THREE.TextureLoader();

		this._fileLoaderUrl = '';
		this._options = {};
		this._headerInfo = null;
	}

	_setArgOption( _arg) {
		if ( !_arg ) {
			throw 'Missing arguments.';
		}
		if (_arg[0]) {
			this._fileLoaderUrl = _arg[0];
		}
		if (_arg[1]) {
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
		// make sure data is a string
		if ( typeof data !== "string" ) {
			const array_buffer = new Uint8Array( data );
			let str = '';
			for ( let i = 0; i < data.byteLength; i++ ) {
				str += String.fromCharCode( array_buffer[ i ] ); // implicitly assumes little-endian
			}
			data = str;
		}
		const lines = data.split(/\r?\n/);
		const firstLine = lines[0];
		this._headerInfo = new HeaderLineParser(firstLine);
		this.onLoad = onLoad;
		if (!this._headerInfo._fileCompressed && !this._headerInfo._fileBinary) {
			const parser = new TextParser(lines.slice(1).join('\n'));
			const exportScene = parser.parse();
			console.log(exportScene);
		}
		throw 'Unsupported file format.'
	}
}
