


var bgModels = [];
var bgModelColor = [];
var bgModelAlpha = [];


function setupBackgroundModelFiles(configArray)
{
	bgModels.push(configArray[0]);
	bgModelColor.push(configArray[1]);
	bgModelAlpha.push(configArray[2]);
}




var treePositions = [];
function addTreeAtPosition(pos)
{
	treePositions.push(new THREE.Vector3(pos[0], pos[1], pos[2]));
}
