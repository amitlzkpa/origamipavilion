setupScene();
renderScene();





renderer.setClearColor (0xe0e0e0, 1);
camera.position.set( -120, -100, 60 );
camera.lookAt(new THREE.Vector3( 2, 2, 0 ));





renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.gammaInput = true;
renderer.gammaOutput = true;









var spotLight = new THREE.SpotLight( 0xffffff, 1 );
spotLight.position.set( 15, 40, 35 );
spotLight.castShadow = true;
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 0.05;
spotLight.decay = 2;
spotLight.distance = 200;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 200;
scene.add(spotLight);
lightHelper = new THREE.SpotLightHelper( spotLight );
scene.add(lightHelper);











// var geometry = new THREE.PlaneGeometry( 100, 100, 1 );
// var material = new THREE.MeshPhongMaterial( { color: 0x330000, dithering: true } );
// var plane = new THREE.Mesh( geometry, material );
// plane.receiveShadow = true;
// plane.castShadow = true;
// scene.add(plane);





var geometry = new THREE.SphereGeometry( 5, 32, 32 );
var material = new THREE.MeshPhongMaterial( { color: 0x00ee00, dithering: true } );
var sphere = new THREE.Mesh( geometry, material );
sphere.receiveShadow = true;
sphere.castShadow = true;
sphere.position.set(2, 4, 8);
scene.add(sphere);







