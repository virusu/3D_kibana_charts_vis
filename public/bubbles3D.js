import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';
import BubblesTemplate from 'plugins/vr_charts/bubbles3D.html';

import 'plugins/vr_charts/bubbles3D_controller';


export default function bubbles3DVisProvider(Private) {
    var TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);
    const Schemas = Private(VisSchemasProvider);
	
    return new TemplateVisType({
  		name: 'Bubbles3DChart',
  		title: '3D Bubbles Chart',
  		icon: 'fa-bomb',
  		description: 'A 3D bubbles chart. Great for representing 3D data',
  		template: BubblesTemplate,
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
          name: 'bubbles_height_size',
          title: 'Bubbles Height-Size',
          min: 1,
          max: 1,
          aggFilter: ['count', 'avg', 'sum', 'min', 'max', 'cardinality', 'std_dev']
        },
        {
          group: 'buckets',
          name: 'bubbles',
          title: 'Bubbles',
          min: 1,
          max: 2,
          aggFilter: '!geohash_grid'
        }
      ])

    });
}