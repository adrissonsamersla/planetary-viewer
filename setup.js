// Create the scene that holds all of the visible objects.
const scene = new THREE.Scene();

// Create background scene
const bgScene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    70, // field of view
    window.innerWidth / window.innerHeight, // aspect ratio
    0.1, // near clipping plane
    10000 // far clipping plane
);

const domElem = document.getElementById('mycanvas');

const renderer = new THREE.WebGLRenderer({
    canvas: domElem,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.autoClearColor = false;

const controls = new THREE.OrbitControls(camera, renderer.domElement);

export {
    scene,
    bgScene,
    camera,
    renderer,
    controls,
};
