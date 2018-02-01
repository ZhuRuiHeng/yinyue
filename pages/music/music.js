// pages/music/music.js
var app = getApp();
var util = require('../../utils/util.js');
import tips from '../../utils/tips.js'
Page({
  data: {
     answer:[],
     play:false, //播放
     bg: false,
     right:false, //回答正确于否
     tishi:false,
     click:0
  },
  onLoad: function (options) {
    console.log("options:", options);
    let that = this;
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
            guess_type: 'music',
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
                inform:res.data.data,
                problem: res.data.data.option
              })
              app.AppMusic.src = res.data.data.url;
              console.log('AppMusic:',app.AppMusic);
              for (let i = 0; i < res.data.data.length; i++) {
                both.text=0;
                both.index=-1;
                both.notice = false;
                answer[i]= both;
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
            guess_type: 'music',
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
  // 提示
  notice(e){
    let that = this;
    that.setData({
      bg:true,
      tishi:true
    })
  },
  no(){
    this.setData({
      bg: false,
      tishi: false
    })
  },
  // 提示规则,不是提示的文字全部清掉,保留提示的字符,因为正确的字是唯一的话,若前边又选,提示就没有了
  ok(){
    let that = this;
    let answer = that.data.answer;
    let _answer = that.data.answer.reverse();
    let problem = that.data.problem;
    let point = that.data.point;
    let notice_use_point = that.data.notice_use_point;
    let inform = that.data.inform;
    that.setData({
      bg: false,
      tishi: false
    })
    wx.request({
      url: app.data.apiurl + "guessmc/notice?sign=" + wx.getStorageSync('sign') + '&operator_id=' + wx.getStorageSync("kid"),
      data: {
        num: that.data.inform.num,
        guess_type: 'music'
      },
      header: {
        'content-type': 'application/json'
      },
      method: "GET",
      success: function (res) {
        console.log("提示信息:", res);
        var status = res.data.status;
        if (status == 1) {
          console.log('answer:', answer);
          let notice_key = res.data.data.notice_key;
          console.log('notice_key:', res.data.data.notice_key);
          for (let i = 0; i < answer.length; i++) {
            if (_answer[i].notice == false){
                console.log(i);
                answer[i].text = 0;
            }
          }
          for (let i = 0; i < answer.length; i++) {
            if (_answer[i].notice == false) {
              console.log(i);
              // 循环选择中与提示文字相同的
              for (let j = 0; j < problem.length;j++){
                if (problem[j] == notice_key){
                    console.log(j);
                    let index = j;
                }
              }
              let obj = {
                text: notice_key,
                index: index,
                notice: true
              };
              answer[i] = obj;
              console.log(i);
              
              break;
            }
          }
          
          console.log('objanswer:', answer)
          that.setData({
            answer: answer,
            click: 0,
            problem: that.data.inform.option,
            point: point - notice_use_point
          })
        } else {
          console.log(res.data.msg)
        }
      }
    })
  },
  // 分享
  share(e) {
    wx.navigateTo({
      url: '../share/share',
    })
  },
  // 刷新
  refresh(e){
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
      click:0,
      problem: inform.option
    })
    console.log('refreshAnswer:', answer);
  },
  // 禾葡兰
  hepulan(){
    util.jump()
  },
  // 下一题
  nextTitle(){
    console.log('nextTitle');
    let that = this;
    app.AppMusic.pause();
    app.AppMusic.onPause(() => {
      console.log('暂停播放');
    })
    that.setData({
      right:false,
      bg: false, 
      play: false
    })
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
        console.log("下一题猜歌信息:", res);
        var status = res.data.status;
        let answer = [];
        let both = {};
        if (status == 1) {
          that.setData({
            inform: res.data.data,
            problem: res.data.data.option
          })
          for (let i = 0; i < res.data.data.length; i++) {
            both.text = 0;
            both.index = -1;
            both.notice = false;
            answer[i] = both;
          }
          that.setData({
            answer,
            click:0,
            problem: that.data.inform.option
          })
          app.AppMusic.src = res.data.data.url;
        } else {
          console.log(res.data.msg)
        }
      }
    })
  },
  //stop
  stop(){
    let that = this;
    that.setData({
      play:false
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
    setTimeout(function(){
      console.log('setTimeout');
      app.AppMusic.pause();
      app.AppMusic.onPause(() => {
        console.log('暂停播放');
      })
      that.setData({
        play: false
      })
    },10000)
  },
  // 选择
  checked(e){
    let that = this;
    let text = e.currentTarget.dataset.text;
    let index = e.currentTarget.dataset.index;
    let answer = that.data.answer;
    let problem = that.data.problem;
    let inform = that.data.inform;
    let click = that.data.click;
    let point = that.data.point;
    let answer_add_point = that.data.answer_add_point;
    if(text == 0){
        return;
    }
    if (click==inform.length){
      let huida = [];
      for (let i = 0; i < answer.length; i++) {
        huida.push(answer[i].text)
      }
      console.log(huida, 'huida:');
      console.log(typeof (huida.toString()));
      // 答题
      wx.request({
        url: app.data.apiurl + "guessmc/answer?sign=" + wx.getStorageSync('sign') + '&operator_id=' + wx.getStorageSync("kid"),
        data: {
          num: that.data.inform.num,
          answer: huida.toString(),
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
              right: true,
              point: point + answer_add_point
            })
            tips.success('积分' + answer_add_point +'');
            app.AppMusic.play();
            that.setData({
              play: true
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
    let both = {};
        click = click+1;
        that.setData({
          click
        })
        // 答案
        for (let i = 0; i < answer.length; i++) {
          if (answer[i].text == 0) {
            let obj = {
              text: text,
              index: index,
              notice: false
            };
            answer[i] = obj;
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
    if (click==inform.length){
      let huida = [];
      for (let i =0;i<answer.length;i++){
          huida.push(answer[i].text)
      }
      console.log(huida,'huida:');
      console.log(typeof(huida.toString()));
      // 答题
      wx.request({
          url: app.data.apiurl + "guessmc/answer?sign=" + wx.getStorageSync('sign') + '&operator_id=' + wx.getStorageSync("kid"),
          data: {
            num: that.data.inform.num,
            answer: huida.toString(),
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
                right: true,
                point: point + answer_add_point
              })
              tips.alert(res.data.msg);
              app.AppMusic.onEnded(() => {
                console.log('播放结束事件');
                that.setData({
                  play:false
                })
              })
            } else {
              console.log(res.data.msg);
              tips.alert(res.data.msg);
              for (let i = 0; i <inform.length; i++) {
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
  
    // 如果点击6次就提交
  },
  // backText
  backText(e){
    let that = this;
    let askindex = e.currentTarget.dataset.askindex;
    let index = e.currentTarget.dataset.index;
    let text = e.currentTarget.dataset.text;
    let problem = that.data.problem;
    let answer = that.data.answer;
    let click = that.data.click;
    for (let i = 0; i < problem.length;i++){
      if (i == askindex){
         problem[i] = text
      }
    }
    for (let j = 0; j < answer.length; j++){
      if (j == index) {
        let obj = {
          text : 0,
          obj : -1
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
  onShareAppMessage: function (res) {
    let that = this;
    return {
      title: '猜猜音乐',
      path: '/page/shareMusic/shareMusic?mid=' + wx.getStorageSync('mid'),
      success: function (res) {
        // 转发成功
        wx.request({
          url: app.data.apiurl + "guessmc/share-add-point?sign=" + wx.getStorageSync('sign') + '&operator_id=' + wx.getStorageSync("kid"),
          data:{
            guess_type: 'music'
          },
          header: {
            'content-type': 'application/json'
          },
          method: "GET",
          success: function (res) {
            console.log("求助加积分:", res);
            var status = res.data.status;
            if (status == 1) {
              tips.success('积分' +that.data.share_add_point+'')
              that.setData({
                point: res.data.data.point,
              })
            } else {
              console.log(res.data.msg)
            }
          }
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onHide(e){
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