import 'plugins/vr_charts/c3_vis.less';
import 'plugins/vr_charts/c3_vis_controller';
import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';
import c3VisTemplate from 'plugins/vr_charts/c3_vis.html';
import c3VisParamsTemplate from 'plugins/vr_charts/c3_vis_params.html';

// register the provider with the visTypes registry
require('ui/registry/vis_types').register(c3VisProvider);

require('../node_modules/c3/c3.css');

function c3VisProvider(Private) {
    const TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);
    const Schemas = Private(VisSchemasProvider);
	
    return new TemplateVisType({
  		name: 'vrCharts',
  		title: 'Vio linear charts widget',
  		icon: 'fa-bicycle',
  		description: 'Just a sample visualization for checking three integration in kibana',
  		template: c3VisTemplate,
  		params: {
  			defaults: {
          		editorPanel: {},
          		enableZoom: false,

  			},
	    },

    });
}

// export the provider so that the visType can be required with Private()
export default c3VisProvider;
