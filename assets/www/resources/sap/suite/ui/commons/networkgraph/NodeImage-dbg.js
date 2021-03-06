sap.ui.define([
	"sap/ui/core/Element"
], function (Element) {

	/**
	 * Constructor for a new Node Image.
	 *
	 * @class
	 * Holds information about node image.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @constructor
	 * @since 1.50
	 * @public
	 * @alias sap.suite.ui.commons.networkgraph.NodeImage
	 */
	var NodeImage = Element.extend("sap.suite.ui.commons.networkgraph.NodeImage", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * Relative or absolute path to the image file.
				 */
				src: {
					type: "string", group: "Appearance", defaultValue: null
				},
				/**
				 * Width of the image.
				 */
				width: {
					type: "int", group: "Appearance", defaultValue: null
				},
				/**
				 * Height of the image.
				 */
				height: {
					type: "int", group: "Appearance", defaultValue: null
				}
			}
		}
	});

	return NodeImage;
});
