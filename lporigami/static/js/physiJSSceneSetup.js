

var scene, camera;
function boilerplatePhysiJS(document, workerPath, ammoPath) {
    'use strict';


    Physijs.scripts.worker = workerPath;
    Physijs.scripts.ammo = ammoPath;

    var initScene, renderer;
    var raycaster, mouse;


    function onMouseMove( event ) {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }


    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }


    // meant to be overwritten
    physicsUpdate;
    frameUpdate;

    
    initScene = function() {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.getElementById( 'viewport' ).appendChild( renderer.domElement );

        scene = new Physijs.Scene;

        scene.addEventListener( 'update', physicsUpdate );

        camera = new THREE.PerspectiveCamera(
            35,
            window.innerWidth / window.innerHeight,
            1,
            10000
        );
        camera.position.set( -60, 50, 60 );
        camera.lookAt( scene.position );
        scene.add( camera );

        raycaster = new THREE.Raycaster();
        raycaster.lineprecision = 0.00001;
        raycaster.precision = 0.001;

        mouse = new THREE.Vector2();
        window.addEventListener( 'mousemove', onMouseMove, false );
        window.addEventListener( 'resize', onWindowResize, false );
    };



    function renderScene(){
        var controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set( 0, 0, 0 );
        function render() {
            // update the picking ray with the camera and mouse position
            raycaster.setFromCamera( mouse, camera );
            scene.simulate(); // run physics
            renderer.render( scene, camera );
            requestAnimationFrame( render );
            frameUpdate();
        }
        render();
    }


    function initAndRenderScene() {
        initScene();
        renderScene();
    }


    window.onload = initAndRenderScene();
}