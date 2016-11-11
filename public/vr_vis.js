import 'plugins/vr_charts/vr_vis.less';

import visTypes from 'ui/registry/vis_types';

//import vrVisParamsTemplate from 'plugins/vr_charts/vr_vis_params.html';

// register the provider with the visTypes registry
visTypes.register(require('plugins/vr_charts/pie3D'));
visTypes.register(require('plugins/vr_charts/bars3D'));

require('../node_modules/c3/c3.css');