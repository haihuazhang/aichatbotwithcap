// import ResponsiveColumnItemLayoutData from "sap/ui/layout/cssgrid/ResponsiveColumnItemLayoutData";

sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
    "use strict";

    // 定义一个普通对象来模拟IUser接口（JavaScript中没有类型定义接口概念）
    const IUser = {
        displayName: "",
        // 若需要可在这里扩展其他参数
    };
    return JSONModel.extend("chatbotui.model.UserModel", {
        initialize: function () {
            // const res = await fetch(sap.ui.require.toUrl("chatbotui2/user-api/currentUser"));
            // if (res.ok) {
            //     // 解析响应数据为JSON格式
            //     const data = await res.json();
            //     this.setData(data);
            // } else {
            //     this.setProperty("/displayName", "unknown");
            // }
            var that = this;
            return new Promise((resolve, reject) => {
                // resolve(this.setDate())
                that.setData({
                    user: {
                        displayName: "You"
                    }
                });
                resolve("");
            });
        },
        getUser: function () {
            return this.getData();
        }
    });

    // 定义UserModel构造函数，模拟类的定义并继承JSONModel
});