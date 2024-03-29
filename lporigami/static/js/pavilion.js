


    debug = false;
    // debug = true;




    // global params
    divisions = 20;
    foldHeight = 4;
    height = 1.0;
    eaveHeightFront = 30;
    eaveHeightBack = 15;
    width = 90;
    breadth = 90;
    pinch = 30;
    analyzeSurface = false;
    seeEdges = true;
    panelColor = 0xD3D3D3;
    var origamiGroup;
    var envModelsGroup;
    var lineMaterial = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 4});
    var panelMaterial = new THREE.MeshPhongMaterial( { side: THREE.DoubleSide, color: panelColor, specular: 0x00ff00, shininess: 0, shading: THREE.FlatShading } );
    var activePanelMaterial;


    var guiControls = new function() {
        this.divisions = divisions;
        this.foldHeight = foldHeight;
        this.height = height;
        this.eaveHeightFront = eaveHeightFront;
        this.eaveHeightBack = eaveHeightBack;
        this.width = width;
        this.breadth = breadth;
        this.pinch = pinch;
        this.analyzeSurface = analyzeSurface;
        this.seeEdges = seeEdges;
    }



    function setupControllers()
    {
        var datGUI = new dat.GUI({autoPlace: false});
        // datGUI.domElement.id = 'datGUI';
        var customContainer = document.getElementById('datGUI');
        customContainer.appendChild(datGUI.domElement);
        var widthController = datGUI.add(guiControls, 'width', 70, 120);
        var heightController = datGUI.add(guiControls, 'height', 1, 1.5).step(0.05);
        var breadthController = datGUI.add(guiControls, 'breadth', 70, 120);
        var pinchController = datGUI.add(guiControls, 'pinch', 0, 30);
        var eaveHeightFrontController = datGUI.add(guiControls, 'eaveHeightFront', 0, 60);
        var eaveHeightBackController = datGUI.add(guiControls, 'eaveHeightBack', 0, 60);
        var foldHeightController = datGUI.add(guiControls, 'foldHeight', 0, 10).step(1);
        var divisionsController = datGUI.add(guiControls, 'divisions', 4, 40);
        var analyzeSurface = datGUI.add(guiControls, 'analyzeSurface');
        var seeEdges = datGUI.add(guiControls, 'seeEdges');


        for (var i in datGUI.__controllers)
        {
            datGUI.__controllers[i].onFinishChange(function() {
                updateParameters();
                updateOrigamiModel();
            });
        }
    }



    function updateParameters()
    {
        divisions = guiControls.divisions;
        foldHeight = guiControls.foldHeight;
        height = guiControls.height;
        eaveHeightFront = guiControls.eaveHeightFront;
        eaveHeightBack = guiControls.eaveHeightBack;
        width = guiControls.width;
        breadth = guiControls.breadth;
        pinch = guiControls.pinch;
        analyzeSurface = guiControls.analyzeSurface;
        seeEdges = guiControls.seeEdges;
    }




    function init()
    {
        setupScene();
        overrideDefaultSceneSetup();
        loadAllModels();
        loadTrees();
        loadOrigamiModel();
        setupControllers();
    }




    function overrideDefaultSceneSetup() {
        var focusPt = new THREE.Vector3( width/2, breadth/2, 25 );

        renderer.setClearColor (0xe0e0e0, 1);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        camera.position.set( -120, -100, 60 );
        camera.lookAt(focusPt);



        var spotLight = new THREE.SpotLight( 0xffffff, 1.5 );
        spotLight.position.set( 0, 0, 465 );
        spotLight.target.position.set( 60, 60, 0 );
        spotLight.angle = Math.PI / 3;
        spotLight.castShadow = true;
        spotLight.penumbra = 0.05;
        spotLight.decay = 2;
        spotLight.distance = 800;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.near = 50;
        spotLight.shadow.camera.far = 800;
        scene.add(spotLight);
        scene.add(spotLight.target);
        // lightHelper = new THREE.SpotLightHelper( spotLight );
        // scene.add(lightHelper);
        // shadowCameraHelper = new THREE.CameraHelper( spotLight.shadow.camera );
        // scene.add( shadowCameraHelper );
    }




    function loadOrigamiModel()
    {

        crv1Pt1 = [0, pinch, 0];
        crv1Pt2 = [width/2, 0, eaveHeightFront];
        crv1Pt3 = [width, pinch, 0];


        crv2Pt1 = [0, breadth-pinch, 0];
        crv2Pt2 = [width/2, breadth, eaveHeightBack];
        crv2Pt3 = [width, breadth-pinch, 0];


        baseCrvPts1 = [crv1Pt1, crv1Pt2, crv1Pt3];
        baseCrvPts2 = [crv2Pt1, crv2Pt2, crv2Pt3];


        for (var i=0; i<baseCrvPts1.length; i++)
        {
            baseCrvPts1[i][2] *= height;
            baseCrvPts2[i][2] *= height;
        }
        
        
        var loftedSurface = createLoftedSurface(baseCrvPts1, baseCrvPts2);
        if (debug) {addMeshToScene( loftedSurface.toThreeGeometry() );}
        origamiGroup = createOrigamiSurface(loftedSurface, divisions, foldHeight);
        scene.add(origamiGroup);
    }




    function updateOrigamiModel()
    {
        scene.remove(origamiGroup);
        loadOrigamiModel();
    }





    function loadModel(filename, matColor, isTransparent)
    {
        var manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) {
            console.log( item, loaded, total );
        };
        var texture = new THREE.Texture();
        var onProgress = function ( xhr ) {
            if ( xhr.lengthComputable ) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log( Math.round(percentComplete, 2) + '% downloaded' );
            }
        };
        var onError = function ( xhr ) {
        };
        var objMat = new THREE.MeshPhongMaterial( { side: THREE.DoubleSide, color: matColor,
                                                    specular: 0xffffff, shininess: 0,
                                                    shading: THREE.FlatShading, transparent: isTransparent,
                                                    opacity: 0.8 } );
        var loader = new THREE.OBJLoader( manager );
        loader.load( filename, function ( object ) {
            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.castShadow = true;
                    child.material = objMat;
                }
            } );
            envModelsGroup.add( object );
        }, onProgress, onError );
    }



    function loadAllModels()
    {
        envModelsGroup = new THREE.Group();
        for(i=0; i<bgModels.length; i++) {
            loadModel(bgModels[i], bgModelColor[i], bgModelAlpha[i]);
        }
        scene.add(envModelsGroup);
    }




    function addTree(position, scale) {
        var tree = new THREE.Tree({
          generations : 4,        // # for branch' hierarchy
          length      : 4.0,      // length of root branch
          uvLength    : 16.0,     // uv.v ratio against geometry length (recommended is generations * length)
          radius      : 0.08,      // radius of root branch
          radiusSegments : 8,     // # of radius segments for each branch geometry
          heightSegments : 3      // # of height segments for each branch geometry
        });

        var treeGeometry = THREE.TreeGeometry.build(tree);

        var treeMesh = new THREE.Mesh(
            treeGeometry, 
            new THREE.MeshBasicMaterial( { color: 0x222222 } )
        );
        treeMesh.castShadow = true;

        treeMesh.rotation.x = Math.PI / 2;
        treeMesh.position.set(position.x, position.y, position.z);
        treeMesh.scale.set(scale, scale, scale);

        scene.add(treeMesh);
    }


    function loadTrees() {
        for(var i=0; i < treePositions.length; i++) {
            addTree(treePositions[i], getRandomInRange(4, 6));
        }
    }




    function getDistance(pt1, pt2)
    {
        var dX = pt2[0]-pt1[0];
        var dY = pt2[1]-pt1[1];
        var dZ = pt2[2]-pt1[2];
        return (Math.sqrt(Math.abs((dX^2) + (dY^2) + (dZ^2))));
    }


    function getRemappedFromZero(inpVal, srcRange, tgtRange)
    {
        return tgtRange * (inpVal/srcRange);
    }


    function getRandomInRange(min,max)
    {
        return Math.random()*(max-min+1)+min;
    }


    function getPtAlongLine(ptA, ptB, t)
    {
        var newPt = [0, 0, 0];
        newPt[0] = (ptA[0] + ((ptB[0]-ptA[0]) * t));
        newPt[1] = (ptA[1] + ((ptB[1]-ptA[1]) * t));
        newPt[2] = (ptA[2] + ((ptB[2]-ptA[2]) * t));
        return newPt;
    }



    // smoothVal controls the smoothness of the rise and fall on the curves
    function getArchCurveOld(basePt1, basePt2, smoothVal)
    {
        var crestMultiplier = 1;
        var lowerTroughMultiplier = 1;
        var higherTroughMultiplier = 1;

        var divsA = 6;
        var incrA = 1.0/divsA;

        var ptsA = [basePt1];
        for (var i=1; i<divsA; i++)
        {
            var midPt = getPtAlongLine(basePt1, basePt2, (incrA * i));
            // midPt[2] += (getDistance(basePt1, basePt2));
            ptsA.push(midPt);
        }
        ptsA.push(basePt2);

        if (debug) {addPointsToScene(ptsA);}
        var interpCurve = verb.geom.NurbsCurve.byPoints( ptsA, 2 );
        return interpCurve;
    }


    // returns a value of 0.5 foldHeightd to power of the value between 0 and 1 domain
    // creates a smoothing function when iterated between 0 and 1, flattening towards 1
    // offset is used to constrain the value in global space
    function getAdjustedValue(inpVal, t, offset=0)
    {
        inpVal -= offset;
        var retVal = (inpVal * (Math.pow(0.5, t)));
        return retVal + offset;
    }


    function getArchCurve(basePt1, basePt2, smoothVal)
    {
        var divsA = 6;
        var incrA = 1.0/divsA;

        var ptsA = [basePt1];
        for (var i=1; i<divsA; i++)
        {
            var midPt = getPtAlongLine(basePt1, basePt2, (incrA * i));
            midPt[2] = getAdjustedValue(midPt[2], (incr * (i)), basePt2[2]);
            ptsA.push(midPt);
        }
        ptsA.push(basePt2);

        var interpCurve = verb.geom.NurbsCurve.byPoints( ptsA, 2 );
        if (debug) {addPointsToScene(ptsA);}
        if (debug) {addCurveToScene(interpCurve.toThreeGeometry());}
        return interpCurve;
    }


    function createLoftedSurface(baseCrvPts1, baseCrvPts2)
    {
        var interpBaseCrv1 = verb.geom.NurbsCurve.byPoints( baseCrvPts1, 2 );
        var interpBaseCrv2 = verb.geom.NurbsCurve.byPoints( baseCrvPts2, 2 );
        if (debug) {addCurveToScene( interpBaseCrv1.toThreeGeometry() );}
        if (debug) {addCurveToScene( interpBaseCrv2.toThreeGeometry() );}
        var divs = 6;

        incr = 1.0/divs;
        surfaceCurves = [];
        for (i = 0; i <= divs; i++)
        {
            ptA = interpBaseCrv1.point(i * incr);
            ptB = interpBaseCrv2.point(i * incr);
            var archCurve = getArchCurve(ptA, ptB, (i*incr));
            surfaceCurves.push(archCurve);
        }

        var srf = verb.geom.NurbsSurface.byLoftingCurves( surfaceCurves, 3 );
        return srf;
    }


    function createOrigamiSurface(srf, divisions, foldHeight) {
        group = new THREE.Group();
        step = 1/divisions;
        for(x = 0; x < divisions; x++)
        {
            i = x/divisions;
            
            for(y = 0; y < divisions-1; y++)
            {
                j=y/divisions;
                
                if(y%2 == 0)
                {
                    if(x%2 == 0)
                    {
                        try
                        {
                            var a = srf.point(i,j+step);
                            var b = srf.point(i+step,j);
                            createPanel([a[0],a[1],a[2]+foldHeight], [b[0],b[1],b[2]+foldHeight], srf.point(i+step,j+step), srf.point(i,j+2*step));
                        }
                        catch(err)
                        {
                            console.log("error 1");
                        }
                    }
                    else
                    {
                        try
                        {
                            var a = srf.point(i,j);
                            var b = srf.point(i+step,j+step);
                            createPanel([a[0],a[1],a[2]+foldHeight], [b[0],b[1],b[2]+foldHeight], srf.point(i+step,j+2*step), srf.point(i,j+step));
                        }
                        catch(err)
                        {
                            console.log("error 2");
                        }
                    }
                }
                else
                {
                    if(x%2 == 0)
                    {
                        try
                        {
                            var a = srf.point(i+step,j+step);
                            var b = srf.point(i,j+2*step);
                            createPanel(srf.point(i,j+step), srf.point(i+step,j), [a[0],a[1],a[2]+foldHeight], [b[0],b[1],b[2]+foldHeight]);

                        }
                        catch(err)
                        {
                            console.log("error 3");
                        }
                    }
                    else
                    {
                        try
                        {
                            var a = srf.point(i+step,j+2*step);
                            var b = srf.point(i,j+step);
                            createPanel(srf.point(i,j), srf.point(i+step,j+step), [a[0],a[1],a[2]+foldHeight], [b[0],b[1],b[2]+foldHeight]);
                        }
                        catch(err)
                        {
                            console.log("error 4");
                        }
                    }
                }
            }
        }
        return group;
    }


    function roundHalf(num)
    {
        return Math.round(num*2)/2;
    }


    function getMaterial(gap, limit)
    {
        var maxColor = 0x00ff00;
        var dynColor = 0xffffff;
        // round to nearest 0.5 and remap it from given 0 to limit range to 0 to 256 range
        var rVal = Math.round(getRemappedFromZero(roundHalf(gap), limit, maxColor));
        // cap max values at maxColor
        if (rVal > maxColor) rVal = maxColor;
        // invert the color, to make black max and red min
        rVal = 0xff - rVal;
        // bitshifts to generate color in desired spectrum i.e (R-shift left 16, G-shift left 8, B-no shift) with 'OR' oper
        dynColor = ((dynColor) & ((rVal) << 16));
        // var material = new THREE.MeshLambertMaterial( { side: THREE.DoubleSide, color: dynColor, shading: THREE.SmoothShading } );
        // var material = new THREE.MeshPhongMaterial( { side: THREE.DoubleSide, color: dynColor, specular: 0x000000, shininess: 10, shading: THREE.FlatShading } );
        var material = new THREE.MeshPhongMaterial( { side: THREE.DoubleSide, color: dynColor, specular: 0xffffff, shininess: 0, shading: THREE.FlatShading } );
        return material;
    }



    function addEdge(pt1, pt2)
    {
        var lineGeom = new THREE.Geometry();
        lineGeom.vertices.push(new THREE.Vector3(pt1[0], pt1[1], pt1[2]));
        lineGeom.vertices.push(new THREE.Vector3(pt2[0], pt2[1], pt2[2]));
        var line = new THREE.Line(lineGeom, lineMaterial);
        group.add(line);
        lineGeom.vertices.push(new THREE.Vector3(pt2[0], pt2[1], pt2[2]));
        lineGeom.vertices.push(new THREE.Vector3(pt1[0], pt1[1], pt1[2]));
        var line = new THREE.Line(lineGeom, lineMaterial);
        group.add(line);
    }


    
    // creates a plane between 4 given points, by creating the diagonal planes
    // pts to be given in clockwise order
    function createPanel(pt1, pt2, pt3, pt4)
    {
        var gap1 = getDistance(pt1, pt3);
        var gap2 = getDistance(pt2, pt4);
        var gap = (gap1+gap2)/2;

        var mid1 = getPtAlongLine(pt1, pt3, 0.5);
        var mid2 = getPtAlongLine(pt2, pt4, 0.5);
        var midLine = verb.geom.NurbsCurve.byPoints( [mid1, mid2], 1 );
        if (debug) {addCurveToScene( midLine.toThreeGeometry() );}


        // var panelMaterial = new THREE.MeshBasicMaterial( { color: panelColor } );
        if (analyzeSurface)
        {
            activePanelMaterial = getMaterial(gap, 4);
        }
        else
        {
            activePanelMaterial = panelMaterial;
        }

        var planeGeometry = new THREE.Geometry();
        planeGeometry.vertices.push(new THREE.Vector3(pt1[0], pt1[1], pt1[2]));
        planeGeometry.vertices.push(new THREE.Vector3(pt2[0], pt2[1], pt2[2]));
        planeGeometry.vertices.push(new THREE.Vector3(pt3[0], pt3[1], pt3[2]));
        var face = new THREE.Face3( 0, 1, 2 );
        planeGeometry.faces.push( face );
        var meshToAdd1 = new THREE.Mesh( planeGeometry, activePanelMaterial );
        meshToAdd1.receiveShadow = true;
        meshToAdd1.castShadow = true;
        
        var planeGeometry = new THREE.Geometry();
        planeGeometry.vertices.push(new THREE.Vector3(pt3[0], pt3[1], pt3[2]));
        planeGeometry.vertices.push(new THREE.Vector3(pt4[0], pt4[1], pt4[2]));
        planeGeometry.vertices.push(new THREE.Vector3(pt1[0], pt1[1], pt1[2]));
        var face = new THREE.Face3( 0, 1, 2 );
        planeGeometry.faces.push( face );
        var meshToAdd2 = new THREE.Mesh( planeGeometry, activePanelMaterial );
        meshToAdd2.receiveShadow = true;
        meshToAdd2.castShadow = true;

        if (seeEdges)
        {
            addEdge(pt1, pt2);
            addEdge(pt3, pt4);
            addEdge(pt1, pt4);
            addEdge(pt2, pt3);
        }
        
        group.add(meshToAdd1);
        group.add(meshToAdd2);
    }


    function renderScene(){
        var controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set( width/2, breadth/2, 25 );

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



    init();
    renderScene();



    function getOrigamiModel()
    {
        scene.remove(envModelsGroup);
        var exporter = new THREE.OBJExporter();
        var result = exporter.parse( scene );
        scene.add(envModelsGroup);
        return result;
    }




    function downloadModel()
    {
        var modelData = getOrigamiModel();
        var fileName = "LERAPlusOrigamiPavilion_" + new Date().getTime() + ".obj";
        var file = new File([modelData], fileName, {type: "text/plain"});
        saveAs(file);
    }



