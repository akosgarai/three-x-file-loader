class Vector3 {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
};
class Vector2 {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
};
class Color {
	constructor(r, g, b) {
		this.r = r;
		this.g = g;
		this.b = b;
	}
};
class Material {
	constructor() {
		this.name = '';
		this.color = new Color(0, 0, 0);
		this.shininess = 0;
		this.specular = new Color(0, 0, 0);
		this.emissive = new Color(0, 0, 0);
		// textureFileName
		this.map = '';
		// normalMapFileName
		this.normalMap = '';
		this.normalScale = new Vector2(1, 1);
		// bumpMapFileName
		this.bumpMap = '';
		this.bumpScale = 1;
		// emissiveMapFileName
		this.emissiveMap = '';
		// lightMapFileName
		this.lightMap = '';
	}
};
module.exports = {
	Vector3,
	Vector2,
	Color,
	Material,
};
