/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "./model/models",
    "./service/ChatService",
    "./util/IconFonts",
    "./util/LayoutManager"
],
    function (UIComponent, models, ChatService, IconFonts, LayoutManager) {
        "use strict";

        return UIComponent.extend("chatbotui.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);
                // set device model
                this.setModel(models.createDeviceModel(), "device");
                this.setModel(models.createAppModel(), "app");

                models.createUserModel().then(function (userModel) {
                    this.setModel(userModel, "user");
                }.bind(this));

                const layoutModel = models.createLayoutModel();
                this.setModel(layoutModel, "appLayout");
                LayoutManager.getInstance().setModel(layoutModel);

                ChatService.getInstance().setModel(this.getModel());

                IconFonts.register();
                // enable routing
                this.getRouter().initialize();


            }
        });
    }
);