sap.ui.define([
    "./BaseController",
    "sap/ui/model/odata/v4/ODataListBinding",
    "sap/ui/base/Event",
    "sap/m/ListItemBase",
    "sap/ushell/Container",
    "../service/ChatService"
], function (BaseController, ODataListBinding, UI5Event, ListItemBase, Container, ChatService) {
    "use strict";

    return BaseController.extend("chatbotui.controller.Chats", {

        /**
         * Called when the controller is instantiated.
         */
        onInit: function () {
            this.getRouter().getRoute("home").attachPatternMatched(this.onRouteMatched, this);

            // Subscribe to the event bus for title updates
            var oBus = this.getOwnerComponent().getEventBus();
            oBus.subscribe("ChatsChannel", "TitleUpdated", this._onRefreshContextByID, this);
        },

        onRouteMatched: function (event) {
            this.getView().byId("chatList").getBinding("items").refresh();




        },

        _onRefreshContextByID: function (channel, event, data) {
            var oList = this.getView().byId("chatList");
            var oBinding = oList.getBinding("items");
            
            // Get all contexts
            var aContexts = oBinding.getCurrentContexts();
            
            // Find the context with matching ID
            var targetContext = aContexts.find(function(context) {
                return context.getObject().ID === data.ID;
            });
            
            if (targetContext) {
                // Refresh the specific context
                targetContext.refresh();
                
                // // Get the index of the context
                // var iIndex = aContexts.indexOf(targetContext);
                
                // // Refresh the corresponding list item
                // var aItems = oList.getItems();
                // if (aItems[iIndex]) {
                //     aItems[iIndex].invalidate();
                // }
            } else {
                // If context not found, refresh the entire binding
                oBinding.refresh();
            }
        },

        onChatPress: function (event) {
            var item = event.getParameter("listItem");
            this.getRouter().navTo("chat", {
                chat: item.getBindingContext().getProperty("ID")
            });
        },

        onAddChat: function (event) {
            var binding = this.getView().byId("chatList").getBinding("items");
            // var context = binding.create({
            //     model: "gpt-3.5-turbo"
            // });
            // var binding2 = this.getModel().bindContext("/newChat(...)");
            // binding2.invoke(undefined, null, null, true).then(() => {
            //     // binding.binding2.getBoundContext()
            //     // binding.refresh();
            //     this.getRouter().navTo("chat", {
            //         chat: binding2.getBoundContext().getObject().ID
            //     });
            // });
            event.getSource().setBusy(true);
            ChatService.getInstance().createEntity({
                binding: binding,
                entity: {
                },
                atEnd: false,
                submitBatch: true
            }).then((createdUserContext) => {
                this.getRouter().navTo("chat", {
                    chat: createdUserContext.getObject().ID
                });
            }).finally(() => {
                event.getSource().setBusy(false);
            });

        }
    });
});
