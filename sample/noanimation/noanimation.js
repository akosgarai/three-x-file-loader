var stats, controls;
var camera, scene, renderer;

(function () {
	init();
})();

function init() {

	const container = document.createElement('div');
	document.body.appendChild(container);
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
	scene = new THREE.Scene();
	scene.add(new THREE.AmbientLight(0x999999));
	// grid
	var gridHelper = new THREE.GridHelper(14, 1, 0x303030, 0x303030);
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
	controls.target.set(0, 2, 0);
	camera.position.set(2, 7, -28);
	camera.up.set(0, 1, 0);

	var light = new THREE.DirectionalLight(0xeeeeff, 2);
	light.position.set(10, 100, 1).normalize();
	scene.add(light);

	light = new THREE.DirectionalLight(0xaa5555);
	light.position.set(-1, -1, -1).normalize();
	scene.add(light);

	controls.update();
	window.addEventListener('resize', onWindowResize, false);
	animate();

	// model load
	// Define the loading manager and setup the url modifier to be able to download the textures.
	const manager = new THREE.LoadingManager();
	manager.setURLModifier((url) => {
		// When the lower case of the url ends with .png, then replace the url with the texturePath and extend it with the last fragment of the url.
		if (url.toLowerCase().endsWith('.png')) {
			return 'https://raw.githubusercontent.com/adrs2002/threeXfileLoader/master/sample/content/texture/' + url.split('/').pop();
		}
		return url;
	});

	var loader = new THREE.XFileLoader(manager);

	//download Model file
	loader.load(['https://raw.githubusercontent.com/adrs2002/threeXfileLoader/master/sample/content/SSR06_model.x'], function (object) {
		for (var i = 0; i < object.models.length; i++) {
			scene.add(object.models[i]);
		}
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
	stats.update();
	render();
}
function render() {
	renderer.render(scene, camera);
}
