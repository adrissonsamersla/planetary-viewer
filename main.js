import { scene, bgScene, camera, renderer, controls } from "./setup.js";
import { getPointLight } from "./src/utils.js";

import SolarSystem from "./src/SolarSystem.js";

import {
  numSphereSegments,
  earthSunDist,
  earthMoonDist,
  earthRadius,
  moonRadius,
} from "./src/constants.js";

const beginOfTime = Date.now();

const buildBackground = (bgScene) => {
  const vertShader = document.getElementById("vertexShader").innerHTML;
  const fragShader = document.getElementById("fragmentShader").innerHTML;
  const uniforms = {
    time: {
      type: "f",
      value: 0.0,
    },
    bgtexture: {
      type: "t",
      value: new THREE.TextureLoader().load("./cubemap/sky.jpg"),
    },
  };
  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertShader,
    fragmentShader: fragShader,
    depthWrite: false,
    side: THREE.BackSide,
  });
  const plane = new THREE.BoxBufferGeometry(2, 2, 2);
  const bgMesh = new THREE.Mesh(plane, material);
  bgScene.add(bgMesh);

  return bgMesh;
};

const buildGUI = (pointLight, backgroundLight, solarSystem) => {
    // Create the GUI that displays controls.
    const gui = new dat.GUI();

    const lightFolder = gui.addFolder('Luminosity');
    lightFolder.add(pointLight, 'intensity', 0, 1, 0.1);
    lightFolder.add(backgroundLight, 'intensity', 0, 1, 0.1);

    const speedFolder = gui.addFolder('Movement');
    speedFolder.add(solarSystem.orbitData, 'speedFactor', -3, 3, 0.1);
    speedFolder.add(solarSystem.orbitData, 'runOrbit');
    speedFolder.add(solarSystem.orbitData, 'runRotation');

    const spacecraftLinks = {
        'Hubble': () => window.open("hubble.html"),
        'Cassini': () => window.open("cassini.html"),
        'ISS': () => window.open("iss.html"),
        'New Horizons': () => window.open("newHorizons.html"),
        'Voyager': () => window.open("voyager.html"),
    };
    const spacecraftFolder = gui.addFolder('Spacecraft');
    spacecraftFolder.add(spacecraftLinks, 'Hubble');
    spacecraftFolder.add(spacecraftLinks, 'Cassini');
    spacecraftFolder.add(spacecraftLinks, 'ISS');
    spacecraftFolder.add(spacecraftLinks, 'New Horizons');
    spacecraftFolder.add(spacecraftLinks, 'Voyager');

    const planetsFolder = gui.addFolder('Planets');
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
  const pointLight = getPointLight(1, "rgb(255, 220, 180)");
  scene.add(pointLight);

  // Create light that is viewable from all directions.
  const ambientLight = new THREE.AmbientLight(0xaaaaaa, 0.5);
  scene.add(ambientLight);

  return [pointLight, ambientLight];
};

const setCameraPosition = (camera, cameraDistance) => {
  camera.position.z = 50;
  camera.position.x = 1.2 * cameraDistance;
  camera.position.y = 100;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
};

const setMouse = () => {
  const mouse = new THREE.Vector2();

  const handler = (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  };
  window.addEventListener("mousemove", handler, false);

  return mouse;
};

const getDataFromApi = async (bodyName) => {
  const promise = fetch(
    "https://api.le-systeme-solaire.net/rest/bodies?filter[]=englishName,eq," +
    bodyName +
    "&data=meanRadius,mass,massValue,massExponent,gravity,escape,sideralOrbit,sideralRotation,moons,aphelion,perihelion"
  );

  const response = await promise;

  return {
    "name": bodyName,
    "data": await response.json()
  }
}

const main = async () => {
  const bgMesh = buildBackground(bgScene);

  const [pointLight, backgroundLight] = buildLights(scene);

  const mouse = setMouse();

  const names = [
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "pluto",
    "uranus",
    "neptune",
    "saturn",
  ];
  const promises = names.map(name => getDataFromApi(name));
  const rawData = await Promise.all(promises);
  const data = rawData.map((payload) => {
    const planetData = new PlanetDataFromAPI(payload.name);
    planetData.inicia(payload.data.bodies[0]);
    return planetData;
  });
  const solarSystem = new SolarSystem(scene, camera, mouse, controls, data);

  const gui = buildGUI(pointLight, backgroundLight, solarSystem);

  setCameraPosition(camera, solarSystem.cameraInitialDistance());

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
      const current = Date.now() - beginOfTime - time;
      if (current >= period) update();
      else {
        setTimeout(update, period - current);
      }
    });
  };

  // Start the animation.
  update();
};

export default main;
