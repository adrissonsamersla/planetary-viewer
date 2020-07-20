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
    };

    move = (time, orbitData, stopRotation = false, stopOrbit = false) => {
        if (!stopRotation) {
            this.body.rotation.y += this.data.rotationRate;
        }
        if (!stopOrbit) {
            this.distVector.applyAxisAngle(
                new THREE.Vector3(0, 1, 0),
                time * 1.0 / (this.data.orbitRate * orbitData.value * 50)
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
            /*this.group.position.x = Math.cos(time * 1.0 / (this.data.orbitRate * orbitData.value))
                * this.data.distanceFromAxis;
            this.group.position.z = Math.sin(time * 1.0 / (this.data.orbitRate * orbitData.value))
                * this.data.distanceFromAxis;*/
        }
    }

    resize = (resizeFactor) => {
        const newSize = resizeFactor * this.data.size;
        this.body.scale.set(newSize, newSize, newSize);
    }

    get position() {
        return this.body.position;
    }
}

export default Body;
