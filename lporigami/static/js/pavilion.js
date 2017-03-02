




//-----------------------------------------------------------------------------



var firstFrame = true;
var debug = true;
// var debug = false;




//-----------------------------------------------------------------------------



// use this for any physics stuff; called after every physics simulation iteration;
// physics iteration is diff from frame rendering iteration
physicsUpdate = function() {
}


// called after every frame;
// physics iteration is diff from frame rendering iteration
frameUpdate = function() {
  if (debug) redrawConstraintLines();
}




//-----------------------------------------------------------------------------




function getBox(width, depth, breadth, mass, materialColor){
  var box = new Physijs.BoxMesh(
    new THREE.BoxGeometry(width, depth, breadth),
    new THREE.MeshBasicMaterial({color: materialColor}),
    mass
  );
  return box;
}



function getLine(start, end, lineColor) {
  var material = new THREE.LineBasicMaterial({
    color: lineColor
  });
  var geometry = new THREE.Geometry();
  geometry.vertices.push(start, end);
  var line = new THREE.Line( geometry, material );
  return line;
}




//-----------------------------------------------------------------------------




function addGroundPlane() {
  var gp = getBox(30, 0.2, 60, 0, 0xbbbbbb);
  gp.position.y = -0.1;
  scene.add(gp);
}




function addOrigin() {
  var originGroup = new THREE.Group();
  var redLine = getLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(6, 0, 0), 0xff0000);
  var greenLine = getLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 4), 0x00ff00);
  var blueLine = getLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 2, 0), 0x0000ff);
  originGroup.add(redLine);
  originGroup.add(greenLine);
  originGroup.add(blueLine);
  scene.add(originGroup);
}




//-----------------------------------------------------------------------------




function ControlPoint(row, col, xSpc, zSpc) {
  this.phyMesh = (row%2 != 0) ? getBox(0.1, 0.1, 0.1, 1, 0xff0000) : getBox(0.1, 0.1, 0.1, 5, 0xff0000);
  this.row = row;
  this.col = col;
  this.phyMesh.position.x = row * xSpc;
  this.phyMesh.position.y = (col % 2==0)?0.5:2;
  this.phyMesh.position.z = col * zSpc;
}



ControlPoint.prototype.getPhyMesh = function() {
  return this.phyMesh;
}



ControlPoint.prototype.addToScene = function() {
  scene.add(this.phyMesh);
}



ControlPoint.prototype.getPosition = function() {
  return this.phyMesh.position;
}


ControlPoint.prototype.move = function(movVector) {
  this.phyMesh.setLinearVelocity(moveVector);
}




//-----------------------------------------------------------------------------




var pointsArray = [];



function addPointsArray(xCount, zCount, xSpacing, zSpacing) {
  for (var col=0; col<zCount; col++) {
    var rowArray = [];
    for (var row=0; row<xCount; row++) {
      var cp = new ControlPoint(row, col, xSpacing, zSpacing);
      cp.addToScene();
      rowArray.push(cp);
    }
    pointsArray.push(rowArray);
  }
}




//-----------------------------------------------------------------------------




var constraintLinesGroup;



function removeConstraintLinesGroup() {
  scene.remove(constraintLinesGroup);
}



function addConstraintLinesGroup() {
  constraintLinesGroup = new THREE.Group();
  for (var col=0; col<pointsArray.length; col++) {
    for (var row=0; row<pointsArray[col].length; row++) {
      if (col+1 < pointsArray.length) {
        constraintLinesGroup.add(getLine(pointsArray[col][row].getPosition(),
                                         pointsArray[col+1][row].getPosition(),
                                         0x00ff00));
      }
      if (row+1 < pointsArray[col].length) {
        constraintLinesGroup.add(getLine(pointsArray[col][row].getPosition(),
                                         pointsArray[col][row+1].getPosition(),
                                         0x0000ff));
      }
    }
  }
  scene.add(constraintLinesGroup);
}



function redrawConstraintLines() {
  if (firstFrame) {
    addConstraintLinesGroup();
    firstFrame = false;
    return;
  }
  removeConstraintLinesGroup();
  addConstraintLinesGroup();
  
}




//-----------------------------------------------------------------------------




function getSinglePtConstraintObject(cp1) {
  var pt1 = cp1.getPhyMesh();
  var constraint = new Physijs.PointConstraint(
    pt1,
    pt1.position
    );
  return constraint;
}



function getDoublePtConstraintObject(cp1, cp2) {
  var pt1 = cp1.getPhyMesh();
  var pt2 = cp2.getPhyMesh();
  var constraint = new Physijs.PointConstraint(
    pt1,
    pt2,
    pt1.position
    );
  return constraint;
}




//---------------------------------------------------------




function addPtConstraints(xCount, zCount) {
  for (var col=0; col<zCount-1; col++) {
    for (var row=0; row<xCount; row++) {
      scene.addConstraint(getDoublePtConstraintObject(pointsArray[col][row], pointsArray[col+1][row]));
    }
  }

  for (var col=0; col<zCount; col++) {
    for (var row=0; row<xCount-1; row++) {
      scene.addConstraint(getDoublePtConstraintObject(pointsArray[col][row], pointsArray[col][row+1]));
    }
  }
}




//-----------------------------------------------------------------------------



function addSingleSliderConstraintObject(cp1, axis) {
  var pt1 = cp1.getPhyMesh();
  var constraint = new Physijs.SliderConstraint(
    pt1,
    new THREE.Vector3(0, 0, 0),
    axis
    );
  scene.add(constraint);
  constraint.setLimits(-10, 10, 0, 0);
  constraint.setRestitution(0.1, 0.1);
  // constraint.enableLinearMotor(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0) );
  // constraint.disableLinearMotor();
  // constraint.enableAngularMotor(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));
  // constraint.disableAngularMotor();
}




//---------------------------------------------------------




function addSliderConstraints(xCount, zCount) {
  // for (var col=0; col<zCount-1; col++) {
  //   for (var row=0; row<xCount; row++) {
  //     var cp1 = pointsArray[col][row];
  //     var cp2 = pointsArray[col+1][row];
  //     var axis = new THREE.Vector3(0, 0, 1);
  //     scene.addConstraint(getSingleSliderConstraintObject(cp1, axis, cp1.getPosition(), cp2.getPosition()));
  //   }
  // }

  for (var col=0; col<zCount; col++) {
    for (var row=0; row<xCount-1; row++) {
      var cp1 = pointsArray[col][row];
      var cp2 = pointsArray[col][row+1];
      var axis = new THREE.Vector3(0, 1, 0);
      addSingleSliderConstraintObject(cp1, axis);
    }
  }
}




//-----------------------------------------------------------------------------




function moveLastRow(moveVector) {
  for(var i=0; i<pointsArray[pointsArray.length-1].length; i++) {
    pointsArray[pointsArray.length-1][i].move(moveVector);
  }
}



function pinDownFirstRow() {
  for(var i=0; i<pointsArray[0].length; i++) {
    scene.addConstraint(getSinglePtConstraintObject(pointsArray[0][i]));
  }
}



function moveAltPoint(moveVector) {
  for(var i=2; i<pointsArray.length; i++) {
    if (i % 2 == 0) {
      for (var j=0; j<pointsArray[i].length; j++) {
        pointsArray[i][j].getPhyMesh().setLinearVelocity(moveVector);
      }
    }
  }
}




//-----------------------------------------------------------------------------


var trialBox;

function trialSlider() {
  trialBox = getBox(1, 1, 1, 1, 0xff00ff);
  trialBox.position.set(-3, 3, -3);
  scene.add(trialBox);
  var constraint = new Physijs.SliderConstraint(trialBox, new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0));
  scene.addConstraint(constraint);
  constraint.setLimits(-10, 10, 0, 0);
  constraint.setRestitution(0.1, 0.1);
}



// function moveBullDozer(moveVector) {
//   bullDozer.setLinearVelocity(moveVector);
// }



// var bullDozer;



// function addBullDozer() {
//   bullDozer = getBox(15, 2, 0.1, 10, 0xffff00);
//   bullDozer.position.x = 6;
//   bullDozer.position.y = 1;
//   bullDozer.position.z = 12.6;
//   scene.add(bullDozer);
// }




//-----------------------------------------------------------------------------




function pavilionRun(){

  var xCount = 3;
  var zCount = 5;
  var xSpacing = 6;
  var zSpacing = 3;
  if(debug) addOrigin();
  addGroundPlane();
  // addBullDozer();
  addPointsArray(xCount, zCount, xSpacing, zSpacing);
  addPtConstraints(xCount, zCount);
  // addSliderConstraints(xCount, zCount);
  pinDownFirstRow();

  trialSlider();


  var pushSpeed = 4;
  var moveXVec = new THREE.Vector3(pushSpeed, 0, 0);
  var moveYVec = new THREE.Vector3(0, pushSpeed, 0);
  var moveZVec = new THREE.Vector3(0, 0, -pushSpeed);

  var moveYZVec = new THREE.Vector3(0, pushSpeed*4, pushSpeed*4);


  window.addEventListener( 'keydown', function( event ) {
      switch ( event.keyCode ) {
        // Q
        case 81: {
          moveLastRow(moveZVec);
          break;
        }
        // D
        case 68: {
          // moveBullDozer(-10);
          break;
        }
        // F
        case 70: {
          moveAltPoint(moveZVec);
          break;
        }
        // Z
        case 90: {
          trialBox.setLinearVelocity(moveYZVec);
          break;
        }
    }
  });

}





