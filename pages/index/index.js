// pages/before/before.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    second: 3
  },
  onLoad(options){
    if (options.scene) {
      let scene = decodeURIComponent(options.scene);
      if (options.scene) {
        var strs = new Array(); //定义一数组 
        strs = scene.split("_"); //字符分割 
        console.log(strs);
        console.log("mid:", strs[2]);
        var mid = strs[2];
        var num = strs[3];
        wx.setStorageSync(mid, 'strs[2]');
        wx.setStorageSync(num, 'strs[3]')
        wx.switchTab({
          url: '../shareMusic/shareMusic',
        })
      }
    }
  },
  onShow: function () {
    const that = this;
    let time = that.data.time;
    var second = that.data.second;

    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
    var id = extConfig.kid;
    console.log("kid",extConfig.kid);

    wx.request({
      url: "https://unify.playonweixin.com/site/get-advertisements",
      data:{
        operator_id: id
      },
      success: function (res) {
        console.log(res);
        if (res.data.status) {
          var advers = res.data.adver.advers;
          var head_adver = res.data.adver.head_adver;
          var broadcasting = res.data.adver.broadcasting;
          wx.setStorageSync("advers", advers);
          wx.setStorageSync("broadcasting", broadcasting);
          that.setData({
            head_adver
          })

          var inter = setInterval(function () {
            if (second <= 1) {
              clearInterval(inter);
              wx.reLaunch({
                url: '../indexs/indexs',
              })
            }
            second--;
            console.log(second);
            that.setData({
              second,
              inter
            })
          }, 1000)
        }
      }
    })
  },


  jumpAd() {
    var inter = this.data.inter;
    clearInterval(inter);
    wx.reLaunch({
      url: '../indexs/indexs',
    })
  },


  
})
