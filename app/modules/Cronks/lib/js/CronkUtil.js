
Cronk.util.StructUtil = function(){
	
	var pub = {

		extractParts : function(o, list) {
			var intersect = {};
			
			Ext.each(list, function(item, index, arry) {
				if (item in o) {
					intersect[item] = o[item];
				}
				else if (!(item in intersect)) {
					intersect[item] = {};
				}
			});
			
			return intersect;			
		},
		
		attributeString : function(o) {
			var p = [];
			Ext.iterate(o, function(k,v) {
				p.push(String.format('{0}="{1}"', k, v));
			});
			return p.join(' ');
		}
		
	};
	
	return pub;
	
}();

Cronk.util.scriptInterface = Ext.extend(Object, function () {
	
	var r = null;
	var parentCmp = null;
	var parentCall = function(method) {
		if (method in parentCmp && Ext.isFunction(parentCmp[method])) {
			return parentCmp[method].createDelegate(parentCmp, [], true);
		}
	}
	
	return {
		constructor : function(parentid) {
			r = Cronk.Registry.get(parentid);
			
			if (r) {
				parentCmp = Ext.getCmp(parentid);
				this.parentd = parentid;
				Ext.apply(this, r);
				
				Ext.apply(this, {
					insert: parentCall('insert'),
					add: parentCall('add'),
					doLayout: parentCall('doLayout')					
				});
				
			}
			
		},
		
		getRegistryEntry : function() {
			return r;
		},
		
		getParent : function() {
			return parentCmp;
		},
		
		getParameter : function(pname, vdefault) {
			if (pname in this.params) {
				return this.params[pname];
			}
			return vdefault;
		}
	}
	
}());

Cronk.util.initEnvironment = function(parentid, method, o) {
	var
	run=false,
	extready=false;
	
	o = (o || {});
	
	// Some options you can set withn a object as third parameter
	if (!Ext.isEmpty(o.parentid)) parentid = o.parentid;
	if (!Ext.isEmpty(o.run)) run = true;
	if (!Ext.isEmpty(o.extready)) extready = true;
	
	var rc = function() {
		if (parentid) {
			if (Ext.isFunction(method)) {
				var lscope = new Cronk.util.scriptInterface(parentid);
				if (run==true || (lscope.getParent() && lscope.getRegistryEntry())) {
					method.call(lscope);
					return true;
				}
			}
		}
	}
	
	if (extready==true) {
		Ext.onReady(rc, this);
	}
	else {
		rc.call(this);
	}
	
	return true;
};

Cronk.util.InterGridUtil = function(){
	
	var applyParametersToGrid = function(baseParams, c) {
		if ((c.getXType() == 'grid' || c.getXType() == 'cronkgrid')) {
			
			var store = c.getStore();
			if (!"originParams" in store || typeof(store.originParams) == "undefined") {
				store.originParams = {};
			}
			
			Ext.iterate(baseParams, function(k,v) {
				store.originParams[k] = v;
				store.setBaseParam(k, v);
			});
			
			c.getStore().reload();
		}
	};
	
	var pub = {
		
		gridFilterLink : function(config, baseParams) {
			var tabs = Ext.getCmp('cronk-tabs');
			var id = config.parentid || null;
			var panel = Ext.getCmp(id);
//			console.log(config);
			// disable grid autoload
			config.params['storeDisableAutoload'] = 1;
			
			if (!panel) {
				
				panel = Cronk.factory(config);					
								
				panel.on('add', function(p, c, i) {
//					console.log('ADD', c.getXType());
					applyParametersToGrid(baseParams, c)
				});
				
//				console.log(baseParams);
				
				tabs.add(panel);
			}
			else {
				grids = panel.findByType('cronkgrid');
				if (grids[0]) {
					applyParametersToGrid(baseParams, grids[0]);
				}
			}
			
			panel.setTitle(config.title);
			tabs.setActiveTab(panel);
			
			tabs.doLayout();
			Ext.getCmp('view-container').doLayout();
		},
		
		clickGridLink : function(id, template, f, t) {
			var el = Ext.get(id)
			if (id && el) {
				el.addClass('icinga-link');
				el.on('click', (function() {
					var cronk = {
						parentid: 'click-grid-link-' + id, 
						title: (t || 'SUBGRID'),
						crname: "gridProc",
						closable: true,
						params: {template: template}
					};
					
					Ext.iterate(f, function(k, v) {
						delete(f[k]);
						f['f[' + k + '-value]'] = v;
						f['f[' + k + '-operator]'] = 50;
					});
					
					Cronk.util.InterGridUtil.gridFilterLink(cronk, f);
					
				}).createDelegate(this));
			}
		}
	};	
	
	return pub;
	
}();