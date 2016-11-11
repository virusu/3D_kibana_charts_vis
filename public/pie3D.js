import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';
import pieVisTemplate from 'plugins/vr_charts/pie_vis.html';

import 'plugins/vr_charts/pie_vis_controller';


export default function pieVisProvider(Private) {
    var TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);
    const Schemas = Private(VisSchemasProvider);
	
    return new TemplateVisType({
  		name: 'vrCharts',
  		title: 'Vio Rusu charts widget',
  		icon: 'fa-bicycle',
  		description: 'Just a sample visualization for checking threedc integration in kibana',
  		template: pieVisTemplate,
/*  		params: {
  			defaults: {
          		editorPanel: {},
          		enableZoom: false,

  			},
            editor: vrVisParamsTemplate
	    },   */  
    // Define the aggregation your visualization accepts
    schemas: new Schemas([
        {
          group: 'metrics',
          name: 'slice_size',
          title: 'Slice Size',
          min: 1,
          max: 1,
          aggFilter: ['count', 'avg', 'sum', 'min', 'max', 'cardinality', 'std_dev']
        },
        {
          group: 'buckets',
          name: 'slices',
          title: 'Slices',
          min: 1,
          max: 1,
          aggFilter: '!geohash_grid'
        }
      ])

    });
}