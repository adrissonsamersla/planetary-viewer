import { scene, bgScene, camera, renderer, controls } from './setup.js'
import { getPointLight } from './src/utils.js';
import { numSphereSegments, earthSunDist, earthMoonDist, earthRadius, moonRadius } from './src/constants.js';

import Sun from './src/Sun.js';
import Body from './src/Body.js';

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

const buildGUI = (pointLight) => {
    // Create the GUI that displays controls.
    const gui = new dat.GUI();

    const folder1 = gui.addFolder('light');
    folder1.add(pointLight, 'intensity', 0, 10);

    const folder2 = gui.addFolder('speed');
    folder2.add(orbitData, 'value', 0, 600);
    folder2.add(orbitData, 'runOrbit', 0, 1);
    folder2.add(orbitData, 'runRotation', 0, 1);


    const hubble = () => {
        window.open("hubble.html");
    }
    const cassini = () => {
        window.open("cassini.html");
    }
    const iss = function () {
        window.open("iss.html");
    }
    const newHorizons = () => {
        window.open("newHorizons.html");
    }
    const voyager = () => {
        window.open("voyager.html");
    }
    const obj = {
        'Hubble': hubble,
        'Cassini': cassini,
        'ISS': iss,
        'NewHorizons': newHorizons,
        'Voyager': voyager,
    };
    gui.add(obj, 'Hubble');
    gui.add(obj, 'Cassini');
    gui.add(obj, 'ISS');
    gui.add(obj, 'NewHorizons');
    gui.add(obj, 'Voyager');

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

    const gui = buildGUI(pointLight);

    const solarRadius = 10 // Must be get from API
    const sun = new Sun(scene, solarRadius)

    // Create the Earth, the Moon, and a ring around the earth.
    const earthData = {
        orbitRate: 365.2564,
        rotationRate: 0.015,
        distanceFromAxis: earthSunDist / moonRadius,
        name: "earth",
        texture: "img/earth.jpg",
        size: earthRadius / moonRadius,
        segments: numSphereSegments,
    }
    const moonData = {
        orbitRate: 290.5,
        rotationRate: 0.01,
        distanceFromAxis: earthMoonDist / moonRadius,
        name: "moon",
        texture: "img/moon.jpg",
        size: 1.0,
        segments: numSphereSegments,
    }
    const mercuryData = {
        orbitRate: 200.5,
        rotationRate: 0.15,
        distanceFromAxis: (earthSunDist / moonRadius) / 3,
        name: "mercury",
        texture: "img/earth.jpg",
        size: (earthRadius / moonRadius) / 2,
        segments: numSphereSegments,
    }
    const jupiterData = {
        orbitRate: 3650.2564,
        rotationRate: 0.015,
        distanceFromAxis: (earthSunDist / moonRadius) * 3,
        name: "jupiter",
        texture: "img/earth.jpg",
        size: (earthRadius / moonRadius) * 10,
        segments: numSphereSegments,
    }

    setCameraPosition(camera, earthData.distanceFromAxis)

    const raycaster = new THREE.Raycaster();
    const mouse = setMouse();

    const earth = new Body(scene, sun, earthData);
    const mercury = new Body(scene, sun, mercuryData);
    const jupiter = new Body(scene, sun, jupiterData);
    const moon = new Body(scene, earth, moonData);

    //moonRing = getTube(earthMoonDist / moonRadius, 0.05, 480, 0xffffff, "ring", earthData.distanceFromAxis);

    // Create the visible orbit that the Earth uses.
    //createVisibleOrbits();

    const planets = [earth, mercury, jupiter];
    const moons = [moon];
    const update = () => {
        const time = Date.now() - beginOfTime;

        // Twinkling the stars
        bgMesh.material.uniforms.time.value = time / 1000.0;
        bgMesh.position.copy(camera.position);
        renderer.render(bgScene, camera);

        // Tracking the sun position
        pointLight.position.copy(sun.position);
        controls.update();

        // Selected celestial bodies
        // Not done yet
        /*planets.forEach((planet) => planet.resize(1));
        raycaster.setFromCamera(mouse, camera);
        planets
            .map((planet) => planet.body)
            .filter((mesh) => {
                console.log(raycaster.intersectObject(mesh).length);
                return raycaster.intersectObject(mesh).length > 0;
            })
            .forEach((_, idx) => {
                console.log(planets[idx])
                planets[idx].resize(2)
            });*/


        // Moving the other bodies
        planets.forEach((planet) => planet.move(time, orbitData));
        moons.forEach((moon) => moon.move(time, orbitData));

        renderer.render(scene, camera);
        requestAnimationFrame(() => update());
    }

    // Start the animation.
    update();
}

export default main;
