//import 'plugins/3D_kibana_charts_vis/vr_vis.less';
import visTypes from 'ui/registry/vis_types';
define(function(require){

//import vrVisParamsTemplate from 'plugins/3D_kibana_charts_vis/vr_vis_params.html';

  THREE = require("three");
  console.log(THREE);
/*  require('plugins/3D_kibana_charts_vis/Three');
  console.log(THREE);*/
  require("plugins/3D_kibana_charts_vis/FontUtils");
  console.log(THREE.FontUtils);
  require("plugins/3D_kibana_charts_vis/TextGeometry");
  console.log(THREE.TextGeometry);
  require("plugins/3D_kibana_charts_vis/Projector");
  console.log(THREE.RenderableObject);
  THREEx = require("plugins/3D_kibana_charts_vis/threex.domevents");
  console.log(THREEx.DomEvents);
  Detector = require("plugins/3D_kibana_charts_vis/Detector");
  console.log(Detector);
/*  Stats = require("plugins/3D_kibana_charts_vis/Stats");
  console.log(Stats);*/
  require("plugins/3D_kibana_charts_vis/OrbitControls");
  console.log(THREE.OrbitControls);
  //require("plugins/3D_kibana_charts_vis/THREEx.WindowResize");
  //console.log(THREEx.WindowResize);
  //console.log(THREEx.DomEvents);
  //require("plugins/3D_kibana_charts_vis/THREEx.FullScreen");
  //console.log(THREEx.FullScreen);

  //si no lo pongo la biblioteca peta
  dat = require('plugins/3D_kibana_charts_vis/DAT.GUI.min');

  THREEDC = require("plugins/3D_kibana_charts_vis/3dc");
  console.log(THREEDC);

/*  var typeface = require('three.regular.helvetiker');
  THREE.typeface_js.loadFace(typeface);*/
  var typeface2 = require('plugins/3D_kibana_charts_vis/helvetiker_bold.typeface');
  THREE.typeface_js.loadFace(typeface2);

// register the provider with the visTypes registry
visTypes.register(require('plugins/3D_kibana_charts_vis/pie3D'));
visTypes.register(require('plugins/3D_kibana_charts_vis/bars3D'));
visTypes.register(require('plugins/3D_kibana_charts_vis/bubbles3D'));

//require('../node_modules/c3/c3.css');
});