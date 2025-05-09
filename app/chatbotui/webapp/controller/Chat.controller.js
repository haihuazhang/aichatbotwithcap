sap.ui.define([
    "./BaseController",
    "../util/Helper",
    "../service/ChatService",
    "../service/NewMessageHandler",
    "../util/UIHelper",
    "sap/ushell/Container"
], function (BaseController, Helper, ChatService, NewMessageHandler, UIHelper, Container) {
    "use strict";

    return BaseController.extend("chatbotui.controller.Chat", {
        /**
         * Called when the controller is instantiated.
         */
        onInit: function () {
            this.getRouter().getRoute("chat").attachPatternMatched(this.onRouteMatched, this);
        },

        onAfterRendering: function () {
            this.addKeyboardEventsToInput();
            this.getView().byId("messageListWithStream").addEventDelegate({
                onAfterRendering: function () {
                    // UIHelper.scrollToElement(this.getView().byId("listEndMarkerWithStream").getDomRef(), 100);
                    this.scrollToListEnd();
                }.bind(this)
            });
        },

        onRouteMatched: function (event) {
            const chat = event.getParameter("arguments").chat;
            this.getView().bindElement({
                path: `/Chats(${chat})`
            });
            // Load messages when route matched
            this.loadMessages();

        },
        loadMessages: function () {
            // Get messages from backend
            const chat = this.getView().getBindingContext();
            const binding = this.getModel().bindList(`messages`, chat, new sap.ui.model.Sorter("chatTime", true), null,{
                $select : ["ID","role","content","chatTime"]
            });


            binding.requestContexts().then((contexts) => {
                // const messages = contexts.map(context => context.getObject());
                const messages = contexts.map(context => {
                    return {    
                        ...context.getObject(),
                        chatTime: new Date(context.getObject().chatTime)
                    }
                });
                const localModel = this.getView().getModel("local");
                localModel.setProperty("/messages", messages);
            });
        },

        onStreamingEnabledChange: function (event) {
            ChatService.getInstance().submitChanges();
            const toast = this.getView().byId("steamingEnabledToast");
            toast.setText(`Streaming ${event.getParameter("state") ? "enabled" : "disabled"} for chat.`);
            toast.show();
        },

        onDeleteChat: function () {
            Helper.withConfirmation("Delete Chat", "Are you sure you want to delete this chat?", function () {
                ChatService.getInstance().deleteEntity(this.getView().getBindingContext())
                    .then(function () {
                        this.getRouter().navTo("home");
                    }.bind(this))
                    .catch(function (error) {
                        console.error("Error deleting chat:", error);
                    });
            }.bind(this));
        },

        onPostMessage: function (event) {
            
            const messageList = this.getView().byId("messageListWithStream");
            const feedInput = this.getView().byId("newMessageInput");
            const message = event.getParameter("value");
            const chat = this.getView().getBindingContext();
            const binding = this.getView().byId("messageListWithStream").getBinding("items");

            feedInput.setEnabled(false);

            const messageHandler = new NewMessageHandler({
                chat: chat,
                binding: binding,
                message: message,
                sender: this.getModel("user").getUser().displayName,
                onCreatedEmptyAssistantMessage: function (replyContext) {
                    // 设置Busy状态                        
                    const messageListItem = messageList.getItems().find(item =>
                        item.getBindingContext() === replyContext
                    );
                    if (messageListItem) {
                        messageListItem.setLoading(true);
                    }
                    this.scrollToListEnd();
                }.bind(this),
                streamingCallback: function (chunk, replyContext) {
                    if (!chunk) return;

                    // replyContext.setProperty("content", `${replyContext.getProperty("content")}${chunk}`);
                    replyContext.setProperty("content", chunk);

                    const messageListItem = messageList.getItems().find(item =>
                        item.getBindingContext() === replyContext
                    );
                    if (messageListItem) {
                        messageListItem.setLoading(false);
                        messageListItem.invalidate();
                    }

                    // const listEndMarker = this._dialogWithStream.getContent()[0].getContent()[0].getItems()[1];
                    // UIHelper.scrollToElement(listEndMarker.getDomRef());
                    this.scrollToListEnd();
                }.bind(this),
                onComplete: function () {
                    // 对话完成后恢复状态
                    this._isProcessing = false;
                    feedInput.setEnabled(true);
                    feedInput.setValue("");
                }.bind(this)
            });

            // messageHandler.createMessageAndCompletion();
            messageHandler.createMessageAndCompletion(true,
                sap.ui.require.toUrl(`${this.getOwnerComponent().getManifest()["sap.app"].id}/api/chat/completion/streaming`)
            );
            // .then(function () {
            //     console.log("Message posted successfully");
            // })
            // .catch(function (error) {
            //     console.error("Error posting message:", error);
            // });
        },

        addKeyboardEventsToInput: function () {
            const input = this.getView().byId("newMessageInput");
            input.attachBrowserEvent("keydown", function (event) {
                if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && input.getValue().trim() !== "") {
                    input.fireEvent("post", { value: input.getValue() });
                    input.setValue(null);
                    event.preventDefault();
                }
            });
        },
        scrollToListEnd: function () {
            // if (!this._dialogWithStream) {
            //     return;
            // }

            const listEndMarker = this.getView().byId("listEndMarkerWithStream");
            if (listEndMarker && listEndMarker.getDomRef()) {
                UIHelper.scrollToElement(listEndMarker.getDomRef());
            } else {
                // 如果元素还没有渲染完成，延迟执行
                setTimeout(() => this.scrollToListEnd(), 100);
            }
        }
    });
});
