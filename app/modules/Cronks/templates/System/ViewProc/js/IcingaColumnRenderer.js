Ext.ns('AppKit.Ext.grid');

// These are the javascript methods available within
// the namespace
AppKit.Ext.grid.IcingaColumnRenderer = {
	
	subGrid : function(cfg) {
		return function(grid, rowIndex, colIndex, e) {
			var fieldName = grid.getColumnModel().getDataIndex(colIndex);
			if (fieldName == cfg.field) {
				
				var record = grid.getStore().getAt(rowIndex);
				var val = record.data[ cfg.sourceField ];
				var id = (cfg.idPrefix || 'empty') + 'subGridComponent';
				
				var cronk = {
					parentid: id,
					title: (cfg.titlePrefix || '') + " " + record.data[ cfg.labelField ],
					crname: 'gridProc',
					closable: true,
					params: { template: cfg.targetTemplate }
				};
				
				var filter = {};
				filter["f[" + cfg.targetField + "-value]"] = val;
				filter["f[" + cfg.targetField + "-operator]"] = 50;
				
				AppKit.Ext.util.InterGridUtil.gridFilterLink(cronk, filter);
			}
		}
	},
	
	ajaxClick : function(cfg) {

		return function(grid, rowIndex, colIndex, e) {
			var fieldName = grid.getColumnModel().getDataIndex(colIndex);
			if (fieldName == cfg.field) {

				cfg.processedFilterData = [];

				Ext.iterate(
					cfg.filter,
					function (key, value) {
						this.push({key: key, value: grid.getStore().getAt(rowIndex).data[value]});
					},
					cfg.processedFilterData
				);

				var sdp = new SimpleDataProvider({
					targetXY: [e.getPageX(), e.getPageY() - 50],
					srcId: cfg.src_id,
					width: 400,
					delay: 15000,
					filter: cfg.processedFilterData
				});

			}
		}

	}
};