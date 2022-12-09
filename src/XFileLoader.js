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
			console.log('Frame has been processed.', this.meshes);

			setTimeout( () => {
				console.log('Executing onload form fileloader.');
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
			// set faces aka indices
			const indices = [];
			this._currentMesh.vertexFaces.forEach((face) => {
				//console.log('face', face.indices, vertices[face.indices[0]], vertices[face.indices[1]], vertices[face.indices[2]]);
				indices.push(face.indices[0], face.indices[1], face.indices[2]);
			});
			// set vertices
			const vertices = this._vector3sToFloat32Array(this._currentMesh.vertices, indices);
			geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
			// set faces aka indices for normals
			const indicesN = [];
			this._currentMesh.normalFaces.forEach((face) => {
				indicesN.push(face.indices[0], face.indices[1], face.indices[2]);
			});
			// set normals
			const normals = this._vector3sToFloat32Array(this._currentMesh.normals, indicesN);
			geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
			//geometry.setIndex(indices);
			const uvs = this._vector2sToFloat32Array(this._currentMesh.texCoords, indices);
			geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
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
					// The original xLoader sets the bumpScale to 0.05 by default.
					// In my case it defaults to 1 (see Material type constructor or materialNode parser),
					// as it is the default value for this property (according to the threejs docs).
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
			let mesh = null;
			if (this._currentMesh.bones.length > 0) {
				// define the bones based on the xLoader solution.
				// make bones from the current root node.
				const frameTransformationMatrix = new THREE.Matrix4().fromArray(currentObject.transformation);
				const bones = [];
				let tempBoneCountData = [];
				let tempBoneWeightData = [];
				let tempBoneIndexData = [];
				this._currentMesh.vertices.forEach((vertex) => {
					tempBoneCountData.push(0);
					tempBoneWeightData.push([0,0,0,0]);
					tempBoneIndexData.push([1,0,0,0]);
				});
				this._makeBones(currentObject.parentNode, bones);
				this._currentMesh.bones.forEach((bone) => {
					let boneIndex = 0;
					for ( let bb = 0; bb < bones.length; bb++ ) {
						if ( bones[ bb ].name === bone.name ) {
							boneIndex = bb;
							bones[ bb ].OffsetMatrix = new THREE.Matrix4().fromArray(bone.offsetMatrix);
							break;
						}
					}
					bone.boneWeights.forEach((boneWeight) => {
						const index = boneWeight.boneIndex;
						const weight = boneWeight.weight;
						tempBoneWeightData[index][tempBoneCountData[index]] = weight;
						tempBoneIndexData[index][tempBoneCountData[index]] = boneIndex;
						tempBoneCountData[index] += 1;
					});
				});
				const skinWeights = this._array4sToFloat32Array(tempBoneWeightData, indices);
				geometry.setAttribute('skinWeight', new THREE.BufferAttribute(skinWeights, 4));
				const skinIndices = this._array4sToFloat32Array(tempBoneIndexData, indices);
				geometry.setAttribute('skinIndex', new THREE.BufferAttribute(skinIndices, 4));
				materials.forEach((material) => {
					material.skinning = true;
				});
				mesh = new THREE.SkinnedMesh( geometry, materials.length === 1 ? materials[ 0 ] : materials );
				const offsetList = [];
				bones.forEach((bone) => {
					if (bone.OffsetMatrix) {
						offsetList.push(bone.OffsetMatrix);
					} else {
						offsetList.push(new THREE.Matrix4());
					}
				});
				const skeleton = new THREE.Skeleton(bones, offsetList);
				mesh.add(skeleton.bones[0]);
				mesh.bind(skeleton);
			} else {
				mesh = new THREE.Mesh( geometry, materials.length === 1 ? materials[ 0 ] : materials );
			}
			mesh.name = this._currentMesh.name;
			const worldBaseMx = new THREE.Matrix4();
			let currentMxFrame = currentObject.putBone;
			if ( currentMxFrame && currentMxFrame.parent ) {
				while ( true ) {
					currentMxFrame = currentMxFrame.parent;
					if ( currentMxFrame ) {
						worldBaseMx.multiply( currentMxFrame.FrameTransformMatrix );
					}
					else {
						break;
					}
				}
				mesh.applyMatrix4( worldBaseMx );
			}
			this.meshes.push(mesh);
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
					b.parent = outputBones[ i ];
					break;
				}
			}
		}
		outputBones.push( b );
		currentFrame.childrenNodes.forEach((child) => {
			this._makeBones(child, outputBones);
		});
	}
	_makeOutputAnimation() {
		if (this._currentAnimation && Object.keys(this._currentAnimation).length > 0) {
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
	_array4sToFloat32Array( vectors , indices ) {
		const floatArray = [];
		indices.forEach((index) => {
			const vector = vectors[index];
			floatArray.push(vector[0]);
			floatArray.push(vector[1]);
			floatArray.push(vector[2]);
			floatArray.push(vector[3]);
		});
		return new Float32Array(floatArray);
	}
	_vector3sToFloat32Array( vectors , indices ) {
		const floatArray = [];
		indices.forEach((index) => {
			const vector = vectors[index];
			floatArray.push(vector.x);
			floatArray.push(vector.y);
			floatArray.push(vector.z);
		});
		return new Float32Array(floatArray);
	}
	_vector2sToFloat32Array( vectors , indices ) {
		const floatArray = [];
		indices.forEach((index) => {
			const vector = vectors[index];
			floatArray.push(vector.x);
			floatArray.push(1 - vector.y);
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

		if (currentObject.parentNode) {
			currentObject.parentNode.putBone.add(currentObject.putBone);
		}
	}
}
