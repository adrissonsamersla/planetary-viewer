import { getTexturedBody, getOrbit } from './utils.js';

class Body {
    constructor(scene, centralBody, bodyData) {
        this.group = new THREE.Group();
        this.centralBody = centralBody;

        this.data = bodyData;
        this.body = getTexturedBody(bodyData);
        this.body.position
            .set(bodyData.distanceFromAxis, 0, 0).add(centralBody.position);
        scene.add(this.body);

        this.distVector = this.body.position.clone()
        this.distVector.sub(centralBody.position);

        this.orbit = getOrbit(
            bodyData.distanceFromAxis + 0.1,
            bodyData.distanceFromAxis - 0.1, 320,
            0xffffff,
            bodyData.name + '-orbit',
            0
        );
        this.orbit.position.set(centralBody.position.x, centralBody.position.y, centralBody.position.z);
        scene.add(this.orbit);

        this.name = bodyData.name;
    };

    move = (time, orbitData) => {
        const stopRotation = !orbitData.runRotation;
        const stopOrbit = !orbitData.runOrbit;

        if (!stopRotation) {
            this.body.rotation.y += this.data.rotationRate;
        }
        if (!stopOrbit) {
            this.distVector.applyAxisAngle(
                new THREE.Vector3(0, 1, 0),
                time * Math.pow(2, orbitData.speedFactor) / (this.data.orbitRate * 1000)
            );

            this.orbit.position.set(
                this.centralBody.position.x,
                this.centralBody.position.y,
                this.centralBody.position.z
            );

            this.body.position.set(
                this.centralBody.position.x + this.distVector.x,
                this.centralBody.position.y + this.distVector.y,
                this.centralBody.position.z + this.distVector.z,
            )
        }
    }

    resize = (resizeFactor) => {
        this.body.scale.set(resizeFactor, resizeFactor, resizeFactor);
    }

    get position() {
        return this.body.position;
    }

    get radius() {
        return this.data.size
    }
}

export default Body;
