import uiModules from 'ui/modules';
import errors from 'ui/errors';	

(function () {
// get the kibana/table_vis module, and make sure that it requires the "kibana" module if it
// didn't already
const module = uiModules.get('kibana/vr_vis', ['kibana']);
/*  const ElementQueries = require('css-element-queries/src/ElementQueries');
  const ResizeSensor = require('css-element-queries/src/ResizeSensor');*/

module.controller('PieController', function($scope, $element, Private){

var filterManager = Private(require('ui/filter_manager'));

// standard global variables
var containerpie, scenepie, camerapie, rendererpie;


$scope.pie = null;
$scope.slices=[];

 
  //esResponse holds the result of the elasticSearch query
  //resp is the actual value of esResponse
  $scope.$watch('esResponse', function(resp) {
    //if user has eliminated aggregations, return
    if (!resp) {
      $scope.slices = null;
      return;
    }

/*    if ($scope.pie){
      $scope.pie.remove();
      console.log("pie removed");
    }*/

    console.log(containerpie);
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

      if ($scope.pie){
        $scope.pie.data($scope.slices);
        $scope.pie.reBuild();
      } else {
      //redibujar pie con los nuevos datos
      $scope.pie = THREEDC.pieChart();
         $scope.pie
      //  .dimension(dimByOrg)
      //  .group(groupByOrg)
        //.width(200)
        .data($scope.slices)
        .addCustomEvents(filter)
       // .numberOfXLabels(50)
        //.numberOfYLabels(5)
        //.gridsOn()
        //.height(200)
        .radius(50)
        .color(0xffaa00);

/*        console.log(containerpie.getBoundingClientRect());
        new ResizeSensor(containerpie, function() {
            console.log('Diiiv');
            //network.setSize('150px', '150px');
            rendererpie.setSize(containerpie.getBoundingClientRect().width, containerpie.getBoundingClientRect().height);
        });*/


      $scope.pie.render();
    }
}

  });

  var testFunction = function (mesh) {
      THREEDC.domEvents.bind(mesh, 'mouseover', function(object3d){ 
        console.log(mesh.data.key);
      });
 }

 var filter = function(mesh) {
    THREEDC.domEvents.bind(mesh, 'mousedown', function(object3d){ 
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
   scenepie = new THREE.Scene();

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
   camerapie = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
   // add the camera to the scene
   scenepie.add(camerapie);
   // the camera defaults to position (0,0,0)
   //    so pull it back (z = 400) and up (y = 100) and set the angle towards the scene origin
   camerapie.position.set(0,150,400);
   camerapie.lookAt(scenepie.position);

   //////////////
   // RENDERER //
   //////////////
   rendererpie = new THREE.WebGLRenderer( {antialias:true} );
   rendererpie.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
   rendererpie.setClearColor( 0xd8d8d8 );
   containerpie = idchart[0];
   containerpie.appendChild(rendererpie.domElement);


   ///////////
   // LIGHT //
   ///////////
   var light = new THREE.PointLight(0xffffff,0.8);
   light.position.set(0,200,250);
   scenepie.add(light);
   var ambientLight = new THREE.AmbientLight(0x111111);


  var data1= [{key:'monday',value:20},{key:'tuesday',value:80},{key:'friday',value:30}];
  var data2 = [{key:'may',value:200},{key:'june',value:100},{key:'july',value:250}, {key:'december',value:20}, {key:'monday',value:20},{key:'tuesday',value:80},{key:'friday',value:30}];

  THREEDC(camerapie,scenepie,rendererpie, containerpie);


}

function animatepie()
{
   requestAnimationFrame( animatepie );
   renderpie();
   updatepie();
}

function renderpie()
{
   rendererpie.render( scenepie, camerapie );
}

function updatepie()
{
  //#TODO: fix controls
  THREEDC.controls.update();
}

});


}());