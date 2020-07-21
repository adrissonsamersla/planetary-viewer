import Sun from './Sun.js';
import Body from './Body.js';

import { numSphereSegments, earthSunDist, earthMoonDist, earthRadius, moonRadius } from './constants.js';


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
    texture: "img/mercury.jpg",
    size: (earthRadius / moonRadius) / 2,
    segments: numSphereSegments,
}
const jupiterData = {
    orbitRate: 3650.2564,
    rotationRate: 0.015,
    distanceFromAxis: (earthSunDist / moonRadius) * 3,
    name: "jupiter",
    texture: "img/jupiter.jpg",
    size: (earthRadius / moonRadius) * 5,
    segments: numSphereSegments,
}

const solarRadius = 50 // Must be get from API

class SolarSystem {
    //planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    planetsNames = ['mercury', 'earth', 'jupiter'];
    moonsNames = ['moon'];

    constructor(scene, camera, mouse, controls, data, orbitData) {
        this.camera = camera;
        this.mouse = mouse
        this.controls = controls;
        this.raycaster = new THREE.Raycaster();

        this.data = data;
        this.orbitData = orbitData;

        this.navigation = {
            active: false,
            numTicks: 0,
            totalTicks: 1000,
            to: null,
            initialPos: null,
            finalPos: null,
            initialOrientation: null,
            finalOrientation: null,
            spline: null,
        };
        this.freeMode = true;

        this.sun = new Sun(scene, solarRadius)

        const earth = new Body(scene, this.sun, earthData);
        const mercury = new Body(scene, this.sun, mercuryData);
        const jupiter = new Body(scene, this.sun, jupiterData);
        const moon = new Body(scene, earth, moonData);

        this.planets = [earth, mercury, jupiter]
        this.moons = [moon];

        this.addEscapeListener();
    }

    update = (deltaTime) => {
        this.handleSelection();

        if (this.navigation.active) {
            const param = this.navigation.numTicks / this.navigation.totalTicks;

            this.navigation.numTicks++;
            if (this.navigation.numTicks > this.navigation.totalTicks) {
                this.navigation.active = false;
                this.controls.target.copy(this.navigation.to.position);
            }

            this.camera.position.copy(this.navigation.spline.getPointAt(param))


            this.camera.lookAt(
                this.navigation.initialOrientation.clone().lerp(
                    this.navigation.finalOrientation,
                    param
                ).add(this.camera.position)
            );
        } else if (this.freeMode) {
            this.controls.update();

            // Moving the other bodies
            this.planets.forEach((planet) => planet.move(deltaTime, this.orbitData));
            this.moons.forEach((moon) => moon.move(deltaTime, this.orbitData));
        }
    }

    handleSelection = () => {
        // Selected celestial bodies
        // Not done yet
        this.planets.forEach((planet) => planet.resize(1));
        this.raycaster.setFromCamera(this.mouse, this.camera);
        this.planets
            .filter((planet) => {
                return this.raycaster.intersectObject(planet.body).length > 0;
            })
            .forEach((planet) => {
                planet.resize(2)
            });
    }

    navigateTo = (planetName) => {
        // Setting this.navigation
        this.navigation.active = true;
        this.freeMode = false;
        this.navigation.numTicks = 1;

        this.navigation.to = this.planets.filter((planet) => planet.name === planetName)[0];

        this.navigation.initialPos = this.camera.position.clone();
        this.navigation.finalPos = this.navigation.to.position.clone().add(new THREE.Vector3(100, 100, 100));


        this.navigation.initialOrientation = this.camera.getWorldDirection().clone();
        this.navigation.finalOrientation = this.navigation.to.position.clone().sub(this.navigation.finalPos).normalize();

        this.navigation.spline = new THREE.CatmullRomCurve3([
            this.navigation.initialPos,
            this.navigation.finalPos
        ])
    }

    addEscapeListener = () => {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                if (this.navigation.active) {
                    this.camera.position.copy(this.navigation.finalPos);
                    this.camera.up.copy(this.navigation.finalOrientation);
                }
                this.freeMode = true;
                this.controls.target.copy(this.sun.position);
            }
        })
    }
}

export default SolarSystem;
