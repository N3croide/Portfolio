import * as THREE from './three';
import { FirstPersonControls } from './three/addons/controls/FirstPersonControls.js';
import { FlakesTexture } from 'three/addons/textures/FlakesTexture.js';
import { EffectComposer, RenderPass } from './postprocessing';
import { shininess, specularColor } from './three/examples/jsm/nodes/Nodes.js';
import { CSS3DRenderer, CSS3DObject } from './three/addons/renderers/CSS3DRenderer.js';



// Crear la escena
const scene = new THREE.Scene();

scene.background = new THREE.Color(0x000000);

// Crear la cámara
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
// Crear Render
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = true;

// Render de pagina
const pagRender = new CSS3DRenderer();
pagRender.setSize(window.innerWidth,window.innerHeight);
pagRender.domElement.style.position = 'absolute';
pagRender.domElement.style.top = '0px';
pagRender.domElement.style.pointerEvents = 'none';
document.getElementById('universe').appendChild(pagRender.domElement);

const div = document.createElement('div');
div.textContent = 'HOA';
// const p = document.createElement('p');
// p.textContent = 'HOLA';
// div.appendChild(p);
div.style.backgroundColor = 'white';
const div3DCSS = new CSS3DObject(div);
scene.add(div3DCSS);


scene.traverse(obj => {
if (obj instanceof THREE.Mesh) {
    obj.castShadow = true;
    obj.receiveShadow = true;
}
});


renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('universe').appendChild(renderer.domElement);
const clock = new THREE.Clock();



// Crear controles de para la cámara
const controls = new FirstPersonControls(camera, renderer.domElement);
controls.lookSpeed = 0.08;
controls.lookVertical = true;
controls.constrainVertical = true;
controls.verticalMin = 0;
controls.verticalMax = Math.PI;



// Cargar la textura de la estrella
const loader = new THREE.TextureLoader();
const starTexture = loader.load('images/star.png'); // Ruta corregida según lo mencionado

// Crear la malla (grid) sin líneas diagonales
const createGridMesh = () => {
    const size = 2000;
    const divisions =100;
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.6 });
    const gridGeometry = new THREE.BufferGeometry();
    const points = [];

    for (let i = -size / 2; i <= size / 2; i += size / divisions) {
        points.push(-size / 2, -100, i, size / 2, -100, i); // Líneas paralelas al eje Z
        points.push(i, -100, -size / 2, i, -100, size / 2); // Líneas paralelas al eje X
    }

    gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    const gridMesh = new THREE.LineSegments(gridGeometry, gridMaterial);
    scene.add(gridMesh);
};


// Añadir estrellas (puntos)
let starVertices;
const addStars = () => {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ 
        color: 0xffffff, 
        size: 0.7, 
        map: starTexture, 
        transparent: false, 
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    starVertices = [];
    const spread = 1600;  // Rango de dispersión de las estrellas
    for (let i = 0; i <20000; i++) {
        const x = THREE.MathUtils.randInt(-spread, spread);
        const y = THREE.MathUtils.randInt(-spread, spread);
        const z = THREE.MathUtils.randInt(-spread, spread);
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

    const stars = new THREE.Points(starGeometry, starMaterial);
    return stars;
};

let isLeftMouseDown = false;
let isRightMouseDown = false;

// Capturar eventos del mouse para mover la cámara hacia adelante o atrás
document.addEventListener('mousedown', (event) => {
    if (event.button === 0) { // Botón izquierdo
        isLeftMouseDown = true;
    } else if (event.button === 2) { // Botón derecho
        isRightMouseDown = true;
    }
});

document.addEventListener('mouseup', (event) => {
    if (event.button === 0) { // Botón izquierdo
        isLeftMouseDown = false;
    } else if (event.button === 2) { // Botón derecho
        isRightMouseDown = false;
    }
});

//Generar sol

const sunGeo = new THREE.SphereGeometry(20,100,100);
const sunMa = new THREE.MeshBasicMaterial({
    color : 0x0000FF
});
const sun = new THREE.Mesh(sunGeo, sunMa);


//Generar planetas
function generatePlanet(size, texture, position){

    const geometry = new THREE.SphereGeometry(size,50,50);
    const maretial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF
    });

    const mesh = new THREE.Mesh(geometry, maretial);
    const obj = new THREE.Object3D();
    obj.add(mesh);
    scene.add(obj);
    mesh.position.x = position;
    return {mesh, obj}
};


//Crear planeteas
const marte = generatePlanet(40, null, 300);


//Generar luces
const pointLight = new THREE.PointLight(0xFFFFFF, 100000, 0);
pointLight.castShadow = true;
// pointLight.shadow.mapSize.width = 1024;
// pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.autoUpdate = true;
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 1000;
pointLight.shadow.camera.updateProjectionMatrix();
const lightHelper = new THREE.PointLightHelper(pointLight);
// pointLight.position.copy(lightPos);
scene.add(pointLight);

let texture = new THREE.CanvasTexture(new FlakesTexture());
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.x = 0;
texture.repeat.y = 0;

const ballMaterial = {
    clearcoat: 1.0,
    clearcoatRoughness:0,
    opacity: 0.4,
    transparent: true, // Importante para que la opacidad funcione
    transmission: 1,
    reflectivity: 2,
    ior : 1.05,
    normalMap: texture,
    normalScale: new THREE.Vector2(0.2,0.2),
    side: THREE.DoubleSide,
    specularColor: 0xFFFFFF,
    specularIntensity : 1,
    shininess: 60,
    color:0x000000,
    emissive:0x000000
}
//testeando luces

// Crear un material de vidrio para el casco de astronauta
const glassMaterial = new THREE.MeshPhongMaterial(ballMaterial);
glassMaterial.side = THREE.DoubleSide;
renderer.outputEncoding = THREE.sRGBEncoding;

const helmetGeometry = new THREE.SphereGeometry(10, 50, 50,);
helmetGeometry.computeVertexNormals();
const helmetMesh = new THREE.Mesh(helmetGeometry, glassMaterial);
camera.add(helmetMesh);
const helmetHlper = new THREE.AxesHelper();
helmetHlper.setColors(0x00FF00,0xFF0000,0xFFFFFF);
helmetMesh.add(helmetHlper);
// helmetMesh.position.set(0, 0, 0);

scene.add(lightHelper);
sun.add(pointLight);
sun.add(addStars())
scene.add(addStars())
scene.add(pointLight);
sun.position.x = 0;
// scene.add(sun);
// sun.add(camera);



const moveForward = () => {
    camera.position.add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(1));
};
const moveBackward = () => {
    camera.position.add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-0.4));
};


//Animate Sun
function animateSun(time){
    const positionAttribute = sun.geometry.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);

        // Ajustar la coordenada z del vértice para inestabilidad acumulativa
        vertex.z += Math.sin(vertex.x * 0.3 + time * 3) * 0.08; // Ajuste de frecuencia, velocidad y amplitud
        vertex.z += Math.cos(vertex.y * 0.3 + time * 5) * 0.09; // Otra componente de inestabilidad

        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    positionAttribute.needsUpdate = true;
}

createGridMesh();

scene.add(helmetMesh);

function attachHelment(time){

    const vector = new THREE.Vector3();
    camera.getWorldDirection(vector)
    helmetMesh.rotation.copy(camera.rotation);
    helmetMesh.position.copy(camera.position)
    // helmetMesh.position.z -= 20;
    // console.log('camara: ', vector.multiplyScalar(100));
    helmetMesh.updateMatrix();

}


const animate = () => {
    requestAnimationFrame(animate);
    
    const limit = 1300;
    //Aplicar límites para la cámara
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -limit, limit);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, -limit, limit);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -limit, limit);

    // Mover las estrellas
    for (let i = 0; i < starVertices.length; i += 3) {
        starVertices[i + 1] += 0.01;  // Ajusta la velocidad de movimiento
        if (starVertices[i + 1] > limit) {
            starVertices[i + 1] = -limit;  // Reinicia la posición si sale del rango
        }
    }
    scene.children.forEach(child => {
        if (child.isPoints) {
            child.geometry.attributes.position.needsUpdate = true;
        }
    });

    // Mover la cámara hacia adelante si el botón izquierdo del mouse está presionado
    if (isLeftMouseDown) {
        moveForward();
    }
    // Mover la cámara hacia atrás si el botón derecho del mouse está presionado
    if (isRightMouseDown) {
        moveBackward();
    }
    const time = clock.getElapsedTime();
    animateSun(time);
    attachHelment(time);
    // animateSun2(time);
    controls.update(0.03);  // Actualizar los controles
    helmetMesh.geometry.needsUpdate  = true;
    sun.rotateY(0.0004);
    marte.mesh.rotateY(0.04);
    marte.obj.rotateY(0.02);
    pagRender.render(scene, camera)
    renderer.render(scene, camera);
};

animate();

// Ajustar el tamaño del renderizador cuando se cambia el tamaño de la ventana
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    pagRender.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
});

// Ajustar la posición inicial de la cámara
// camera.position.set(10, 50, 100);  // Posición inicial de la cámara
