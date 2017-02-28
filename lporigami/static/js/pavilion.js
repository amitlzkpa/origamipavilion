

var pointsGroup = new THREE.Group();










function pavilionRun(){
  var spacing = 6;

  for (var i=0; i<3; i++) {
    for (var j=0; j<5; j++) {
      // Box
      var box = new Physijs.BoxMesh(
        new THREE.CubeGeometry( 1, 1, 1 ),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      box.position.x = i * spacing;
      box.position.y = 10;
      box.position.z = j * spacing;
      scene.add( box );
    }
  }
  // scene.add( pointsGroup );


  // Plane
  var plane = new Physijs.PlaneMesh(
    new THREE.PlaneGeometry( 60, 30 ),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.rotation.z = Math.PI / 2;
  scene.add( plane );
}





