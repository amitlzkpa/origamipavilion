



function pavilionRun(){
  // Box
  var box = new Physijs.BoxMesh(
    new THREE.CubeGeometry( 5, 5, 5 ),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  box.position.y = 20;
  scene.add( box );


  // Plane
  var plane = new Physijs.PlaneMesh(
    new THREE.PlaneGeometry( 20, 20 ),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.rotation.z = Math.PI / 2;
  scene.add( plane );
}





