import { HeaderLineParser } from './components/header-line-parser.js';
import { TextParser } from './components/text-parser.js';

export default class XFileLoader {

	constructor ( manager, texloader ) {
		this.manager = ( manager !== undefined ) ? manager : new THREE.DefaultLoadingManager();
		this.texloader = ( texloader !== undefined ) ? texloader : new THREE.TextureLoader();

		this._fileLoaderUrl = '';
		this._options = {};
		this._headerInfo = null;
		// The following variables are used to store the data of the extracted three.js objects.
		this.meshes = [];
		this.animations = [];
		// The following variables are used to store the data of the current object
		this._currentObject = {};
		this._currentMesh = {};
		this._currentAnimation = {};
		// The exported scene is stored in this variable.
		this._exportScene = {};
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
			this._exportScene = parser.parse();
			this._initCurrentAnimationAndMesh();
			this._currentObject = this._exportScene.rootNode;
			console.log('exportScene', this._exportScene);
			this._processFrame(this._currentObject);

			setTimeout( () => {
				this.onLoad( {
					models: this.meshes,
					animations: this.animations
				} )
			}, 1 );
		} else {
			throw 'Unsupported file format.'
		}
	}
	// _initCurrentAnimationAndMesh creates the output mesh or animation from the current objects
	// and adds them to the output arrays. Then it resets the current animation and mesh.
	_initCurrentAnimationAndMesh() {
		this._makeOutputMesh();
		this._currentMesh = {};
		this._makeOutputAnimation();
		this._currentAnimation = {};
	}
	_makeOutputMesh(currentObject) {
		console.log('current output mesh', this._currentMesh, currentObject);
		if (this._currentMesh && Object.keys(this._currentMesh).length > 0) {
			const geometry = new THREE.BufferGeometry();
			// set vertices
			const vertices = this._vector3sToFloat32Array(this._currentMesh.vertices);
			geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
			// set faces aka indices
			const indices = [];
			this._currentMesh.vertexFaces.forEach((face) => {
				indices.push(face[0], face[1], face[2]);
			});
			geometry.setIndex(indices);
			// set materials
			const materials = [];
			this._currentMesh.materials.forEach((material) => {
				const mpMat = new THREE.MeshPhongMaterial();
				mpMat.name = material.name;
				mpMat.color = new THREE.Color(material.color.r, material.color.g, material.color.b);
				mpMat.shininess = material.shininess;
				mpMat.specular = new THREE.Color(material.specular.r, material.specular.g, material.specular.b);
				mpMat.emissive = new THREE.Color(material.emissive.r, material.emissive.g, material.emissive.b);
				if (material.map) {
					mpMat.map = this.texloader.load(material.map);
				}
				if (material.bumpMap) {
					mpMat.bumpMap = this.texloader.load(material.bumpMap);
					mpMat.bumpScale = material.bumpScale;
				}
				if (material.normalMap) {
					mpMat.normalMap = this.texloader.load(material.normalMap);
					mpMat.normalScale = new THREE.Vector2(material.normalScale.x, material.normalScale.y);
				}
				if (material.emissiveMap) {
					mpMat.emissiveMap = this.texloader.load(material.emissiveMap);
				}
				if (material.lightMap) {
					mpMat.lightMap = this.texloader.load(material.lightMap);
				}
				materials.push(mpMat);
			});
			if (this._currentMesh.bones.length > 0) {
				// define the bones based on the xLoader solution.
				// make bones from the current root node.
				const frameTransformationMatrix = new THREE.Matrix4().fromArray(currentObject.transformation);
				const bones = [];
				this._makeBones(currentObject.parentNode, bones);
				console.log('geometry', geometry);
				console.log('bones', bones);
			} else {
				const mesh = new THREE.Mesh( geometry, materials.length === 1 ? materials[ 0 ] : materials );
				this.meshes.push(mesh);
			}
		}
	}
	// It creates the bone hierarchy from the current object
	_makeBones(currentFrame, outputBones) {
		const frameTransformationMatrix = new THREE.Matrix4().fromArray(currentFrame.transformation);
		const b = new THREE.Bone();
		b.name = currentFrame.name;
		b.applyMatrix4( frameTransformationMatrix );
		b.matrixWorld = b.matrix;
		b.FrameTransformMatrix = frameTransformationMatrix;
		b.pos = new THREE.Vector3()
			.setFromMatrixPosition( b.FrameTransformMatrix )
			.toArray();
		b.rotq = new THREE.Quaternion()
			.setFromRotationMatrix( b.FrameTransformMatrix )
			.toArray();
		b.scl = new THREE.Vector3()
			.setFromMatrixScale( b.FrameTransformMatrix )
			.toArray();
		if ( currentFrame.parentNode ) {
			for ( let i = 0; i < outputBones.length; i++ ) {
				if ( currentFrame.parentNode.name === outputBones[ i ].name ) {
					outputBones[ i ].add( b );
					b.parent = i;
					break;
				}
			}
		}
		outputBones.push( b );
		console.log('Frame finished ' + currentFrame.name, outputBones);
		currentFrame.childrenNodes.forEach((child) => {
			console.log('Make Bone Child ', child.name);
			this._makeBones(child, outputBones);
		});
	}
	_makeOutputAnimation() {
		if (this._currentAnimation) {
			this.animations.push(this._currentAnimation);
		}
	}
	_processFrame(currentObject) {
		// Make bone from the current frame object.
		this._boneFromCurrentObject(currentObject);
		currentObject.meshes.forEach((currentMesh) => {
			if (currentMesh.bones) {
				console.log('currentMesh.bones', currentMesh.name, currentMesh.bones.length);
			}
			this._currentMesh = currentMesh;
			this._makeOutputMesh(currentObject);
		});
		currentObject.childrenNodes.forEach((child) => {
			//console.log('child', child);
			this._processFrame(child);
		});
	}
	_vector3sToFloat32Array( vectors ) {
		const floatArray = [];
		vectors.forEach((vector) => {
			floatArray.push(vector.x);
			floatArray.push(vector.y);
			floatArray.push(vector.z);
		});
		return new Float32Array(floatArray);
	}
	_boneFromCurrentObject(currentObject) {
		const frameTransformationMatrix = new THREE.Matrix4().fromArray(currentObject.transformation);
		const b = new THREE.Bone();
		b.name = currentObject.name;
		b.applyMatrix4( frameTransformationMatrix );
		b.matrixWorld = b.matrix;
		b.FrameTransformMatrix = frameTransformationMatrix;
		currentObject.putBone = b;
	}
}
