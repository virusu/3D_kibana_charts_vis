import uiModules from 'ui/modules';
import errors from 'ui/errors';
import moment from 'moment';

// get the kibana/table_vis module, and make sure that it requires the "kibana" module if it
// didn't already
const module = uiModules.get('kibana/vr_vis', ['kibana']);

module.controller('BarsController', function($scope, $rootScope, $element, Private){

var filterManager = Private(require('ui/filter_manager'));

var dash, container, scene, camera, renderer, controls;


$scope.barschart = null;
$scope.bars=[];
  $scope.$watch('esResponse', function(resp) {

    if (!resp) {
      $scope.bars = [];
      return;
    }

    if ($scope.barschart){
      $scope.bars = [];
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

    $scope.bars = [];

    // Transform all buckets into tag objects
    bucketsx.map(function(bucketx) {

      var bucketsy = bucketx[barsyAggId].buckets;

      bucketsy.map(function(buckety){

      var value = metricsAgg.getValue(buckety);


      if($scope.vis.aggs.bySchemaName['bars'][0]._opts.type.includes("date")){

        $scope.bars.push({key1:bucketx.key_as_string, key2:buckety.key, value: value});
      } else {

        if($scope.vis.aggs.bySchemaName['bars'][1]._opts.type.includes("date")){

          $scope.bars.push({key1:bucketx.key, key2:buckety.key_as_string, value: value});

        } else {

      $scope.bars.push({key1:bucketx.key, key2:buckety.key, value: value});
        }
      }
     })
    });


    $scope.bars = getOrderedData($scope.bars);

      if ($scope.barschart){
        $scope.barschart.data($scope.bars);
        if ($scope.bars.length > 0){
          $scope.barschart.reBuild();
        }

      } else {
        $scope.barschart = dash.TDbarsChart();
        $scope.barschart
        .data($scope.bars)
        .width(400)
        .height(500)
        .depth(400)
        .barSeparation(0.8)
        .addCustomEvents(filter)
        .opacity(0.95)
        .color(0xffaa00)
        .gridsOn(0xffffff);

    $scope.barschart.render();
  }
  }

  });



init();

// animation loop / game loop
animate();

///////////////
// FUNCTIONS //
///////////////

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

    //if first buckets are date
    if($scope.vis.aggs.bySchemaName['bars'][0]._opts.type.includes("date")){


    var from = moment(mesh.data.key1);
    var interval = moment($scope.bars[1].key1) - moment($scope.bars[0].key1);
    var to = moment(from).add('ms', interval);

    $rootScope.$$timefilter.time.from = from;
    $rootScope.$$timefilter.time.to = to;
    $rootScope.$$timefilter.time.mode = 'absolute';

    } else {
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
    }


    //if second buckets are date
    if($scope.vis.aggs.bySchemaName['bars'][1]._opts.type.includes("date")){

    var from = moment(mesh.data.key2);

    var i = 0;
    while ($scope.bars[i].key2 == $scope.bars[i+1].key2){
      i++;
    }

    var interval = moment($scope.bars[i+1].key2) - moment($scope.bars[i].key2);
    var to = moment(from).add('ms', interval);

    $rootScope.$$timefilter.time.from = from;
    $rootScope.$$timefilter.time.to = to;
    $rootScope.$$timefilter.time.mode = 'absolute';

    } else {
        filterManager.add(
      // The field to filter for, we can get it from the config
      $scope.vis.aggs.bySchemaName['bars'][1].params.field,
      // The value to filter for, we will read out the bucket key
      //$scope.bars[0].key,
      mesh.data.key2,
      // Whether the filter is negated. If you want to create a negated filter pass '-' here
      null,
      // The index pattern for the filter
      $scope.vis.indexPattern.title
    );
    }

  });
  };

  var testFunction = function (mesh) {
      dash.domEvents.bind(mesh, 'mousedown', function(object3d){ 
      //alert(mesh.data.key1);
      console.log(mesh.data.key1);
      });
 }


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

  //create new dash object containing all variables needed for the scene
  dash = THREEDC({},camera,scene,renderer, container);

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
  dash.controls.update();
}

});

