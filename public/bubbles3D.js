import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';
import BubblesTemplate from 'plugins/3D_kibana_charts_vis/bubbles3D.html';

import 'plugins/3D_kibana_charts_vis/bubbles3D_controller';


export default function bubbles3DVisProvider(Private) {
    var TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);
    const Schemas = Private(VisSchemasProvider);
	
    return new TemplateVisType({
  		name: 'Bubbles3DChart',
  		title: '3D Bubbles Chart',
  		icon: 'fa-bomb',
  		description: 'A 3D bubbles chart. Great for representing 3D data',
  		template: BubblesTemplate,

    // Define the aggregation your visualization accepts
    schemas: new Schemas([
        {
          group: 'metrics',
          name: 'bubbles_height_size',
          title: 'Bubbles Height and Size',
          min: 2,
          max: 2,
          aggFilter: ['count', 'avg', 'sum', 'min', 'max', 'cardinality', 'std_dev']
        },
        {
          group: 'buckets',
          name: 'bubbles',
          title: 'Bubbles',
          min: 2,
          max: 2,
          aggFilter: '!geohash_grid'
        }
      ])

    });
}