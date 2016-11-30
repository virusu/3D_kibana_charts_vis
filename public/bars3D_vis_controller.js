import uiModules from 'ui/modules';
import errors from 'ui/errors';	
(function () {
// get the kibana/table_vis module, and make sure that it requires the "kibana" module if it
// didn't already
const module = uiModules.get('kibana/vr_vis', ['kibana']);



module.controller('BarsController', function($scope, $element, Private){

  console.log(THREEx.DomEvents);

var filterManager = Private(require('ui/filter_manager'));



// standard global variables
var container, scene, camera, renderer, controls;


$scope.barschart = null;
$scope.bars=[];
  $scope.$watch('esResponse', function(resp) {
    if (!resp) {
      $scope.bars = [];
      return;
    }

    if ($scope.barschart){
      $scope.bars = [];
/*      $scope.barschart.remove();
      console.log("barschart removed");*/
    }
    //if bars aggregation exists, that is, user has configured it
    if ($scope.vis.aggs.bySchemaName['bars']) {
    // Retrieve the id of the configured tags aggregation
    var barsxAggId = $scope.vis.aggs.bySchemaName['bars'][0].id;
    var barsyAggId = $scope.vis.aggs.bySchemaName['bars'][1].id;
    console.log(barsxAggId);
    console.log(barsyAggId);
    // Retrieve the metrics aggregation configured
    var metricsAgg = $scope.vis.aggs.bySchemaName['bars_height'][0];
    console.log(metricsAgg);
    // Get the buckets of that aggregation

    var bucketsx = resp.aggregations[barsxAggId].buckets;
    //var bucketsy = resp.aggregations[barsyAggId].buckets;

    console.log(bucketsx);
    console.log($scope.vis.aggs.bySchemaName);
    console.log(resp.aggregations);

    $scope.bars = [];
    // Transform all buckets into tag objects
    bucketsx.map(function(bucketx) {
      // Use the getValue function of the aggregation to get the value of a bucket


      var bucketsy = bucketx[barsyAggId].buckets;

    bucketsy.map(function(buckety){

      var value = metricsAgg.getValue(buckety);
      $scope.bars.push({key1:bucketx.key, key2:buckety.key, value: value});

     })
    });
    console.log($scope.bars);


//some test data
/*  var data= [{key1:'january',key2:'apple',value:23},{key1:'february',key2:'apple',value:31},{key1:'march',key2:'apple',value:10},{key1:'april',key2:'apple',value:59},

            {key1:'january',key2:'google',value:34},{key1:'february',key2:'google',value:89},{key1:'march',key2:'google',value:53},{key1:'april',key2:'google',value:76},

            {key1:'january',key2:'microsoft',value:10},{key1:'february',key2:'microsoft',value:5},{key1:'march',key2:'microsoft',value:4},{key1:'april',key2:'microsoft',value:12},

            {key1:'january',key2:'sony',value:56},{key1:'february',key2:'sony',value:21},{key1:'march',key2:'sony',value:23},{key1:'april',key2:'sony',value:12}
  ];*/

      if ($scope.barschart){
        $scope.barschart.data($scope.bars);
        $scope.barschart.reBuild();

      } else {
        $scope.barschart = THREEDC.TDbarsChart();
        $scope.barschart
        .data($scope.bars)
        .width(400)
        .height(500)
        .depth(400)
        .barSeparation(0.8)
        //.addCustomEvents(filter)
        .opacity(0.95)
        .color(0xffaa00)
        .gridsOn(0xffffff);

    $scope.barschart.render();
  }
  }

  });

 var filter = function(mesh) {
    THREEDC.domEvents.bind(mesh, 'click', function(object3d){ 
    console.log(mesh.data);
    filterManager.add(
      // The field to filter for, we can get it from the config
      $scope.vis.aggs.bySchemaName['bars'][0].params.field,
      // The value to filter for, we will read out the bucket key
      //$scope.bars[0].key,
      mesh.data.key1,
      // Whether the filter is negated. If you want to create a negated filter pass '-' here
      null,
      // The index pattern for the filter
      $scope.vis.indexPattern.title
    );
  });
  };

      init();
      // animation loop / game loop
      animate();

///////////////
// FUNCTIONS //
///////////////

function init () {


   var idchart = $element.children().find(".chartbars");
   ///////////
   // SCENE //
   ///////////
   scene = new THREE.Scene();

   ////////////
   // CAMERA //
   ////////////
   // set the view size in pixels (custom or according to window size)
   var SCREEN_WIDTH = 400 + 468.52 - 25;
   var SCREEN_HEIGHT = 400 + 178.89 - 25;
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
   renderer.setClearColor( 0xd8d8d8 );
   container = idchart[0];
   container.appendChild(renderer.domElement);


   ///////////
   // LIGHT //
   ///////////
   var light = new THREE.PointLight(0xffffff,0.8);
   light.position.set(0,200,250);
   scene.add(light);
   var ambientLight = new THREE.AmbientLight(0x111111);


  var data1= [{key:'monday',value:20},{key:'tuesday',value:80},{key:'friday',value:30}];
  var data2 = [{key:'may',value:200},{key:'june',value:100},{key:'july',value:250}, {key:'december',value:20}, {key:'monday',value:20},{key:'tuesday',value:80},{key:'friday',value:30}];

  THREEDC(camera,scene,renderer, container);


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
  //#TODO: fix controls
  THREEDC.controls.update();
}

});
}());

