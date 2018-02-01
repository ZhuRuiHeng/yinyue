// pages/music/music.js
var app = getApp();
var util = require('../../utils/util.js');
import tips from '../../utils/tips.js'
Page({
  data: {
    answer: [],
    play: false, //播放
    bg: false,
    right: false, //回答正确于否
    tishi: false,
    click: 0
  },
  onLoad: function (options) {
    console.log("options:", options);
    let that = this;
    that.setData({
      friend_mid: options.mid, //好友mid
      mid: wx.getStorageSync('mid')
    })
    if (options.mid == wx.getStorageSync('mid')) { //自己
      wx.switchTab({
        url: '../music/music',
      })
    }
  },

  onShow: function () {
    let that = this;
    that.setData({
      play: false,
    })
    app.getAuth(function () {
      // 猜歌信息
      wx.request({
        url: app.data.apiurl + "guessmc/go?sign=" + wx.getStorageSync('sign') + '&operator_id=' + wx.getStorageSync("kid"),
        data:{
          guess_type: 'music'
        },
        header: {
          'content-type': 'application/json'
        },
        method: "GET",
        success: function (res) {
          console.log("猜歌信息:", res);
          var status = res.data.status;
          let answer = [];
          let both = {};
          if (status == 1) {
            that.setData({
              inform: res.data.data,
              problem: res.data.data.option
            })
            app.AppMusic.src = res.data.data.url;
            console.log('AppMusic:', app.AppMusic);
            for (let i = 0; i < res.data.data.length; i++) {
              both.text = 0;
              both.index = -1;
              answer[i] = both;
            }
            console.log('objanswer:', answer)
            that.setData({
              answer,
              click: 0,
              problem: that.data.inform.option
            })
          } else {
            console.log(res.data.msg)
          }
        }
      })
      // 积分信息
      wx.request({
        url: app.data.apiurl + "guessmc/get-point-info?sign=" + wx.getStorageSync('sign') + '&operator_id=' + wx.getStorageSync("kid"),
        data:{
          guess_type: 'music'
        },
        header: {
          'content-type': 'application/json'
        },
        method: "GET",
        success: function (res) {
          console.log("积分信息:", res);
          var status = res.data.status;
          if (status == 1) {
            wx.setStorageSync('jifen', res.data.data);
            that.setData({
              answer_add_point: res.data.data.answer_add_point,
              notice_use_point: res.data.data.notice_use_point,
              point: res.data.data.point,
              share_add_point: res.data.data.share_add_point
            })
          } else {
            console.log(res.data.msg)
          }
        }
      })
    });
  },
  mine() {
    wx.switchTab({
      url: '../music/music',
    })
  },
  // 刷新
  refresh(e) {
    console.log('refresh');
    let that = this;
    let inform = that.data.inform;
    let answer = [];
    let both = {};
    for (let i = 0; i < inform.length; i++) {
      both.text = 0;
      both.index = -1;
      answer[i] = both;
    }
    that.setData({
      answer,
      click: 0,
      problem: inform.option
    })
    console.log('refreshAnswer:', answer);
  },
  // 禾葡兰
  hepulan() {
    util.jump()
  },
  
  //stop
  stop() {
    let that = this;
    that.setData({
      play: false
    })
    app.AppMusic.pause();
    app.AppMusic.onPause(() => {
      console.log('暂停播放');
    })
  },
  //play
  play() {
    let that = this;
    app.AppMusic.play();
    that.setData({
      play: true
    })
    //console.log('AppMusic:',app.AppMusic);
    setTimeout(function () {
        console.log('setTimeout');
        app.AppMusic.pause();
        app.AppMusic.onPause(() => {
          console.log('暂停播放');
        })
        that.setData({
          play: false
        })
    }, 10000)

  },
  // 选择
  checked(e) {
    let that = this;
    let text = e.currentTarget.dataset.text;
    let index = e.currentTarget.dataset.index;
    let answer = that.data.answer;
    let problem = that.data.problem;
    let inform = that.data.inform;
    let click = that.data.click;
    let both = {};
    click = click + 1;
    that.setData({
      click
    })
    if (click == inform.length) {
      // 答题
      wx.request({
        url: app.data.apiurl + "guessmc/answer?sign=" + wx.getStorageSync('sign') + '&operator_id=' + wx.getStorageSync("kid"),
        data: {
          num: that.data.inform.num,
          answer: answer.toString(),
          type: 'self',
          guess_type: 'music'
        },
        header: {
          'content-type': 'application/json'
        },
        method: "GET",
        success: function (res) {
          console.log("回答:", res);
          var status = res.data.status;
          if (status == 1) {
            that.setData({
              bg: true,
              right: true
            })
          } else {
            console.log(res.data.msg);
            tips.alert(res.data.msg);
            for (let i = 0; i < inform.length; i++) {
              both.text = 0;
              both.index = -1;
              answer[i] = both;
            }
            that.setData({
              answer,
              click: 0,
              problem: inform.option
            })
          }
        }
      })
    }
    console.log('选择', text);
    // 答案
    for (let i = 0; i < answer.length; i++) {
      if (answer[i].text == 0) {
        let obj = {
          text: text,
          index: index
        };
        answer[i] = obj;
        console.log(i);
        break;
      }
    }
    for (let j = 0; j < problem.length; j++) {
      if (j == index) {
        problem[j] = 0;
      }
    }
    that.setData({
      answer,
      problem
    })
    // 如果点击6次就提交
  },
  // backText
  backText(e) {
    console.log(e);
    let that = this;
    let askindex = e.currentTarget.dataset.askindex;
    let index = e.currentTarget.dataset.index;
    let text = e.currentTarget.dataset.text;
    let problem = that.data.problem;
    let answer = that.data.answer;
    let click = that.data.click;
    for (let i = 0; i < problem.length; i++) {
      if (i == askindex) {
        problem[i] = text
      }
    }
    for (let j = 0; j < answer.length; j++) {
      if (j == index) {
        let obj = {
          text: 0,
          obj: -1
        }
        answer[j] = obj;
      }

    }

    that.setData({
      problem,
      answer,
      click: click - 1
    })
  },
  
  onHide(e) {
    console.log('musiconhide');
    let that = this;
    that.setData({
      play: false
    })
    app.AppMusic.pause();
    app.AppMusic.onPause(() => {
      console.log('暂停播放');
    })
  }

})