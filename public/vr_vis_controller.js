import uiModules from 'ui/modules';
import AggResponseTabifyTabifyProvider from 'ui/agg_response/tabify/tabify';
import errors from 'ui/errors';	

// get the kibana/table_vis module, and make sure that it requires the "kibana" module if it
// didn't already
const module = uiModules.get('kibana/vr_vis', ['kibana']);

THREE = require("three");


	require("plugins/vr_charts/FontUtils");
  console.log(THREE.FontUtils);
	require("plugins/vr_charts/TextGeometry");
  console.log(THREE.TextGeometry);
	require("plugins/vr_charts/Projector");
  console.log(THREE.RenderableObject);
	THREEx = require("plugins/vr_charts/threex.domevents");
  console.log(THREEx.DomEvents);
	Detector = require("plugins/vr_charts/Detector");
  console.log(Detector);
/*	Stats = require("plugins/vr_charts/Stats");
  console.log(Stats);*/
	require("plugins/vr_charts/OrbitControls");
  console.log(THREE.OrbitControls);
	//require("plugins/vr_charts/THREEx.WindowResize");
  //console.log(THREEx.WindowResize);
  //console.log(THREEx.DomEvents);
	//require("plugins/vr_charts/THREEx.FullScreen");
  //console.log(THREEx.FullScreen);

  dat = require('plugins/vr_charts/dat.gui');

	THREEDC = require("plugins/vr_charts/3dc");
  console.log(THREEDC.version);

  var typeface = require('three.regular.helvetiker');
  THREE.typeface_js.loadFace(typeface);
  var typeface2 = require('plugins/vr_charts/helvetiker_bold.typeface');
  THREE.typeface_js.loadFace(typeface2);

module.controller('KbnVRVisController', function($scope, $element, Private){

//////////
// MAIN //
//////////

// standard global variables
var container, scene, camera, renderer, controls, stats;

//CROSSFILTER VARS

 var cf;

 var dimByMonth;

 var groupByMonth;

  var dimByOrg;

  var groupByOrg;

$scope.pie = null;

$scope.slices=[];
  $scope.$watch('esResponse', function(resp) {
    if (!resp) {
      $scope.slices = null;
      return;
    }

    if ($scope.pie){
      $scope.pie.remove();
      console.log("pie removed");
    }
    // Retrieve the id of the configured tags aggregation
    var slicesAggId = $scope.vis.aggs.bySchemaName['slices'][0].id;
    console.log(slicesAggId);
    // Retrieve the metrics aggregation configured
    var metricsAgg = $scope.vis.aggs.bySchemaName['slice_size'][0];
    console.log(metricsAgg);
    // Get the buckets of that aggregation
    var buckets = resp.aggregations[slicesAggId].buckets;

    // Transform all buckets into tag objects
    $scope.slices = buckets.map(function(bucket) {
      // Use the getValue function of the aggregation to get the value of a bucket
      var value = metricsAgg.getValue(bucket);

      return {
        key: bucket.key,
        value: value
      };
    });
    console.log($scope.slices);
    //redibujar pie con los nuevos datos
    $scope.pie =  THREEDC.pieChart();
       $scope.pie
    //  .dimension(dimByOrg)
    //  .group(groupByOrg)
      //.width(200)
      .data($scope.slices)
     // .numberOfXLabels(50)
      //.numberOfYLabels(5)
      //.gridsOn()
      //.height(200)
      .radius(50)
      .color(0x0000ff);

  $scope.pie.render();

  });

      init();
      // animation loop / game loop
      animate();

///////////////
// FUNCTIONS //
///////////////

function init () {



   var idchart = $element.children().find(".chartvr");
   ///////////
   // SCENE //
   ///////////
   scene = new THREE.Scene();

   ////////////
   // CAMERA //
   ////////////
   // set the view size in pixels (custom or according to window size)
   var SCREEN_WIDTH = 1280;
   var SCREEN_HEIGHT = 1024;
   // camera attributes
   var VIEW_ANGLE = 45;
   var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
   var NEAR = 0.1;
   var FAR = 20000;
      // set up camera
   camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
   // add the camera to the scene
   scene.add(camera);
   // the camera defaults to position (0,0,0)
   //    so pull it back (z = 400) and up (y = 100) and set the angle towards the scene origin
   camera.position.set(0,150,400);
   camera.lookAt(scene.position);

   //////////////
   // RENDERER //
   //////////////
   renderer = new THREE.WebGLRenderer( {antialias:true} );
   renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
   renderer.setClearColor( 0xffffff );
   container = idchart[0];
   container.appendChild(renderer.domElement);
    ////////////
  // EVENTS //
  ////////////



  // automatically resize renderer
  //THREEx.WindowResize(renderer, camera);
    // toggle full-screen on given key press
  //THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });


   ///////////
   // LIGHT //
   ///////////
   var light = new THREE.PointLight(0xffffff,0.8);
   light.position.set(0,200,250);
   scene.add(light);
   var ambientLight = new THREE.AmbientLight(0x111111);
   // scene.add(ambientLight);

   // create a set of coordinate axes to help orient user
   //    specify length in pixels in each direction
   //var axes = new THREE.AxisHelper(1000);
   //scene.add(axes);

  //STATS
  //stats = new Stats();
  //stats.domElement.style.position = 'absolute';
  //stats.domElement.style.bottom = '0px';
  //stats.domElement.style.zIndex = 100;

  //container.appendChild(stats.domElement);
   //////////////
   // CUSTOM //
   //////////////

   // most objects displayed are a "mesh":
   //  a collection of points ("geometry") and
   //  a set of surface parameters ("material")

  //data without CF

  var data1= [{key:'monday',value:20},{key:'tuesday',value:80},{key:'friday',value:30}];
  console.log(data1);
  var data2 = [{key:'may',value:200},{key:'june',value:100},{key:'july',value:250}, {key:'december',value:20}, {key:'monday',value:20},{key:'tuesday',value:80},{key:'friday',value:30}];
  console.log(data2);
  console.log($scope.slices);
 //CUSTOM DASHBOARD//

  THREEDC.initializer(camera,scene,renderer, idchart[0]);


/*    var line =  THREEDC.pieChart([50,0,0]);
       line
  	//  .dimension(dimByOrg)
  	//  .group(groupByOrg)
      .width(200)
      .data(data2)
      .numberOfXLabels(50)
      .numberOfYLabels(5)
      .gridsOn()
      .height(200)
      .color(0x0000ff);

    var line2 =  THREEDC.pieChart([-70,0,0]);
       line2
    //  .dimension(dimByOrg)
    //  .group(groupByOrg)
      .width(200)
      .data(data1)
      .numberOfXLabels(50)
      .numberOfYLabels(5)
      .gridsOn()
      .height(200)
      .color(0x0000ff);

  THREEDC.renderAll();*/

}

function animate()
{
   requestAnimationFrame( animate );
   render();
   update();
}

function render()
{
   renderer.render( scene, camera );
}

function update()
{
  THREEDC.controls.update();
  //stats.update();
}




/*var camera, scene, renderer;
var geometry, material, mesh;

init();
animate();


function init() {

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;

    scene = new THREE.Scene();

    geometry = new THREE.BoxGeometry(200, 200, 200);
    material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    var idchart = $element.children().find(".chartvr");
    console.log(idchart);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    //doesn't work as expected
    idchart[0].appendChild(renderer.domElement);

    //does work as expected
    //document.body.appendChild(renderer.domElement);
}

function animate() {

    requestAnimationFrame(animate);

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;

    renderer.render(scene, camera);

}*/



/*	var idchart = $element.children().find(".chartvr");
	var config = {};
	config.bindto = idchart[0];
	config.data = {};
	config.data.columns = 
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 50, 20, 10, 40, 15, 25];

var chart = c3.generate(config);

setTimeout(function () {
    chart.load({
        columns: [
            ['data1', 230, 190, 300, 500, 300, 400]
        ]
    });
}, 1000);

setTimeout(function () {
    chart.load({
        columns: [
            ['data3', 130, 150, 200, 300, 200, 100]
        ]
    });
}, 1500);

setTimeout(function () {
    chart.unload({
        ids: 'data1'
    });
}, 2000);*/


/*	var previo_zoom = false;
	var hold ="";
    var wold= "";

	$scope.$watchMulti([
		'vis.params.editorPanel',
		'vis.params.enableZoom'
		], function (html) {
    		if (Object.keys(html[0]).length === 0 && html[1] == previo_zoom || !$scope.show_chart) return;
    		previo_zoom = html[1];
    		$scope.chartGen();
  	});

	const tabifyAggResponse = Private(AggResponseTabifyTabifyProvider);
	$scope.$root.editorParams = {};
	var x_axis_values = [];
	var parsed_data = [];
	var chart_labels = {};
	var idchart = $element.children().find(".chartvr");
	const message = 'This chart require more than one data point. Try adding an X-Axis Aggregation.';
	

	// C3JS chart generator!
	$scope.chart = null;
	$scope.chartGen = function(){

		$scope.show_chart = true;
		var config = {};
		config.bindto = idchart[0];
		config.data = {};
		config.data.types = $scope.vis.params.editorPanel.types;
		config.data.colors = $scope.vis.params.editorPanel.colors;
		config.data.columns = parsed_data;
		config.axis = {"x": {"type":"category", "categories": x_axis_values[0]}};
		config.zoom = {"enabled" : $scope.vis.params.enableZoom};
		$scope.chart = c3.generate(config);
		var elem = $(idchart[0]).closest('div.visualize-chart');
        var h = elem.height();
        var w = elem.width();
        $scope.chart.resize({height: h - 50, width: w - 50});


	};


	// Get data from ES
	$scope.processTableGroups = function (tableGroups) {
    	tableGroups.tables.forEach(function (table) {
      		table.columns.forEach(function (column, i) {
      			var data = table.rows;
      			var tmp = [];

      			for (var val in data){
      				tmp.push(data[val][i]);
      			}

      			if (i > 0){
      				chart_labels[column.title] = column.title;
      				tmp.splice(0, 0, column.title);
      				parsed_data.push(tmp);
				} else {
					x_axis_values.push(tmp);
				}

      		});
    	});

    	$scope.$root.editorParams.label = chart_labels;
  	};
	
	$scope.$watch('esResponse', function(resp){
		if (resp) {
			if (!$scope.vis.aggs.bySchemaName['buckets']){
				$scope.waiting = message;
				return;
			}
			x_axis_values.length = 0;
			parsed_data.length = 0;
			chart_labels = {};
      		$scope.processTableGroups(tabifyAggResponse($scope.vis, resp));
      		$scope.chartGen();

		}
    		
	});

	// Automatic resizing of graphics
    $scope.$watch(
    	function () {
	   		var elem = $(idchart[0]).closest('div.visualize-chart');
           	var h = elem.height();
           	var w = elem.width();
           	if (!$scope.chart) return;
	   		if (idchart.length > 0 && h > 0 && w > 0) {
		   		if (hold != h || wold != w) {
	            	$scope.chart.resize({height: h - 50, width: w - 50});
           	 		hold = elem.height();
	          	 	wold = elem.width();
		   		}
           	}      
        }, 
        true
    );*/

});


