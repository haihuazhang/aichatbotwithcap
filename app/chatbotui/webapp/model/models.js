sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/BindingMode",
    "sap/ui/Device",
    "sap/f/library",
    "./UserModel",
    "./LayoutModel"
], function (JSONModel, BindingMode, Device, library, UserModel, LayoutModel) {
    "use strict";

    return {
        createDeviceModel: function () {
            // 创建JSONModel实例并传入Device对象
            var model = new JSONModel(Device);
            // 设置默认绑定模式为单向绑定
            model.setDefaultBindingMode(BindingMode.OneWay);
            return model;
        },

        createAppModel: function () {
            var model = new JSONModel({
                layout: library.LayoutType.TwoColumnsMidExpanded
            });
            model.setDefaultBindingMode(BindingMode.OneWay);
            return model;
        },

        createUserModel: function () {
            var userModel = new UserModel();
            // 假设UserModel有initialize方法并且返回一个Promise（需根据实际情况调整）
            return userModel.initialize().then(function () {
                return userModel;
            });
        },

        createLayoutModel: function () {
            var layoutModel = new LayoutModel();
            layoutModel.setData({
                currentLayout: library.LayoutType.TwoColumnsMidExpanded,
                isFullScreen: false
            });
            return layoutModel;
        }
    };
});