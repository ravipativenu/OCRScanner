// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/components/flp/launchpad/PagingManager"],function(P){"use strict";sap.ui.controller("sap.ushell.components.flp.launchpad.appfinder.Catalog",{oPopover:null,onInit:function(){this.categoryFilter="";this.oMainModel=this.oView.getModel();this.oSubHeaderModel=this.oView.getModel("subHeaderModel");var t=this,s=this.oSubHeaderModel.bindProperty("/tag/selectedTags"),S=this.oSubHeaderModel.bindProperty("/search"),T=this.oSubHeaderModel.bindProperty("/tag/tagMode");sap.ui.getCore().byId("catalogSelect").addEventDelegate({onBeforeRendering:this.onBeforeSelectRendering},this);var r=this.getView().parentComponent.getRouter();r.getRoute("catalog").attachPatternMatched(function(e){t.onShow(e);});r.getRoute("appFinder").attachPatternMatched(function(e){t.onShow(e);});this.timeoutId=0;document.subHeaderModel=this.oSubHeaderModel;document.mainModel=this.oMainModel;S.attachChange(t.handleSearchModelChanged.bind(this));s.attachChange(t.handleSearchModelChanged.bind(this));T.attachChange(t.handleSearchModelChanged.bind(this));var o=this.oSubHeaderModel.bindProperty("/openCloseSplitAppButtonToggled");o.attachChange(t.handleToggleButtonModelChanged.bind(this));},onBeforeRendering:function(){sap.ui.getCore().getEventBus().publish("renderCatalog");},onAfterRendering:function(){var m=this.getView().getModel(),c=m.getProperty('/catalogs'),t=this;if(!c.length){}else if(c[0].title!=sap.ushell.resources.i18n.getText('catalogsLoading')){}if(!this.PagingManager){this.lastCatalogId=0;this.PagingManager=new P('catalogPaging',{supportedElements:{tile:{className:'sapUshellTile'}},containerHeight:window.innerHeight,containerWidth:window.innerWidth});this.getView().getCatalogContainer().setPagingManager(this.PagingManager);}if(this.PagingManager.currentPageIndex===0){t.allocateNextPage();}jQuery(window).resize(function(){var w=$(window).width(),a=$(window).height();t.PagingManager.setContainerSize(w,a);});t._handleAppFinderWithDocking();sap.ui.getCore().getEventBus().subscribe("launchpad","appFinderWithDocking",t._handleAppFinderWithDocking,this);},_decodeUrlFilteringParameters:function(u){var U=u?JSON.parse(u):u,h=(U&&U.tagFilter&&U.tagFilter)||"";if(h){try{this.tagFilter=JSON.parse(h);}catch(e){this.tagFilter=[];}}else{this.tagFilter=[];}this.categoryFilter=(U&&U.catalogSelector&&U.catalogSelector)||this.categoryFilter;if(this.categoryFilter){this.categoryFilter=window.decodeURIComponent(this.categoryFilter);}this.searchFilter=(U&&U.tileFilter&&U.tileFilter)||null;if(this.searchFilter){this.searchFilter=window.decodeURIComponent(this.searchFilter);}},_applyFilters:function(){if(this.categoryFilter){this.categoryFilter=sap.ushell.resources.i18n.getText('all')===this.categoryFilter?'':this.categoryFilter;this.getView().getModel().setProperty("/categoryFilter",this.categoryFilter);return;}if(this.searchFilter&&this.searchFilter.length){this.searchFilter=this.searchFilter.replace(/\*/g,'');this.oSubHeaderModel.setProperty('/search',{searchMode:true,searchTerm:this.searchFilter});}if(this.tagFilter&&this.tagFilter.length){this.oSubHeaderModel.setProperty('/tag',{tagMode:true,selectedTags:this.tagFilter});}},onShow:function(e){var v,u=e.getParameter('arguments').filters;v=sap.ui.getCore().byId("viewPortContainer");if(v){v.shiftCenterTransition(false);}$.extend(this.getView().getViewData(),e);this._decodeUrlFilteringParameters(u);this._applyFilters();},resetPageFilter:function(){this.lastCatalogId=0;this.allocateTiles=this.PagingManager.getNumberOfAllocatedElements();this.getView().getCatalogContainer().setCategoryAllocateTiles(this.allocateTiles);},allocateNextPage:function(){var c=this.getView().getCatalogContainer();if(!this.nAllocatedTiles||this.nAllocatedTiles===0){this.PagingManager.moveToNextPage();this.allocateTiles=this.PagingManager._calcElementsPerPage();c.setCategoryAllocateTiles(this.allocateTiles);}},onBeforeSelectRendering:function(){var s=sap.ui.getCore().byId("catalogSelect"),i=jQuery.grep(s.getItems(),jQuery.proxy(function(I){return I.getBindingContext().getObject().title===this.categoryFilter;},this));if(!i.length&&s.getItems()[0]){i.push(s.getItems()[0]);}},setTagsFilter:function(f){var p={catalogSelector:this.categoryFilter,tileFilter:this.searchFilter?encodeURIComponent(this.searchFilter):"",tagFilter:f,targetGroup:encodeURIComponent(this.getGroupContext())};this.getView().parentComponent.getRouter().navTo('appFinder',{'menu':'catalog',filters:JSON.stringify(p)},true);},setCategoryFilter:function(f){var p={catalogSelector:f,tileFilter:this.searchFilter?encodeURIComponent(this.searchFilter):"",tagFilter:JSON.stringify(this.tagFilter),targetGroup:encodeURIComponent(this.getGroupContext())};this.getView().parentComponent.getRouter().navTo('appFinder',{'menu':'catalog',filters:JSON.stringify(p)},true);},setSearchFilter:function(f){var p={catalogSelector:this.categoryFilter,tileFilter:f?encodeURIComponent(f):"",tagFilter:JSON.stringify(this.tagFilter),targetGroup:encodeURIComponent(this.getGroupContext())};this.getView().parentComponent.getRouter().navTo('appFinder',{'menu':'catalog','filters':JSON.stringify(p)});},getGroupContext:function(){var m=this.getView().getModel(),g=m.getProperty("/groupContext/path");return g?g:"";},_isTagFilteringChanged:function(s){var S=s.length===this.tagFilter.length,i=S;if(!i){return true;}s.some(function(t,I){i=jQuery.inArray(t,this.tagFilter)!==-1;return!i;}.bind(this));return i;},_setUrlWithTagsAndSearchTerm:function(s,S){var u={tileFilter:s&&s.length?encodeURIComponent(s):'',tagFilter:S.length?JSON.stringify(S):[],targetGroup:encodeURIComponent(this.getGroupContext())};this.getView().parentComponent.getRouter().navTo('appFinder',{'menu':'catalog','filters':JSON.stringify(u)});},handleSearchModelChanged:function(){var a=this.oSubHeaderModel.getProperty('/activeMenu'),s=this.oSubHeaderModel.getProperty('/search/searchMode'),t=this.oSubHeaderModel.getProperty('/tag/tagMode'),p,S=this.oSubHeaderModel.getProperty('/search/searchTerm'),b=this.oSubHeaderModel.getProperty('/tag/selectedTags'),o,f=[],c;if(this.oView.getId().indexOf(a)!==-1){if(s||t){this.oView.setCategoryFilterSelection();if(!this.oView.oCatalogEntrySearchContainer.getBinding("customTilesContainer")){this.oView.oCatalogEntrySearchContainer.bindAggregation("customTilesContainer",{path:"/catalogSearchEntity/customTiles",template:this.oView.oTileTemplate,templateShareable:true});}if(!this.oView.oCatalogEntrySearchContainer.getBinding("appBoxesContainer")){this.oView.oCatalogEntrySearchContainer.bindAggregation("appBoxesContainer",{path:"/catalogSearchEntity/appBoxes",template:this.oView.oAppBoxesTemplate,templateShareable:true});}if(b&&b.length>0){o=new sap.ui.model.Filter('tags','EQ','v');o.fnTest=function(T){var i,h;if(b.length===0){return true;}for(i=0;i<b.length;i++){h=b[i];if(T.indexOf(h)===-1){return false;}}return true;}.bind(this);f.push(o);}S=S?S.replace(/\*/g,''):S;if(S){var d=S.split(/[\s,]+/);var k=new sap.ui.model.Filter(jQuery.map(d,function(v){return(v&&new sap.ui.model.Filter("keywords",sap.ui.model.FilterOperator.Contains,v));}),true);var e=new sap.ui.model.Filter($.map(d,function(v){return(v&&new sap.ui.model.Filter("title",sap.ui.model.FilterOperator.Contains,v));}),true);var g=new sap.ui.model.Filter($.map(d,function(v){return(v&&new sap.ui.model.Filter("subtitle",sap.ui.model.FilterOperator.Contains,v));}),true);f.push(k);f.push(e);f.push(g);}this.oView.oCatalogEntrySearchContainer.getBinding("customTilesContainer").filter(f);this.oView.oCatalogEntrySearchContainer.getBinding("appBoxesContainer").filter(f);c=this.oView.oCatalogEntrySearchContainer.getNumberResults();this.bSearchResults=(c.nAppboxes+c.nCustom>0);this.oView.oCatalogEntrySearchContainer.setAfterHandleElements(function(i){var n=i.getNumberResults();this.bSearchResults=(n.nAppboxes+n.nCustom>0);this.oView.splitApp.toDetail(this.getView()._calculateDetailPageId());}.bind(this));this._showHideSelectedMasterItem(false);if(this._isTagFilteringChanged(b)){this._setUrlWithTagsAndSearchTerm(S,b);}}else{this._showHideSelectedMasterItem(true);this.setCategoryFilter(this.categoryFilter);}p=this.getView()._calculateDetailPageId();this.oView.splitApp.toDetail(p);}else{this._restoreSelectedMasterItem();}},_handleAppFinderWithDocking:function(){if(jQuery(".sapUshellContainerDocked").length>0){if(jQuery("#mainShell").width()<710){if(window.innerWidth<1024){this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonVisible",false);this.oView.splitApp.setMode(sap.m.SplitAppMode.ShowHideMode);}else{this.oView.splitApp.setMode(sap.m.SplitAppMode.HideMode);this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonVisible",true);}}else{this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonVisible",false);this.oView.splitApp.setMode(sap.m.SplitAppMode.ShowHideMode);}}else{if(window.innerWidth<1024&&window.innerWidth>715){this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonVisible",false);this.oView.splitApp.setMode(sap.m.SplitAppMode.ShowHideMode);}}},_showHideSelectedMasterItem:function(i){var c=this.oView.splitApp.getMasterPage('catalogSelect'),C=c.getSelectedItem();if(C){C.toggleStyleClass("sapUshellHideSelectedListItem",!i);}},_restoreSelectedMasterItem:function(){var c=this.oView.splitApp.getMasterPage('catalogSelect'),o=sap.ui.getCore().byId(this.selectedCategoryId);if(o){this.categoryFilter=o.getTitle();}c.setSelectedItem(o);},handleToggleButtonModelChanged:function(){var b=this.oSubHeaderModel.getProperty("/openCloseSplitAppButtonVisible"),B=this.oSubHeaderModel.getProperty("/openCloseSplitAppButtonToggled");if(B!=this.bCurrentButtonToggled){if(!sap.ui.Device.system.phone){if(b){if(B&&!this.oView.splitApp.isMasterShown()){this.oView.splitApp.showMaster();}else if(this.oView.splitApp.isMasterShown()){this.oView.splitApp.hideMaster();}}}else{if(b){if(B&&!this.oView.splitApp.isMasterShown()){var c=sap.ui.getCore().byId('catalogSelect');this.oView.splitApp.backMaster(c);}else if(this.oView.splitApp.isMasterShown()){var d=sap.ui.getCore().byId(this.getView()._calculateDetailPageId());this.oView.splitApp.toDetail(d);}}}}this.bCurrentButtonToggled=B;},_handleCatalogListItemPress:function(e){this.onCategoryFilter(e);this.oSubHeaderModel.setProperty('/search/searchMode',false);this.oSubHeaderModel.setProperty('/tag/tagMode',false);if(sap.ui.Device.system.phone||sap.ui.Device.system.tablet){this.oSubHeaderModel.setProperty('/openCloseSplitAppButtonToggled',!this.oSubHeaderModel.setProperty('/openCloseSplitAppButtonToggled'));}this.handleSearchModelChanged();},onCategoryFilter:function(e){var m=e.getSource(),s=m.getSelectedItem(),S=s.getBindingContext(),M=S.getModel();if(M.getProperty("static",S)){M.setProperty("/showCatalogHeaders",true);this.setCategoryFilter();this.selectedCategoryId=undefined;this.categoryFilter=undefined;}else{M.setProperty("/showCatalogHeaders",false);this.setCategoryFilter(window.encodeURIComponent(s.getBindingContext().getObject().title));this.categoryFilter=s.getTitle();this.selectedCategoryId=s.getId();}},onTileAfterRendering:function(e){var j=jQuery(e.oSource.getDomRef()),a=j.find(".sapMGT");a.attr("tabindex","-1");},catalogTilePress:function(c){sap.ui.getCore().getEventBus().publish("launchpad","catalogTileClick");},onAppBoxPressed:function(e){var a=e.getSource(),t=a.getBindingContext().getObject(),p;if(e.mParameters.srcControl.$().closest(".sapUshellPinButton").length){return;}p=sap.ushell.Container.getService("LaunchPage").getAppBoxPressHandler(t);if(p){p(t);}else{var u=a.getProperty("url");if(u&&u.indexOf("#")===0){hasher.setHash(u);}else{window.open(u,'_blank');}}},onTilePinButtonClick:function(e){var l=sap.ushell.Container.getService("LaunchPage");var d=l.getDefaultGroup();d.done(function(D){var c=e.getSource(),s=c.getBindingContext(),m=this.getView().getModel(),g=m.getProperty("/groupContext/path");if(g){this._handleTileFooterClickInGroupContext(s,g);}else{var a=m.getProperty("/groups");var l=sap.ushell.Container.getService("LaunchPage");var b=this.getCatalogTileDataFromModel(s);var t=b.tileData.associatedGroups;var G=[];var i=0;var f=a.map(function(k){var r,n,T;r=l.getGroupId(k.object);n=!($.inArray(r,t)==-1);T={id:r,title:this._getGroupTitle(D,k.object),selected:n};G.push(T);i++;return{selected:n,initiallySelected:n,oGroup:k};}.bind(this));var h=jQuery("#groupsPopover-popover");if(h.length===1){var p=sap.ui.getCore().byId("sapUshellGroupsPopover");p.destroy();}var j=new sap.ui.view("sapUshellGroupsPopover",{type:sap.ui.core.mvc.ViewType.JS,viewName:"sap.ushell.components.flp.launchpad.appfinder.GroupListPopover",viewData:{groupData:f,title:l.getCatalogTileTitle(m.getProperty(s.sPath).src),enableHideGroups:m.getProperty("/enableHideGroups"),enableHelp:m.getProperty("/enableHelp"),sourceContext:s,catalogModel:this.getView().getModel(),catalogController:this}});j.getController().setSelectedStart(G);j.open(c).then(this._handlePopoverResponse.bind(this,s,b));}}.bind(this));},_getGroupTitle:function(d,g){var l=sap.ushell.Container.getService("LaunchPage"),t;if(l.getGroupId(d)===l.getGroupId(g)){t=sap.ushell.resources.i18n.getText("my_group");}else{t=l.getGroupTitle(g);}return t;},_handlePopoverResponse:function(s,c,r){if(!r.addToGroups.length&&!r.newGroups.length&&!r.removeFromGroups.length){return;}var m=this.getView().getModel();var g=m.getProperty("/groups");var p=[];r.addToGroups.forEach(function(a){var i=g.indexOf(a);var G=new sap.ui.model.Context(m,"/groups/"+i);var b=this._addTile(s,G);p.push(b);}.bind(this));r.removeFromGroups.forEach(function(a){var t=s.getModel().getProperty(s.getPath()).id;var i=g.indexOf(a);var b=this._removeTile(t,i);p.push(b);}.bind(this));r.newGroups.forEach(function(a){var n=(a.length>0)?a:sap.ushell.resources.i18n.getText("new_group_name");var b=this._createGroupAndSaveTile(s,n);p.push(b);}.bind(this));jQuery.when.apply(jQuery,p).then(function(){var a=Array.prototype.slice.call(arguments);this._handlePopoverGroupsActionPromises(c,r,a);}.bind(this));},_handlePopoverGroupsActionPromises:function(c,p,r){var e=r.filter(function(g,i,r){return!g.status;});if(e.length){var E=this.prepareErrorMessage(e,c.tileData.title);var d=sap.ushell.components.flp.launchpad.DashboardManager();d.resetGroupsOnFailure(E.messageId,E.parameters);return;}var t=[];var l=sap.ushell.Container.getService("LaunchPage");p.allGroups.forEach(function(g){if(g.selected){var h=l.getGroupId(g.oGroup.object);t.push(h);}});var m=this.getView().getModel();if(p.newGroups.length){var a=m.getProperty("/groups");var n=a.slice(a.length-p.newGroups.length);n.forEach(function(g){var h=l.getGroupId(g.object);t.push(h);});}m.setProperty(c.bindingContextPath+"/associatedGroups",t);var f=(!!p.addToGroups[0])?p.addToGroups[0].title:"";if(!f.length&&p.newGroups.length){f=p.newGroups[0];}var b=(!!p.removeFromGroups[0])?p.removeFromGroups[0].title:"";var D=this.prepareDetailedMessage(c.tileData.title,p.addToGroups.length+p.newGroups.length,p.removeFromGroups.length,f,b);sap.m.MessageToast.show(D,{duration:3000,width:"15em",my:"center bottom",at:"center bottom",of:window,offset:"0 -50",collision:"fit fit"});},_getCatalogTileIndexInModel:function(s){var t=s.sPath,a=t.split("/"),b=a[a.length-1];return b;},_handleTileFooterClickInGroupContext:function(s,g){var l=sap.ushell.Container.getService("LaunchPage"),m=this.getView().getModel(),c=this.getCatalogTileDataFromModel(s),a=c.tileData.associatedGroups,G=m.getProperty(g),b=l.getGroupId(G.object),C=$.inArray(b,a),t=this._getCatalogTileIndexInModel(s),o,A,r,T,d,e=this;if(c.isBeingProcessed){return;}m.setProperty('/catalogTiles/'+t+'/isBeingProcessed',true);if(C==-1){o=new sap.ui.model.Context(s.getModel(),g);A=this._addTile(s,o);A.done(function(f){if(f.status==1){e._groupContextOperationSucceeded(s,c,G,true);}else{e._groupContextOperationFailed(c,G,true);}});A.always(function(){m.setProperty('/catalogTiles/'+t+'/isBeingProcessed',false);});}else{T=s.getModel().getProperty(s.getPath()).id;d=g.split('/')[2];r=this._removeTile(T,d);r.done(function(f){if(f.status==1){e._groupContextOperationSucceeded(s,c,G,false);}else{e._groupContextOperationFailed(c,G,false);}});r.always(function(){m.setProperty('/catalogTiles/'+t+'/isBeingProcessed',false);});}},_groupContextOperationSucceeded:function(s,c,g,t){var l=sap.ushell.Container.getService("LaunchPage"),G=l.getGroupId(g.object),a=c.tileData.associatedGroups,d,i;if(t){a.push(G);s.getModel().setProperty(c.bindingContextPath+"/associatedGroups",a);d=this.prepareDetailedMessage(c.tileData.title,1,0,g.title,"");}else{for(i in a){if(a[i]==G){a.splice(i,1);break;}}s.getModel().setProperty(c.bindingContextPath+"/associatedGroups",a);d=this.prepareDetailedMessage(c.tileData.title,0,1,"",g.title);}sap.m.MessageToast.show(d,{duration:3000,width:"15em",my:"center bottom",at:"center bottom",of:window,offset:"0 -50",collision:"fit fit"});},_groupContextOperationFailed:function(c,g,t){var d=sap.ushell.components.flp.launchpad.getDashboardManager(),e;if(t){e=sap.ushell.resources.i18n.getText({messageId:"fail_tile_operation_add_to_group",parameters:[c.tileData.title,g.title]});}else{e=sap.ushell.resources.i18n.getText({messageId:"fail_tile_operation_remove_from_group",parameters:[c.tileData.title,g.title]});}d.resetGroupsOnFailure(e.messageId,e.parameters);},prepareErrorMessage:function(e,t){var g,a,f,F,n=0,N=0,c=false,m;for(var i in e){g=e[i].group;a=e[i].action;if(a=='add'){n++;if(n==1){f=g.title;}}else if(a=='remove'){N++;if(N==1){F=g.title;}}else if(a=='addTileToNewGroup'){n++;if(n==1){f=g.title;}}else{c=true;}}if(c){if(e.length==1){m=sap.ushell.resources.i18n.getText({messageId:"fail_tile_operation_create_new_group"});}else{m=sap.ushell.resources.i18n.getText({messageId:"fail_tile_operation_some_actions"});}}else if(e.length==1){if(n){m=sap.ushell.resources.i18n.getText({messageId:"fail_tile_operation_add_to_group",parameters:[t,f]});}else{m=sap.ushell.resources.i18n.getText({messageId:"fail_tile_operation_remove_from_group",parameters:[t,F]});}}else{if(N==0){m=sap.ushell.resources.i18n.getText({messageId:"fail_tile_operation_add_to_several_groups",parameters:[t]});}else if(n==0){m=sap.ushell.resources.i18n.getText({messageId:"fail_tile_operation_remove_from_several_groups",parameters:[t]});}else{m=sap.ushell.resources.i18n.getText({messageId:"fail_tile_operation_some_actions"});}}return m;},prepareDetailedMessage:function(t,n,a,f,b){var m;if(n==0){if(a==1){m=sap.ushell.resources.i18n.getText("tileRemovedFromSingleGroup",[t,b]);}else if(a>1){m=sap.ushell.resources.i18n.getText("tileRemovedFromSeveralGroups",[t,a]);}}else if(n==1){if(a==0){m=sap.ushell.resources.i18n.getText("tileAddedToSingleGroup",[t,f]);}else if(a==1){m=sap.ushell.resources.i18n.getText("tileAddedToSingleGroupAndRemovedFromSingleGroup",[t,f,b]);}else if(a>1){m=sap.ushell.resources.i18n.getText("tileAddedToSingleGroupAndRemovedFromSeveralGroups",[t,f,a]);}}else if(n>1){if(a==0){m=sap.ushell.resources.i18n.getText("tileAddedToSeveralGroups",[t,n]);}else if(a==1){m=sap.ushell.resources.i18n.getText("tileAddedToSeveralGroupsAndRemovedFromSingleGroup",[t,n,b]);}else if(a>1){m=sap.ushell.resources.i18n.getText("tileAddedToSeveralGroupsAndRemovedFromSeveralGroups",[t,n,a]);}}return m;},getCatalogTileDataFromModel:function(s){var b=s.getPath(),m=s.getModel(),t=m.getProperty(b);return{tileData:t,bindingContextPath:b,isBeingProcessed:t.isBeingProcessed?true:false};},_addTile:function(t,g){var d=sap.ushell.components.flp.launchpad.getDashboardManager(),a=jQuery.Deferred(),p=d.createTile({catalogTileContext:t,groupContext:g});p.done(function(b){a.resolve(b);});return a;},_removeTile:function(t,i){var d=sap.ushell.components.flp.launchpad.getDashboardManager(),a=jQuery.Deferred(),p=d.deleteCatalogTileFromGroup({tileId:t,groupIndex:i});p.done(function(b){a.resolve(b);});return a;},_createGroupAndSaveTile:function(t,n){var d=sap.ushell.components.flp.launchpad.getDashboardManager(),a=jQuery.Deferred(),p=d.createGroupAndSaveTile({catalogTileContext:t,newGroupName:n});p.done(function(b){a.resolve(b);});return a;},onExit:function(){sap.ui.getCore().getEventBus().unsubscribe("launchpad","appFinderWithDocking",this._handleAppFinderWithDocking,this);}});},false);
