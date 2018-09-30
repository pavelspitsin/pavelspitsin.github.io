'use strict';


class Material {

    constructor() {
        this.name = null;

        this.ambientColor = vec3.clone([1.0,1.0,1.0]);
        this.diffuseColor = vec3.clone([1.0,1.0,1.0]);
        this.specularColor = vec3.clone([0.0,0.0,0.0]);
        this.specularExponent = 0.0;

        this.diffuseMap = null;
        this.normalMap = null;
        this.alpha = 1.0;

    }

    static createDefaultMaterials() {
        let materials = [];
        materials["default"] = this.createDefault();

        return materials;
    }

    static createDefault() {
        let material = new Material();
        material.name = "default";

        return material;
    }

    static create(ambientColor, diffuseColor, specularColor, specularExponent, normalMap, diffuseMap, alpha) {

        let material = new Material();

        material.ambientColor = (ambientColor == null || ambientColor == undefined) ? material.ambientColor : ambientColor;
        material.diffuseColor = (diffuseColor == null || diffuseColor == undefined) ? material.diffuseColor : diffuseColor;
        material.specularColor = (specularColor == null || specularColor == undefined) ? material.specularColor : specularColor;
        material.specularExponent = (specularExponent == null || specularExponent == undefined) ? material.specularExponent : specularExponent;

        material.normalMap = (normalMap == null || normalMap == undefined) ? material.normalMap : normalMap;
        material.diffuseMap = (diffuseMap == null || diffuseMap == undefined) ? material.diffuseMap : diffuseMap;
        material.alpha = (alpha == null || alpha == undefined) ? material.alpha : alpha;

        return material;
    }

}

class Model {

    constructor(meshes, position, rotation, scale) {
        this.meshes = meshes;
        this.materials = null;
        this.position = (position == null || position == undefined) ? vec3.create() : position;
        this.rotation = (rotation == null || rotation == undefined) ? vec3.create() : rotation;
        this.scale = (scale == null || scale == undefined) ? vec3.clone([1,1,1]) : scale;

        this.quatRotate = quat.create();
        quat.fromEuler(this.quatRotate, this.rotation[0], this.rotation[1], this.rotation[2]);

    }

    init(gl) {
        for (let i = 0; i < this.meshes.length; ++i) {
            this.meshes[i].init(gl);
        }
    }

    addRotation(rotation) {
        this.rotation[0] += rotation[0];
        if (this.rotation[0] >= 360) {
            this.rotation[0] = this.rotation[0] - 360;
        }

        this.rotation[1] += rotation[1];
        if (this.rotation[1] >= 360) {
            this.rotation[1] = this.rotation[1] - 360;
        }
        this.rotation[2] += rotation[2];
        if (this.rotation[2] >= 360) {
            this.rotation[2] = this.rotation[2] - 360;
        }

        quat.fromEuler(this.quatRotate, this.rotation[0], this.rotation[1], this.rotation[2]);
    }

    setRotation(rotation) {
        this.rotation = vec3.clone(rotation);
        quat.fromEuler(this.quatRotate, this.rotation[0], this.rotation[1], this.rotation[2]);
    }
}


class Mesh {

    constructor() {
        this.vertices = [];
        this.normals = [];
        this.indices = [];
        this.tangents = null;
        this.materialName = null;
        this.texCoords = [];
        this.initialized = false;
        this.vao = null;
    }

    static create(vertices, normals, indices, texCoords, materialName) {

        let mesh = new Mesh();
        mesh.vertices = vertices;
        mesh.normals = normals;
        mesh.indices = indices;
        mesh.texCoords = texCoords;
        mesh.materialName = materialName;

        return mesh;
    }

    init(gl) {
        this.vao = this.createBuffers(gl);
        this.initialized = true;
        return this;
    }

    get hasTextureCoords() {
        return this.texCoords != null && this.texCoords != undefined && this.texCoords.length > 0 ;
      }

    get hasTangents() {
        return this.tangents != null && this.tangents != undefined && this.tangents.length > 0 ;
    }

    createBuffers(gl) {

        let vao = gl.createVertexArray();	
        let indexBuffer = gl.createBuffer();
        
        gl.bindVertexArray(vao);
        initArrayBuffer(gl, new Float32Array(this.vertices), 3, gl.FLOAT, "a_Position");
        initArrayBuffer(gl, new Float32Array(this.normals), 3, gl.FLOAT, "a_Normal");

        if (this.hasTangents != null)
            initArrayBuffer(gl, new Float32Array(this.tangents), 3, gl.FLOAT, "a_Tangent");

        if (this.hasTextureCoords)
            initArrayBuffer(gl, new Float32Array(this.texCoords), 2, gl.FLOAT, "a_TexCoord");	
                
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);		
            
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
        
        return vao;
    }
}


function initModels(gl, models, resourceManager) {

	// Plane
	models['plane'] = {
		model: null
	};

	models['plane'].model = CreatePlane();
	models['plane'].model.init(gl);
	models['plane'].model.scale = vec3.clone([80, 1, 80]);
	models['plane'].model.materials['default'].diffuseColor = [0.8, 0.8, 0.8];


	// Cube
	models['cube'] = {
		model: null,
		camEye: [0, 2, 6], 
		camCenter:[0, 0, 0]
	};	

	models['cube'].model = CreateCube('brick.JPG', 'brick_norm.JPG');
	models['cube'].model.init(gl);

	// Barrel
    models['barrel'] = {
        model: null,
		camEye: [0, 2, 6], 
		camCenter:[0, 0, 0]
    };	

    models['barrel'].model = resourceManager.models['barrel.obj'];
    models['barrel'].model.position = vec3.clone([0.0, 0.7, 1.0]);
    models['barrel'].model.scale = vec3.clone([0.20, 0.20, 0.20]);
    models['barrel'].model.init(gl);

	// Nanosuit
	models['nanosuit'] = {
		model: null,
		camEye: [0.0, 13.0, 19.0],
		camCenter:[0.0, 8.0, 0.0]
	};	

	models['nanosuit'].model = resourceManager.models['nanosuit.obj'];
	models['nanosuit'].model.init(gl);
}
  

function CreateCube(diffuseMap, normalMap) {

    let material = Material.createDefault();
    material.diffuseMap = diffuseMap;
    material.normalMap = normalMap;

    let mesh = CreateCubeMesh(material.name);
    mesh.tangents = ObjLoader.calculateTangents(mesh.indices, mesh.vertices, mesh.texCoords);
    let meshes = [];
    meshes.push(mesh);

    let position = vec3.create();
    let rotation = vec3.create();
    let scale = vec3.clone([1,1,1]);

    
    let model = new Model(meshes, position, rotation, scale);
    model.materials = [];
    model.materials[material.name] = material;

    return model;
}


function CreatePlane(diffuseMap, normalMap) {

    let material = Material.createDefault();
    material.diffuseMap = diffuseMap;
    material.normalMap = normalMap;

    let mesh = CreatePlaneMesh(material.name);
    mesh.tangents = ObjLoader.calculateTangents(mesh.indices, mesh.vertices, mesh.texCoords);
    let meshes = [];
    meshes.push(mesh);

    let position = vec3.create();
    let rotation = vec3.create();
    let scale = vec3.clone([1,1,1]);

    
    let model = new Model(meshes, position, rotation, scale);
    model.materials = [];
    model.materials[material.name] = material;

    return model;
}


function CreatePlaneMesh(materialName) {

    const vertices = [-1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0];
    const normals = [0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0];
    const texCoords = [1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    0.0, 0.0];
    const indices = [0, 1, 2,   0, 2, 3];

    return Mesh.create(vertices, normals, indices, texCoords, materialName);
}

function CreateCubeMesh(materialName) {

    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3

    const vertices = [   // Coordinates
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
       -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
       -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
    ];

    const normals = [    // Normal
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
       -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    ];


    const texCoords = [
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    1.0, 0.0,                      // v0-v1-v2-v3 fron     
        0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    1.0, 1.0,                      // v0-v3-v4-v5 righ    
        1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    0.0, 0.0,                      // v0-v5-v6-v1 up    
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    1.0, 0.0,                      // v1-v6-v7-v2 left    
        0.0, 1.0,   1.0, 1.0,   1.0, 0.0,    0.0, 0.0,                      // v7-v4-v3-v2 down    
        0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    0.0, 1.0                       // v4-v7-v6-v5 back
    ];
    
    const indices = [
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
       12,13,14,  12,14,15,    // left
       16,17,18,  16,18,19,    // down
       20,21,22,  20,22,23     // back
    ];

    return Mesh.create(vertices, normals, indices, texCoords, materialName);
}