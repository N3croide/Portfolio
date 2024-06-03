import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/controls/OrbitControls.js';

// Crear la escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Crear la cámara
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);

// Crear el renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('universe').appendChild(renderer.domElement);

// Crear controles de órbita para la cámara
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI;
controls.enableRotate = false; // Deshabilitar rotación con el click

// Cargar la textura de la estrella
const loader = new THREE.TextureLoader();
const starTexture = loader.load('images/star.png'); // Ruta corregida según lo mencionado

// Crear el plano de la malla (suelo)
const createGrid = () => {
    const size = 1000;
    const divisions = 100;
    const gridHelper = new THREE.GridHelper(size, divisions, 0x888888, 0x444444);
    gridHelper.position.y = 0;  // Posicionar la malla en y=0
    scene.add(gridHelper);
};

createGrid();

// Añadir estrellas (puntos)
let starVertices;
const addStars = () => {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ 
        color: 0xffffff, 
        size: 0.5, 
        map: starTexture, 
        transparent: true, 
        blending: THREE.AdditiveBlending,
        depthWrite: false  // No escribir en el buffer de profundidad
    });

    starVertices = [];
    const spread = 500;  // Rango de dispersión de las estrellas
    for (let i = 0; i < 10000; i++) {
        const x = THREE.MathUtils.randInt(-spread, spread);
        const y = THREE.MathUtils.randInt(-spread, spread);
        const z = THREE.MathUtils.randInt(-spread, spread);
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
};

addStars();

// Capturar eventos de la rueda del mouse para hacer zoom
document.addEventListener('wheel', (event) => {
    const moveSpeed = event.deltaY * 0.1;  // Ajustar la velocidad de movimiento
    camera.position.z -= moveSpeed;
});
// document.addEventListener('mousemove', function(e){
//     camera.positionx = (e.clientX - window.innerWidth) / 100;
//     camera.positiony = (e.clientY - window.innerHeight) / 100;

// });
// Capturar eventos de movimiento del mouse para mover la cámara
document.addEventListener('mousemove', (event) => {
  const mouseX = event.clientX - window.innerWidth / 2;
  const mouseY = event.clientY - window.innerHeight / 2;
  
  camera.position.x = -mouseX / 10;  // Ajusta la velocidad de movimiento horizontal
  camera.position.y = mouseY / 10;  // Ajusta la velocidad de movimiento vertical (invertido)
});

// Animar la escena
const animate = () => {
    requestAnimationFrame(animate);
    
    // Aplicar límites para la cámara
    const limit = 500;  // Tamaño del universo
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

    // Aplicar efecto de hundimiento
    if (camera.position.y < 1) {
        camera.position.y -= 0.01;
    }

    controls.update();  // Actualizar los controles

    renderer.render(scene, camera);
};

animate();

// Ajustar el tamaño del renderizador cuando se cambia el tamaño de la ventana
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Ajustar la posición inicial de la cámara
camera.position.set(0, 50, 100);  // Posición inicial de la cámara
