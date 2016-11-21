import uiModules from 'ui/modules';
import errors from 'ui/errors';	

// get the kibana/table_vis module, and make sure that it requires the "kibana" module if it
// didn't already
const module = uiModules.get('kibana/vr_vis', ['kibana']);

module.controller('PieController', function($scope, $element, Private){



  console.log(THREEx.DomEvents);
var filterManager = Private(require('ui/filter_manager'));



// standard global variables
var container, scene, camera, renderer, controls;


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
    //if slices aggregation exists, that is, user has configured it
    if ($scope.vis.aggs.bySchemaName['slices']) {
      // Retrieve the id of the configured tags aggregation
      var slicesAggId = $scope.vis.aggs.bySchemaName['slices'][0].id;
      //console.log(slicesAggId);
      // Retrieve the metrics aggregation configured
      var metricsAgg = $scope.vis.aggs.bySchemaName['slice_size'][0];
      //console.log(metricsAgg);
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
        //.addCustomEvents(filter)
       // .numberOfXLabels(50)
        //.numberOfYLabels(5)
        //.gridsOn()
        //.height(200)
        .radius(50)
        .color(0x0000ff);

    $scope.pie.render();
}

  });

  var testFunction = function (mesh) {
      THREEDC.domEvents.bind(mesh, 'mouseover', function(object3d){ 
        console.log(mesh.data.key);
      });
 }

 var filter = function(mesh) {
    THREEDC.domEvents.bind(mesh, 'click', function(object3d){ 
    console.log(mesh.data);
    filterManager.add(
      // The field to filter for, we can get it from the config
      $scope.vis.aggs.bySchemaName['slices'][0].params.field,
      // The value to filter for, we will read out the bucket key
      //$scope.slices[0].key,
      mesh.data.key,
      // Whether the filter is negated. If you want to create a negated filter pass '-' here
      null,
      // The index pattern for the filter
      $scope.vis.indexPattern.title
    );
  });
  };

      initpie();
      // animation loop / game loop
      animatepie();

///////////////
// FUNCTIONS //
///////////////

function initpie () {


   var idchart = $element.children().find(".chartpie");
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


   ///////////
   // LIGHT //
   ///////////
   var light = new THREE.PointLight(0xffffff,0.8);
   light.position.set(0,200,250);
   scene.add(light);
   var ambientLight = new THREE.AmbientLight(0x111111);


  var data1= [{key:'monday',value:20},{key:'tuesday',value:80},{key:'friday',value:30}];
  var data2 = [{key:'may',value:200},{key:'june',value:100},{key:'july',value:250}, {key:'december',value:20}, {key:'monday',value:20},{key:'tuesday',value:80},{key:'friday',value:30}];

  THREEDC(camera,scene,renderer, idchart[0]);


}

function animatepie()
{
   requestAnimationFrame( animatepie );
   renderpie();
   updatepie();
}

function renderpie()
{
   renderer.render( scene, camera );
}

function updatepie()
{
  //#TODO: fix controls
  THREEDC.controls.update();
}

});


