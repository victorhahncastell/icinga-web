Ext.ns('Cronk.util');

Cronk.util.Tabhelper = (function() {
	
	var pub = {};
	var tp = null;
	var ctxItem = null;
	var contextmenu = null;
	var keyMap = null;
	
	Ext.apply(pub, {
		init: function(panel) {
			tp = panel;
			
			// create  our drop target for the cronks
			tp.on('afterrender', this.createDropTarget, this, { single: true });
			
			// Deny removing all tabs
			tp.on('beforeremove', this.itemRemoveActiveHandler, this);
			
			// Enable title change bubble to safe the state 
			// of the component
			tp.on('add', this.itemModifier, this);
			
			// Saving the last tab for a history
			tp.on('beforetabchange', this.itemActivate, this);
			
			// Adding the contextmenu
			tp.on('contextmenu', this.contextMenu, this);
			
			// Check if we've no tabs and say hello if the frame is empty
			tp.on('afterrender', this.sayHello, this, { single: true, delay: 5 });
			
			// Prevent refresh
			this.applyGlobalKeyMap();
		},
		
		createWelcomeCronk : function() {
			return AppKit.Ext.CronkMgr.create({
				title: _("Welcome"),
				crname: 'portalHello',
				loaderUrl: "<?php echo $ro->gen('icinga.cronks.crloader', array('cronk' => null)); ?>",
				closable: true
			});
		},
		
		sayHello : function() {
			if (tp.items.getCount() < 1) {
				tp.setActiveTab(tp.add(this.createWelcomeCronk()));
			}
		},
		
		applyGlobalKeyMap : function() {
			keyMap = new Ext.KeyMap(Ext.getDoc(), {
				key: Ext.EventObject.F5,
				fn: function(keycode, e) {
					
					if (Ext.isIE) {
						e.browserEvent.keyCode = Ext.EventObject.ESC
					}
					
					var tab = tp.getActiveTab();
					if (tab) {
						e.stopEvent();
						tab.getUpdater().refresh();
					}
				},
				scope: this
			});
		},
		
		createDropTarget : function() {
			var t = tp;
			new Ext.dd.DropTarget(t.header, {
							ddGroup: 'cronk',
							
							notifyDrop: function(dd, e, data){

								// Create the cronk we want
								var panel = AppKit.Ext.CronkMgr.create({
									parentid: AppKit.Ext.genRandomId('cronk'),
									title: data.dragData['name'],
									crname: data.dragData.id,
									loaderUrl: "<?php echo $ro->gen('icinga.cronks.crloader', array('cronk' => null)); ?>",
									closable: true,
									layout: 'fit',
									params: data.dragData.parameter
								});
								
								// add them to the tabs
								tabPanel.add(panel);
								
								// Set active
								tabPanel.setActiveTab(panel);
							}
			});
		},
		
		itemRemoveActiveHandler : function (tabPanel, ri) {
			var s = AppKit.Ext.Storage.getStore(tabPanel.id);
			
			if (tabPanel.items.getCount() <= 1) {
				AppKit.Ext.notifyMessage(_('Sorry'), _('Could not remove the last tab!'));
				return false;
			}
			else {
				
				var last = s.get('last_tab');
				if (last && ri.id !== last) {
					tabPanel.setActiveTab( last );
				}
				else {
					tabPanel.setActiveTab( (tabPanel.items.getCount() - 1) );
				}
			}
			
			return true;
		},
		
		itemModifier : function (co, item, index) {
			item.enableBubble('titlechange');
			return true;
		},
		
		itemActivate : function (p, ntab, ctab) {
			var s = AppKit.Ext.Storage.getStore(p.id);
			if (ctab && "id" in ctab) {
				s.add('last_tab', ctab.id);
			}
		},
		
		contextMenu : function (panel, tab, e) {
			if (!this.contextmenu) {
				this.contextmenu = new Ext.menu.Menu({
					items: [{
						text: _("Close"),
						id: panel.id + '-close',
						iconCls: 'silk-cross',
						handler: function() { panel.remove(ctxItem); }
					}, {
						text: _("Close others"),
						id: panel.id + '-close-others',
						handler: function() {
							tp.items.each(function(item){
								if(item.closable && item != ctxItem){
									tp.remove(item);
								}
							});
						}
					}, {
						text: _("Rename"),
						id: panel.id + '-rename',
						iconCls: 'silk-table-edit',
						handler: this.renameTab,
						scope: this
					}, {
						text: _("Refresh"),
						tooltip: _("Reload the cronk (not the content)"), 
						iconCls: 'silk-arrow-refresh',
						handler: function() { ctxItem.getUpdater().refresh(); }
					}]
				});
			}
			
			ctxItem = tab;
			
			this.contextmenu.items.get(panel.id + '-close').setDisabled(!tab.closable);
			this.contextmenu.items.get(panel.id + '-close-others').setDisabled(!tab.closable);
			this.contextmenu.items.get(panel.id + '-rename').setDisabled(!tab.closable);
			this.contextmenu.showAt(e.getPoint());
		},
		
		renameTab : function() {
			var msg = Ext.Msg.prompt(_("Enter title"), _("Change title for this tab"), function(btn, text) {
				
				if (btn == 'ok' && text) {
					ctxItem.setTitle(text);
				}
						
			}, this, false, ctxItem.title);
			
			// Move the msgbox to our context menu
			msg.getDialog().alignTo(this.contextmenu.el, 'tr-tr');
		}
	});
	
	return pub;
	
})();

Ext.preg('cronk-tabhelper', Cronk.util.Tabhelper);
