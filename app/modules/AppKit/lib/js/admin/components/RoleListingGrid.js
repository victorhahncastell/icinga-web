Ext.ns("AppKit.Admin.Components");
AppKit.Admin.Components.RoleListingGrid = Ext.extend(Ext.grid.GridPanel,{
    title: _('Available roles'), 
    region: 'center',
    layout: 'fit',
    stateful: false,
    sm: new Ext.grid.RowSelectionModel(),
    iconCls: 'icinga-icon-group',
    
    constructor: function(cfg) {
        
        cfg.bbar = new Ext.PagingToolbar({
            pageSize: 25,
            store: cfg.store,
            displayInfo: true,
            displayMsg: _('Displaying roles')+' {0} - {1} '+_('of')+' {2}',
            emptyMsg: _('No roles to display')
        });
        Ext.apply(this,cfg);
        Ext.grid.GridPanel.prototype.constructor.call(this,cfg);
    },
    
    deleteSelected: function() {
        Ext.Msg.confirm(_("Delete role"),_("Do you really want to delete these roles?"),function(btn) {
            if(btn != "yes")
                return false;
            var selModel = this.getSelectionModel();
            var selected = selModel.getSelections();
            var ids = [];

            Ext.each(selected,function(record) {
                ids.push(record.get("id"));
            },this);
            var uri = this.roleProviderURI+"/ids="+ids.join(",");                        
            Ext.Ajax.request({
                url: uri,
                method: 'DELETE',
                success: function() {
                    this.getStore().reload();
                },
                scope:this,
                params: ids

            });
        },this)
    },
    viewConfig : {
        scrollOffset:30,
        forceFit:true
    },
    tbar: {
        items: [{
            xtype: 'button',
            iconCls: 'icinga-icon-arrow-refresh',
            scope:this,
            text: 'Refresh',
            handler: function(c) {
                c.ownerCt.ownerCt.getBottomToolbar().doRefresh();
            }

        },{
            xtype: 'button',
            iconCls: 'icinga-icon-cancel',
            text: _('Remove selected'),
            handler: function(c,btn) {
                c.ownerCt.ownerCt.deleteSelected();
            },
            scope: this
        },' ',{
            xtype: 'button',
            iconCls: 'icinga-icon-add',
            text: _('Add new role'),
            handler: function(c) {
                AppKit.Admin.RoleEditForm.bindRole('new', c.ownerCt.ownerCt.roleProviderURI);
                Ext.getCmp('roleEditor').setDisabled(false);
                Ext.getCmp('btn-save-group').setText(_('Create role'));
                Ext.getCmp('btn-save-group').setIconClass('icinga-icon-group-add');
                Ext.getCmp('progressbar-field').setValue();
            }

        },'->',{
            xtype:'button',
            enableToggle:true,
            text: _('Hide disabled'),
            id:'hide_disabled',
            name: 'disabled',
            listeners: {
                toggle: function(btn,checked) {
                    btn.ownerCt.ownerCt.getStore().setBaseParam('hideDisabled',checked);
                    return true;
                }
            }
        }]

    },
   
    

    listeners: {
        rowclick: function(grid,index,_e) {
            var id = grid.getStore().getAt(index).get("id");
            Ext.getCmp('roleEditor').setDisabled(false);
            Ext.getCmp('btn-save-group').setText(_('Save'));
            Ext.getCmp('btn-save-group').setIconClass('icinga-icon-disk');
            Ext.getCmp('progressbar-field').setValue();
            AppKit.Admin.RoleEditForm.bindRole(id, grid.roleProviderURI);									
        }
      

    },


    colModel: new Ext.grid.ColumnModel({
        defaults: {
            width:120,
            sortable:true
        },
        columns: [
            {id:'id', header: 'ID', width:75,  dataIndex: 'id'},
            {header: _('Name'), dataIndex: 'name'},
            {header: _('Description'), dataIndex: 'description'},
            {header: _('active'), dataIndex: 'disabled_icon',width:75}
        ]
    })

});