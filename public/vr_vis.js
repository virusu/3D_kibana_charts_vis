import 'plugins/vr_charts/vr_vis.less';

import visTypes from 'ui/registry/vis_types';

//import vrVisParamsTemplate from 'plugins/vr_charts/vr_vis_params.html';

// register the provider with the visTypes registry
visTypes.register(require('plugins/vr_charts/pie3D'));
visTypes.register(require('plugins/vr_charts/bars3D'));

//require('../node_modules/c3/c3.css');

  require('plugins/vr_charts/Three');

  require("plugins/vr_charts/FontUtils");
  console.log(THREE.FontUtils);
  require("plugins/vr_charts/TextGeometry");
  console.log(THREE.TextGeometry);
  require("plugins/vr_charts/Projector");
  console.log(THREE.RenderableObject);
  require("plugins/vr_charts/threex.domevents");
  console.log(THREEx.DomEvents);
  require("plugins/vr_charts/Detector");
  console.log(Detector);
/*  Stats = require("plugins/vr_charts/Stats");
  console.log(Stats);*/
  require("plugins/vr_charts/OrbitControls");
  console.log(THREE.OrbitControls);
  //require("plugins/vr_charts/THREEx.WindowResize");
  //console.log(THREEx.WindowResize);
  //console.log(THREEx.DomEvents);
  //require("plugins/vr_charts/THREEx.FullScreen");
  //console.log(THREEx.FullScreen);

  require('plugins/vr_charts/DAT.GUI.min');

  THREEDC = require("plugins/vr_charts/3dc");
  console.log(THREEDC);

/*  var typeface = require('three.regular.helvetiker');
  THREE.typeface_js.loadFace(typeface);*/
  var typeface2 = require('plugins/vr_charts/helvetiker_bold.typeface');
  THREE.typeface_js.loadFace(typeface2);