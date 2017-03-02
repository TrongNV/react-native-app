/**
 *
 * @author keyy/1501718947@qq.com 16/11/10 16:09
 * @description
 */
import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  Text,
  DeviceEventEmitter,
  NativeAppEventEmitter,
  TouchableOpacity,
  InteractionManager,
  Keyboard,
  Alert,
  Platform
} from 'react-native'
import {connect} from 'react-redux'
import BaseComponent from '../base/BaseComponent'
import {GiftedChat} from 'react-native-gifted-chat'
import {CustomGiftedChat} from '../components/CustomGiftedChat'
import CustomView from '../components/CustomView'
import {URL_DEV, URL_TOKEN_DEV, URL_WS_DEV, URL_WS_PING_DEV} from '../constants/Constant'
import * as Storage from '../utils/Storage'
import tmpGlobal from '../utils/TmpVairables'
import {strToDateTime, dateFormat} from '../utils/DateUtil'
import CustomMessage from '../components/CustomMessage'
import * as HomeActions from '../actions/Home'
import ActionSheet from 'react-native-actionsheet'
import CustomGiftedAvatar from '../components/CustomGiftAvatar'
import UserInfo from '../pages/UserInfo'
import CustomBubble from '../components/CustomBubble'
import Report from '../pages/Report'
import {toastShort, toastLong} from '../utils/ToastUtil'
import Recharge from '../pages/Recharge'
import BackgroundTimer from 'react-native-background-timer'

const styles = StyleSheet.create({
  footerContainer: {
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#aaa',
  },
  container: {
    height: 44,
    justifyContent: 'flex-end',
  },
  text: {
    color: '#0084ff',
    fontWeight: '600',
    fontSize: 17,
    backgroundColor: 'transparent',
    marginBottom: 12,
    marginLeft: 10,
    marginRight: 10,
  },
  tipsContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(12,12,12,0.5)',
    ...Platform.select({
      ios: {
        top: 84
      },
      android: {
        top: 74
      }
    }),
    marginHorizontal: 40,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4
  },
  tipsText: {
    color: '#fff',
    flexWrap: 'wrap'
  },
  clickTipsText: {
    color: 'blue'
  }
});

const CANCEL_INDEX = 0;
const DESTRUCTIVE_INDEX = 1;
let navigator;
let emitter;
let reconnectCount = 0;
let wsNetWorkStatus = true;
let pingErrorTimes = 0;

class MessageDetail extends BaseComponent {

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      loadEarlier: false,//关闭加载历史记录功能
      destroyed: true,
      typingText: '',
      isLoadingEarlier: false,
      AmIFollowedHim: false,
      ...this.props.route.params,
      targetUser: null,
      tips: null,
      tipsClick: '解除黑名单',
      isInBlackList: false,
      SmsCost: 50//默认50觅豆发一条短信
    };
    navigator = this.props.navigator;
    emitter = Platform.OS === 'ios' ? NativeAppEventEmitter : DeviceEventEmitter;
    this.onSend = this.onSend.bind(this);
    this.onSendSms = this.onSendSms.bind(this);
    this.onReceive = this.onReceive.bind(this);
    this.renderBubble = this.renderBubble.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.onLoadEarlier = this.onLoadEarlier.bind(this);
    this.renderSend = this.renderSend.bind(this);
    this.renderMessage = this.renderMessage.bind(this);
    this.renderTime = this.renderTime.bind(this);
    this._goUserInfo = this._goUserInfo.bind(this);
    this.renderAvatar = this.renderAvatar.bind(this);
    this.renderLoadEarlier = this.renderLoadEarlier.bind(this);
  }

  _initOldMessage() {
    Storage.getItem(`${tmpGlobal.currentUser.UserId}_MsgList`).then((res) => {
      if (res !== null && this._getChatRecord(res) && this._getChatRecord(res).MsgList.length > 0) {
        console.log('MessageDetail加载缓存', res);
        this.setState({
          messages: this._updateAvatar(this._getChatRecord(res).MsgList.reverse())
        }, () => {
          this._getNewMsg();
        });
      } else {
        console.log(res, tmpGlobal.currentUser.UserId, this.state.UserId);
        console.log('没有聊天记录');
        this._getNewMsg();
      }
    });
  }

  //从缓存中找出当前用户与聊天对象用户之间的聊天记录
  _getChatRecord(data) {
    return data.find((item) => {
      return item.SenderId === this.state.UserId
    });
  }

  componentWillMount() {
    InteractionManager.runAfterInteractions(() => {
      this._getUserInfo();
    });
  }

  componentDidMount() {
    this.setState({
      destroyed: false
    }, () => {
      this._initOldMessage();
    });
    this._attentionListener = emitter.addListener('hasAttention', () => {
      this._getUserInfo()
    });
  }

  _getUserInfo() {
    const {dispatch}=this.props;
    let params = {
      UserId: this.state.UserId,
      ...this.state.myLocation
    };
    dispatch(HomeActions.getUserInfo(params, (json) => {
      dispatch(HomeActions.getSettings('', (result) => {
        this.setState({
          SmsCost: result.Result.SmsCost,
          AmIFollowedHim: json.Result.AmIFollowedHim,
          targetUser: json.Result,
          isInBlackList: json.Result.IsBlackUser
        });
      }, (error) => {
      }));
    }, (error) => {
    }));
  }

  _getNewMsg() {
    //进入MessageDetail页面后,ws.onmessage监听器被重新绑定了事件,故离开此页面之前要发布广播,重置ws.onmessage监听器。
    tmpGlobal.ws.onmessage = (e) => {
      this._wsNewMsgHandler(JSON.parse(e.data));
    };
  }

  //原生webSocket连接从后台接收消息
  _wsNewMsgHandler(obj) {
    wsNetWorkStatus = true;
    if (pingErrorTimes < 1) {
      this.heartCheck().start();
    }
    if (obj.hasOwnProperty('M')) {
      console.log(obj);
      let index = obj.M.findIndex((item) => {
        return item.M === 'GetNewMsg'
      });
      if (index > -1) {
        Storage.getItem(`${tmpGlobal.currentUser.UserId}_LastMsgId`).then((res) => {
          if (obj.M[0].A[0].LastMsgId && obj.M[0].A[0].LastMsgId > parseInt(res || 0)) {
            //缓存最后一条消息Id
            Storage.setItem(`${tmpGlobal.currentUser.UserId}_LastMsgId`, obj.M[0].A[0].LastMsgId);
            this._handleNewMsg(obj.M[index].A[0]);
          }
        });
      }
    } else {
      //console.log(obj);
    }
  }

  heartCheck() {
    let _this = this;
    return {
      timeout: 15000,//15s
      timeoutObj: null,
      reset: function () {
        BackgroundTimer.clearTimeout(this.timeoutObj);
        this.start();
      },
      start: function () {
        this.timeoutObj = BackgroundTimer.setTimeout(() => {
          fetch(URL_WS_PING_DEV, {
            method: 'POST'
          }).then((response) => {
            return response.json()
          }).then((json) => {
            if (json.Response === 'pong') {
              wsNetWorkStatus = true;
              //console.log('与webSocket服务器连接正常');
              //console.log(this,_this);
              this.reset();
            } else {
              pingErrorTimes += 1;
              wsNetWorkStatus = false;
              console.log('与webSocket服务器连接异常');
              //与websocket服务器的连接断开,手动关闭websocket连接
              tmpGlobal._wsCloseManual = false;
              if (pingErrorTimes === 1) {
                toastLong('您的聊天网络异常，将自动返回上一页，以便重新连接');
                this.popTimer = setTimeout(() => {
                  navigator.pop();
                }, 3000);
                return false;
              }
            }
          }).catch((e) => {
            console.log(e);
            console.log('与webSocket服务器连接异常');
            pingErrorTimes += 1;
            wsNetWorkStatus = false;
            tmpGlobal._wsCloseManual = false;
            if (pingErrorTimes === 1) {
              toastLong('您的聊天网络异常，将自动返回上一页，以便重新连接');
              this.popTimer = setTimeout(() => {
                navigator.pop();
              }, 3000);
              return false;
            }
          });
        }, this.timeout)
      }
    }
  }

  //收到新消息后处理(缓存、展示)
  _handleNewMsg(newMsg) {
    //离开此页面后,不在此页面缓存消息,也不在此页面将消息标为已读
    if (!this.state.destroyed) {
      console.log('MessageDetail页面开始缓存消息');
      this._receiveSaveRecord(JSON.parse(JSON.stringify(newMsg.MsgPackage)));
    }
    let resMsg = this._getSingleMsg(JSON.parse(JSON.stringify(newMsg.MsgPackage)), this.state.UserId);
    //页面销毁后,不在此页面接收消息。对方没有发消息过来,但别人发消息过来后,此页面也不会接收消息(如果对方在极短的时间内发了多条,就循环接收)
    if (resMsg && resMsg.MsgList && resMsg.MsgList.length > 0 && !this.state.destroyed) {
      //console.log(newMsg, resMsg);
      console.log('MessageDetail页面收到了新消息');
      for (let i = 0; i < resMsg.MsgList.length; i++) {
        this._margeMessage(resMsg.MsgList[i]);
      }
    }
  }

  //从服务器返回的消息列表中筛选出与当前用户聊天的对象的消息
  _getSingleMsg(data, id) {
    let newMsgList = JSON.parse(JSON.stringify(data));
    for (let i = 0; i < newMsgList.length; i++) {
      for (let j = 0; j < newMsgList[i].MsgList.length; j++) {
        newMsgList[i].MsgList[j] = {
          HasSend: true,
          MsgContent: newMsgList[i].MsgList[j].MsgContent,
          MsgId: newMsgList[i].MsgList[j].MsgId,
          MsgType: newMsgList[i].MsgList[j].MsgType,
          SendTime: this._renderMsgTime(newMsgList[i].MsgList[j].SendTime),
          _id: Math.round(Math.random() * 1000000),
          text: newMsgList[i].MsgList[j].MsgContent,
          createdAt: this._renderMsgTime(newMsgList[i].MsgList[j].SendTime),
          user: {
            _id: newMsgList[i].SenderId,
            name: newMsgList[i].SenderNickname,
            avatar: newMsgList[i].SenderAvatar,
            myUserId: tmpGlobal.currentUser.UserId
          }
        };
      }
    }
    return newMsgList.find((item) => {
      return item.SenderId === id;
    });
  }

  _renderMsgTime(str) {
    if (str.indexOf('T') > -1) {
      let tmpStr = str;
      let serverTime = tmpStr.split('T')[0] + ' ' + (tmpStr.split('T')[1]).split('.')[0];
      let formatServerTime = (strToDateTime(serverTime) + '').split('GMT')[0] + ' GMT+1100 (AESST)';//澳大利亚东部夏令时
      //console.log('服务器时间', serverTime);
      //console.log('服务器时间转本地时间', new Date(formatServerTime));
      return dateFormat(new Date(formatServerTime));
    } else {
      return str;
    }
  }

  //接收时缓存(同时需要发布缓存成功的订阅,供Message页面监听)
  _receiveSaveRecord(data) {
    console.log('这是从服务器返回的消息', data);
    let dataCopy = [];
    let newMsgList = JSON.parse(JSON.stringify(data));
    for (let i = 0; i < newMsgList.length; i++) {
      for (let j = 0; j < newMsgList[i].MsgList.length; j++) {
        newMsgList[i].MsgList[j] = {
          MsgContent: newMsgList[i].MsgList[j].MsgContent,
          MsgId: newMsgList[i].MsgList[j].MsgId,
          MsgType: newMsgList[i].MsgList[j].MsgType,
          HasSend: true,
          SendTime: this._renderMsgTime(newMsgList[i].MsgList[j].SendTime),
          _id: Math.round(Math.random() * 1000000),
          text: newMsgList[i].MsgList[j].MsgContent,
          createdAt: this._renderMsgTime(newMsgList[i].MsgList[j].SendTime),
          user: {
            _id: newMsgList[i].SenderId,
            name: newMsgList[i].SenderNickname,
            avatar: URL_DEV + newMsgList[i].SenderAvatar,
            myUserId: tmpGlobal.currentUser.UserId
          }
        };
      }
    }

    dataCopy = JSON.parse(JSON.stringify(newMsgList));
    console.log('待缓存的数据', dataCopy);
    Storage.getItem(`${tmpGlobal.currentUser.UserId}_MsgList`).then((res) => {
      if (res !== null && res.length > 0) {
        for (let i = 0; i < res.length; i++) {
          for (let j = 0; j < dataCopy.length; j++) {
            if (res[i].SenderId === dataCopy[j].SenderId) {
              //若用户头像、昵称有更新,则更新缓存中的头像和昵称
              res[i].SenderNickname = dataCopy[j].SenderNickname;
              res[i].SenderAvatar = dataCopy[j].SenderAvatar;
              res[i].MsgList = res[i].MsgList.concat(dataCopy[j].MsgList);
              dataCopy.splice(j, 1);
              break;
            }
          }
        }
        console.log('需要和缓存记录拼接的消息', dataCopy);
        res = res.concat(dataCopy);
        console.log('已有缓存时,待缓存的数据', res);
        Storage.setItem(`${tmpGlobal.currentUser.UserId}_MsgList`, res).then(() => {
          emitter.emit('MessageCached', {data: res, message: '消息缓存成功'});
        });
      } else {
        //没有历史记录,且服务器第一次推送消息
        Storage.setItem(`${tmpGlobal.currentUser.UserId}_MsgList`, dataCopy).then(() => {
          emitter.emit('MessageCached', {data: res, message: '消息缓存成功'});
        });
      }
    });
  }

  //发送时缓存(同时需要发布订阅,供Message页面监听)
  _sendSaveRecord(data) {
    //跟当前用户没有聊天记录
    let allMsg = {
      SenderAvatar: this.state.UserAvatar,
      SenderId: this.state.UserId,
      SenderNickname: this.state.Nickname,
      MsgList: [data]
    };
    Storage.getItem(`${tmpGlobal.currentUser.UserId}_MsgList`).then((res) => {
      if (res !== null && res.length > 0) {
        let index = res.findIndex((item) => {
          return item.SenderId === this.state.UserId
        });
        if (index > -1) {
          res[index].MsgList.push(data);
        } else {
          res.push(allMsg);
        }
        for (let i = 0; i < res.length; i++) {
          res[i].MsgList = this._updateAvatar(res[i].MsgList)
        }
        console.log('发送时更新消息缓存数据', res, data);
        Storage.setItem(`${tmpGlobal.currentUser.UserId}_MsgList`, res).then(() => {
          emitter.emit('MessageCached', {data: res, message: '消息缓存成功'});
        });
      } else {
        Storage.setItem(`${tmpGlobal.currentUser.UserId}_MsgList`, [allMsg]).then(() => {
          emitter.emit('MessageCached', {data: [allMsg], message: '消息缓存成功'});
        });
      }
    });
  }

  //页面销毁之前,切换销毁开关,离开此页面后,不再接收消息
  componentWillUnmount() {
    this.state.destroyed = true;
    this._attentionListener.remove();
    if (this.popTimer) {
      clearTimeout(this.popTimer);
    }
    if (this.reConnectTimer) {
      clearTimeout(this.reConnectTimer);
    }
    if (this.heartCheck && this.heartCheck.timeoutObj) {
      BackgroundTimer.clearTimeout(this.heartCheck.timeoutObj);
    }
    if (wsNetWorkStatus) {
      emitter.emit('ReceiveMsg', {data: true, message: '即将离开MessageDetail页面'});
    }
  }

  //暂不支持加载历史记录功能
  renderLoadEarlier() {
    return null;
  }

  onLoadEarlier() {
    console.log('点击了加载历史记录');
  }

  //发送消息之前,检查webSocket是否成功初始化
  _checkBeforeSend(message) {
    if (tmpGlobal.ws.readyState === 1 && tmpGlobal.isConnected) {
      this.onSend(message);
    } else {
      Alert.alert('提示', '您的网络异常,点击重试', [
        {
          text: '确定', onPress: () => {
          emitter.emit('reConnectWebSocket', {data: true, message: '在聊天页面重新连接webSocket'});
        }
        },
        {
          text: '取消', onPress: () => {
        }
        }
      ]);
    }
  }

  //发消息的同时,将消息缓存在本地
  onSend(messages) {
    Keyboard.dismiss();
    //console.log(messages);
    let tmpId = Math.round(Math.random() * 1000000);
    let singleMsg = {
      MsgContent: messages[0].text,
      MsgId: tmpId,
      MsgType: 1,//1代表用户之间的普通聊天消息
      SendTime: messages[0].createdAt,
      HasSend: true,
      _id: tmpId,
      text: messages[0].text,
      createdAt: messages[0].createdAt,
      user: {
        _id: tmpGlobal.currentUser.UserId,
        name: tmpGlobal.currentUser.Nickname,
        avatar: URL_DEV + tmpGlobal.currentUser.PhotoUrl,
        myUserId: tmpGlobal.currentUser.UserId
      },
    };

    //单条发送的消息存入缓存中时,需要将日期转成字符串存储
    let params = {
      MsgContent: messages[0].text,
      MsgId: tmpId,
      MsgType: 1,//1代表用户之间的普通聊天消息
      SendTime: dateFormat(messages[0].createdAt),
      HasSend: true,
      _id: tmpId,
      text: messages[0].text,
      createdAt: dateFormat(messages[0].createdAt),
      user: {
        _id: tmpGlobal.currentUser.UserId,
        name: tmpGlobal.currentUser.Nickname,
        avatar: URL_DEV + tmpGlobal.currentUser.PhotoUrl,
        myUserId: tmpGlobal.currentUser.UserId
      },
    };
    //console.log(params);
    this._sendSaveRecord(params);

    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, singleMsg),
      };
    }, this.setState({messages: this._updateAvatar(this.state.messages)}));

    let sendMsgParams = {
      H: 'chatcore',
      M: 'UserSendMsgToUser',
      A: [this.state.UserId + '', messages[0].text],
      I: Math.floor(Math.random() * 11)
    };

    tmpGlobal.ws.send(JSON.stringify(sendMsgParams));
  }

  //在聊天页面接收消息，若对方更新了头像或昵称，则需要更新页面上的头像和昵称（更新缓存单独进行）
  _margeMessage(data) {
    for (let i = 0; i < this.state.messages.length; i++) {
      if (this.state.messages[i].user._id === data.user._id) {
        this.state.messages[i].user.avatar = URL_DEV + data.user.avatar;
        this.state.messages[i].user.name = data.user.name;
      }
    }
    this.setState({
      messages: this.state.messages
    }, () => {
      this.onReceive(data)
    });
  }

  onReceive(data) {
    console.log('onReceive渲染方法', data);
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, {
          MsgContent: data.text,
          MsgId: data.MsgId,
          MsgType: data.MsgType,
          HasSend: true,
          _id: data._id,
          text: data.text,
          SendTime: data.createdAt,
          createdAt: strToDateTime(data.createdAt),//从服务器接收的是字符串类型的时间,这里只支持Date类型,存入缓存之前,需要转成字符串时间
          user: {
            _id: data.user._id,
            name: data.user.name,
            avatar: URL_DEV + data.user.avatar,
            myUserId: tmpGlobal.currentUser.UserId
          },
        }),
      };
    });
  }

  renderBubble(props) {
    return (
      <CustomBubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#f0f0f0',
            paddingHorizontal: 6,
            paddingVertical: 6
          },
          right: {
            paddingHorizontal: 6,
            paddingVertical: 6
          }
        }}
      />
    );
  }

  renderCustomView(props) {
    return (
      <CustomView
        {...props}
      />
    );
  }

  onSendSms(text) {
    Alert.alert('提示', `发送短信需要收取${this.state.SmsCost}觅豆,确认发送吗?`, [
      {
        text: '确认', onPress: () => {
        this._sendSms(text)
      }
      },
      {
        text: '取消', onPress: () => {
      }
      }
    ]);
  }

  _sendSms(messages) {
    Keyboard.dismiss();
    console.log(messages);
    let tmpId = Math.round(Math.random() * 1000000);
    let singleMsg = {
      MsgContent: messages[0].text,
      MsgId: Math.round(Math.random() * 1000000),
      MsgType: 4,//4代表短信
      SendTime: messages[0].createdAt,
      HasSend: true,
      _id: tmpId,
      text: messages[0].text,
      createdAt: messages[0].createdAt,
      user: {
        _id: tmpGlobal.currentUser.UserId,
        name: tmpGlobal.currentUser.Nickname,
        avatar: URL_DEV + tmpGlobal.currentUser.PhotoUrl,
        myUserId: tmpGlobal.currentUser.UserId
      },
    };

    //单条发送的消息存入缓存中时,需要将日期转成字符串存储
    let params = {
      MsgContent: messages[0].text,
      MsgId: Math.round(Math.random() * 1000000),
      MsgType: 4,//4代表短信
      SendTime: dateFormat(messages[0].createdAt),
      HasSend: true,
      _id: tmpId,
      text: messages[0].text,
      createdAt: dateFormat(messages[0].createdAt),
      user: {
        _id: tmpGlobal.currentUser.UserId,
        name: tmpGlobal.currentUser.Nickname,
        avatar: URL_DEV + tmpGlobal.currentUser.PhotoUrl,
        myUserId: tmpGlobal.currentUser.UserId
      },
    };
    console.log(params);

    const {dispatch}=this.props;
    let data = {
      UserId: this.state.UserId,
      SmsCost: 1,
      Text: messages[0].text
    };
    dispatch(HomeActions.sendSms(data, (json) => {
      if (!json.Result.code) {
        this._rechargeConfirm(json.Result.msg)
      } else {
        toastShort(json.Result.msg);
        this._sendSaveRecord(params);
        this.setState((previousState) => {
          return {
            messages: GiftedChat.append(previousState.messages, singleMsg),
          };
        }, this.setState({messages: this._updateAvatar(this.state.messages)}));
      }
    }, (error) => {
    }));
  }

  _rechargeConfirm(str) {
    Alert.alert('提示', str, [
      {
        text: '确定', onPress: () => {
        navigator.push({
          component: Recharge,
          name: 'Recharge'
        })
      }
      },
      {
        text: '取消', onPress: () => {
      }
      }
    ]);
  }

  renderFooter(props) {
    if (this.state.typingText) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            {this.state.typingText}
          </Text>
        </View>
      );
    }
    return null;
  }

  renderSend(props) {
    if (props.text.trim().length > 0) {
      return (
        <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
          <TouchableOpacity
            style={[styles.container, this.props.containerStyle]}
            onPress={() => {
              props.onSend({text: props.text.trim()}, true);
            }}>
            <Text style={[styles.text, props.textStyle]}>{props.label}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.container, this.props.containerStyle]}
            onPress={() => {
              props.onSendSms({text: props.text.trim()}, true);
            }}>
            <Text style={[styles.text, props.textStyle]}>{'发短信'}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return <View/>;
  }

  renderMessage(props) {
    return (
      <CustomMessage {...props}/>
    )
  }

  renderTime() {
    return null
  }

  renderAvatar(props) {
    //console.log(props);
    return (
      <CustomGiftedAvatar
        {...props}
        onPress={this._goUserInfo}/>
    )
  }

  getNavigationBarProps() {
    return {
      title: `${this.state.Nickname}`,
      hideRightButton: false,
      rightIcon: {
        name: 'ellipsis-v'
      },
    };
  }

  onRightPressed() {
    this.ActionSheet.show();
  }

  //关注/取消关注
  _actionSheetPress(index) {
    const {dispatch}=this.props;
    let data = {
      attentionUserId: this.state.UserId
    };
    if (index === 1) {
      dispatch(HomeActions.attention(data, (json) => {
        if (json.Result) {
          this._attention(json.Result ? '' : '取消');//取消关注暂时不发消息
        }
        emitter.emit('hasAttention', '已关注/取消关注对方');
      }, (error) => {
      }));
    } else if (index === 2) {
      navigator.push({
        component: Report,
        name: 'Report',
        params: {
          UserId: this.state.UserId
        }
      });
    } else if (index === 3) {
      this._addOrRemoveBlackList();
    }
  }

  _attention(str) {
    let tmpId = Math.round(Math.random() * 1000000);
    let singleMsg = {
      MsgContent: `[关注]${tmpGlobal.currentUser.Nickname}${str}关注了你`,
      MsgId: tmpId,
      MsgType: 3,//3代表关注/取消关注
      SendTime: new Date(),
      HasSend: true,
      _id: tmpId,
      text: `[关注]${tmpGlobal.currentUser.Nickname}${str}关注了你`,
      createdAt: new Date(),
      user: {
        _id: tmpGlobal.currentUser.UserId,
        name: tmpGlobal.currentUser.Nickname,
        avatar: URL_DEV + tmpGlobal.currentUser.PhotoUrl,
        myUserId: tmpGlobal.currentUser.UserId
      },
    };

    //单条发送的消息存入缓存中时,需要将日期转成字符串存储
    let params = {
      MsgContent: `[关注]${tmpGlobal.currentUser.Nickname}${str}关注了你`,
      MsgId: tmpId,
      MsgType: 3,//3代表关注/取消关注
      SendTime: dateFormat(new Date()),
      HasSend: true,
      _id: tmpId,
      text: `[关注]${tmpGlobal.currentUser.Nickname}${str}关注了你`,
      createdAt: dateFormat(new Date()),
      user: {
        _id: tmpGlobal.currentUser.UserId,
        name: tmpGlobal.currentUser.Nickname,
        avatar: URL_DEV + tmpGlobal.currentUser.PhotoUrl,
        myUserId: tmpGlobal.currentUser.UserId
      },
    };

    let sendMsgParams = {
      H: 'chatcore',
      M: 'UserSendMsgToUser',
      A: [this.state.UserId + '', `[关注]${tmpGlobal.currentUser.Nickname}${str}关注了你`],
      I: Math.floor(Math.random() * 11)
    };

    if (tmpGlobal.ws.readyState === 1) {
      this._sendSaveRecord(params);
      this.setState((previousState) => {
        return {
          messages: GiftedChat.append(previousState.messages, singleMsg),
        };
      });
      tmpGlobal.ws.send(JSON.stringify(sendMsgParams));
    }
  }

  //发送消息时，更改本地缓存中的当前用户的头像(如果用户改了头像的话)
  _updateAvatar(data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].user._id === data[i].user.myUserId) {
        data[i].user.avatar = URL_DEV + tmpGlobal.currentUser.PhotoUrl
      }
    }
    return data;
  }

  _addOrRemoveBlackList() {
    const {dispatch}=this.props;
    let data = {
      ForUserId: this.state.UserId
    };
    dispatch(HomeActions.putToBlackList(data, (json) => {
      toastShort(this.state.isInBlackList ? '解除拉黑成功' : '拉黑成功');
      this._getUserInfo();
    }));
  }

  _initButtons(data, arg) {
    return ['取消', data ? '取消关注' : '关注', '举报', arg ? '解除拉黑' : '拉黑'];
  }

  _goUserInfo(props) {
    if (this._getPreviousRoute() === 'UserInfo' && props.currentMessage.user._id !== tmpGlobal.currentUser.UserId) {
      navigator.pop();
    } else {
      navigator.push({
        component: UserInfo,
        name: 'UserInfo',
        params: {
          Nickname: props.currentMessage.user.name,
          UserId: props.currentMessage.user._id,
          isSelf: props.currentMessage.user._id === tmpGlobal.currentUser.UserId
        }
      });
    }
  }

  _getPreviousRoute() {
    let routes = navigator.getCurrentRoutes();
    return routes[routes.length - 2].name;
  }

  renderBlackTips(flag) {
    if (!flag) {
      return null;
    }
    return (
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsText}>
          {'你已拉黑对方,将不会收到对方的消息,'}
          <Text
            style={styles.clickTipsText}
            onPress={() => {
              this._addOrRemoveBlackList()
            }}>{'解除黑名单'}</Text>
          {'后可恢复正常聊天'}
        </Text>
      </View>
    )
  }

  renderBody() {
    return (
      <View style={{flex: 1}}>
        <CustomGiftedChat
          messages={this.state.messages}
          onSend={(message) => {
            this._checkBeforeSend(message)
          }}
          onSendSms={(message) => {
            this.onSendSms(message)
          }}
          renderLoadEarlier={this.renderLoadEarlier}
          loadEarlier={this.state.loadEarlier}
          onLoadEarlier={this.onLoadEarlier}
          isLoadingEarlier={this.state.isLoadingEarlier}
          user={{
            _id: tmpGlobal.currentUser.UserId,
            name: tmpGlobal.currentUser.Nickname,
            avatar: URL_DEV + tmpGlobal.currentUser.PhotoUrl
          }}
          locale={'zh-cn'}
          label={'发送'}
          placeholder={'输入消息内容'}
          renderBubble={this.renderBubble}
          renderCustomView={this.renderCustomView}
          renderFooter={this.renderFooter}
          renderSend={this.renderSend}
          renderMessage={this.renderMessage}
          renderTime={this.renderTime}
          onPress={this._goUserInfo}
          renderAvatar={this.renderAvatar}
        />
        <ActionSheet
          ref={(o) => this.ActionSheet = o}
          title="请选择你的操作"
          options={this._initButtons(this.state.AmIFollowedHim, this.state.isInBlackList)}
          cancelButtonIndex={CANCEL_INDEX}
          destructiveButtonIndex={DESTRUCTIVE_INDEX}
          onPress={this._actionSheetPress.bind(this)}
        />
        {this.renderBlackTips(this.state.isInBlackList)}
      </View>
    )
  }

}

MessageDetail.childContextTypes = {
  getLocale: React.PropTypes.string.isRequired
};

export default connect((state) => {
  return {
    ...state
  }
})(MessageDetail)
