import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';
import pieVisTemplate from 'plugins/3D_kibana_charts_vis/pie3D.html';

import 'plugins/3D_kibana_charts_vis/pie3D_controller';

export default function pieVisProvider(Private) {
    var TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);
    const Schemas = Private(VisSchemasProvider);
	
    return new TemplateVisType({
  		name: 'Pie3DChart',
  		title: '3D Pie chart',
  		icon: 'fa-pie-chart',
  		description: 'A cool 3D pie for your visualization',
  		template: pieVisTemplate,

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