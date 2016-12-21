export default function (kibana) {
	
	return new kibana.Plugin({
		uiExports: {
			visTypes: [
				'plugins/3D_kibana_charts_vis/vr_vis'
      		]
    	}
  	});
};