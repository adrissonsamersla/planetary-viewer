import Sun from './Sun.js';
import Body from './Body.js';

import { earthMoonDist, moonRadius, numSphereSegments } from './constants.js';

// Radius of the Sun: 696342 Km
const solarRadius = 696342 / (15 * moonRadius);
const moonData = {
    orbitRate: (2 * Math.PI) / (23.9345 * 5),
    rotationRate: (2 * Math.PI) / (23.9345 * 5),
    distanceFromAxis: earthMoonDist / (20 * moonRadius),
    name: "moon",
    texture: "img/moon.jpg",
    size: 1.0,
    segments: numSphereSegments,
};

const dataParser = (data) => {
    return {
        orbitRate: (2 * Math.PI) / (data.periodo_translacao * 5),
        rotationRate: (2 * Math.PI) / (data.periodo_rotacao * 5),
        distanceFromAxis: data.dist_media_sol / (1000 * moonRadius),
        name: data.name,
        texture: `img/${data.name}.jpg`,
        size: data.raio_medio / moonRadius,
        segments: numSphereSegments,
    }
}

class SolarSystem {
    static planetsNames = ["mercury", "venus", "earth", "mars",
        "jupiter", "saturn", "uranus", "neptune",
    ];
    moonsNames = ['moon'];

    constructor(scene, camera, mouse, controls, data) {
        this.camera = camera;
        this.mouse = mouse
        this.controls = controls;
        this.raycaster = new THREE.Raycaster();

        this.data = data;
        this.orbitData = {
            speedFactor: 0,
            runOrbit: true,
            runRotation: true
        };

        this.navigation = {
            active: false,
            numTicks: 0,
            totalTicks: 500,
            to: null,
            initialPos: null,
            finalPos: null,
            initialOrientation: null,
            finalOrientation: null,
            spline: null,
        };
        this.freeMode = true;

        this.sun = new Sun(scene, solarRadius)

        // const earth = new Body(scene, this.sun, earthData);
        // const mercury = new Body(scene, this.sun, mercuryData);
        // const jupiter = new Body(scene, this.sun, jupiterData);
        // const moon = new Body(scene, earth, moonData);

        // this.planets = [earth, mercury, jupiter]

        /*this.planets = this.planetsNames.map((planetName) => {
            console.log(planetName)
            console.log(PlanetsDataList)
            console.log(PlanetsDataList[planetName])
            const data = dataParser(PlanetsDataList[planetName])
            console.log(data)
            return new Body(scene, this.sun, data);
        });*/
        console.log(data)
        this.planets = data.map((planetData) => new Body(scene, this.sun, dataParser(planetData)));

        const earth = this.planets.find((p) => p.name === 'earth');
        const moon = new Body(scene, earth, moonData);

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

            this.camera.position.copy(this.navigation.spline.getPointAt(param));


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

        this.navigation.to = this.planets.find((planet) => planet.name === planetName);

        this.navigation.initialPos = this.camera.position.clone();

        this.navigation.finalPos = this.navigation.to.position.clone().add(
            new THREE.Vector3(1, 1, 1).setLength(5 * this.navigation.to.radius)
        );


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
                    this.camera.lookAt(
                        this.sun.position
                    );
                    this.navigation.active = false;
                }
                this.freeMode = true;
                this.controls.target.copy(this.sun.position);
            }
        })
    }

    cameraInitialDistance = () => {
        return this.planets
            .map((planet) => planet.position.length())
            .reduce((prev, curr) => curr > prev ? curr : prev, 100);
    }
}

export default SolarSystem;
