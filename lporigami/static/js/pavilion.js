




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
  this.phyMesh = getBox(1, 1, 1, 1, 0xff0000);
  this.row = row;
  this.col = col;
  this.phyMesh.position.x = row * xSpc;
  this.phyMesh.position.y = (col % 2==0)?0.5:1;
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


ControlPoint.prototype.move = function(amt) {
  this.phyMesh.setLinearVelocity(new THREE.Vector3(0, 0, amt));
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




function attachPoints(xCount, zCount) {
  for (var col=0; col<zCount-1; col++) {
    for (var row=0; row<xCount; row++) {
      scene.addConstraint(getConstraintObject(pointsArray[col][row], pointsArray[col+1][row]));
    }
  }

  for (var col=0; col<zCount; col++) {
    for (var row=0; row<xCount-1; row++) {
      scene.addConstraint(getConstraintObject(pointsArray[col][row], pointsArray[col][row+1]));
    }
  }
}



function getConstraintObjectSingle(cp1) {
  var pt1 = cp1.getPhyMesh();
  var constraint = new Physijs.PointConstraint(
    pt1,
    pt1.position
    );
  return constraint;
}



function getConstraintObject(cp1, cp2) {
  var pt1 = cp1.getPhyMesh();
  var pt2 = cp2.getPhyMesh();
  var constraint = new Physijs.PointConstraint(
    pt1,
    pt2,
    pt1.position
    );
  return constraint;
}




//-----------------------------------------------------------------------------




function moveLastRow(amt) {
  for(var i=0; i<pointsArray[pointsArray.length-1].length; i++) {
    pointsArray[pointsArray.length-1][i].move(amt);
  }
}



function pinDownFirstRow() {
  for(var i=0; i<pointsArray[0].length; i++) {
    scene.addConstraint(getConstraintObjectSingle(pointsArray[0][i]));
  }
}



function moveAltPoint(amt) {
  for(var i=2; i<pointsArray.length; i++) {
    if (i % 2 == 0) {
      for (var j=0; j<pointsArray[i].length; j++) {
        pointsArray[i][j].getPhyMesh().setLinearVelocity(new THREE.Vector3(0, 0, amt));
      }
    }
  }
}



// function moveBullDozer(amt) {
//   bullDozer.setLinearVelocity(new THREE.Vector3(0, 0, amt));
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

  window.addEventListener( 'keydown', function( event ) {
      switch ( event.keyCode ) {
        // Q
        case 81: {
          moveLastRow(-10);
          break;
        }
        // W
        case 87: {
          moveLastRow(10);
          break;
        }
        // D
        case 68: {
          // moveBullDozer(-10);
          break;
        }
        // F
        case 70: {
          moveAltPoint(-10);
          break;
        }
        // G
        case 71: {
          moveAltPoint(10);
          break;
        }
    }
  });

  var xCount = 3;
  var zCount = 5;
  var xSpacing = 6;
  var zSpacing = 3;
  if(debug) addOrigin();
  addGroundPlane();
  // addBullDozer();
  addPointsArray(xCount, zCount, xSpacing, zSpacing);
  attachPoints(xCount, zCount);
  pinDownFirstRow();
}





