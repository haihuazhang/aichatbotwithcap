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
        },

        onRouteMatched: function (event) {
            this.getView().byId("chatList").getBinding("items").refresh();
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
