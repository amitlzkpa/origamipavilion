





//-----------------------------------------------------------------------------



var debug = true;
// var debug = false;



//-----------------------------------------------------------------------------



function calcInterp(valA, valB, off) {
    return valA + ((valB-valA) * off);
}


function getIntermediateVector3(pt1, pt2, offset) {
    return new THREE.Vector3(calcInterp(pt1.x, pt2.x, offset),
                             calcInterp(pt1.y, pt2.y, offset),
                             calcInterp(pt1.z, pt2.z, offset));
}


function getBisectionVector3(dist1, dist2, pt1, pt2) {
    var totalD = dist1 + dist2;
    var d = pt1.distanceTo(pt2);
    var diff = totalD-d;
    var newX = calcInterp(pt1.x, pt2.x, 0.5);
    var newY = diff/totalD;
    var newZ = calcInterp(pt1.z, pt2.z, 0.5);
    return new THREE.Vector3(newX, newY, newZ);
}


// function getBisectionVector3(dist1, dist2, pt1, pt2) {
//     var d = pt1.distanceTo(pt2);
//     var a = ((dist1^2) - (dist2^2) + (d^2)) / (2 * d);
//     var h = Math.sqrt((dist1^2) - (a^2));
//     var pt3 = pt2.sub(pt1);
//     pt3 = (pt3.addScalar(a/d)).add(pt1);
//     var iPt1 = new THREE.Vector3();
//     var iPt2 = new THREE.Vector3();
//     iPt1.x = pt3.x + h*(pt2.y - pt1.y)/d;
//     iPt1.y = pt3.y - h*(pt2.x - pt1.x)/d;
//     return iPt1;
// }



//-----------------------------------------------------------------------------



function getLine(start, end, lineColor) {
    var material = new THREE.LineBasicMaterial({
        color: lineColor
    });
    var geometry = new THREE.Geometry();
    geometry.vertices.push(start, end);
    var line = new THREE.Line( geometry, material );
    return line;
}


function getSphereMesh(radius, wSegs, hSegs, color) {
    var geometry = new THREE.SphereGeometry(radius, wSegs, hSegs);
    var material = new THREE.MeshBasicMaterial({color: color});
    var sphere = new THREE.Mesh(geometry, material);
    return sphere;
}


function getBoxMesh(width, height, depth, color) {
    var geometry = new THREE.BoxGeometry(width, height, depth);
    var material = new THREE.MeshBasicMaterial( {color: color} );
    var cube = new THREE.Mesh( geometry, material );
    return cube;
}



//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------




function ControlPoint(row, col) {
    this.mesh = getBoxMesh(0.5, 0.5, 0.5, 0xff0000);
    this.row = row;
    this.col = col;
    this.mesh.position.x = row * xSpacing;
    this.mesh.position.y = 0;
    this.mesh.position.z = col * zSpacing;
}



ControlPoint.prototype.getMesh = function() {
    return this.mesh;
}



//---------------------------------------------------------



function FoldPoint(attachPt1, attachPt2, offset) {
    this.pt1 = attachPt1;
    this.pt2 = attachPt2;
    var intPos = getIntermediateVector3(this.pt1.getMesh().position, this.pt2.getMesh().position, offset);
    this.distPt1 = this.pt1.getMesh().position.distanceTo(intPos);
    this.distPt2 = this.pt2.getMesh().position.distanceTo(intPos);
    this.mesh = getSphereMesh(0.2, 32, 32, 0xffff00);
    this.mesh.position.set(intPos.x, intPos.y, intPos.z);
}


FoldPoint.prototype.getMesh = function() {
    return this.mesh;
}


FoldPoint.prototype.getDistance1 = function() {
    return this.distPt1;
}


FoldPoint.prototype.getDistance2 = function() {
    return this.distPt2;
}


FoldPoint.prototype.getAttachedObj1 = function() {
    return this.pt1;
}


FoldPoint.prototype.getAttachedObj2 = function() {
    return this.pt2;
}


FoldPoint.prototype.reposition = function() {
    var intPos = getBisectionVector3(this.getDistance1(),
                                     this.getDistance2(),
                                     this.getAttachedObj1().getMesh().position,
                                     this.getAttachedObj2().getMesh().position);
    this.getMesh().position.x = intPos.x;
    this.getMesh().position.y = intPos.y;
    this.getMesh().position.z = intPos.z;
}



//-----------------------------------------------------------------------------



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



//---------------------------------------------------------



var debugControlPointsGroup;
var debugFoldPointsGroup;



function removeDebugPointsGroup() {
    scene.remove(debugControlPointsGroup);
    scene.remove(debugFoldPointsGroup);
}



function addDebugPointsGroup() {
    debugControlPointsGroup = new THREE.Group();
    for (var col=0; col<controlPointsArray.length; col++) {
        for (var row=0; row<controlPointsArray[col].length; row++) {
            debugControlPointsGroup.add(controlPointsArray[col][row].getMesh());
        }
    }
    scene.add(debugControlPointsGroup);

    debugFoldPointsGroup = new THREE.Group();
    for (var col=0; col<foldPointsArray.length; col++) {
        for (var row=0; row<foldPointsArray[col].length; row++) {
            debugFoldPointsGroup.add(foldPointsArray[col][row].getMesh());
        }
    }
    scene.add(debugFoldPointsGroup);
}



//---------------------------------------------------------



var debugLinesGroup;



function removeDebugLinesGroup() {
    scene.remove(debugLinesGroup);
}



function addDebugLinesGroup() {
    debugLinesGroup = new THREE.Group();
    for (var col=0; col<controlPointsArray.length; col++) {
        for (var row=0; row<controlPointsArray[col].length; row++) {
            if (col+1 < controlPointsArray.length) {
                debugLinesGroup.add(getLine(controlPointsArray[col][row].getMesh().position,
                   controlPointsArray[col+1][row].getMesh().position,
                   0x00ff00));
            }
            if (row+1 < controlPointsArray[col].length) {
                debugLinesGroup.add(getLine(controlPointsArray[col][row].getMesh().position,
                   controlPointsArray[col][row+1].getMesh().position,
                   0x0000ff));
            }
        }
    }
    scene.add(debugLinesGroup);
}



//---------------------------------------------------------



function setupDebug() {
    if(debug) addOrigin();
    if(debug) addDebugPointsGroup();
    if(debug) addDebugLinesGroup();
}



function updateDebug() {
    if (!debug) return;
    removeDebugPointsGroup();
    removeDebugLinesGroup();
    addDebugPointsGroup();
    addDebugLinesGroup();
}



//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------



var controlPointsArray = [];



function clearPointsArray() {
    for (var col=0; col<zCount; col++) {
        for (var row=0; row<xCount; row++) {
            delete controlPointsArray[row][col];
        }
    }
    controlPointsArray = [];
}



function setupPointsArray() {
    for (var col=0; col<zCount; col++) {
        var rowArray = [];
        for (var row=0; row<xCount; row++) {
            var cp = new ControlPoint(row, col, xSpacing, zSpacing);
            rowArray.push(cp);
        }
        controlPointsArray.push(rowArray);
    }
}



function repositionPointsArray() {
    for (var row=0; row<zCount; row++) {
        for (var col=0; col<xCount; col++) {
            var cp = controlPointsArray[row][col];
            cp.getMesh().position.set(col * xSpacing, 0, row * zSpacing);
        }
    }
}



//-----------------------------------------------------------------------------



var foldPointsArray = [];



function clearFoldPointsArray() {
    for (var col=0; col<foldPointsArray.length; col++) {
        for (var row=0; row<foldPointsArray[col].length; row++) {
            delete foldPointsArray[row][col];
        }
    }
    foldPointsArray = [];
}



function setupFoldPointsArray() {
    for (var row=0; row<controlPointsArray.length-1; row++) {
        var rowArray = [];
        for (var col=0; col<controlPointsArray[col].length; col++) {
            var fp = new FoldPoint(controlPointsArray[row][col], controlPointsArray[row+1][col], 0.6);
            rowArray.push(fp);
        }
        foldPointsArray.push(rowArray);
    }
}



function repositionFoldPoint() {
    for (var row=0; row<foldPointsArray.length; row++) {
        for (var col=0; col<foldPointsArray[row].length; col++) {
            foldPointsArray[row][col].reposition();
        }
    }
}



function updateFoldPointsArray() {
}



//-----------------------------------------------------------------------------



var meshGroup;



function setupMesh() {
    meshGroup = new THREE.Group();
    scene.add(meshGroup);
}



function updateMesh() {
    for (var row=0; row<controlPointsArray.length-1; row++) {
        for (var col=0; col<controlPointsArray[col].length; col++) {
        }
    }
}



//-----------------------------------------------------------------------------



function updateFrame() {
    repositionPointsArray();
    repositionFoldPoint();
    updateDebug();
}



//-----------------------------------------------------------------------------



var xCount = 3;
var zCount = 5;
var xSpacing = 6;
var zSpacing = 3;
var changeAmt = 0.2;


function reduceXSpacing() {
    xSpacing -= changeAmt;
    updateFrame();
}


function increaseXSpacing() {
    xSpacing += changeAmt;
    updateFrame();
}


function reduceZSpacing() {
    zSpacing -= changeAmt;
    updateFrame();
}


function increaseZSpacing() {
    zSpacing += changeAmt;
    updateFrame();
}



function pavilionRun(){
    setupPointsArray();
    setupFoldPointsArray();
    setupDebug();


    window.addEventListener( 'keyup', function( event ) {
        switch ( event.keyCode ) {
            // Q
            case 81: {
                reduceXSpacing();
                break;
            }
            // W
            case 87: {
                increaseXSpacing();
                break;
            }
            // A
            case 65: {
                reduceZSpacing();
                break;
            }
            // S
            case 83: {
                increaseZSpacing();
                break;
            }
        }
    });
}



//-----------------------------------------------------------------------------



// called after every frame;
frameUpdate = function() {
}



//-----------------------------------------------------------------------------





