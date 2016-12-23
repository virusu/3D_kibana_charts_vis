import uiModules from 'ui/modules';
import errors from 'ui/errors';	
(function () {
// get the kibana/table_vis module, and make sure that it requires the "kibana" module if it
// didn't already
const module = uiModules.get('kibana/vr_vis', ['kibana']);

module.controller('BubblesController', function($scope, $element, Private){

  console.log(THREEx.DomEvents);

var filterManager = Private(require('ui/filter_manager'));


// standard global variables
var dash, container, scene, camera, renderer, controls;


$scope.bubbleschart = null;
$scope.bubbles=[];
  $scope.$watch('esResponse', function(resp) {
    if (!resp) {
      $scope.bubbles = [];
      return;
    }

    if ($scope.bubbleschart){
      $scope.bubbles = [];
/*      $scope.barschart.remove();
      console.log("barschart removed");*/
    }
    //if bars aggregation exists, that is, user has configured it
    if ($scope.vis.aggs.bySchemaName['bubbles']) {
    // Retrieve the id of the configured tags aggregation
    var barsxAggId = $scope.vis.aggs.bySchemaName['bubbles'][0].id;
    var barsyAggId = $scope.vis.aggs.bySchemaName['bubbles'][1].id;
    console.log(barsxAggId);
    console.log(barsyAggId);
    // Retrieve the metrics aggregation configured
    var metricsAgg1 = $scope.vis.aggs.bySchemaName['bubbles_height_size'][0];
    var metricsAgg2 = $scope.vis.aggs.bySchemaName['bubbles_height_size'][1];
    console.log(metricsAgg1);
    console.log(metricsAgg2);
    // Get the buckets of that aggregation

    var bucketsx = resp.aggregations[barsxAggId].buckets;
    //var bucketsy = resp.aggregations[barsyAggId].buckets;

    console.log(bucketsx);
    console.log($scope.vis.aggs.bySchemaName);
    console.log(resp.aggregations);

    $scope.bubbles = [];
    // Transform all buckets into tag objects
    bucketsx.map(function(bucketx) {
      // Use the getValue function of the aggregation to get the value of a bucket


      var bucketsy = bucketx[barsyAggId].buckets;

    bucketsy.map(function(buckety){

      var value = metricsAgg1.getValue(buckety);
      $scope.bubbles.push({key1:bucketx.key, key2:buckety.key, value: value});

     })
    });
    console.log($scope.bubbles);
    //$scope.bars = $scope.bars.concat(getMissingGaps($scope.bars));
    $scope.bubbles = getOrderedData($scope.bubbles);
    console.log($scope.bubbles);


  var data2= [{key1:'january',key2:'apple',value:23,value2:Math.random()*50},{key1:'february',key2:'apple',value:31,value2:Math.random()*50},{key1:'march',key2:'apple',value:10,value2:Math.random()*50},{key1:'april',key2:'apple',value:59,value2:Math.random()*50},

            {key1:'january',key2:'google',value:34,value2:Math.random()*50},{key1:'february',key2:'google',value:89,value2:Math.random()*50},{key1:'march',key2:'google',value:53,value2:Math.random()*50},{key1:'april',key2:'google',value:76,value2:Math.random()*50},

            {key1:'january',key2:'sony',value:34,value2:Math.random()*50},{key1:'february',key2:'sony',value:89,value2:Math.random()*50},{key1:'march',key2:'sony',value:53,value2:Math.random()*50},{key1:'april',key2:'sony',value:76,value2:Math.random()*50}

 
  ];

//some test data
/*  var data= [{key1:'january',key2:'apple',value:23},{key1:'february',key2:'apple',value:31},{key1:'march',key2:'apple',value:10},{key1:'april',key2:'apple',value:59},

            {key1:'january',key2:'google',value:34},{key1:'february',key2:'google',value:89},{key1:'march',key2:'google',value:53},{key1:'april',key2:'google',value:76},

            {key1:'january',key2:'microsoft',value:10},{key1:'february',key2:'microsoft',value:5},{key1:'march',key2:'microsoft',value:4},{key1:'april',key2:'microsoft',value:12},

            {key1:'january',key2:'sony',value:56},{key1:'february',key2:'sony',value:21},{key1:'march',key2:'sony',value:23},{key1:'april',key2:'sony',value:12}
  ];*/

      if ($scope.bubbleschart){
        $scope.bubbleschart.data($scope.bubbles);
        if ($scope.bubbles.length > 0){
          $scope.bubbleschart.reBuild();
        }

      } else {
        $scope.bubbleschart = dash.bubbleChart([0,0,0]);
        $scope.bubbleschart.data(data2)
         .width(500)
         .height(400)
         .gridsOn()
         .depth(400);

    $scope.bubbleschart.render();
  }
  }

  });

var getKeysOne=function(datos) {
  var keysOne=[];
for (var i = 0; i < datos.length; i++) {
  if(keysOne.indexOf(datos[i].key1)===-1){
    keysOne.push(datos[i].key1);
  }
 }
return keysOne;
}

var getKeysTwo=function(datos) {
  var keysTwo=[];
for (var i = 0; i < datos.length; i++) {
  if(keysTwo.indexOf(datos[i].key2)===-1) keysTwo.push(datos[i].key2);
};
return keysTwo;
}

/* Construct structure of this sort (1 = actual element, gap = false)
   (Additional function in order to get Missing gaps)
   1   1
   1 1 1 1
   1 1 1 1
   */
var getAdditionalMesh = function(keysOne, keysTwo, datos){

  var additionalStructure = [];
  var ycolumn;
  var itExists;
    for (var j = 0; j < keysOne.length; j++){
    ycolumn = [];
      for (var k = 0; k < keysTwo.length; k++){
        for (var i = 0; i < datos.length; i++){
          itExists = false; 
          if ((datos[i].key1 === keysOne[j]) && (datos[i].key2 === keysTwo[k])){
            itExists = datos[i];
            break;
          }
        }
        ycolumn.push(itExists);
      }
    additionalStructure.push(ycolumn);
    }
  return additionalStructure;
}

var getOrderedData = function (datos){
  var finalData = [];
  var keysOne = getKeysOne(datos);
  var keysTwo = getKeysTwo(datos);
  var additionalStructure = getAdditionalMesh(keysOne, keysTwo, datos);
  console.log(additionalStructure);
  for (var j = 0; j < keysOne.length; j++){
    for (var k = 0; k < keysTwo.length; k++){
        if (!additionalStructure[j][k]){
          additionalStructure[j][k] = {key1: keysOne[j], key2: keysTwo[k], value: 0};
          //missingGaps.push({key1: keysOne[j], key2: keysTwo[k], value: 0})
        }
      }
    }

  for (var j = 0; j < keysTwo.length; j++){
    for (var k = 0; k < keysOne.length; k++){
      finalData.push(additionalStructure[k][j]);
    }
  }
  return finalData;
}

 var filter = function(mesh) {
    dash.domEvents.bind(mesh, 'mousedown', function(object3d){ 
    console.log(mesh.data.key1);
    filterManager.add(
      // The field to filter for, we can get it from the config
      $scope.vis.aggs.bySchemaName['bubbles'][0].params.field,
      // The value to filter for, we will read out the bucket key
      //$scope.bars[0].key,
      mesh.data.key1,
      // Whether the filter is negated. If you want to create a negated filter pass '-' here
      null,
      // The index pattern for the filter
      $scope.vis.indexPattern.title
    );

        filterManager.add(
      // The field to filter for, we can get it from the config
      $scope.vis.aggs.bySchemaName['bubbles'][1].params.field,
      // The value to filter for, we will read out the bucket key
      //$scope.bars[0].key,
      mesh.data.key2,
      // Whether the filter is negated. If you want to create a negated filter pass '-' here
      null,
      // The index pattern for the filter
      $scope.vis.indexPattern.title
    );

  });
  };

  var testFunction = function (mesh) {
      dash.domEvents.bind(mesh, 'mousedown', function(object3d){ 
      //alert(mesh.data.key1);
      console.log(mesh.data.key1);
      });
 }

      init();
      // animation loop / game loop
      animate();

///////////////
// FUNCTIONS //
///////////////

function init () {


   var idchart = $element.children().find(".chartbubbles");
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
   renderer.setClearColor( 0xffffff );
   container = idchart[0];
   container.appendChild(renderer.domElement);


   ///////////
   // LIGHT //
   ///////////
   var light = new THREE.PointLight(0xffffff,1);
   light.position.set(0,200,250);
   scene.add(light);
   var ambientLight = new THREE.AmbientLight(0x111111);


  var data1= [{key:'monday',value:20},{key:'tuesday',value:80},{key:'friday',value:30}];
  var data2 = [{key:'may',value:200},{key:'june',value:100},{key:'july',value:250}, {key:'december',value:20}, {key:'monday',value:20},{key:'tuesday',value:80},{key:'friday',value:30}];

  dash = THREEDC({}, camera,scene,renderer, container);


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
  dash.controls.update();
}

});
}());

