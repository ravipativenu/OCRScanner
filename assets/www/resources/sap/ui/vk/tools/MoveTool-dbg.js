/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.MoveTool
sap.ui.define([
	"jquery.sap.global", "./library", "./Tool", "./MoveToolHandler", "./MoveToolGizmo"
], function(jQuery, library, Tool, MoveToolHandler, MoveToolGizmo) {
	"use strict";

	/**
	 * Constructor for a new MoveTool.
	 *
	 * @class
	 * Specifies a resource to load.

	 * @param {string} [sId] ID of the new content resource. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new tool instance.
	 * @param {object} [oScope] scope An object for resolving string-based type and formatter references in bindings.
	 * @public
	 * @author SAP SE
	 * @version 1.52.8
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.tools.MoveTool
	 * @experimental Since 1.50.0 This class is experimental and might be modified or removed in future versions.
	 */
	var MoveTool = Tool.extend("sap.ui.vk.tools.MoveTool", /** @lends sap.ui.vk.tools.MoveTool.prototype */ {
		metadata: {
			properties: {
				coordinateSystem: {
					type: "sap.ui.vk.tools.CoordinateSystem",
					defaultValue: sap.ui.vk.tools.CoordinateSystem.Local
				}
			},
			publicMethods: [
				"getDefaultButton",
				"getViewport",
				"move"
			],
			events: {
                /**
				 * This event will be fired when movement occurs.
				 */
				moving: {
					parameters: {
						x: "float",
						y: "float",
						z: "float"
					}
				},
				moved: {
					parameters: {
						x: "float",
						y: "float",
						z: "float"
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			Tool.apply(this, arguments);

			// Configure dependencies
			this._viewport = null;
			this._handler = null;
			this._gizmo = null;
		}
	});

	MoveTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}

		// set footprint for tool
		this.setFootprint([ "sap.ui.vk.threejs.Viewport" ]);

		// this.setSupportedContentResourceSourceCategories([ContentResourceSourceCategory.3D]);
		this.setAggregation("gizmo", new MoveToolGizmo());
	};

	// Checks if the current viewport is of a specified type
	MoveTool.prototype.isViewportType = function(typeString) {
		if (this._viewport && this._viewport.getMetadata().getName() === typeString) {
			return true;
		}
		return false;
	};

	// Override the active property setter so that we execute activation / deactivation code at the same time
	MoveTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		if (Tool.prototype.setActive) {
			Tool.prototype.setActive.call(this, value, activeViewport, gizmoContainer);
		}

		if (value) {
			this._activateTool(activeViewport);
		} else {
			this._deactivateTool();
		}

		if (activeViewport) {
			activeViewport.setShouldRenderFrame();
		}

		return this;
	};

	MoveTool.prototype._activateTool = function(activeViewport) {
		this._viewport = activeViewport;
		this._handler = new MoveToolHandler(this);
		this._gizmo = this.getGizmo();
		if (this._gizmo) {
			this._gizmo.show(activeViewport, this);
		}

		// Prepare the tool to execute
		this._prepare();
	};

	MoveTool.prototype._deactivateTool = function() {
		// Remove tool handler from loco stack for viewport so that the tool no longer handles input from user
		if (this._handler) {
			if (this._viewport._loco) {
				this._viewport._loco.removeHandler(this._handler);
			}
			this._handler = null;
		}

		if (this._gizmo) {
			this._gizmo.hide();
			this._gizmo = null;
		}
	};

    /*
    * Checks that the execution criteria for this tool are met before execution of tool commands
    */
	MoveTool.prototype._prepare = function() {
		var okToExec = false;

		if (this._viewport._loco) {
			// Add tool handler to loco stack for viewport so that the tool can handler input from user
			this._viewport._loco.addHandler(this._handler);
			okToExec = true;
		}

		return okToExec;
	};

    /** MOVE TO BASE
	 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
	 *
	 * @param {function} command The command to be executed.
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	MoveTool.prototype.queueCommand = function(command) {
		if (this._prepare()) {

			if (this.isViewportType("sap.ui.vk.threejs.Viewport")) {
				command();
			}
		}
		return this;
	};

	MoveTool.prototype.destroy = function() {
		// Destroy tool resources
		Tool.prototype.destroy.call(this);

		this._viewport = null;
		this._handler = null;
	};

	MoveTool.prototype.getViewport = function() {
		return this._viewport;
	};

	MoveTool.prototype.getCoordinateSystem = function() {
		return this.getGizmo().getCoordinateSystem();
	};

	MoveTool.prototype.setCoordinateSystem = function(value) {
		this.getGizmo().setCoordinateSystem(value);
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	MoveTool.prototype.move = function(value) {
		if (this._gizmo) {
			this._gizmo.move(value);
		}
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	return MoveTool;
});
