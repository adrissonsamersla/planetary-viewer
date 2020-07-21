import { scene, bgScene, camera, renderer, controls } from './setup.js'
import { getPointLight } from './src/utils.js';

import SolarSystem from './src/SolarSystem.js';

import { numSphereSegments, earthSunDist, earthMoonDist, earthRadius, moonRadius } from './src/constants.js';

const beginOfTime = Date.now();
const orbitData = { value: 200, runOrbit: true, runRotation: true };

const buildBackground = (bgScene) => {
    const vertShader = document.getElementById('vertexShader').innerHTML;
    const fragShader = document.getElementById('fragmentShader').innerHTML;
    const uniforms = {
        time: {
            type: 'f',
            value: 0.0
        },
        bgtexture: {
            type: 't',
            value: new THREE.TextureLoader().load('./cubemap/sky.jpg')
        }
    };
    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertShader,
        fragmentShader: fragShader,
        depthWrite: false,
        side: THREE.BackSide,
    });
    const plane = new THREE.BoxBufferGeometry(2, 2, 2);
    const bgMesh = new THREE.Mesh(plane, material)
    bgScene.add(bgMesh)

    return bgMesh
}

const buildGUI = (pointLight, solarSystem) => {
    // Create the GUI that displays controls.
    const gui = new dat.GUI();

    const lightFolder = gui.addFolder('light');
    lightFolder.add(pointLight, 'intensity', 0, 10);

    const speedFolder = gui.addFolder('speed');
    speedFolder.add(orbitData, 'value', 0, 600);
    speedFolder.add(orbitData, 'runOrbit', 0, 1);
    speedFolder.add(orbitData, 'runRotation', 0, 1);

    const spacecraftLinks = {
        'Hubble': () => window.open("hubble.html"),
        'Cassini': () => window.open("cassini.html"),
        'ISS': () => window.open("iss.html"),
        'New Horizons': () => window.open("newHorizons.html"),
        'Voyager': () => window.open("voyager.html"),
    };
    const spacecraftFolder = gui.addFolder('spacecraft');
    spacecraftFolder.add(spacecraftLinks, 'Hubble');
    spacecraftFolder.add(spacecraftLinks, 'Cassini');
    spacecraftFolder.add(spacecraftLinks, 'ISS');
    spacecraftFolder.add(spacecraftLinks, 'New Horizons');
    spacecraftFolder.add(spacecraftLinks, 'Voyager');

    const planetsFolder = gui.addFolder('planets');
    planetsFolder.closed = false;
    const planetHandler = {
        'Mercury': () => solarSystem.navigateTo('mercury'),
        'Earth': () => solarSystem.navigateTo('earth'),
        'Jupiter': () => solarSystem.navigateTo('jupiter'),
    }
    planetsFolder.add(planetHandler, 'Mercury');
    planetsFolder.add(planetHandler, 'Earth');
    planetsFolder.add(planetHandler, 'Jupiter');

    return gui;
}

const buildLights = (scene) => {
    // Create light from the sun.
    const pointLight = getPointLight(5, "rgb(255, 220, 180)");
    scene.add(pointLight);

    // Create light that is viewable from all directions.
    const ambientLight = new THREE.AmbientLight(0xaaaaaa);
    scene.add(ambientLight);

    return [pointLight, ambientLight]
}

const setCameraPosition = (camera, earthOrbitDistance) => {
    camera.position.z = 50;
    camera.position.x = 1.2 * earthOrbitDistance;
    camera.position.y = 100;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}

const setMouse = () => {
    const mouse = new THREE.Vector2();

    const handler = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }
    window.addEventListener('mousemove', handler, false);

    return mouse;
}

const main = () => {

    const bgMesh = buildBackground(bgScene);

    const [pointLight, _] = buildLights(scene);

    const mouse = setMouse();

    const data = {
        orbitRate: 365.2564,
        rotationRate: 0.015,
        distanceFromAxis: earthSunDist / moonRadius,
        name: "earth",
        texture: "img/earth.jpg",
        size: earthRadius / moonRadius,
        segments: numSphereSegments,
    }; // Get from api
    const solarSystem = new SolarSystem(scene, camera, mouse, controls, data, orbitData);

    const gui = buildGUI(pointLight, solarSystem);

    setCameraPosition(camera, data.distanceFromAxis);

    const update = () => {
        const time = Date.now() - beginOfTime;

        solarSystem.update(time);

        // Twinkling the stars
        bgMesh.material.uniforms.time.value = time / 1000.0;
        bgMesh.position.copy(camera.position);
        renderer.render(bgScene, camera);

        // Tracking the sun position
        pointLight.position.copy(solarSystem.sun.position);

        solarSystem.update(time);

        renderer.render(scene, camera);

        const fps = 60;
        const period = 1000 / fps;
        requestAnimationFrame(() => {
            const current = (Date.now() - beginOfTime) - time;
            if (current >= period)
                update()
            else {
                setTimeout(update, period - current);
            }
        });
    }

    // Start the animation.
    update();
}

export default main;
