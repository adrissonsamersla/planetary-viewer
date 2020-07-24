var earthHubbleDist = 568; // km
var hubbleData = {
    orbitRate: 95.47/(24*60), // dia
    distanceFromAxis: earthHubbleDist + earthRadius,
    name: "hubble",
}
var earthISSDist = 408; // km
var ISSData = {
    orbitRate: 91.34/(24*60), // min
    distanceFromAxis: earthISSDist + earthRadius,
    name: "iss",
}
var sat;
var satData = { size: 1};
orbitData.value = 20000

const sceneBuilder = (modelName) => {
    // Create the camera that allows us to view into the scene.
    camera = new THREE.PerspectiveCamera(
        75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 10, 10);

    if (modelName == "Hubble.glb" || modelName ==  "ISS_stationary.glb"){
        camera = new THREE.PerspectiveCamera(
            70, // field of view
            window.innerWidth / window.innerHeight, // aspect ratio
            0.00001, // near clipping plane
            1000000 // far clipping plane
        );
        camera.position.z = 20000;
        camera.position.x = 10;
        camera.position.y = 10000;
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    }


    // Create the scene that holds all of the visible objects.
    scene = new THREE.Scene();

    const domElem = document.getElementById("mycanvas");

    // Create the renderer that controls animation.
    const renderer = new THREE.WebGLRenderer({
        canvas: domElem,
        alpha: true,
        antialias: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClearColor = false;

    // Attach the renderer to the div element.
    document.getElementById('webgl').appendChild(domElem);

    // Create controls that allows a user to move the scene with a mouse.
    controls = new THREE.OrbitControls(camera, domElem);

    // Attach the background cube to the scene.
    bgScene = new THREE.Scene();
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
    bgMesh = new THREE.Mesh(plane, material)
    bgScene.add(bgMesh)

    // Create light that is viewable from all directions.
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.15);
    scene.add(ambientLight);
    const directionalLights = [
        [1, 1, 0],
        [0, 1, -1],
        [-1, 1, 0],
        [0, 1, 1],

        [1, 0, 0],
        [0, 0, -1],
        [-1, 0, 0],
        [0, 0, 1],

        [1, -1, 0],
        [0, -1, -1],
        [-1, -1, 0],
        [0, -1, 1]
    ]
    directionalLights.forEach((dl) => {
        const light = new THREE.DirectionalLight(0xFFFFFF, 0.35);

        light.position.set(10 * dl[0], 10 * dl[1], 10 * dl[2]);
        light.lookAt(new THREE.Vector3(0, 0, 0));

        scene.add(light)
    });
    
    // Create the Earth, the Moon, and a ring around the earth.
    if (modelName == "Hubble.glb" || modelName ==  "ISS_stationary.glb"){
        earthData = constructPlanetData(365.2564, 0.0015, 0, "earth", "img/earth.jpg", earthRadius, planetSegments);
        earth = loadTexturedPlanet(earthData, 0, 0, 0);
        if (modelName == "Hubble.glb" )
            satRing = getTube(hubbleData.distanceFromAxis, 1, 480, 0xffffff, "ring", earthData.distanceFromAxis);
        else satRing = getTube(ISSData.distanceFromAxis, 1, 480, 0xffffff, "ring", earthData.distanceFromAxis);
    }

    // Add the satelite
    modelLoader(modelName, scene);
    
    // Create the GUI that displays controls.
    var gui = new dat.GUI();
    var obj = {};
    obj.SolarSystem = function() {
        window.open("/")
    }
    var folder2 = gui.addFolder('Speed');
    folder2.add(orbitData, 'value', 20000, 50000, 0.1);
    folder2.add(orbitData, 'runOrbit', 0, 1);
    folder2.add(orbitData, 'runRotation', 0, 1);
    gui.add(obj, 'SolarSystem');
    var folder = gui.addFolder('Spacecraft');
    folder.open();
    var modelSize;
    if (modelName != "Hubble.glb")
        obj.Hubble = function() {
            window.open("hubble.html");
        }
    else modelSize = 'Hubble';
    if (modelName != "Cassini.glb") 
        obj.Cassini = function() {
            window.open("cassini.html");
        }
    else modelSize = 'Cassini';
    if (modelName != "ISS_stationary.glb") 
        obj.ISS = function() {
            window.open("iss.html");
        }
    else modelSize = 'ISS';
    if (modelName != "New_Horizons.glb")
        obj.NewHorizons = function() {
            window.open("newHorizons.html");
        }
    else modelSize = 'NewHorizons';
    if (modelName != "Voyager.glb")
        obj.Voyager = function() {
            window.open("voyager.html");
        }
    else modelSize = 'Voyager';
    if (typeof modelSize != 'undefined'){
        var folder3 = gui.addFolder(modelSize);
        folder3.open();
        folder3.add(satData, 'size', 1, 10, 0.1);
    }
    if (modelName != "Hubble.glb") folder.add(obj, 'Hubble');
    if (modelName != "Cassini.glb") folder.add(obj, 'Cassini');
    if (modelName != "ISS_stationary.glb") folder.add(obj, 'ISS');
    if (modelName != "New_Horizons.glb") folder.add(obj, 'NewHorizons');
    if (modelName != "Voyager.glb") folder.add(obj, 'Voyager');

    const animate = () => {
        const time = Date.now();

        bgMesh.material.uniforms.time.value = (time - beginOfTime) / 1000.0;
        bgMesh.position.copy(camera.position);
        renderer.render(bgScene, camera);
        renderer.render(scene, camera);
        controls.update();

        if (typeof sat != "undefined"){
            sat.scale.set(satData.size,satData.size,satData.size);
            if (modelName == "Hubble.glb" || modelName ==  "ISS_stationary.glb"){
                movePlanet(earth, earthData, time, false, "rot"); // only rotation
                if (modelName == "Hubble.glb") 
                    moveSat(sat, earth, hubbleData, time, "sat");
                if (modelName == "ISS_stationary.glb") 
                    moveSat(sat, earth, ISSData, time, "sat");
            }
        }

        requestAnimationFrame(animate);
        
    }

    animate();
}

const modelLoader = (modelName, scene) => {
    const loader = new THREE.GLTFLoader();
    loader.load(
        `./models/${modelName}`,
        (gltf) => {
            sat = gltf.scene;
            scene.add(sat);
            if (modelName == "Hubble.glb"){
                sat.position.set(hubbleData.distanceFromAxis, 0, 0);
                satData.size = 10;
            }
            if (modelName == "ISS_stationary.glb")
                sat.position.set(ISSData.distanceFromAxis, 0, 0);
        
            console.log("Spacecraft added!");
        },
        (xhr) => console.log(`${xhr.loaded / xhr.total * 100} % loaded...`),
        (err) => console.log(err)
    );
}
