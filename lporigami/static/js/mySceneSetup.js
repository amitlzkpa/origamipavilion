// Some helper methods for the examples

var scene, camera, renderer;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

raycaster.lineprecision = 0.00001;
raycaster.precision = 0.001;

function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

window.addEventListener( 'mousemove', onMouseMove, false );

function setupScene(doUseRaycaster){
    useRaycaster = doUseRaycaster;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 10000 );
    // camera = new THREE.OrthographicCamera( -window.innerWidth/2, window.innerWidth/2, -window.innerHeight/2, window.innerHeight/2, 0.1, 1000 );

    camera.up.set( 0, 0, 1 );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );

    var viewerele = document.getElementById("viewer");

    viewerele.appendChild( renderer.domElement );

    var ambientLight = new THREE.AmbientLight( 0xFFFAFA );
    scene.add( ambientLight );

    var geometry = new THREE.PlaneGeometry( 5000, 5000, 1 );
    var material = new THREE.MeshPhongMaterial( { color: 0xe0e0e0, side: THREE.DoubleSide, dithering: true } );
    var plane = new THREE.Mesh( geometry, material );
    plane.receiveShadow = true;
    plane.castShadow = false;
    scene.add( plane );
}

var intersects = [];

function renderScene(){
    var controls = new THREE.OrbitControls(camera, renderer.domElement);

    function render() {
        if (useRaycaster){

            // update the picking ray with the camera and mouse position
            raycaster.setFromCamera( mouse, camera );

            // clear color
            for ( var i = 0; i < intersects.length; i++ ) {
                if (!intersects[ i ].object.material.color) continue;
                intersects[ i ].object.material.color.set( 0xffffff );
            }

            // calculate objects intersecting the picking ray
            intersects = raycaster.intersectObjects( scene.children );

            for ( var i = 0; i < intersects.length; i++ ) {
                if (!intersects[ i ].object.material.color) continue;
                intersects[ i ].object.material.color.set( 0xff0000 );
            }
        }

    	requestAnimationFrame( render );
        renderer.render( scene, camera );
    }
    render();
}

function addCurveToScene(geom, material){
    material = material || new THREE.LineBasicMaterial({ linewidth: 2, color: 0xdcdcdc});
    scene.add( new THREE.Line( geom, material ) );
}

function addLineToScene(pts, mat){
    addCurveToScene(asGeometry(asVector3(pts)), mat);
}

function addMeshToScene(mesh, material, wireframe ){
    material = material || new THREE.MeshNormalMaterial( { side: THREE.DoubleSide, wireframe: false, shading: THREE.SmoothShading, transparent: true, opacity: 0.4 } )

    scene.add( new THREE.Mesh( mesh, material ) );

    if (wireframe){
        var material2 = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide, wireframe: true } );
        var mesh2 = new THREE.Mesh( mesh, material2 );
        scene.add( mesh2 );
    }
}

function asVector3(pts){
    return pts.map(function(x){
        return new THREE.Vector3(x[0],x[1],x[2]);
    });
}

function asGeometry(threePts){
    var geometry = new THREE.Geometry();
    geometry.vertices.push.apply( geometry.vertices, threePts );
    return geometry;
}

function benchmark(func, runs){
	var d1 = Date.now();
	for (var i = 0 ; i < runs; i++)
		res = func();
	var d2 = Date.now();
	return { result : res, elapsed : d2-d1, each : (d2-d1)/runs };
}

function pointsAsGeometry(pts){
    return asGeometry( asVector3(pts) )
}

function addPointsToScene(pts){

    var geom = asGeometry( asVector3( pts ) );
    var cloudMat2 = new THREE.PointCloudMaterial({ size: 6.5, sizeAttenuation: false, color: 0xffffff });
    var cloud2 = new THREE.PointCloud( geom, cloudMat2 );

    scene.add( cloud2 );
}




