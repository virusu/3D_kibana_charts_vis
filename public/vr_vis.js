import visTypes from 'ui/registry/vis_types';
define(function(require){

  THREE = require("three");

  require("plugins/3D_kibana_charts_vis/threedc/FontUtils");
  require("plugins/3D_kibana_charts_vis/threedc/TextGeometry");
  require("plugins/3D_kibana_charts_vis/threedc/Projector");
  THREEx = require("plugins/3D_kibana_charts_vis/threedc/threex.domevents");
  Detector = require("plugins/3D_kibana_charts_vis/threedc/Detector");
  require("plugins/3D_kibana_charts_vis/threedc/OrbitControls");
  console.log(THREE.OrbitControls);


  //if don't imported, threedc doesn't work. Doesn't do anything actually
  dat = require('plugins/3D_kibana_charts_vis/threedc/DAT.GUI.min');

  THREEDC = require("plugins/3D_kibana_charts_vis/threedc/3dc");
  console.log(THREEDC);

  var typeface2 = require('plugins/3D_kibana_charts_vis/threedc/helvetiker_bold.typeface');
  THREE.typeface_js.loadFace(typeface2);

  // register the provider with the visTypes registry
  visTypes.register(require('plugins/3D_kibana_charts_vis/pie3D'));
  visTypes.register(require('plugins/3D_kibana_charts_vis/bars3D'));
  visTypes.register(require('plugins/3D_kibana_charts_vis/bubbles3D'));

});