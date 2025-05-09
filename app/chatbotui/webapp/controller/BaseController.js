sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/routing/History",
		"sap/ui/core/UIComponent",
		"../formatter/ChatFormatter",
		"sap/ui/core/Message",
		"sap/m/MessageBox",
		// "BC/commonvaluehelp/controllers/CommonVHController"
	],
	function (Controller, History, UIComponent, formatter, Message, MessageBox) {
		"use strict";

		var BaseController = Controller.extend("chatbotui.controller.BaseController", {
			// return Controller.extend("SD.salesdiffprocess.controller.BaseController", {
			formatter: formatter,

			/**
			 * Convenience method for getting the view model by name in every controller of the application.
			 * @public
			 * @param {string} sName the model name
			 * @returns {sap.ui.model.Model} the model instance
			 */
			getModel: function (sName) {
				return this.getView().getModel(sName);
			},

			/**
			 * Convenience method for setting the view model in every controller of the application.
			 * @public
			 * @param {sap.ui.model.Model} oModel the model instance
			 * @param {string} sName the model name
			 * @returns {sap.ui.mvc.View} the view instance
			 */
			setModel: function (oModel, sName) {
				return this.getView().setModel(oModel, sName);
			},

			/**
			 * Convenience method for getting the resource bundle.
			 * @public
			 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
			 */
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},

			/**
			 * Method for navigation to specific view
			 * @public
			 * @param {string} psTarget Parameter containing the string for the target navigation
			 * @param {mapping} pmParameters? Parameters for navigation
			 * @param {boolean} pbReplace? Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
			 */
			navTo: function (psTarget, pmParameters, pbReplace) {
				this.getRouter().navTo(psTarget, pmParameters, pbReplace);
			},

			getRouter: function () {
				return UIComponent.getRouterFor(this);
			},

			onNavBack: function () {
				var sPreviousHash = History.getInstance().getPreviousHash();

				if (sPreviousHash !== undefined) {
					window.history.back();
				} else {
					this.getRouter().navTo("appHome", {}, true /*no history*/ );
				}
			},
			addMessagesToMessageManager: function (sMessage, sType) {
				// 新規MessageをMessageManagerに登録
				var oMessage = new Message({
					id: this.getUuid(),
					message: sMessage,
					type: sType,
				});
				sap.ui.getCore().getMessageManager().addMessages(oMessage);
			},
			/**
			 * get uuid
			 * @param {*} len
			 * @param {*} radix
			 */
			getUuid: function (len, radix) {
				var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(
					""
				);
				var uuid = [],
					i;
				radix = radix || chars.length;
				if (len) {
					// Compact form
					for (i = 0; i < len; i++)
						uuid[i] = chars[0 | (Math.random() * radix)];
				} else {
					// rfc4122, version 4 form
					var r;
					// rfc4122 requires these characters
					uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
					uuid[14] = "4";
					// Fill in random data.  At i==19 set the high bits of clock sequence as
					// per rfc4122, sec. 4.1.5
					for (i = 0; i < 36; i++) {
						if (!uuid[i]) {
							r = 0 | (Math.random() * 16);
							uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
						}
					}
				}
				return uuid.join("");
			},
			initBase: function () {
				var oMessageManager = sap.ui.getCore().getMessageManager();
				this.getView().setModel(oMessageManager.getMessageModel(), "message");
				oMessageManager.registerObject(this.getView(), true);
			},

			setBusy: function (isBusy) {
				this.getModel("localModel").setProperty("/busy", isBusy);
			},

			/**
			 * 確認Dialogの表示
			 * @param {String} sTitle - タイトル
			 * @param {String} sMessage - メッセージ
			 * @param {String} fnYes - YES押下時処理
			 */
			showConfirm: function (sTitle, sMessage, fnYes) {
				// MessageBoxを作成
				MessageBox.show(sMessage, {
					icon: MessageBox.Icon.QUESTION,
					title: sTitle,
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					onClose: function (sButton) {
						// Yesボタン押下時にCallBackを実行
						if (sButton === MessageBox.Action.YES) {
							fnYes(this);
						}
					}.bind(this)
				});
			},

			/**
			 * 完了Dialogの表示
			 * @param {String} sTitle - タイトル
			 * @param {String} sMessage - メッセージ
			 * @param {String} fnOk - OK押下時処理
			 */
			showComplete: function (sTitle, sMessage, fnOk) {
				// MessageBoxを作成
				MessageBox.show(sMessage, {
					icon: MessageBox.Icon.INFORMATION,
					title: sTitle,
					actions: MessageBox.Action.OK,
					onClose: function (sButton) {
						// OKボタン押下時にCallBackを実行
						if (sButton === MessageBox.Action.OK) {
							fnOk(this);
						}
					}.bind(this)
				});
			},

			/**
			 * エラーDialogの表示
			 * @param {String} sTitle - タイトル
			 * @param {String} sMessage - メッセージ
			 * @param {String} fnOk - OK押下時処理
			 */
			showError: function (sTitle, sMessage, fnOk) {
				if (typeof fnOk === "undefined") {
					// MessageBoxを作成(OK押下時処理の指定なし)
					MessageBox.error(
						sMessage, {
							title: sTitle,
							actions: MessageBox.Action.OK
						}
					);

				} else {
					// MessageBoxを作成(OK押下時処理の指定あり)
					MessageBox.error(
						sMessage, {
							title: sTitle,
							actions: MessageBox.Action.OK,
							onClose: function (sButton) {
								// OKボタン押下時にCallBackを実行
								if (sButton === MessageBox.Action.OK) {
									fnOk(this);
								}
							}.bind(this)
						}
					);
				}
			}
		});
		// jQuery.extend(SD.salesdiffprocess.controller.BaseController.prototype, new CommonVHController());
		return BaseController;
	}
);