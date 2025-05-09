sap.ui.define([
    "sap/f/library",
    "sap/ui/model/json/JSONModel"
], function (library, JSONModel) {
    "use strict";

    // 定义LayoutData对应的对象结构（JavaScript中没有接口概念，用普通对象模拟）
    const LayoutData = {
        currentLayout: null,
        isFullScreen: false,
        oldLayout: null
    };
    return JSONModel.extend("chatbotui.model.LayoutModel", {

        setData: function (data, merge) {
            JSONModel.prototype.setData.call(this, data, merge);
        },

        // 重写getData方法
        getData: function () {
            return JSONModel.prototype.getData.call(this);
        },

        // 设置布局的方法
        setLayout: function (layout) {
            this.setData({
                currentLayout: layout,
                oldLayout: this.getLayout(),
                isFullScreen: layout === library.LayoutType.MidColumnFullScreen || layout === library.LayoutType.EndColumnFullScreen
            });
        },

        // 获取当前布局的方法
        getLayout: function () {
            return this.getProperty("/currentLayout");
        },

        // 设置中间列全屏的方法
        setMidColumnFullScreen: function () {
            this.setLayout(library.LayoutType.MidColumnFullScreen);
        },

        // 设置末尾列全屏的方法
        setEndColumnFullScreen: function () {
            this.setLayout(library.LayoutType.EndColumnFullScreen);
        },

        // 退出全屏的方法
        exitFullScreen: function () {
            this.setLayout(this.getProperty("/oldLayout"));
        }
    });

});