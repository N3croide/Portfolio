import * as THREE from 'three';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';


// Crear la escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Crear la cámara
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
// Crear el renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('universe').appendChild(renderer.domElement);

// Crear controles de órbita para la cámara
const controls = new FirstPersonControls(camera, renderer.domElement);
controls.lookSpeed = 0.1;
// controls.dispose();
// Cargar la textura de la estrella
const loader = new THREE.TextureLoader();
const starTexture = loader.load('images/star.png'); // Ruta corregida según lo mencionado

// Crear la malla (grid) sin líneas diagonales
const createGridMesh = () => {
    const size = 2000;
    const divisions =100;
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.5 });

    const gridGeometry = new THREE.BufferGeometry();
    const points = [];

    for (let i = -size / 2; i <= size / 2; i += size / divisions) {
        points.push(-size / 2, -100, i, size / 2, -100, i); // Líneas paralelas al eje Z
        points.push(i, -100, -size / 2, i, -100, size / 2); // Líneas paralelas al eje X
    }

    gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    const gridMesh = new THREE.LineSegments(gridGeometry, gridMaterial);
    gridMesh.renderOrder = 1; // Establecer orden de renderizado
    scene.add(gridMesh);
};
createGridMesh();


// Añadir estrellas (puntos)
let starVertices;
const addStars = () => {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ 
        color: 0xffffff, 
        size: 0.7, 
        map: starTexture, 
        transparent: true, 
        blending: THREE.AdditiveBlending,
        depthWrite: false  // No escribir en el buffer de profundidad
    });

    starVertices = [];
    const spread = 1500;  // Rango de dispersión de las estrellas
    for (let i = 0; i <100000; i++) {
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

const moveForward = () => {
    camera.position.add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(1));
};
const moveBackward = () => {
    camera.position.add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-0.4));
};


// Animar la escena
const animate = () => {
    requestAnimationFrame(animate);
    
    const limit = 500;
    // Aplicar límites para la cámara
    // const limit = 500;  // Tamaño del universo
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


    // Mover la cámara hacia adelante si el botón izquierdo del mouse está presionado
    if (isLeftMouseDown) {
        moveForward();
    }
    // Mover la cámara hacia atrás si el botón derecho del mouse está presionado
    if (isRightMouseDown) {
        moveBackward();
    }

    // updateRotation();
    controls.update(0.025);  // Actualizar los controles

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
camera.position.set(10, 50, 100);  // Posición inicial de la cámara
