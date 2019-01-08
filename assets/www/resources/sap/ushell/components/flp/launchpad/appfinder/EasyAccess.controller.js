// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(function(){"use strict";sap.ui.controller("sap.ushell.components.flp.launchpad.appfinder.EasyAccess",{DEFAULT_URL:"/sap/opu/odata/UI2",DEFAULT_NUMBER_OF_LEVELS:3,SEARCH_RESULTS_PER_REQUEST:100,onInit:function(){var t=this;this.translationBundle=sap.ushell.resources.i18n;this.oView=this.getView();var e=this.oView.getModel("easyAccessSystemsModel");var s=e.bindProperty("/systemSelected");s.attachChange(t.adjustUiOnSystemChange.bind(this));this.menuName=this.oView.getViewData().menuName;this.systemId=null;this.easyAccessCache={};this.easyAccessModel=new sap.ui.model.json.JSONModel();this.oView.hierarchyFolders.setModel(this.easyAccessModel,"easyAccess");this.oView.hierarchyApps.setModel(this.easyAccessModel,"easyAccess");var S=this.oView.getModel("subHeaderModel");var T=S.bindProperty("/openCloseSplitAppButtonToggled");T.attachChange(t.handleToggleButtonModelChanged.bind(this));if(this.oView.getViewData().enableSearch){var o=S.bindProperty("/search");o.attachChange(t.handleSearchModelChanged.bind(this));}this.checkIfSystemSelectedAndLoadData();},onAfterRendering:function(){setTimeout(function(){this.oView.hierarchyApps.getController()._updateAppBoxedWithPinStatuses();}.bind(this),0);},checkIfSystemSelectedAndLoadData:function(){var s=this.oView.getModel("easyAccessSystemsModel").getProperty("/systemSelected");if(s){this.systemId=s.systemId;this.loadMenuItemsFirstTime(this.oView.getViewData().menuName,s);}},navigateHierarchy:function(p,f){this.oView.hierarchyFolders.setBusy(false);var e=this.easyAccessModel.getProperty(p?p:"/");if(typeof e.folders!="undefined"){this.oView.hierarchyFolders.updatePageBindings(p,f);this.oView.hierarchyApps.getController().updatePageBindings(p);return;}this.oView.hierarchyFolders.setBusy(true);this.getMenuItems(this.menuName,this.systemId,e.id,e.level).then(function(p,r){this.easyAccessModel.setProperty(p+"/folders",r.folders);this.easyAccessModel.setProperty(p+"/apps",r.apps);this.oView.hierarchyFolders.updatePageBindings(p,f);this.oView.hierarchyApps.getController().updatePageBindings(p);this.oView.hierarchyFolders.setBusy(false);}.bind(this,p),function(a){this.handleGetMenuItemsError(a);}.bind(this));},handleSearch:function(s){var i=!this.hierarchyAppsSearchResults;if(i){this.hierarchyAppsSearchResults=new sap.ui.view(this.getView().getId()+"hierarchyAppsSearchResults",{type:sap.ui.core.mvc.ViewType.JS,viewName:"sap.ushell.components.flp.launchpad.appfinder.HierarchyApps",height:"100%",viewData:{easyAccessSystemsModel:this.oView.getModel("easyAccessSystemsModel"),getMoreSearchResults:this.getMoreSearchResults.bind(this)}});this.easyAccessSearchResultsModel=new sap.ui.model.json.JSONModel();this.easyAccessSearchResultsModel.setSizeLimit(10000);this.hierarchyAppsSearchResults.setModel(this.easyAccessSearchResultsModel,"easyAccess");this.hierarchyAppsSearchResults.setBusyIndicatorDelay(this.getView().BUSY_INDICATOR_DELAY);this.hierarchyAppsSearchResults.addStyleClass(" sapUshellAppsView sapMShellGlobalInnerBackground");this.hierarchyAppsSearchResults.addCustomData(new sap.ushell.ui.launchpad.AccessibilityCustomData({key:"role",value:"region",writeToDom:true}));this.hierarchyAppsSearchResults.addCustomData(new sap.ushell.ui.launchpad.AccessibilityCustomData({key:"aria-label",value:this.oView.oResourceBundle.getText("easyAccessTileContainer"),writeToDom:true}));}this.searchResultFrom=0;this.oView.splitApp.getCurrentDetailPage().setBusy(true);this.easyAccessSearchResultsModel.setProperty("/apps",[]);this.easyAccessSearchResultsModel.setProperty("/total",0);this._getSearchResults(s,this.searchResultFrom).then(function(r){this.easyAccessSearchResultsModel.setProperty("/apps",r.results);this.easyAccessSearchResultsModel.setProperty("/total",r.count);this.searchResultFrom=r.results.length;if(i){this.oView.splitApp.addDetailPage(this.hierarchyAppsSearchResults);}this.hierarchyAppsSearchResults.updateResultSetMessage(parseInt(r.count,10),true);this.oView.splitApp.getCurrentDetailPage().setBusy(false);if(this.oView.splitApp.getCurrentDetailPage()!==this.hierarchyAppsSearchResults){this.oView.splitApp.toDetail(this.getView().getId()+"hierarchyAppsSearchResults");}}.bind(this),function(e){this.handleGetMenuItemsError(e);this.oView.splitApp.getCurrentDetailPage().setBusy(false);}.bind(this));},getMoreSearchResults:function(){if(this.oView.splitApp.getCurrentDetailPage().setShowMoreResultsBusy){this.oView.splitApp.getCurrentDetailPage().setShowMoreResultsBusy(true)}var s=this.oView.getModel("subHeaderModel");var S=s.getProperty("/search/searchTerm");this._getSearchResults(S,this.searchResultFrom).then(function(r){var c=this.easyAccessSearchResultsModel.getProperty("/apps");var n=c.slice();Array.prototype.push.apply(n,r.results);this.easyAccessSearchResultsModel.setProperty("/apps",n);if(this.oView.splitApp.getCurrentDetailPage().setShowMoreResultsBusy){this.oView.splitApp.getCurrentDetailPage().setShowMoreResultsBusy(false)}this.searchResultFrom=n.length;}.bind(this),function(e){this.handleGetMenuItemsError(e);if(this.oView.splitApp.getCurrentDetailPage().setShowMoreResultsBusy){this.oView.splitApp.getCurrentDetailPage().setShowMoreResultsBusy(true)}}.bind(this));},_getSearchResults:function(s,f){var d=new jQuery.Deferred();var S=this._getODataRequestForSearchUrl(this.menuName,this.systemId,s,f);var r={requestUri:S};var c=this._callODataService(r,this.handleSuccessOnReadFilterResults);c.done(function(a){d.resolve(a);});c.fail(function(e){d.reject(e);});return d.promise();},getSystemNameOrId:function(){var s=this.oView.getModel("easyAccessSystemsModel").getProperty("/systemSelected");if(s){return s.name||s.id;}return;},adjustUiOnSystemChange:function(){var c=this.easyAccessModel.getData();if(this.systemId&&c&&c.id){this.easyAccessCache[this.systemId]=c;}var s=this.oView.getModel("easyAccessSystemsModel").getProperty("/systemSelected");if(s){this.systemId=s.systemId;var n=this.easyAccessCache[this.systemId];if(n){this.easyAccessModel.setData(n);this.navigateHierarchy("",false);}else{this.oView.hierarchyFolders.setBusy(true);this.oView.hierarchyApps.setBusy(true);this.loadMenuItemsFirstTime(this.menuName,s);}}},handleToggleButtonModelChanged:function(){var s=this.oView.getModel("subHeaderModel");var b=s.getProperty("/openCloseSplitAppButtonVisible");var B=s.getProperty("/openCloseSplitAppButtonToggled");var S=this.getView().splitApp;if(b){if(B&&!S.isMasterShown()){S.showMaster();}else if(S.isMasterShown()){S.hideMaster();}}},handleSearchModelChanged:function(){var s=this.oView.getModel("subHeaderModel");var a=s.getProperty("/activeMenu");if(this.getView().getId().indexOf(a)===-1){return;}var S=s.getProperty("/search/searchTerm");var b=s.getProperty("/search/searchMode");if(b){sap.ui.getCore().byId('appFinderSearch').getCustomData()[0].setValue(this.getView().getId()+"hierarchyAppsSearchResults");if(S){this.handleSearch(S);}}else{sap.ui.getCore().byId('appFinderSearch').getCustomData()[0].setValue('');this.oView.splitApp.toDetail(this.getView().getId()+"hierarchyApps");}},loadMenuItemsFirstTime:function(m,s){return this.getMenuItems(m,s.systemId,"",0).then(function(r){r.text=s.systemName||s.systemId;this.easyAccessModel.setData(r);this.oView.hierarchyFolders.setBusy(false);this.oView.hierarchyApps.setBusy(false);this.navigateHierarchy("",false);}.bind(this),function(e){this.handleGetMenuItemsError(e);this.oView.hierarchyFolders.updatePageBindings("/",false);this.oView.hierarchyApps.getController().updatePageBindings("/");}.bind(this));},handleGetMenuItemsError:function(e){var E=this.getErrorMessage(e);sap.ui.require(["sap/m/MessageBox"],function(M){M.error(E);});this.easyAccessModel.setData("");this.oView.hierarchyFolders.setBusy(false);this.oView.hierarchyApps.setBusy(false);},getErrorMessage:function(e){var m="";if(this.menuName=="SAP_MENU"){m=this.translationBundle.getText("easyAccessSapMenuNameParameter");}else if(this.menuName=="USER_MENU"){m=this.translationBundle.getText("easyAccessUserMenuNameParameter");}if(e){if(e.message){return this.translationBundle.getText("easyAccessErrorGetDataErrorMsg",[m,e.message]);}else{return this.translationBundle.getText("easyAccessErrorGetDataErrorMsg",[m,e]);}}else{return this.translationBundle.getText("easyAccessErrorGetDataErrorMsgNoReason",m);}},getMenuItems:function(m,s,e,a,n){var d=new jQuery.Deferred();if(m!="SAP_MENU"&&m!="USER_MENU"){d.reject("Invalid menuType parameter");return d.promise();}if(typeof s!=="string"||s===""){d.reject("Invalid systemId parameter");return d.promise();}if(typeof e!=="string"){d.reject("Invalid entityId parameter");return d.promise();}if(typeof a!=="number"){d.reject("Invalid entityLevel parameter");return d.promise();}if(n&&typeof n!=="number"){d.reject("Invalid numberOfNextLevels parameter");return d.promise();}if(e==""){a=0;}var N;var M=this.getView().getModel();var c=M.getProperty("/easyAccessNumbersOfLevels");if(c){N=c;}else if(n){N=n;}else{N=this.DEFAULT_NUMBER_OF_LEVELS;}var l=a+N+1;var S=this._getODataRequestUrl(m,s,e,l);var r={requestUri:S};var C=this._callODataService(r,this.handleSuccessOnReadMenuItems,{systemId:s,entityId:e,iLevelFilter:l});C.done(function(b){d.resolve(b);});C.fail(function(b){d.reject(b);});return d.promise();},_callODataService:function(r,s,S){var t=this;var d=new jQuery.Deferred();if(!S){S={};}sap.ui.require(["sap/ui/thirdparty/datajs"],function(){OData.read(r,function(R,o){if(R&&R.results&&o&&o.statusCode===200){var a=s.bind(t,R,S)();d.resolve(a);}},function(m){d.reject(m);});});return d.promise();},handleSuccessOnReadMenuItems:function(r,p){var R=this._oDataResultFormatter(r.results,p.systemId,p.entityId,p.iLevelFilter);return R;},handleSuccessOnReadFilterResults:function(r){var u;r.results.forEach(function(R,i){u=this._appendSystemToUrl(R,this.systemId);R.url=u}.bind(this));return{results:r.results,count:r.__count}},_appendSystemToUrl:function(d,s){if(d.url){return d.url+(d.url.indexOf('?')>0?'&':'?')+'sap-system='+s;}},_oDataResultFormatter:function(r,s,e,l){var f={};var R={};if(e==""){R={id:"root",text:"root",level:0,folders:[],apps:[]};f.root=R;}else{R={id:e,folders:[],apps:[]};f[e]=R;}var o;for(var i=0;i<r.length;i++){o=r[i];var p;if(o.level=="01"){p=f["root"];}else{p=f[o.parentId];}var m={id:o.Id,text:o.text,subtitle:o.subtitle,icon:o.icon,level:parseInt(o.level,10)};if(o.type=='FL'){m.folders=[];m.apps=[];if(o.level==l-1){m.folders=undefined;m.apps=undefined;}if(p&&p.folders){p.folders.push(m);}f[o.Id]=m;}else{m.url=this._appendSystemToUrl(o,s);if(p&&p.apps){p.apps.push(m);}}}return R;},_getODataRequestUrl:function(m,s,e,l){var S=this._getServiceUrl(m);var L;if(l<10){L="0"+l;}else{L=l.toString();}var a="";if(e){if(decodeURIComponent(e)===e){e=encodeURIComponent(e);}a="('"+e+"')/AllChildren";}S=S+";o="+s+"/MenuItems"+a+"?$filter=level lt '"+L+"'&$orderby=level,text";return S;},_getODataRequestForSearchUrl:function(m,s,t,f){var S=this._getServiceUrl(m);var n=this.SEARCH_RESULTS_PER_REQUEST;var t=this._removeWildCards(t);var f=!f?0:f;S=S+";o="+s+"/MenuItems"+"?$filter=type ne 'FL' and substringof('"+t+"', text) or substringof('"+t+"', subtitle) or substringof('"+t+"', url)&$orderby=text,subtitle,url&$inlinecount=allpages&$skip="+f+"&$top="+n;return S;},_getServiceUrl:function(m){var s;var M=this.getView().getModel();if(m=="SAP_MENU"){var S=M.getProperty("/sapMenuServiceUrl");if(S){s=S;}else{s=this.DEFAULT_URL+"/EASY_ACCESS_MENU";}}else if(m=="USER_MENU"){var u=M.getProperty("/userMenuServiceUrl");if(u){s=u;}else{s=this.DEFAULT_URL+"/USER_MENU";}}return s;},_removeWildCards:function(t){return t.replace(/\*/g,"");}});},false);
