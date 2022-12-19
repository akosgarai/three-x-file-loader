var stats, controls;
var camera, scene, renderer;
var manager = null;

var Models = [];

var d = new Date();
var LastDateTime = null;

var animates = [];
var actions = [];
init();

function init() {

	LastDateTime = Date.now();

	const container = document.createElement('div');
	document.body.appendChild(container);
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
	scene = new THREE.Scene();
	scene.add(new THREE.AmbientLight(0xaaaaaa));
	// grid
	const gridHelper = new THREE.GridHelper(14, 1, 0x303030, 0x303030);
	gridHelper.position.set(0, -0.04, 0);
	scene.add(gridHelper);
	// stats
	stats = new Stats();
	container.appendChild(stats.dom);

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x666666);
	container.appendChild(renderer.domElement);

	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 5, 0);
	camera.position.set(2, 10, -28);
	camera.up.set(0, 1, 0);

	let light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(10, 100, -10).normalize();
	scene.add(light);

	light = new THREE.DirectionalLight(0x777666, 1);
	light.position.set(-1, -1, -1).normalize();
	scene.add(light);

	controls.update();
	window.addEventListener('resize', onWindowResize, false);
	animate();

	// model load
	// Define the loading manager and setup the url modifier to be able to download the textures.
	manager = new THREE.LoadingManager();
	manager.setURLModifier((url) => {
		// When the lower case of the url ends with .png, then replace the url with the texturePath and extend it with the last fragment of the url.
		if (url.toLowerCase().endsWith('.png')) {
			return 'https://raw.githubusercontent.com/adrs2002/threeXfileLoader/master/sample/content/texture/' + url.split('/').pop();
		}
		return url;
	});

	const loader = new THREE.XFileLoader(manager);

	actions[0] = {};
	actions[1] = {};
	//download Model file
	loader.load('https://raw.githubusercontent.com/adrs2002/threeXfileLoader/master/sample/content/SSR06_model.x', function (object) {

		for (var i = 0; i < object.models.length; i++) {
			Models.push(object.models[i]);
			object.models[i].position.x -= 5;
			object.models[i].position.z -= 5;
			const other = THREE.SkeletonUtils.clone(object.models[i]);
			other.position.x += 10;
			other.position.z += 10;
			Models.push(other);
		}

		loadAnimation('stand',0, () => {
			scene.add(Models[0]);
			if (Models[0] instanceof THREE.SkinnedMesh) {
				const skeletonHelper = new THREE.SkeletonHelper(Models[0]);
				scene.add(skeletonHelper);
			}
			actions[0]['stand'].play();
		});
		loadAnimation('stand',1, () => {
			scene.add(Models[1]);
			if (Models[1] instanceof THREE.SkinnedMesh) {
				const skeletonHelper = new THREE.SkeletonHelper(Models[1]);
				scene.add(skeletonHelper);
			}
			actions[1]['stand'].play();
		});

		object = null;
	}, null, null);

}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {

	requestAnimationFrame(animate);
	const nowTime = Date.now();
	const dulTime = nowTime - LastDateTime;
	LastDateTime = nowTime;

	if (animates != null && animates.length > 0) {
		for (var i = 0; i < animates.length; i++) {
			animates[i].update(dulTime);
		}
	}

	stats.update();
	render();
}

function render() {
	renderer.render(scene, camera);
}

function loadAnimation(animeName, modelId, _callback) {

	if(actions[modelId][animeName]) {
		if(_callback) {
			_callback();
		}
	} else {
		var loader2 = new THREE.XFileLoader(manager);
		loader2.load('https://raw.githubusercontent.com/adrs2002/threeXfileLoader/master/sample/content/' + animeName + '.x', function (data) {
			// associate divided model and animation.
			//START
			const animation = data.animations[0];
			const put = {};
			put.name = animation.name;
			put.hierarchy = [];
			for ( let b = 0; b < Models[modelId].skeleton.bones.length; b++ ) {
				let findAnimation = false;
				for ( let i = 0; i < animation.hierarchy.length; i++ ) {
					if ( Models[modelId].skeleton.bones[ b ].name === animation.hierarchy[ i ].name ) {
						findAnimation = true;
						const c_key = Object.assign({}, animation.hierarchy[ i ]);
						c_key.parent = -1;
						if ( Models[modelId].skeleton.bones[ b ].parent && Models[modelId].skeleton.bones[ b ].parent.type === "Bone" ) {
							for ( let bb = 0; bb < put.hierarchy.length; bb++ ) {
								if ( put.hierarchy[ bb ].name === Models[modelId].skeleton.bones[ b ].parent.name ) {
									c_key.parent = bb;
									c_key.parentName = Models[modelId].skeleton.bones[ b ].parent.name;
								}
							}
						}
						put.hierarchy.push( c_key );
						break;
					}
				}
				if ( !findAnimation ) {
					const c_key = Object.assign({}, animation.hierarchy[ 0 ]);
					c_key.name = Models[modelId].skeleton.bones[ b ].name;
					c_key.parent = -1;
					put.hierarchy.push( c_key );
				}
			}
			// in this case we only need for the rotation from the hierarchy, so that
			// we can delete the position and scale keys
			for ( let i = 0; i < put.hierarchy.length; i++ ) {
				put.hierarchy[i].keys.forEach( ( key ) => {
					delete key.pos;
					delete key.scl;
				});
			}
			if ( !Models[modelId].geometry.animations ) {
				Models[modelId].geometry.animations = [];
			}
			const animationClip = THREE.AnimationClip.parseAnimation(put, Models[modelId].skeleton.bones);
			Models[modelId].geometry.animations.push( animationClip );
			if ( !Models[modelId].animationMixer ) {
				Models[modelId].animationMixer = new THREE.AnimationMixer( Models[modelId] );
			}
			//END
			if(!animates[modelId]){
				animates[modelId] = Models[modelId].animationMixer;
			}

			Models[modelId].animationMixer.timeScale = 1/30;
			actions[modelId][animeName] =  Models[modelId].animationMixer.clipAction(animeName);
			if (animeName == 'stand') {
				actions[modelId][animeName].setLoop(THREE.LoopOnce);
			}
			actions[modelId][animeName].clampWhenFinished = true;

			if(_callback) {
				_callback();
				return;
			}
			actions[modelId][animeName].play();

		},  null, null);
	}
}

function mech_changeAnime(index, val){
	loadAnimation(val, index, function () {
		Object.keys(actions[index]).forEach(function (p) {
			if(p == val){
				actions[index][p].play();
			} else {
				actions[index][p].stop();
			}
		})
	});
}

