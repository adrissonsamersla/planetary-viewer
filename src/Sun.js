import { getSphere, getMaterial } from './utils.js';

class Sun {
    constructor(scene, radius) {
        // Create the sun.
        const sunTexture = new THREE.ImageUtils.loadTexture('img/sun.jpg');
        const sunMaterial = getMaterial("basic", "rgb(255, 255, 255)", sunTexture);
        this.sun = getSphere(sunMaterial, radius);
        scene.add(this.sun);

        // Create the glow of the sun.
        const solarGlowMaterial = new THREE.SpriteMaterial(
            {
                map: new THREE.ImageUtils.loadTexture("img/glow.png")
                , useScreenCoordinates: false
                , color: 0xffffee
                , transparent: true
                , blending: THREE.AdditiveBlending
            });
        const solarGlowSprite = new THREE.Sprite(solarGlowMaterial);
        solarGlowSprite.scale.set(5 * radius, 5 * radius, 1.0);

        // This centers the glow at the sun.
        this.sun.add(solarGlowSprite);
    }

    resize = (resizeFactor) => {
        const newSize = resizeFactor * this.data.size;
        this.sun.scale.set(newSize, newSize, newSize);
    }

    get position() {
        return this.sun.position
    }

    set position(newPosition) {
        this.sun.position.copy(newPosition);
    }
}

export default Sun;
