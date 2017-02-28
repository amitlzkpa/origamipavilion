

var scene, camera;
function boilerplatePhysiJS(document, workerPath, ammoPath) {
    'use strict';


    Physijs.scripts.worker = workerPath;
    Physijs.scripts.ammo = ammoPath;

    var initScene, render, renderer;

    initScene = function() {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.getElementById( 'viewport' ).appendChild( renderer.domElement );

        scene = new Physijs.Scene;

        camera = new THREE.PerspectiveCamera(
            35,
            window.innerWidth / window.innerHeight,
            1,
            1000
        );
        camera.position.set( 60, 50, 60 );
        camera.lookAt( scene.position );
        scene.add( camera );

        requestAnimationFrame( render );
    };

    render = function() {
        scene.simulate(); // run physics
        renderer.render( scene, camera); // render the scene
        requestAnimationFrame( render );
    };

    window.onload = initScene();
}