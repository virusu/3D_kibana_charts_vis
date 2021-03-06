
function THREEDC (THREEDC,camera,scene,renderer,container) {

	THREEDC.camera=camera;
	THREEDC.scene=scene;
	THREEDC.renderer=renderer;
	THREEDC.container=container;


	THREEDC.version='0.1-b';
	THREEDC.allCharts=[];
	THREEDC.allPanels=[];
	THREEDC.textLabel=null;
	THREEDC.chartToDrag=null;
	THREEDC.intervalFilter=[];
	THREEDC.raycaster = new THREE.Raycaster();
	THREEDC.mouse = new THREE.Vector2();
	THREEDC.offset = new THREE.Vector3();
	THREEDC.paint=true;
	   //////////////
   // CONTROLS //
   //////////////

   // move mouse and: left   click to rotate,
   //                 middle click to zoom,
   //                 right  click to pan
    THREEDC.controls = new THREE.OrbitControls( THREEDC.camera, THREEDC.renderer.domElement );
    THREEDC.controls.enableDamping = true;
	THREEDC.controls.dampingFactor = 0.25;
	//with this, we can use standard dom events without raycasting
	THREEDC.domEvents  = new THREEx.DomEvents(THREEDC.camera, THREEDC.renderer.domElement);
	//a little graphical interface//
	THREEDC.gui = new dat.GUI();

	THREEDC.parameters =
	{
		plane:"XZ",
		activate:false,
		activateFilter:false
	};

	var folder1 = THREEDC.gui.addFolder('Drag');
	var activateDrag = folder1.add( THREEDC.parameters, 'activate' ).name('On/Off').listen();
	activateDrag.onChange(function(value)
	{ THREEDC.dragTrigger(); });
	var dragChange = folder1.add( THREEDC.parameters, 'plane', [ "XZ", "XY" ] ).name('Plane').listen();
	dragChange.onChange(function(value)
	{   THREEDC.changePlane();   });
	folder1.close();
	THREEDC.gui.close();

	THREEDC.plane = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 2000, 2000, 8, 8 ),
		new THREE.MeshBasicMaterial( { transparent:true,opacity:0.5,side: THREE.DoubleSide,visible: false } )
	);
	THREEDC.plane.rotation.x = Math.PI / 2; //xz THREEDC.plane

	//it creates a panel to put the charts which are related
	THREEDC.addPanel=function (coords,numberOfCharts,size,opacity) {


	  coords = coords || [0,0,0];
	  numberOfCharts = numberOfCharts || 4;
	  opacity = opacity || 0.3;

	  var xSize;
	  var ySize;

		if(size){
			xSize=size[0];
			ySize=size[1];
		}else{
			xSize=500;
			ySize=500;
		}

	  var geometry = new THREE.CubeGeometry( xSize, ySize, 2);
	  var material = new THREE.MeshPhongMaterial( {
	  											   //color:0xff00ff,
	                                               specular: 0x999999,
	                                               shininess: 100,
	                                               shading : THREE.SmoothShading,
	                                               opacity:opacity,
	                                               transparent: true
	    } );

	  var panel = new THREE.Mesh(geometry, material);
	  panel.coords=new THREE.Vector3( coords[0], coords[1], coords[2] );
	  panel.charts=[];

	  panel.makeAnchorPoints =function() {
	   	panel.anchorPoints=[];
	  	var numberOfAnchorPoints=numberOfCharts;

	  	if(numberOfAnchorPoints===4){
			panel.anchorPoints[0]={filled:false,
								   coords:new THREE.Vector3( panel.coords.x-xSize/2, panel.coords.y-ySize/2, panel.coords.z )};
			panel.anchorPoints[1]={filled:false,
								   coords:new THREE.Vector3( panel.coords.x, panel.coords.y-ySize/2, panel.coords.z )};
			panel.anchorPoints[2]={filled:false,
								   coords:new THREE.Vector3( panel.coords.x-xSize/2, panel.coords.y, panel.coords.z )};
			panel.anchorPoints[3]={filled:false,
				                   coords:new THREE.Vector3( panel.coords.x,panel.coords.y, panel.coords.z )};
	  	}

	   	if(numberOfAnchorPoints===3){
			panel.anchorPoints[0]={filled:false,
								   coords:new THREE.Vector3( panel.coords.x-xSize/2, panel.coords.y-ySize/2, panel.coords.z )};
			panel.anchorPoints[1]={filled:false,
								   coords:new THREE.Vector3( panel.coords.x, panel.coords.y-ySize/2, panel.coords.z )};
			panel.anchorPoints[2]={filled:false,
								   coords:new THREE.Vector3( panel.coords.x-xSize/2, panel.coords.y, panel.coords.z )};
	  	}

	   	if(numberOfAnchorPoints===2){
			panel.anchorPoints[0]={filled:false,
								   coords:new THREE.Vector3( panel.coords.x-xSize/2, panel.coords.y-ySize/2, panel.coords.z )};
			panel.anchorPoints[1]={filled:false,
								   coords:new THREE.Vector3( panel.coords.x-xSize/2, panel.coords.y, panel.coords.z )};
	  	}


	  }

	  panel.makeAnchorPoints();
	  panel.position.set(panel.coords.x,panel.coords.y,panel.coords.z);
	  panel.isPanel=true;

	  panel.reBuild=function() {
	  	panel.makeAnchorPoints();
	  	for (var i = 0; i < panel.charts.length; i++) {
	  		panel.charts[i].reBuild();
	  	};
	  }

	  panel.remove=function() {
	  	THREEDC.scene.remove(panel);
	  	for (var i = 0; i < panel.charts.length; i++) {
	  		panel.charts[i].remove();
	  	};
	  }
	  console.log(THREEDC.scene);
	  THREEDC.scene.add(panel);

		THREEDC.domEvents.bind(panel, 'mousedown', function(object3d){
			if(THREEDC.parameters.activate){
				THREEDC.container.style.cursor = 'move';
				THREEDC.controls.enabled=false;
				THREEDC.SELECTED=panel;
				THREEDC.chartToDrag=panel;
			    THREEDC.plane.position.copy( panel.position );
			    THREEDC.raycaster.setFromCamera( THREEDC.mouse, THREEDC.camera );
			    var intersects = THREEDC.raycaster.intersectObject( THREEDC.plane );
			    if ( intersects.length > 0 ) {
			      THREEDC.offset.copy( intersects[ 0 ].point ).sub( THREEDC.plane.position );
			    }
			}
		});

		THREEDC.domEvents.bind(panel, 'mouseup', function(object3d){
	      if(THREEDC.chartToDrag){
	        THREEDC.controls.enabled=true;
	        THREEDC.container.style.cursor = 'auto';
	        THREEDC.SELECTED=null;
	        THREEDC.chartToDrag=null;
	        THREEDC.plane.material.visible=false;
	        panel.reBuild();
	      }
		});

	  return panel;
	}

	THREEDC.renderAll=function() {
		for (var i = 0; i < THREEDC.allCharts.length; i++) {
			THREEDC.allCharts[i].render();
		};
	}

	THREEDC.removeAll=function() {
		for (var i = 0; i < THREEDC.allCharts.length; i++) {
			THREEDC.allCharts[i].removeEvents();
	    	for (var j = 0; j < THREEDC.allCharts[i].parts.length; j++) {
	    		THREEDC.scene.remove(THREEDC.allCharts[i].parts[j]);
	    	};
		};
		THREEDC.allCharts=[];
	}

	THREEDC.removeEvents=function(){
		for (var i = 0; i < THREEDC.allCharts.length; i++) {
			THREEDC.allCharts[i].removeEvents();
		};
	}

	//The spherical coordinates of a point in the ISO convention (radius r, inclination θ, azimuth φ) can be obtained from its Cartesian coordinates (x, y, z)
	THREEDC.cartesianToSpherical=function (x,y,z) {
		var r=Math.sqrt(Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2)) ;
		var θ=Math.acos(z/r);
		var φ=Math.atan(y/x);

		return {r:r,θ:θ,φ:φ};
	 }

	//Conversely, the Cartesian coordinates may be retrieved from the spherical coordinates (radius r, inclination θ, azimuth φ), where r ∈ [0, ∞), θ ∈ [0, π], φ ∈ [0, 2π), by:
	THREEDC.sphericalToCartesian= function  (r,θ,φ) {
		var x=r*Math.sin(θ)*Math.cos(φ);
		var y=r*Math.sin(θ)*Math.sin(φ);
		var z=r*Math.cos(θ);

		return {x:x,y:y,z:z};
	 }

	 //console.log(sphericalToCartesian(50,Math.PI/2,0));

	/*base object whose methods are inherited for each implementation
	* the properties of a chart are given by a function chain
	*/
	THREEDC.baseMixin = function (_chart) {
		_chart={parts:[],
				xLabels:[],
				yLabels:[],
				xGrids:[],
				yGrids:[],
				//by default
				_gridsOn:false,
				_numberOfXLabels:9,
				_numberOfYLabels:9,
				_width:100,
				_height:100};

	    _chart.render=function() {
	    	//defined by each implementation
	    	_chart.build();
	    	for (var i = 0; i < _chart.parts.length; i++) {
	    		THREEDC.scene.add(_chart.parts[i]);
	    	};
	    }

	    _chart.remove=function(){
	    	_chart.removeEvents();
	    	_chart.removeLabels();
	    	_chart.removeGrids();

	    	for (var i = 0; i < _chart.parts.length; i++) {
	    		THREEDC.scene.remove(_chart.parts[i]);
	    	};
	    	var index = THREEDC.allCharts.indexOf(_chart);

	    	THREEDC.allCharts.splice(index, 1);
	    }

	    /*rebuild the chart when a filter is added
	    * or a chart is moved
	    */
	    _chart.reBuild=function(){
	     	_chart.removeEvents();
	     	_chart.removeLabels();
	     	_chart.removeGrids();
	    	for (var i = 0; i < _chart.parts.length; i++) {
	    		THREEDC.scene.remove(_chart.parts[i]);
	    	};
	    	_chart.parts=[];
	    	if(_chart.panel){
				for (var i = 0; i < _chart.panel.anchorPoints.length; i++) {
					if(!_chart.panel.anchorPoints[i].filled){
						_chart.coords=_chart.panel.anchorPoints[i].coords;
						_chart.panel.anchorPoints[i].filled=true;
						_chart.panel.charts.push(_chart);
						break;
					}
				};
	    	}
	    	_chart.render();
	    }

	    _chart.addEvents=function(){

	    	//custom events
	    	if(_chart._addCustomEvents){
		    	for (var i = 0; i < _chart.parts.length; i++) {
		    		_chart._addCustomEvents(_chart.parts[i]);
		    		//mouseover and mouse out events added here too for now
		    		addInfoEvents(_chart.parts[i]);
		    	};
	    	}else{
		    	//events by default
		    	for (var i = 0; i < _chart.parts.length; i++) {
		    		addEvents(_chart.parts[i]);
		    	};
	    	}

	    	function addInfoEvents (mesh) {
				//adds mouseover events
				THREEDC.domEvents.bind(mesh, 'mouseover', function(object3d){
					changeMeshColor(mesh);
					showInfo(mesh);
				});

				THREEDC.domEvents.bind(mesh, 'mouseout', function(object3d){
					//restores the original color
					if(mesh.type!='Line'){
						mesh.material.emissive.setHex(mesh.currentHex);
					}
				});
	    	}

			function addEvents (mesh) {

				//adds mouseover events
				THREEDC.domEvents.bind(mesh, 'mouseover', function(object3d){
					changeMeshColor(mesh);
					showInfo(mesh);
				});

				THREEDC.domEvents.bind(mesh, 'mouseout', function(object3d){
					//restores the original color
					if(mesh.type!='Line'){
						mesh.material.emissive.setHex(mesh.currentHex);
					}
				});

				//THREEDC.domEvents.bind(mesh, 'click', function(object3d){
				//	addFilter(mesh);
				//});

				THREEDC.domEvents.bind(mesh, 'mousedown', function(object3d){
					if(THREEDC.parameters.activate){
						THREEDC.container.style.cursor = 'move';
						THREEDC.controls.enabled=false;
						THREEDC.SELECTED=mesh;
						THREEDC.chartToDrag=_chart;
					    THREEDC.plane.position.copy( mesh.position );
					    THREEDC.raycaster.setFromCamera( THREEDC.mouse, THREEDC.camera );
					    var intersects = THREEDC.raycaster.intersectObject( THREEDC.plane );
					    if ( intersects.length > 0 ) {
					      THREEDC.offset.copy( intersects[ 0 ].point ).sub( THREEDC.plane.position );
					    }
					}else{
						THREEDC.container.style.cursor = 'move';
						THREEDC.controls.enabled=false;
						THREEDC.intervalFilter[0]=mesh.data.key;
					}
				});

				THREEDC.domEvents.bind(mesh, 'mouseup', function(object3d){
					if(!THREEDC.parameters.activate){
						THREEDC.container.style.cursor = 'auto';
						THREEDC.controls.enabled=true;
						THREEDC.intervalFilter[1]=mesh.data.key;
						addIntervalFilter();
					}else{
				      if(THREEDC.chartToDrag){
				        THREEDC.controls.enabled=true;
				        THREEDC.container.style.cursor = 'auto';
				        THREEDC.SELECTED=null;
				        THREEDC.chartToDrag=null;
				        THREEDC.plane.material.visible=false;
				      }
					}
				});

			}

			function addFilter (mesh) {
				console.log('click');
				//_chart._dimension.filterAll();
				_chart._dimension.filter(mesh.data.key);
				for (var i = 0; i < THREEDC.allCharts.length; i++) {
					THREEDC.allCharts[i].reBuild();
				};
			}

			function addIntervalFilter () {
				console.log('mouseup');
				//_chart._dimension.filterAll();
				if(THREEDC.intervalFilter[0]===THREEDC.intervalFilter[1]){
					_chart._dimension.filter(THREEDC.intervalFilter[0]);
				}else{
					_chart._dimension.filter(THREEDC.intervalFilter);
				}
				for (var i = 0; i < THREEDC.allCharts.length; i++) {
					THREEDC.allCharts[i].reBuild();
				};
			}

			//creates a 3D text label
			function showInfo (mesh) {
				  THREEDC.scene.remove(THREEDC.textLabel);
			      var txt = mesh.name;
			      var curveSeg = 3;
			      var material = new THREE.MeshPhongMaterial( {color:mesh.origin_color,
			      											   specular: 0x999999,
	                                            	           shininess: 100,
	                                            	           shading : THREE.SmoothShading
			      } );
			      var geometry = new THREE.TextGeometry( txt, {
			        size: 8,
			        height: 2,
			        curveSegments: 3,
			        font: "helvetiker",
			        weight: "bold",
			        style: "normal",
			        bevelEnabled: false
			      });
			      // Positions the text and adds it to the THREEDC.scene
			      THREEDC.textLabel = new THREE.Mesh( geometry, material );
			      THREEDC.textLabel.position.z = mesh.position.z;
			      THREEDC.textLabel.position.x = _chart.coords.x;
			      THREEDC.textLabel.position.y = _chart._height+10+_chart.coords.y;
			      //textLabel.rotation.set(3*Math.PI/2,0,0);
			      THREEDC.scene.add(THREEDC.textLabel);
			}

			function changeMeshColor (mesh) {
				if(mesh.type!='Line'){
				 	 mesh.currentHex=mesh.material.emissive.getHex();
			 		 mesh.material.emissive.setHex(mesh.origin_color);
				}
			}
	    }

	    _chart.removeEvents=function(){

	    	for (var i = 0; i < _chart.parts.length; i++) {
	    		removeEvents(_chart.parts[i]);
	    	};

			function removeEvents(mesh){
				//removes mouseover events
				THREEDC.domEvents.unbind(mesh, 'mouseover');
				THREEDC.domEvents.unbind(mesh, 'mouseout');
				//THREEDC.domEvents.unbind(mesh, 'click');
				THREEDC.domEvents.unbind(mesh, 'mousedown');
				THREEDC.domEvents.unbind(mesh, 'mouseup');
			}
	    }

	    _chart.gridsOn=function(color) {
	    	if( color) _chart._gridColor=color;
	    	_chart._gridsOn=true;

	    	return _chart;
	    }

	    _chart.gridsOff=function() {
	    	_chart._gridsOn=false;

	    	return _chart;
	    }

	    _chart.addGrids=function(){


			var material = new THREE.LineBasicMaterial({
				color: 0x000000,
				linewidth:1
			});

	    	var stepY=_chart._height/_chart._numberOfYLabels;


	 	 	for (var i = 0; i <_chart._numberOfYLabels+1; i++) {
	    		putYGrid(i*stepY);
	    	};


	    	var stepX=_chart._width/_chart._numberOfXLabels;


	 	 	for (var i = 0; i <_chart._numberOfXLabels+1; i++) {
	    		putXGrid(i*stepX);
	    	};

	    	_chart.renderGrids();

	    	function putXGrid (step) {

				var verticalGeometry = new THREE.Geometry();

				verticalGeometry.vertices.push(
					new THREE.Vector3( 0, -10, 0 ),
					new THREE.Vector3( 0, _chart._height, 0 )
				);
				var verticalLine = new THREE.Line( verticalGeometry, material );

				verticalLine.position.set(_chart.coords.x+step,_chart.coords.y,_chart.coords.z);
				_chart.xGrids.push(verticalLine);

	    	}

	    	function putYGrid (step) {

				var horizontalGeometry = new THREE.Geometry();

				horizontalGeometry.vertices.push(
					new THREE.Vector3( -10, 0, 0 ),
					new THREE.Vector3( _chart._width, 0, 0 )
				);
				var horizontalLine = new THREE.Line( horizontalGeometry, material );

				horizontalLine.position.set(_chart.coords.x,_chart.coords.y+step,_chart.coords.z);
				_chart.yGrids.push(horizontalLine);

	    	}

	    }
	    _chart.renderGrids=function(){
	    	for (var i = 0; i < _chart.xGrids.length; i++) {
	    		THREEDC.scene.add(_chart.xGrids[i]);
	    	};

	    	for (var i = 0; i < _chart.yGrids.length; i++) {
	    		THREEDC.scene.add(_chart.yGrids[i]);
	    	};
	    }

	    _chart.removeGrids=function() {
	    	for (var i = 0; i < _chart.xGrids.length; i++) {
	    		THREEDC.scene.remove(_chart.xGrids[i]);
	    	};
	    	_chart.xGrids=[];

	    	for (var i = 0; i < _chart.yGrids.length; i++) {
	    		THREEDC.scene.remove(_chart.yGrids[i]);
	    	};
	    	_chart.yGrids=[];
	    }


	    _chart.addLabels=function(){
	    	var numberOfValues;
	    	var topYValue;


	   	   if(_chart._group){
	   	   		topYValue=_chart._group.top(1)[0].value;
	   	   		numberOfValues=_chart._group.top(Infinity).length;
	   	   }

	   	   if(_chart._data){
		   		 topYValue=_chart.getTopValue();
		   		 numberOfValues=_chart._data.length;
	   	   }

	    	//Y AXIS
	    	//var numerOfYLabels=Math.round(_chart._height/20);
	    	var stepYValue= Math.round(topYValue/_chart._numberOfYLabels);
	    	var stepY=_chart._height/_chart._numberOfYLabels;
	    	var maxYLabelWidth=getMaxWidth(topYValue);

	 	 	for (var i = 0; i <_chart._numberOfYLabels+1; i++) {
	    		putYLabel(i*stepY,i*stepYValue);
	    	};

	    	/*
	    	//X AXIS
	    	var topXValue=_chart._group.top(1)[0].key;
	    	console.log(topXValue);
	    	//var numerOfXLabels=Math.round(_chart._width/15);
	    	var numerOfXLabels=9;
	    	var stepXValue= Math.round(topXValue/numerOfXLabels);
	    	var stepX=_chart._width/numerOfXLabels;
	    	var maxXLabelWidth=getMaxWidth(topXValue);

	 	 	for (var i = 0; i < numerOfXLabels+1; i++) {
	    		putXLabel(i*stepX,i*stepXValue);
	    	};
	    	*/

	    	_chart.renderLabels();

		    /* gets the max width of an axis label to calculate the separation
	   		*  between the chart border and the label
			*/
	    	function getMaxWidth (axis) {
				var txt = axis;
				var curveSeg = 3;
				var material = new THREE.MeshPhongMaterial( {color:0x000000,
															   specular: 0x999999,
				                            	           shininess: 100,
				                            	           shading : THREE.SmoothShading
				} );
				var geometry = new THREE.TextGeometry( txt, {
				size: 4,
				height: 2,
				curveSegments: 3,
				font: "helvetiker",
				weight: "bold",
				style: "normal",
				bevelEnabled: false
				});
				var label = new THREE.Mesh( geometry, material );
			    var box = new THREE.Box3().setFromObject(label);
				return box.size().x ;
	    	}

	    	function getMaxHeight (axis) {
				var txt = axis;
				var curveSeg = 3;
				var material = new THREE.MeshPhongMaterial( {color:0x000000,
															   specular: 0x999999,
				                            	           shininess: 100,
				                            	           shading : THREE.SmoothShading
				} );
				var geometry = new THREE.TextGeometry( txt, {
				size: 4,
				height: 2,
				curveSegments: 3,
				font: "helvetiker",
				weight: "bold",
				style: "normal",
				bevelEnabled: false
				});
				var label = new THREE.Mesh( geometry, material );
			    var box = new THREE.Box3().setFromObject(label);
				return box.size().y ;
	    	}

	    	function putYLabel (step,value) {

			      var txt = value;
			      var curveSeg = 3;
			      var material = new THREE.MeshPhongMaterial( {color:0x000000,
			      											   specular: 0x999999,
	                                            	           shininess: 100,
	                                            	           shading : THREE.SmoothShading
			      } );
			      var geometry = new THREE.TextGeometry( txt, {
			        size: _chart._height/30,
			        height: 2,
			        curveSegments: 3,
			        font: "helvetiker",
			        weight: "bold",
			        style: "normal",
			        bevelEnabled: false
			      });
			      // Positions the text and adds it to the THREEDC.scene
			      var label = new THREE.Mesh( geometry, material );
			      label.position.z = _chart.coords.z;
			      label.position.x = _chart.coords.x-maxYLabelWidth-15;
			      label.position.y = _chart.coords.y+step;
			     // label.rotation.set(3*Math.PI/2,0,0);
			      _chart.yLabels.push(label);
	    	}

	    	function putXLabel (step,value) {

			      var txt = value;
			      var curveSeg = 3;
			      var material = new THREE.MeshPhongMaterial( {color:0x000000,
			      											   specular: 0x999999,
	                                            	           shininess: 100,
	                                            	           shading : THREE.SmoothShading
			      } );
			      var geometry = new THREE.TextGeometry( txt, {
			        size: _chart._height/30,
			        height: 2,
			        curveSegments: 3,
			        font: "helvetiker",
			        weight: "bold",
			        style: "normal",
			        bevelEnabled: false
			      });
			      // Positions the text and adds it to the THREEDC.scene
			      var label = new THREE.Mesh( geometry, material );
			      label.position.z = _chart.coords.z;
			      label.position.x = _chart.coords.x+step;
			      label.position.y = _chart.coords.y-20;
			     // label.rotation.set(3*Math.PI/2,0,0);
			      _chart.xLabels.push(label);
	    	}
	    }

	    _chart.renderLabels=function(){
	    	for (var i = 0; i < _chart.xLabels.length; i++) {
	    		THREEDC.scene.add(_chart.xLabels[i]);
	    	};

	    	for (var i = 0; i < _chart.yLabels.length; i++) {
	    		THREEDC.scene.add(_chart.yLabels[i]);
	    	};
	    }

	    _chart.removeLabels=function() {
	    	for (var i = 0; i < _chart.xLabels.length; i++) {
	    		THREEDC.scene.remove(_chart.xLabels[i]);
	    	};
	    	_chart.xLabels=[];

	    	for (var i = 0; i < _chart.yLabels.length; i++) {
	    		THREEDC.scene.remove(_chart.yLabels[i]);
	    	};
	    	_chart.yLabels=[];
	    }

	    _chart.getTopValue=function() {
			var topValue = _chart._data[0].value;
			for (var i = 1; i < _chart._data.length; i++) {
				if (_chart._data[i].value > topValue) topValue=_chart._data[i].value;
			};

			return topValue;
		}

	    _chart.getTopValue2=function() {
			var topValue2 = _chart._data[0].value2;
			for (var i = 1; i < _chart._data.length; i++) {
				if (_chart._data[i].value2 > topValue2) topValue2=_chart._data[i].value2;
			};

			return topValue2;
		}

		_chart.sortCFData=function() {
		    var unsort_data=_chart._group.top(Infinity);

			var dates=[];
			//en dates guardo las fechas(keys)
			for (var i = 0; i <  unsort_data.length; i++) {
					dates[i]= unsort_data[i].key;
			};
			//ordeno fechas(keys) de menor a mayor
			dates.sort(function(a, b){return a-b});

		    //ordeno el grupo de menor a mayor usando
		    //las posiciones de dates
			var _data=[];
			for (var i = 0; i < dates.length; i++) {
				for (var j = 0; j <  unsort_data.length; j++) {
					if(dates[i] === unsort_data[j].key){
						_data[i]={key:unsort_data[j].key,
							      value:unsort_data[j].value};
					}
				};
			};

			return _data;
		}


	    _chart.group= function (group) {
	    	if(!arguments.length){
	    		console.log('argument needed');
	    		return;
	    	}
	    	_chart._group=group;
	    	return _chart;
	    }

	    _chart.dimension= function (dimension) {
	    	if(!arguments.length){
	    		console.log('argument needed');
	    		return;
	    	}
	    	_chart._dimension=dimension;
	    	return _chart;
	    }

	    _chart.width=function(width){
	    	if(!arguments.length){
	    		console.log('argument needed');
	    		return;
	    	}
	    	_chart._width=width;
	    	return _chart;
	    }

	    _chart.height=function(height){
	    	if(!arguments.length){
	    		console.log('argument needed');
	    		return;
	    	}
	    	_chart._height=height;
	    	return _chart;
	    }

	    _chart.color= function (color) {
	    	if(!arguments.length){
	    		console.log('argument needed');
	    		return;
	    	}
	    	_chart._color=color;
	    	return _chart;
	    }


	    _chart.numberOfXLabels=function(number){
	    	if(!arguments.length){
	    		console.log('argument needed');
	    		return;
	    	}
	    	_chart._numberOfXLabels=number;
	    	return _chart;
	    }

	    _chart.numberOfYLabels=function(number){
	    	if(!arguments.length){
	    		console.log('argument needed');
	    		return;
	    	}
	    	_chart._numberOfYLabels=number;
	    	return _chart;
	    }

	    _chart.depth=function(number){
	    	if(!arguments.length){
	    		console.log('argument needed');
	    		return;
	    	}
	    	_chart._depth=number;
	    	return _chart;
	    }

	    _chart.opacity=function(number){
	    	if(!arguments.length){
	    		console.log('argument needed');
	    		return;
	    	}
	    	_chart._opacity=number;
	    	return _chart;
	    }

	    _chart.addCustomEvents=function(argFunction){
	    	if(!arguments.length){
	    		console.log('argument needed');
	    		return;
	    	}
	    	_chart._addCustomEvents=argFunction;
	    	return _chart;
	    }

	    // data when crossfilter is not used
	    _chart.data=function(data){
	    	if(!arguments.length){
	    		console.log('argument needed');
	    		return;
	    	}
	    	_chart._data=data;
	    	return _chart;
	    }
		return _chart;

	}

	THREEDC.threeDMixin = function (_chart) {

		_chart = THREEDC.baseMixin(_chart);
		_chart.labels=[];

	    _chart.groupOne=function(group){
	    	if(!arguments.length){
	    		console.log('argument needed');
	    		return;
	    	}
	    	_chart._groupOne=group;
	    	return _chart;
	    }

	    _chart.groupTwo=function(group){
	    	if(!arguments.length){
	    		console.log('argument needed');
	    		return;
	    	}
	    	_chart._groupTwo=group;
	    	return _chart;
	    }

	    _chart.getKeysOne=function() {
	    	var keysOne=[];
			for (var i = 0; i < _chart._data.length; i++) {
				if(keysOne.indexOf(_chart._data[i].key1)===-1) keysOne.push(_chart._data[i].key1);

			};
			return keysOne;
	    }

	    _chart.getKeysTwo=function() {
	    	var keysTwo=[];
			for (var i = 0; i < _chart._data.length; i++) {
				if(keysTwo.indexOf(_chart._data[i].key2)===-1) keysTwo.push(_chart._data[i].key2);
			};
			return keysTwo;
	    }

	    _chart.addGrids=function(){

	    	var numberOfKeys1=_chart.getKeysOne().length;
	    	var numberOfKeys2=_chart.getKeysTwo().length;

			var material = new THREE.LineBasicMaterial({
				color: 0x000000,
				linewidth:1
			});

	    	addXYGrid();
	    	addXZgrid();
	    	addYZgrid();
	    	addGridBox();
	    	_chart.renderGrids();

	    	function addXYGrid () {

		    	var stepY=_chart._height/_chart._numberOfYLabels;

		 	 	for (var i = 0; i <_chart._numberOfYLabels+1; i++) {
		    		putYGrid(i*stepY);
		    	};

		    	var stepX = _chart._width/numberOfKeys1;

	    	 	for (var i = 0; i <numberOfKeys1+1; i++) {
	    			putXGrid(i*stepX);
	    		};

		    	function putYGrid (step) {

					var horizontalGeometry = new THREE.Geometry();

					horizontalGeometry.vertices.push(
						new THREE.Vector3( -10, 0, 0 ),
						new THREE.Vector3( _chart._width, 0, 0 )
					);
					var horizontalLine = new THREE.Line( horizontalGeometry, material );

					horizontalLine.position.set(_chart.coords.x,_chart.coords.y+step,_chart.coords.z);
					_chart.yGrids.push(horizontalLine);

		    	}

		    	function putXGrid (step) {

					var verticalGeometry = new THREE.Geometry();

					verticalGeometry.vertices.push(
						new THREE.Vector3( 0, 0, 0 ),
						new THREE.Vector3( 0, _chart._height, 0 )
					);
					var verticalLine = new THREE.Line( verticalGeometry, material );

					verticalLine.position.set(_chart.coords.x+step,_chart.coords.y,_chart.coords.z);
					_chart.xGrids.push(verticalLine);

		    	}
	    	}

	    	function addXZgrid () {
	    		var stepX= _chart._width/numberOfKeys1;

		 	 	for (var i = 0; i <numberOfKeys1+1; i++) {
		    		putXGrid(i*stepX);
		    	};

	   			var stepZ= _chart._depth/numberOfKeys2;

		 	 	for (var i = 1; i <numberOfKeys2+1; i++) {
		    		putZGrid(i*stepZ);
		    	};

		    	function putXGrid (step) {

					var verticalGeometry = new THREE.Geometry();

					verticalGeometry.vertices.push(
						new THREE.Vector3( 0, 0, 0 ),
						new THREE.Vector3( 0, 0, _chart._depth+10 )
					);
					var verticalLine = new THREE.Line( verticalGeometry, material );

					verticalLine.position.set(_chart.coords.x+step,_chart.coords.y,_chart.coords.z);
					_chart.xGrids.push(verticalLine);
		    	}

		    	function putZGrid (step) {

					var horizontalGeometry = new THREE.Geometry();

					horizontalGeometry.vertices.push(
						new THREE.Vector3( -10, 0, 0 ),
						new THREE.Vector3( _chart._width, 0, 0 )
					);
					var horizontalLine = new THREE.Line( horizontalGeometry, material );

					horizontalLine.position.set(_chart.coords.x,_chart.coords.y,_chart.coords.z+step);
					_chart.yGrids.push(horizontalLine);

		    	}
	    	}

	    	function addYZgrid () {
	    		var stepY=_chart._height/_chart._numberOfYLabels;

		 	 	for (var i = 1; i <_chart._numberOfYLabels+1; i++) {
		    		putYGrid(i*stepY);
		    	};

	   			var stepZ= _chart._depth/numberOfKeys2;

		 	 	for (var i = 1; i <numberOfKeys2+1; i++) {
		    		putZGrid(i*stepZ);
		    	};

		    	function putYGrid (step) {

					var horizontalGeometry = new THREE.Geometry();

					horizontalGeometry.vertices.push(
						new THREE.Vector3( 0, 0, 0 ),
						new THREE.Vector3( 0, 0, _chart._depth )
					);
					var horizontalLine = new THREE.Line( horizontalGeometry, material );

					horizontalLine.position.set(_chart.coords.x+_chart._width,_chart.coords.y+step,_chart.coords.z);
					_chart.yGrids.push(horizontalLine);

		    	}

		    	function putZGrid (step) {

					var horizontalGeometry = new THREE.Geometry();

					horizontalGeometry.vertices.push(
						new THREE.Vector3( 0, 0, 0 ),
						new THREE.Vector3( 0, _chart._height, 0 )
					);
					var horizontalLine = new THREE.Line( horizontalGeometry, material );

					horizontalLine.position.set(_chart.coords.x+_chart._width,_chart.coords.y,_chart.coords.z+step);
					_chart.yGrids.push(horizontalLine);

		    	}

	    	}

	    	function addGridBox () {
				var material = new THREE.MeshPhongMaterial( {
														   color:_chart._gridColor || 0x0000ff,
				                                           specular: 0x999999,
				                                           shininess: 100,
				                                           shading : THREE.SmoothShading,
				                                           opacity:0.8,
				                                           transparent: true
				} );

				var geometryXY = new THREE.CubeGeometry( _chart._width, _chart._height, 1);
				var geometryYZ = new THREE.CubeGeometry( _chart._depth, _chart._height, 1);
				var geometryXZ = new THREE.CubeGeometry( _chart._width, _chart._depth, 1);

				var boxXY=new THREE.Mesh(geometryXY, material);
				boxXY.position.set(_chart.coords.x+_chart._width/2,_chart.coords.y+_chart._height/2,_chart.coords.z);
				//scene.add(boxXY);
				_chart.xGrids.push(boxXY);

				var boxYZ=new THREE.Mesh(geometryYZ, material);
				boxYZ.rotation.y = Math.PI / 2; //ZY plane
				boxYZ.position.set(_chart.coords.x+_chart._width,_chart.coords.y+_chart._height/2,_chart.coords.z+_chart._depth/2);
				//scene.add(boxYZ);
				_chart.xGrids.push(boxYZ);

				var boxXZ=new THREE.Mesh(geometryXZ, material);
				boxXZ.position.set(_chart.coords.x+_chart._width/2,_chart.coords.y,_chart.coords.z+_chart._depth/2);
				boxXZ.rotation.x = Math.PI / 2; //XZ plane
				//scene.add(boxXZ);
				_chart.xGrids.push(boxXZ);
	    	}

	    }
	    _chart.renderGrids=function(){
	    	for (var i = 0; i < _chart.xGrids.length; i++) {
	    		THREEDC.scene.add(_chart.xGrids[i]);
	    	};

	    	for (var i = 0; i < _chart.yGrids.length; i++) {
	    		THREEDC.scene.add(_chart.yGrids[i]);
	    	};
	    }

		//to fix
	    _chart.removeGrids=function() {
	    	for (var i = 0; i < _chart.xGrids.length; i++) {
	    		THREEDC.scene.remove(_chart.xGrids[i]);
	    	};
	    	_chart.xGrids=[];

	    	for (var i = 0; i < _chart.yGrids.length; i++) {
	    		THREEDC.scene.remove(_chart.yGrids[i]);
	    	};
	    	_chart.yGrids=[];
	    }

	    _chart.addLabels=function(){
	    	var numberOfValues;
	    	var topYValue;
	    	var keysOne=_chart.getKeysOne();
	    	var keysTwo=_chart.getKeysTwo();
	    	var numberOfKeys1=keysOne.length;
	    	var numberOfKeys2=keysTwo.length;

	   	   if(_chart._group){
	   	   		topYValue=_chart._group.top(1)[0].value;
	   	   		numberOfValues=_chart._group.top(Infinity).length;
	   	   }

	   	   if(_chart._data){
		   		 topYValue=_chart.getTopValue();
		   		 numberOfValues=_chart._data.length;
	   	   }

	    	addYLabels();
	    	addXLabels();
	    	addZLabels();
	    	_chart.renderLabels();

	   	   function addYLabels () {
		    	var stepYValue= Math.round(topYValue/_chart._numberOfYLabels);
		    	var stepY=_chart._height/_chart._numberOfYLabels;
		    	var maxYLabelWidth=getMaxWidth(topYValue);

		 	 	for (var i = 0; i <_chart._numberOfYLabels+1; i++) {
		    		putYLabel(i*stepY,i*stepYValue);
		    	};

		    	function putYLabel (step,value) {

				      var txt = value;
				      var curveSeg = 3;
				      var material = new THREE.MeshPhongMaterial( {color:0x000000,
				      											   specular: 0x999999,
		                                            	           shininess: 100,
		                                            	           shading : THREE.SmoothShading
				      } );
				      var geometry = new THREE.TextGeometry( txt, {
				        size: _chart._height/30,
				        height: 2,
				        curveSegments: 3,
				        font: "helvetiker",
				        weight: "bold",
				        style: "normal",
				        bevelEnabled: false
				      });
				      // Positions the text and adds it to the THREEDC.scene
				      var label = new THREE.Mesh( geometry, material );
				      label.position.z = _chart.coords.z;
				      label.position.x = _chart.coords.x-maxYLabelWidth*6;
				      label.position.y = _chart.coords.y+step;
				     // label.rotation.set(3*Math.PI/2,0,0);
				      _chart.labels.push(label);
		    	}
	   	   }

	   	   function addZLabels () {

		    	var stepZ=_chart._depth/numberOfKeys2/2;
		    	//TO FIX
		    	var maxZLabelWidth=20;
		    	putZLabel(stepZ,keysTwo[0]);
		    	stepZ=stepZ+_chart._depth/numberOfKeys2;
		 	 	for (var i = 1; i <numberOfKeys2; i++) {
		    		putZLabel(stepZ,keysTwo[i]);
		    		stepZ+=_chart._depth/numberOfKeys2;
		    	};

		    	function putZLabel (step,value) {

				      var txt = value;
				      var curveSeg = 3;
				      var material = new THREE.MeshPhongMaterial( {color:0x000000,
				      											   specular: 0x999999,
		                                            	           shininess: 100,
		                                            	           shading : THREE.SmoothShading
				      } );
				      var geometry = new THREE.TextGeometry( txt, {
				        size: _chart._depth/30,
				        height: 2,
				        curveSegments: 3,
				        font: "helvetiker",
				        weight: "bold",
				        style: "normal",
				        bevelEnabled: false
				      });
				      // Positions the text and adds it to the THREEDC.scene
				      var label = new THREE.Mesh( geometry, material );
				      label.position.z = _chart.coords.z+step;
				      label.position.x = _chart.coords.x-maxZLabelWidth*6;
				      label.position.y = _chart.coords.y;
				      label.rotation.set(3*Math.PI/2,0,0);
				      _chart.labels.push(label);
		    	}
	   	   }

	   	   function addXLabels () {

		    	var stepX=_chart._depth/numberOfKeys1/2;
		    	//TO FIX
		    	var maxXLabelWidth=20;
		    	putXLabel(stepX,keysOne[0]);
		    	stepX=stepX+_chart._width/numberOfKeys1;
		 	 	for (var i = 1; i <numberOfKeys1; i++) {
		    		putXLabel(stepX,keysOne[i]);
		    		stepX+=_chart._width/numberOfKeys1;
		    	};

		    	function putXLabel (step,value) {

				      var txt = value;
				      var curveSeg = 3;
				      var material = new THREE.MeshPhongMaterial( {color:0x000000,
				      											   specular: 0x999999,
		                                            	           shininess: 100,
		                                            	           shading : THREE.SmoothShading
				      } );
				      var geometry = new THREE.TextGeometry( txt, {
				        size: _chart._depth/30,
				        height: 2,
				        curveSegments: 3,
				        font: "helvetiker",
				        weight: "bold",
				        style: "normal",
				        bevelEnabled: false
				      });
				      // Positions the text and adds it to the THREEDC.scene
				      var label = new THREE.Mesh( geometry, material );
				      label.position.z = _chart.coords.z+_chart._depth+20;
				      label.position.x = _chart.coords.x+step;
				      label.position.y = _chart.coords.y;
				      label.rotation.set(3*Math.PI/2,0,3*Math.PI/2);
				      _chart.labels.push(label);
		    	}
	   	   }

	    	/*
	    	//X AXIS
	    	var topXValue=_chart._group.top(1)[0].key;
	    	console.log(topXValue);
	    	//var numerOfXLabels=Math.round(_chart._width/15);
	    	var numerOfXLabels=9;
	    	var stepXValue= Math.round(topXValue/numerOfXLabels);
	    	var stepX=_chart._width/numerOfXLabels;
	    	var maxXLabelWidth=getMaxWidth(topXValue);

	 	 	for (var i = 0; i < numerOfXLabels+1; i++) {
	    		putXLabel(i*stepX,i*stepXValue);
	    	};
	    	*/


		    /* gets the max width of an axis label to calculate the separation
	   		*  between the chart border and the label
			*/
	    	function getMaxWidth (axis) {
				var txt = axis;
				var curveSeg = 3;
				var material = new THREE.MeshPhongMaterial( {color:0x000000,
															   specular: 0x999999,
				                            	           shininess: 100,
				                            	           shading : THREE.SmoothShading
				} );
				var geometry = new THREE.TextGeometry( txt, {
				size: 4,
				height: 2,
				curveSegments: 3,
				font: "helvetiker",
				weight: "bold",
				style: "normal",
				bevelEnabled: false
				});
				var label = new THREE.Mesh( geometry, material );
			    var box = new THREE.Box3().setFromObject(label);
				return box.size().x ;
	    	}

	    	function getMaxHeight (axis) {
				var txt = axis;
				var curveSeg = 3;
				var material = new THREE.MeshPhongMaterial( {color:0x000000,
															   specular: 0x999999,
				                            	           shininess: 100,
				                            	           shading : THREE.SmoothShading
				} );
				var geometry = new THREE.TextGeometry( txt, {
				size: 4,
				height: 2,
				curveSegments: 3,
				font: "helvetiker",
				weight: "bold",
				style: "normal",
				bevelEnabled: false
				});
				var label = new THREE.Mesh( geometry, material );
			    var box = new THREE.Box3().setFromObject(label);
				return box.size().y ;
	    	}


	    	function putXLabel (step,value) {

			      var txt = value;
			      var curveSeg = 3;
			      var material = new THREE.MeshPhongMaterial( {color:0x000000,
			      											   specular: 0x999999,
	                                            	           shininess: 100,
	                                            	           shading : THREE.SmoothShading
			      } );
			      var geometry = new THREE.TextGeometry( txt, {
			        size: _chart._height/30,
			        height: 2,
			        curveSegments: 3,
			        font: "helvetiker",
			        weight: "bold",
			        style: "normal",
			        bevelEnabled: false
			      });
			      // Positions the text and adds it to the THREEDC.scene
			      var label = new THREE.Mesh( geometry, material );
			      label.position.z = _chart.coords.z;
			      label.position.x = _chart.coords.x+step;
			      label.position.y = _chart.coords.y-20;
			     // label.rotation.set(3*Math.PI/2,0,0);
			      _chart.labels.push(label);
	    	}
	    }

	    _chart.renderLabels=function(){
	    	for (var i = 0; i < _chart.labels.length; i++) {
	    		THREEDC.scene.add(_chart.labels[i]);
	    	};
	    }

	    _chart.removeLabels=function() {
	    	for (var i = 0; i < _chart.labels.length; i++) {
	    		THREEDC.scene.remove(_chart.labels[i]);
	    	};
	    	_chart.labels=[];
	    }
		return _chart;

	}

	THREEDC.pieChart = function (location) {

	   if(location===undefined){
	   	location=[0,0,0];
	   }
		//by default
		var _radius=50;

		var _chart = THREEDC.baseMixin({});
		_chart._width=_radius;
		_chart._height=_radius;
		//by default
		_chart._depth=5;
		_chart._opacity=0.8;
		var _data;

		if(location.isPanel){
			for (var i = 0; i < location.anchorPoints.length; i++) {
				if(!location.anchorPoints[i].filled){
					_chart.coords=location.anchorPoints[i].coords;
					_chart.coords.x=_chart.coords.x+_chart._width;
					_chart.coords.y=_chart.coords.y+_chart._height;
					location.anchorPoints[i].filled=true;
					location.charts.push(_chart);
					_chart.panel=location;
					break;
				}
			};
		}else{
			_chart.coords= new THREE.Vector3( location[0], location[1], location[2] );
		}

		THREEDC.allCharts.push(_chart);

		_chart.radius=function(radius){
			_radius=radius;
			_chart._width=radius;
			_chart._height=radius;
			return _chart;
		}


		_chart.getTotalValue=function(){
			var totalValue=0;

			for (var i = 0; i < _chart._data.length; i++) {
				totalValue +=_chart._data[i].value;
			};

			return totalValue;
		}

	    _chart.build=function () {

		   if(_chart._group===undefined && _chart._data===undefined){
		   	console.log('You must define a group or an array of data for this chart');
		   	return;
		   }

		   if(_chart._group && _chart._data){
		   	console.log('You must define a crossfilter group or an array of data, never both');
		   	return;
		   }

		   var valTotal;
		   var _data;

	   	   if(_chart._group){
	   	   		//_chart._dimension.filterAll();
	   	   		_data=_chart._group.top(Infinity).filter(function(d) { return d.value > 0; });
				 valTotal=0;
				for (var i = 0; i < _data.length; i++) {
					valTotal +=_data[i].value;
				};
	   	   }

	   	   if(_chart._data){
		   		 valTotal=_chart.getTotalValue();
	   	   		 _data=_chart._data;
	   	   }

	   	   var curveSegments;
	   	   if (_chart._data.length===1) {
	   	   		curveSegments=600;
	   	   }else{
	   	   		curveSegments=30;
	   	   };

			var  extrudeOpts = {curveSegments:curveSegments,
								amount: _chart._depth,
								bevelEnabled: true,
								bevelSegments: 4,
								steps: 2,
								bevelSize: 1,
								bevelThickness: 1 };

	   	    //console.log('length dimension'+_chart._dimension.top(Infinity).length);
	   	    //console.log('length group'+_chart._group.top(Infinity).length);

			var angPrev=0;
			var angToMove=0;

			for (var i = 0; i < _data.length; i++) {
				if(_data[i].value===0){
					//break;
				}
				var origin_color=Math.random() * 0xffffff
			        var material = new THREE.MeshPhongMaterial( {color: origin_color,
	                                            	        specular: 0x999999,
	                                            	        shininess: 100,
	                                            	        shading : THREE.SmoothShading,
	                                               	 		opacity:_chart._opacity,
	                                           				transparent: true
	            } );
	             // Creats the shape, based on the value and the _radius
				var shape = new THREE.Shape();
				var angToMove = (Math.PI*2*(_data[i].value/valTotal));
				shape.moveTo(0,0);
				shape.arc(0,0,_radius,angPrev,
				        angPrev+angToMove,false);
				shape.lineTo(0,0);
				var nextAng = angPrev + angToMove;

				var geometry = new THREE.ExtrudeGeometry( shape, extrudeOpts );
				var piePart = new THREE.Mesh( geometry, material );
				piePart.material.color.setHex(origin_color);
				piePart.origin_color=origin_color;
				//piePart.rotation.set(0,0,0);
				piePart.position.set(_chart.coords.x,_chart.coords.y,_chart.coords.z);
				piePart.name ="key:"+_data[i].key+" value:"+_data[i].value;
				piePart.data={
					key:_data[i].key,
					value:_data[i].value
				};
				piePart.parentChart=_chart;
				_chart.parts.push(piePart);
				angPrev=nextAng;
			}

			_chart.addEvents();
	    }

		return _chart;
	}

	THREEDC.barsChart = function (location){

		if(location==undefined){
			location=[0,0,0];
		}

		var _chart = THREEDC.baseMixin({});

			//by default
		_chart._depth=5;
		_chart._opacity=0.8;

		if(location.isPanel){
			for (var i = 0; i < location.anchorPoints.length; i++) {
				if(!location.anchorPoints[i].filled){
					_chart.coords=location.anchorPoints[i].coords;
					location.anchorPoints[i].filled=true;
					location.charts.push(_chart);
					_chart.panel=location;
					break;
				}
			};
		}else{
			_chart.coords= new THREE.Vector3( location[0], location[1], location[2] );
		}
		_chart._color=0x0000ff;

		THREEDC.allCharts.push(_chart);

		_chart.build = function() {
		   if(_chart._group===undefined && _chart._data===undefined){
		   	console.log('You must define a group or an array of data for this chart');
		   	return;
		   }

		   if(_chart._group && _chart._data){
		   	console.log('You must define a crossfilter group or an array of data, never both');
		   	return;
		   }

		   var numberOfValues;
		   var topValue;
		   var _data;

	   	   if(_chart._group){
	   	   		topValue=_chart._group.top(1)[0].value;
	   	   		numberOfValues=_chart._group.top(Infinity).length;
	   	   		_data=_chart.sortCFData();
	   	   }

	   	   if(_chart._data){
		   		 topValue=_chart.getTopValue();
		   		 numberOfValues=_chart._data.length;
	   	   		 _data=_chart._data;
	   	   }


		   var barWidth=_chart._width/numberOfValues;

		   var y;
		   var x=barWidth/2;

			for (var i = 0; i < _data.length; i++) {
		      	var barHeight=(_chart._height*_data[i].value)/topValue;
		 		var geometry = new THREE.CubeGeometry( barWidth, barHeight, _chart._depth);
				y=barHeight/2;
				var origin_color=_chart._color;
	   		    var material = new THREE.MeshPhongMaterial( {color: origin_color,
	                                                	     specular: 0x999999,
	                                                	     shininess: 100,
	                                                	     shading : THREE.SmoothShading,
	                                                   	     opacity:_chart._opacity,
	                                               		     transparent: true
	            } );
				var bar = new THREE.Mesh(geometry, material);
				bar.origin_color=origin_color;
				bar.position.set(x+_chart.coords.x,y+_chart.coords.y,_chart.coords.z+_chart._depth/2);
				bar.name = "key:"+_data[i].key+" value: "+_data[i].value;
				bar.data={
					key:_data[i].key,
					value:_data[i].value
				};
				bar.parentChart=_chart;
				_chart.parts.push(bar);
				x+=barWidth;

			};

		    _chart.addEvents();
		    _chart.addLabels();
			if (_chart._gridsOn) _chart.addGrids();
	    }

	    return _chart;
	}


	THREEDC.TDbarsChart = function (location){

		if(location==undefined){
			location=[0,0,0];
		}

		var _chart = THREEDC.threeDMixin({});

		//add to 3Dmixin when added
		_chart.labels=[];

			//by default
		_chart._depth=100;
		_chart._opacity=0.8;
		_chart._barSeparation=0.7;

		_chart.coords= new THREE.Vector3( location[0], location[1], location[2] );
		_chart._color=0x0000ff;

		THREEDC.allCharts.push(_chart);

	    // (0,1)> 1 no separation
	    //
	    _chart.barSeparation=function(separation){
	    	if(!arguments.length){
	    		console.log('argument needed');
	    		return;
	    	}
	    	_chart._barSeparation=separation;
	    	return _chart;
	    }

		_chart.build = function() {
			/*
		   if(_chart._groupOne===undefined || _chart._groupTwo===undefined){
		   	console.log('You must define two groups and dimensions');
		   	return;
		   }
		   */
		   var topValue=_chart.getTopValue();
		   var numberOfKeys1=_chart.getKeysOne();
		   var numberOfKeys2=_chart.getKeysTwo();
		   var barHeight;
		   var barWidth=_chart._width/numberOfKeys1.length*_chart._barSeparation;
		   var barDepth=_chart._depth/numberOfKeys2.length*_chart._barSeparation;
		   var dataPos=0;
		   var stepX=0;
	   	   var y=0;
		   var stepZ=_chart._depth/numberOfKeys2.length/2;
		   for (var i = 0; i < numberOfKeys2.length; i++) {
		   		stepX =_chart._width/numberOfKeys1.length/2;
		   		var origin_color =Math.random() * 0xffffff;
		   		for (var j = 0; j < numberOfKeys1.length; j++) {
		   			barHeight=(_chart._height*_chart._data[dataPos].value)/topValue;
		   			y=barHeight/2;
					var geometry = new THREE.CubeGeometry( barWidth, barHeight, barDepth);
					//var origin_color=_chart._color;
		   		    var material = new THREE.MeshPhongMaterial( {color: origin_color,
		                                                	     specular: 0x999999,
		                                                	     shininess: 100,
		                                                	     shading : THREE.SmoothShading,
		                                                   	     opacity:_chart._opacity,
		                                               		     transparent: true
		            } );
		            var bar = new THREE.Mesh(geometry, material);
		            bar.origin_color=origin_color;
		            bar.position.set(stepX+_chart.coords.x,y+_chart.coords.y,stepZ+_chart.coords.z);
		            bar.name = "key1:"+_chart._data[dataPos].key1+" key2:"+_chart._data[dataPos].key2+" value: "+_chart._data[dataPos].value;
		            bar.data={
		            	key1:_chart._data[dataPos].key1,
		            	key2:_chart._data[dataPos].key2,
		            	value:_chart._data[dataPos].value
		            };
		            bar.parentChart=_chart;
		            _chart.parts.push(bar);
					 stepX+=_chart._width/numberOfKeys1.length;
		   			dataPos++;
		   		};
		   		stepZ+=_chart._depth/numberOfKeys2.length;
		   };
		    _chart.addEvents();
		    _chart.addLabels();
			if (_chart._gridsOn) _chart.addGrids();
		}

		return _chart;
	}

	THREEDC.pointsCloudChart = function (location){

		if(location==undefined){
			location=[0,0,0];
		}

		var _chart = THREEDC.baseMixin({});

		THREEDC.allCharts.push(_chart);

		_chart.getPoints=function(points){
			if(!points){
				console.log('argument needed')
				return;
			}
			_chart._points=points;
			return _chart;
		}


		_chart.build = function() {
		   if(_chart._points===undefined){
		   	console.log('You must define an array of data for this chart');
		   	return;
		   }
		var tLoader = new THREE.TextureLoader();
	    var particleTexture= tLoader.load("/images/spark.png");

		particleGroup = new THREE.Object3D();
		particleAttributes = { startSize: [], startPosition: [], randomness: [] };

		var totalParticles = 200;
		var radiusRange = 10;
		for( var i = 0; i < _chart._points.length; i++ )
		{
		    var spriteMaterial = new THREE.SpriteMaterial( { map: particleTexture, color: 0xffffff } );

			var sprite = new THREE.Sprite( spriteMaterial );
			sprite.scale.set( 3, 3, 1.0 ); // imageWidth, imageHeight
			sprite.position.set( _chart._points[i].x, _chart._points[i].y, _chart._points[i].z );
			sprite.coordis=[_chart._points[i].x,_chart._points[i].y,_chart._points[i].z];
			// for a cube:
			// sprite.position.multiplyScalar( radiusRange );
			// for a solid sphere:
			// sprite.position.setLength( radiusRange * Math.random() );
			// for a spherical shell:
			//sprite.position.setLength( radiusRange * (Math.random() * 0.1 + 0.9) );

			// sprite.color.setRGB( Math.random(),  Math.random(),  Math.random() );
			sprite.material.color.setHSL( Math.random(), 0.9, 0.7 );

			// sprite.opacity = 0.80; // translucent particles
			sprite.material.blending = THREE.AdditiveBlending; // "glowing" particles
			THREEDC.domEvents.bind(sprite, 'mouseover', function(object3d){
				console.log(sprite.coordis);
			});
			//particleGroup.add( sprite );
			// add variable qualities to arrays, if they need to be accessed later
			particleAttributes.startPosition.push( sprite.position.clone() );
			particleAttributes.randomness.push( Math.random() );
			scene.add( sprite );
		}
		//particleGroup.position.y = 50;


	    }

	    return _chart;
	}

	THREEDC.simpleLineChart= function (coords) {

		this.coords=coords;

		var _chart = THREEDC.baseMixin({});

		THREEDC.allCharts.push(_chart);

		_chart.build = function() {

		   if(_chart._group===undefined){
		   	console.log('You must define a group for this chart');
		   	return;
		   }
		   if(coords==undefined){
		   	coords=[0,0,0];
		   }

			var chartShape = new THREE.Shape();
			chartShape.moveTo( 0,0 );
			var x=0;

		   _chart._group.top(Infinity).forEach(function(p,i) {
				chartShape.lineTo( x, p.value/10 );
				x+=1.5;
			});
			chartShape.lineTo( x, 0 );
			chartShape.lineTo( 0, 0 );

			var extrusionSettings = {
				size: 30, height: 4, curveSegments: 3,
				bevelThickness: 1, bevelSize: 2, bevelEnabled: false,
				material: 0, extrudeMaterial: 1
			};

			var chartGeometry = new THREE.ExtrudeGeometry( chartShape, extrusionSettings );
			var materialSide = new THREE.MeshLambertMaterial( { color: 0x0000ff } );
	  		var extrudeChart = new THREE.Mesh( chartGeometry, materialSide );

			extrudeChart.position.set(coords[0],coords[1],coords[2]);
			THREEDC.scene.add(extrudeChart);

	    }

	    return _chart;

	}

	THREEDC.lineChart= function (location) {

		if(location==undefined){
			location=[0,0,0];
		}

		var _chart = THREEDC.baseMixin({});
		if(location.isPanel){
			for (var i = 0; i < location.anchorPoints.length; i++) {
				if(!location.anchorPoints[i].filled){
					_chart.coords=location.anchorPoints[i].coords;
					location.anchorPoints[i].filled=true;
					location.charts.push(_chart);
					_chart.panel=location;
					break;
				}
			};
		}else{
			_chart.coords= new THREE.Vector3( location[0], location[1], location[2] );
		}
		//by default
		_chart._color=0x0000ff;
		_chart._depth=5;
		_chart._opacity=0.8;

		THREEDC.allCharts.push(_chart);


		_chart.build = function() {


		   if(_chart._group===undefined && _chart._data===undefined){
		   	console.log('You must define a group or an array of data for this chart');
		   	return;
		   }

		   if(_chart._group && _chart._data){
		   	console.log('You must define a crossfilter group or an array of data, never both');
		   	return;
		   }

		   var numberOfValues;
		   var topValue;
		   var _data;

	   	   if(_chart._group){
	   	   		topValue=_chart._group.top(1)[0].value;
	   	   		numberOfValues=_chart._group.top(Infinity).length;
	   	   		_data=_chart.sortCFData();
	   	   }

	   	   if(_chart._data){
		   		 topValue=_chart.getTopValue();
		   		 numberOfValues=_chart._data.length;
	   	   		 _data=_chart._data;
	   	   }

			var barWidth=_chart._width/numberOfValues;

			var x=0;


		   	for (var i = 0; i < _data.length; i++) {
		   		if(_data[i+1]){
		   			var barHeight1=(_chart._height*_data[i].value)/topValue;
		   			var barHeight2=(_chart._height*_data[i+1].value)/topValue;

		   			var lineShape = new THREE.Shape();
					lineShape.moveTo(0,0);
					lineShape.lineTo( 0, barHeight1);
					lineShape.lineTo( barWidth, barHeight2 );

					lineShape.lineTo( barWidth, 0 );
					lineShape.lineTo( 0, 0 );
					var extrusionSettings = {curveSegments:1,
					 						 amount: _chart._depth,
					 						 bevelEnabled: true,
					 						 bevelSegments: 4,
					 						 steps: 2,
					 						 bevelSize: 1,
					 						 bevelThickness: 1 };
					var charGeometry = new THREE.ExtrudeGeometry( lineShape, extrusionSettings );
					var origin_color=_chart._color;
	   		    	var material = new THREE.MeshPhongMaterial( {color: origin_color,
	                                                	     	 specular: 0x999999,
	                                                	    	 shininess: 100,
	                                                	     	 shading : THREE.SmoothShading,
	                                                   	     	 opacity:_chart._opacity,
	                                               		    	 transparent: true
	          	  } );
					var linePart = new THREE.Mesh( charGeometry, material );
					linePart.origin_color=origin_color;
					linePart.position.set(x+_chart.coords.x,_chart.coords.y,_chart.coords.z);
					linePart.name="key:"+_data[i].key+" value: "+_data[i].value;
					linePart.data={
						key:_data[i].key,
						value:_data[i].value
					};
					linePart.parentChart=_chart;
					x+=barWidth;
					_chart.parts.push(linePart);
		   		}
		   	};

			_chart.addEvents();
			_chart.addLabels();
			if (_chart._gridsOn) _chart.addGrids();


	    }

	    return _chart;

	}

	//problema con emissive al cambiar de color(probablemente por ser linebasic material)
	THREEDC.smoothCurveChart= function (location) {

		if(location==undefined){
			location=[0,0,0];
		}

		var _chart = THREEDC.baseMixin({});
		if(location.isPanel){
			for (var i = 0; i < location.anchorPoints.length; i++) {
				if(!location.anchorPoints[i].filled){
					_chart.coords=location.anchorPoints[i].coords;
					location.anchorPoints[i].filled=true;
					location.charts.push(_chart);
					_chart.panel=location;
					break;
				}
			};
		}else{
			_chart.coords= new THREE.Vector3( location[0], location[1], location[2] );
		}
		_chart._color=0x0000ff;

		THREEDC.allCharts.push(_chart);

		var unsort_data;

		_chart.build = function() {

		   if(_chart._group===undefined && _chart._data===undefined){
		   	console.log('You must define a group or an array of data for this chart');
		   	return;
		   }

		   if(_chart._group && _chart._data){
		   	console.log('You must define a crossfilter group or an array of data, never both');
		   	return;
		   }

		   var numberOfValues;
		   var topValue;
		   var _data;

	   	   if(_chart._group){
	   	   		topValue=_chart._group.top(1)[0].value;
	   	   		numberOfValues=_chart._group.top(Infinity).length;
	   	   		_data=_chart.sortCFData();
	   	   }

	   	   if(_chart._data){
		   		 topValue=_chart.getTopValue();
		   		 numberOfValues=_chart._data.length;
	   	   		 _data=_chart._data;
	   	   }

			var points=[];
			var x=0;
			var step=_chart._width/numberOfValues;

			for (var i = 0; i < _data.length; i++) {
				points.push(new THREE.Vector3( x,(_chart._height*_data[i].value)/topValue, 0 ));
				x+=step;
			};

			var curve = new THREE.CatmullRomCurve3(points);

			var geometry = new THREE.Geometry();
			geometry.vertices = curve.getPoints( 512 );

			var origin_color=_chart._color;

			var material = new THREE.LineBasicMaterial( { color : origin_color,linewidth:1 } );

			var splineObject = new THREE.Line( geometry, material );
			splineObject.position.set(_chart.coords.x,_chart.coords.y,_chart.coords.z)

			_chart.parts.push(splineObject);


			_chart.addEvents();
			_chart.addLabels();
			if (_chart._gridsOn) _chart.addGrids();
	    }

	    return _chart;

	}

	THREEDC.bubbleChart= function (location) {

		if(location==undefined){
			location=[0,0,0];
		}

		var _chart = THREEDC.threeDMixin({});

			//by default
		_chart._depth=100;
		_chart._opacity=0.8;

		_chart.coords= new THREE.Vector3( location[0], location[1], location[2] );
		_chart._color=0x0000ff;

		THREEDC.allCharts.push(_chart);

		_chart.getTopRadius=function() {
			var topRadius;
			var chartDimensions=[_chart._width,_chart._height,_chart._depth];
			var minDimension=_chart._width;
			for (var i = 1; i < chartDimensions.length; i++) {
				if(chartDimensions[i]<minDimension){
					minDimension=chartDimensions[i];
				}
			};
			topRadius=minDimension/4;
			return topRadius;
		}

		_chart.build = function() {
			/*
		   if(_chart._groupOne===undefined || _chart._groupTwo===undefined){
		   	console.log('You must define two groups and dimensions');
		   	return;
		   }
		   */
		   var topValue=_chart.getTopValue();
		   var topValue2=_chart.getTopValue2();
		   var topBubbleRadius=_chart.getTopRadius();

		   var numberOfKeys1=_chart.getKeysOne();
		   var numberOfKeys2=_chart.getKeysTwo();

		   var dataPos=0;
		   var stepX=0;
	   	   var y=0;
	   	   var stepZ=_chart._depth/numberOfKeys2.length/2;
		   for (var i = 0; i < numberOfKeys2.length; i++) {
		   		stepX =_chart._width/numberOfKeys1.length/2;
		   		var origin_color =Math.random() * 0xffffff;
		   		for (var j = 0; j < numberOfKeys1.length; j++) {
		   			if (_chart._data[dataPos].value2!=0) {
						var geometry = new THREE.SphereGeometry(topBubbleRadius*_chart._data[dataPos].value2/topValue2,32,32);
			   		    var material = new THREE.MeshPhongMaterial( {color: origin_color,
			                                                	     specular: 0x999999,
			                                                	     shininess: 100,
			                                                	     shading : THREE.SmoothShading,
			                                                   	     opacity:_chart._opacity,
			                                               		     transparent: true
			            } );
			            var bubble = new THREE.Mesh(geometry, material);
			            bubble.origin_color=origin_color;
			            y=(_chart._height*_chart._data[dataPos].value)/topValue;
			            bubble.position.set(stepX+_chart.coords.x,y+_chart.coords.y,stepZ+_chart.coords.z);
			            bubble.name = "key1:"+_chart._data[dataPos].key1+" key2:"+_chart._data[dataPos].key2+" value: "+_chart._data[dataPos].value+" value2: "+_chart._data[dataPos].value2;
			            bubble.data={
			            	key1:_chart._data[dataPos].key1,
			            	key2:_chart._data[dataPos].key2,
			            	value:_chart._data[dataPos].value,
			            	value:_chart._data[dataPos].value2
			            };
			            bubble.parentChart=_chart;
			            _chart.parts.push(bubble);
		   			};

		            stepX+=_chart._width/numberOfKeys1.length;
		   			dataPos++;
		   		};
		   		stepZ+=_chart._depth/numberOfKeys2.length;
		   };

		    _chart.addEvents();
		    _chart.addLabels();
			if (_chart._gridsOn) _chart.addGrids();

		}

		return _chart;
	}


	THREEDC.fileTree= function (location) {


		if(location==undefined){
			location=[0,0,0];
		}

		var _chart = THREEDC.threeDMixin({});

		_chart.coords= new THREE.Vector3( location[0], location[1], location[2] );

		THREEDC.allCharts.push(_chart);

		var pi= Math.PI;

		_chart.build= function () {

			var radius=200;

			var group= new THREE.Group();

			createDataStructure();

			buildRootNode();

			buildSons(_chart.rootNode);

			_chart.parts.push(group);

			function buildRootNode () {

				var geometry = new THREE.CubeGeometry( 20, _chart.rootNode.size, 20);

				var material = new THREE.MeshPhongMaterial( {color: 0xff00ff,
				                                             specular: 0x999999,
				                                             shininess: 100,
				                                             shading : THREE.SmoothShading,
				                                             transparent: true
				} );

				var rootNode = new THREE.Mesh(geometry, material);
				rootNode.position.set(_chart.coords.x,_chart.coords.y+ _chart.rootNode.size/2,_chart.coords.z);
				_chart.rootNode.position=rootNode.position;
				group.add(rootNode);

			}

			function buildSons (node) {
				console.log(node);
				for (var i = 0; i < node.sons.length; i++) {
					var coords=THREEDC.sphericalToCartesian(radius,node.sons[i].anglePosition,0);
					var geometry = new THREE.SphereGeometry( node.sons[i].size/10, 20, 20);

					var material = new THREE.MeshPhongMaterial( {color: 0xff00ff,
					                                             specular: 0x999999,
					                                             shininess: 100,
					                                             shading : THREE.SmoothShading,
					                                             transparent: true
					} );
					//console.log(node.sons[i]);

					var ChildNode = new THREE.Mesh(geometry, material);
					ChildNode.position.set(_chart.coords.x+coords.x,_chart.coords.y+coords.y+node.sons[i].size/2,_chart.coords.z+coords.z);
					node.sons[i].position=ChildNode.position;
					group.add(ChildNode);
					//buildLink();

					var lineGeometry = new THREE.Geometry();

					var material = new THREE.LineBasicMaterial({
						color: 0x000000,
						linewidth:1
					});

					lineGeometry.vertices.push(
						new THREE.Vector3( ChildNode.position.x, ChildNode.position.y, ChildNode.position.z ),
						new THREE.Vector3( node.position.x, node.position.y, node.position.z )
					);

					var link = new THREE.Line( lineGeometry, material );

					group.add(link);

				};
				radius+=radius;
				//recursive
				for (var i = 0; i < node.sons.length; i++) {
					buildSons(node.sons[i]);
				};
			}


			function createDataStructure () {

				findRootNode();
				findSons(_chart.rootNode);
				assignAngles(_chart.rootNode);

				function findRootNode () {

					for (var i = 0; i < _chart._data.length; i++) {
						if(_chart._data[i].parent===null){
							_chart.rootNode=_chart._data[i];
							_chart._data.splice(i,1);
							break;
						}
					};
				}

				function findSons (node) {
					node.sons=[];
					for (var i = 0; i < _chart._data.length; i++) {
						if(_chart._data[i].parent===node.id){
							node.sons.push(_chart._data[i]);
						}
					};
					//remove found sons
					var index;
					for (var i = 0; i < node.sons.length; i++) {
						 index = _chart._data.indexOf(node.sons[i]);
						_chart._data.splice(index,1);
					};
					//	RECURSIVE
					for (var i = 0; i < node.sons.length; i++) {
						findSons(node.sons[i]);
					};

				}

				function assignAngles (node) {
					if(node===_chart.rootNode){
						node.availableAngle=2*pi;
					}

					var anglePerSon=node.availableAngle/node.sons.length;
					var j=1;
					for (var i = 0; i < node.sons.length; i++) {
						node.sons[i].anglePosition=j*anglePerSon;
						//lo puedo colocar en medio del available angle y dejar este para los hijos
						node.sons[i].availableAngle=node.sons[i].anglePosition;
						j++;

					};

					//recursive
					for (var i = 0; i < node.sons.length; i++) {
						assignAngles(node.sons[i]);
					};
				}
			}

			//_chart.addEvents();
			//_chart.addLabels();
			//if (_chart._gridsOn) _chart.addGrids();
		}

		return _chart;
	}

	THREEDC.dragTrigger=function () {
	  if(THREEDC.parameters.activate){
	    THREEDC.scene.add( THREEDC.plane );
	    THREEDC.domEvents.bind(THREEDC.plane, 'mouseup', function(object3d){
	      if(THREEDC.chartToDrag){
	        THREEDC.controls.enabled=true;
	        THREEDC.container.style.cursor = 'auto';
	        if(THREEDC.SELECTED.isPanel) THREEDC.SELECTED.reBuild();
	        THREEDC.SELECTED=null;
	        THREEDC.chartToDrag=null;
	        THREEDC.plane.material.visible=false;
	      }
	    });
	    window.addEventListener( 'mousemove', THREEDC.onMouseMove, false );
	  }else{
	    window.removeEventListener( 'mousemove', THREEDC.onMouseMove, false );
	    THREEDC.scene.remove( THREEDC.plane );
	    THREEDC.domEvents.unbind(THREEDC.plane, 'mouseup');
	  }
	}

	THREEDC.changePlane =function() {
	  if (THREEDC.parameters.plane==='XY'){
	    THREEDC.plane.rotation.set(0,0,0); //xy THREEDC.plane
	  }else if(THREEDC.parameters.plane==='XZ'){
	    THREEDC.plane.rotation.x = Math.PI / 2; //xz THREEDC.plane
	  }
	}

	THREEDC.onMouseMove=function( event ) {

	  // calculate THREEDC.mouse position in normalized device coordinates
	  // (-1 to +1) for both components


	  THREEDC.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	  THREEDC.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	  THREEDC.raycaster.setFromCamera( THREEDC.mouse, THREEDC.camera );

	  if(THREEDC.SELECTED){
	    THREEDC.plane.material.visible=true;
	    var intersects = THREEDC.raycaster.intersectObject( THREEDC.plane );
	    if ( intersects.length > 0 ) {
	      if(THREEDC.SELECTED.isPanel){
	        THREEDC.SELECTED.position.copy(intersects[ 0 ].point.sub( THREEDC.offset ));
	        THREEDC.SELECTED.coords.copy( THREEDC.SELECTED.position);
	      }else{
	        THREEDC.chartToDrag.coords.copy(intersects[ 0 ].point.sub( THREEDC.offset ));
	        if(THREEDC.paint) THREEDC.chartToDrag.reBuild();
	        !THREEDC.paint;
	      }
	    }
	    return;
	  }
	}
	return THREEDC;
}

module.exports = THREEDC;