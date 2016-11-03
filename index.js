export default function (kibana) {
	
	return new kibana.Plugin({
		uiExports: {
			visTypes: [
				'plugins/vr_charts/vr_vis'
      		]
    	}
  	});
};