/**
 *
 * @author keyy/1501718947@qq.com 16/11/10 09:54
 * @description
 */
import React, {Component} from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  InteractionManager,
  ListView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  DeviceEventEmitter,
  Platform,
  Keyboard,
  Animated,
  TouchableHighlight,
  Alert,
  StatusBar,
  NativeAppEventEmitter
} from 'react-native'
import BaseComponent from '../base/BaseComponent'
import {Button as NBButton} from 'native-base'
import IonIcon from 'react-native-vector-icons/Ionicons'
import {connect} from 'react-redux'
import * as HomeActions from '../actions/Home'
import Spinner from '../components/Spinner'
import AnnouncementDetail from '../pages/AnnouncementDetail'
import Addannouncement from '../pages/Addannouncement'
import UserInfo from '../pages/UserInfo'
import {URL_DEV, LOCATION_TIME_OUT} from '../constants/Constant'
import tmpGlobal from '../utils/TmpVairables'
import {toastShort} from '../utils/ToastUtil'
import PhotoScaleViewer from '../components/PhotoScaleViewer'
import ModalBox from 'react-native-modalbox'
import SubTabView from '../components/SubTabView'
import ActionSheet from 'react-native-actionsheet'
import AnnouncementList from '../pages/AnnouncemenetList'
import * as VicinityActions from '../actions/Vicinity'
import JPushModule from 'jpush-react-native'
import Refresh from '../components/Refresh'
import customTheme from '../themes/MyThemes'
import pxToDp from '../utils/PxToDp'
import {ComponentStyles, CommonStyles} from '../style'

const {height, width} = Dimensions.get('window');

const styles = StyleSheet.create({
  gpsTips: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,0,0.7)',
    padding: pxToDp(20)
  },
  tipsContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tipsText: {
    fontSize: pxToDp(24),
    textAlign: 'center',
    flex: 1,
    flexWrap: 'wrap'
  },
  listView: {
    flex: 1
  },
  contentTitle: {
    margin: pxToDp(20)
  },
  content: {
    flex: 1
  },
  card: {
    backgroundColor: '#FFF',
    flex: 1,
    marginTop: pxToDp(20),
    marginHorizontal: pxToDp(20),
    paddingVertical: pxToDp(20),
    borderRadius: pxToDp(8)
  },
  cardRow: {
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: pxToDp(20)
  },
  avatarImg: {
    width: pxToDp(80),
    height: pxToDp(80),
    marginRight: pxToDp(20),
    borderRadius: pxToDp(16)
  },
  userInfo: {
    justifyContent: 'space-between',
    flex: 1
  },
  userInfoLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  userInfoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: pxToDp(20),
    backgroundColor: 'pink',
    borderWidth: 1,
    borderColor: 'pink',
    paddingHorizontal: pxToDp(12)
  },
  userInfoIcon: {
    marginRight: pxToDp(8),
    color: '#FFF'
  },
  userInfoText: {
    fontSize: pxToDp(20),
    color: '#FFF'
  },
  nameTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  nameText: {
    overflow: 'hidden',
    flex: 1,
    flexWrap: 'nowrap'
  },
  timeText: {
    fontSize: pxToDp(24),
    justifyContent: 'center'
  },
  moodView: {
    marginTop: pxToDp(20)
  },
  moodText: {
    fontSize: pxToDp(32),
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    paddingHorizontal: pxToDp(20),
    marginBottom: pxToDp(20)
  },
  postImage: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingLeft: pxToDp(20)
  },
  cardBtn: {
    marginTop: pxToDp(20),
    marginRight: pxToDp(40)
  },
  moreImgLabel: {
    position: 'absolute',
    top: pxToDp(8),
    right: pxToDp(8),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    paddingHorizontal: pxToDp(4)
  },
  moreImgIcon: {},
  moreImgText: {
    fontSize: pxToDp(20),
    marginLeft: pxToDp(8)
  },
  singleImgContainer: {
    marginBottom: pxToDp(20),
    marginRight: pxToDp(20)
  },
  refreshScreen: {
    ...Platform.select({
      ios: {
        top: 64,
        height: height - 64 - pxToDp(97)
      },
      android: {
        top: 54,
        height: height - 54 - pxToDp(97)
      }
    }),
    position: 'absolute',
    left: 0,
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  refreshBtn: {
    paddingHorizontal: pxToDp(20),
    paddingVertical: pxToDp(10),
    borderRadius: pxToDp(8),
    borderColor: 'gray',
    borderWidth: 1
  },
  commentContainer: {
    flexDirection: 'row',
    padding: pxToDp(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F3F3',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: pxToDp(8),
    paddingHorizontal: pxToDp(20),
    flexWrap: 'wrap',
    height: pxToDp(80)
  },
  sendBtn: {
    width: pxToDp(200),
    marginLeft: pxToDp(20),
    height: pxToDp(80)
  },
  closeBtn: {
    position: 'absolute',
    left: pxToDp(40),
    top: pxToDp(40),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: pxToDp(40)
  },
});

let pageNavigator;
let commentId;
let lastCount = null, appointmentCount = null;
let emitter;

const buttons = ['取消', '发聚会', '发约会'];
const CANCEL_INDEX = 0;
const DESTRUCTIVE_INDEX = 3;

class Home extends BaseComponent {

  constructor(props) {
    super(props);
    pageNavigator = this.props.navigator;
    emitter = Platform.OS === 'ios' ? NativeAppEventEmitter : DeviceEventEmitter;
    this.state = {
      pending: false,
      gpsStatus: this.props.gpsStatus,
      tipsText: '请在设置中打开高精确度定位,然后点此重试',
      tabIndex: 0,
      refreshing: false,
      appointmentRefreshing: false,
      loadingMore: false,
      appointmentLoadingMore: false,
      pageSize: 10,
      pageIndex: 1,
      appointmentPageSize: 10,
      appointmentPageIndex: 1,
      postList: [],//聚会列表
      appointmentList: [],//约会列表
      comment: '',
      appointmentComment: '',
      viewMarginBottom: new Animated.Value(0),
      showCommentInput: false,
      imgLoading: true,
      appointmentImgLoading: true,
      showIndex: 0,
      appointmentShowIndex: 0,
      imgList: [],
      appointmentImgList: [],
      commentInputHeight: 0,
      appointmentCommentInputHeight: 0,
    };

    this._commonRefresh = this._commonRefresh.bind(this);
    this._handleInputHeight = this._handleInputHeight.bind(this);
  }

  componentWillMount() {
    InteractionManager.runAfterInteractions(() => {
      this._getAnnouncementList();
    });
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
  }

  _getAnnouncementList() {
    const {dispatch}=this.props;
    let data = {
      pageSize: this.state.pageSize,
      pageIndex: this.state.pageIndex,
      ...tmpGlobal.currentLocation,
      postType: 1
    };
    dispatch(HomeActions.getPostList(data, (json) => {
      lastCount = json.Result.length;
      let params = {
        pageSize: this.state.appointmentPageSize,
        pageIndex: this.state.appointmentPageIndex,
        ...tmpGlobal.currentLocation,
        postType: 2
      };
      //获取约会列表
      dispatch(HomeActions.getPostList(params, (json2) => {
        appointmentCount = json2.Result.length;
        this.setState({
          postList: json.Result,
          appointmentList: json2.Result,
          needRefresh: false
        });
      }, (error2) => {
        this.setState({
          needRefresh: true
        }, () => {
          this._commonRefresh = () => {
            this._getAnnouncementList();
          }
        });
      }));
    }, (error) => {
      this.setState({
        needRefresh: true
      }, () => {
        this._commonRefresh = () => {
          this._getAnnouncementList();
        }
      });
    }));
  }

  _loadMoreData() {
    console.log('加载更多');
    const {dispatch} = this.props;
    if (this.state.tabIndex === 0) {
      this.setState({loadingMore: true});
      this.state.pageIndex += 1;
    } else {
      this.setState({appointmentLoadingMore: true});
      this.state.appointmentPageIndex += 1;
    }
    const data = {
      pageSize: this.state.tabIndex === 0 ? this.state.pageSize : this.state.appointmentPageSize,
      pageIndex: this.state.tabIndex === 0 ? this.state.pageIndex : this.state.appointmentPageIndex,
      ...tmpGlobal.currentLocation,
      postType: this.state.tabIndex + 1
    };

    dispatch(HomeActions.getPostList(data, (json) => {
      if (this.state.tabIndex === 0) {
        lastCount = json.Result.length;
        this.state.postList = this.state.postList.concat(json.Result);
        this.setState({
          ...this.state.postList,
          refreshing: false,
          loadingMore: false,
        })
      } else {
        appointmentCount = json.Result.length;
        this.state.appointmentList = this.state.appointmentList.concat(json.Result);
        this.setState({
          ...this.state.appointmentList,
          appointmentRefreshing: false,
          appointmentLoadingMore: false,
        })
      }
    }, (error) => {

    }));
  }

  _onRefresh() {
    const {dispatch}=this.props;
    if (this.state.tabIndex === 0) {
      this.setState({
        refreshing: true,
        pageIndex: 1
      });
    } else {
      this.setState({
        appointmentRefreshing: true,
        appointmentPageIndex: 1
      });
    }

    const data = {
      pageSize: this.state.tabIndex === 0 ? this.state.pageSize : this.state.appointmentPageSize,
      pageIndex: 1,
      ...tmpGlobal.currentLocation,
      postType: this.state.tabIndex + 1
    };
    dispatch(HomeActions.getPostListQuiet(data, (json) => {
      if (this.state.tabIndex === 0) {
        lastCount = json.Result.length;
        this.setState({
          postList: json.Result,
          refreshing: false,
          needRefresh: false,
        });
      } else {
        appointmentCount = json.Result.length;
        this.setState({
          appointmentList: json.Result,
          appointmentRefreshing: false,
          needRefresh: false,
        });
      }
    }, (error) => {
      this.setState({
        needRefresh: true
      }, () => {
        this._commonRefresh = () => {
          this._getAnnouncementList();
        }
      });
      if (this.state.tabIndex === 0) {
        this.setState({
          refreshing: false
        });
      } else {
        this.setState({
          appointmentRefreshing: false
        });
      }
    }));
  }

  componentDidMount() {
    this.hasReadListener = emitter.addListener('announcementHasRead', (data) => {
      InteractionManager.runAfterInteractions(() => {
        this._changeSubTab(data.data);
      });
    });
    this.hasDeleteListener = emitter.addListener('announcementHasDelete', (data) => {
      InteractionManager.runAfterInteractions(() => {
        this._changeSubTab(data.data);
      });
    });
    this.publishListener = emitter.addListener('announcementHasPublish', (data) => {
      InteractionManager.runAfterInteractions(() => {
        this._changeSubTab(data.data);
      });
    });
    this.commentListener = emitter.addListener('announcementHasComment', (data) => {
      InteractionManager.runAfterInteractions(() => {
        this._changeSubTab(data.data);
      });
    });

    if (Platform.OS === 'android') {

      JPushModule.initPush();

      JPushModule.getRegistrationID((id) => {
        console.log(id);
      });

      let alias = `${tmpGlobal.currentUser.UserId}`;

      this._setAlias(alias);

      JPushModule.addGetRegistrationIdListener((registrationId) => {
        console.log("Device register succeed, registrationId " + registrationId);
      });

      JPushModule.addReceiveCustomMsgListener((message) => {
        console.log(message);
      });
      JPushModule.addReceiveNotificationListener((message) => {
        console.log("receive notification: ", message);
      });

      JPushModule.addReceiveOpenNotificationListener((map) => {
        console.log("Opening notification!", map);
        //自定义点击通知后打开某个 Activity，比如跳转到 pushActivity
        /*pageNavigator.push({
         component: Settings,
         name: "Settings"
         });*/
      });
    } else {

      JPushModule.setupPush();

      let alias = `${tmpGlobal.currentUser.UserId}`;

      this._setAlias(alias);

      JPushModule.setBadge(0, (value) => {
        console.log(value);
      });

      emitter.addListener('OpenNotification', (message) => {
        console.log("Opening notification!", message);
      });

      emitter.addListener('ReceiveNotification', (message) => {
        console.log("content: " + JSON.stringify(message));
        console.log('具体消息内容: ', message.aps.alert);
        JPushModule.setBadge(message.aps.badge, (value) => {
          console.log(value ? '成功' : '失败');
        });
      });

    }
  }

  _setAlias(alias){
    JPushModule.setAlias(alias, () => {
      console.log('成功', alias);
    }, () => {
      console.log('失败');
      this._setAlias(alias);
    });
  }

  _changeSubTab(index) {
    this.setState({tabIndex: index}, () => {
      this._onRefresh();
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.gpsStatus && this.props.gpsStatus !== nextProps.gpsStatus) {
      this.setState({
        gpsStatus: true,
      });
      this._onRefresh();
    } else {

    }
  }

  componentWillUnmount() {
    this.hasReadListener.remove();
    this.hasDeleteListener.remove();
    this.publishListener.remove();
    this.commentListener.remove();
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
    emitter.removeAllListeners();
    if (Platform.OS === 'android') {
      JPushModule.removeReceiveCustomMsgListener();
      JPushModule.removeReceiveNotificationListener();
      JPushModule.removeReceiveOpenNotificationListener();
      JPushModule.removeGetRegistrationIdListener("getRegistrationId");
    }
  }

  //因为在MainContainer中在ScrollableTabView外层包裹了一个View,所以这里的keyboardWillShow、keyboardWillHide失效,只能用keyboardDidShow及keyboardDidHide监听键盘事件
  //https://github.com/skv-headless/react-native-scrollable-tab-view/issues/500
  //ScrollableTabView并不强制要求作为根节点使用。(如果作为根节点使用,在安卓设备上,弹出键盘时,底部tabBar会跟随上滑)
  _keyboardDidShow(e) {
    Animated.timing(
      this.state.viewMarginBottom,
      {
        toValue: e.endCoordinates.height - pxToDp(97),
        duration: 10,
      }
    ).start();
  }

  _keyboardDidHide() {
    this._resetScrollTo();
  }

  getNavigationBarProps() {
    return {
      title: '广场',
      hideRightButton: false,
      rightIcon: {
        name: 'plus',
        size: pxToDp(36)
      },
      leftIcon: {
        name: 'bars',
        size: pxToDp(36)
      }
    };
  }

  onLeftPressed() {
    this.props.menuChange(true);
  }

  onRightPressed() {
    this._closeCommentInput();
    this.ActionSheet.show();
  }

  //点击actionSheet
  _actionSheetPress(index) {
    if (index === 2) {
      this._canPost(2);
    } else if (index === 1) {
      this._canPost(1);
    }
  }

  //检查是否有未过期的聚会/约会
  _canPost(int) {
    const {dispatch}=this.props;
    let data = {
      postType: int
    };
    dispatch(HomeActions.newPost(data, (json) => {
      if (json.Result.CanPost) {
        pageNavigator.push({
          component: Addannouncement,
          name: 'Addannouncement',
          params: {
            title: int === 1 ? '发布新聚会' : '发布新约会',
            postType: int
          }
        });
      } else {
        this._newPostAlert(int);
      }
    }, (error) => {
    }));
  }

  //前往我的历史公告列表(包含聚会和约会)
  _goAnnouncementList() {
    pageNavigator.push({
      component: AnnouncementList,
      name: 'AnnouncementList',
      params: {
        targetUserId: tmpGlobal.currentUser.UserId,
        Nickname: tmpGlobal.currentUser.Nickname
      }
    });
  }

  _newPostAlert(int) {
    Alert.alert('提示', '可发布的未过期的动态数量已达上限', [
      {
        text: `查看历史${int === 1 ? '聚会' : '约会'}`, onPress: () => {
        this._goAnnouncementList();
      }
      },
      {
        text: '关闭', onPress: () => {
      }
      }
    ]);
  }

  //点击头像和名字,跳转个人信息详情页
  _goUserInfo(data) {
    this._closeCommentInput();
    pageNavigator.push({
      component: UserInfo,
      name: 'UserInfo',
      params: {
        Nickname: data.Nickname,
        UserId: data.UserId,
        isSelf: tmpGlobal.currentUser.UserId === data.UserId,
      }
    });
  }

  //点赞/取消赞(不论是否已赞,点赞取消赞,isLike都传true,isLike可能的值null,true,false)
  _doLike(id, isLike) {
    this._closeCommentInput();
    const {dispatch}=this.props;
    let index = this.state.postList.findIndex((item) => {
      return item.Id === id;
    });

    let appointmentIndex = this.state.appointmentList.findIndex((item) => {
      return item.Id === id;
    });
    if (this.state.tabIndex === 0) {
      if (isLike === null) {
        this.state.postList[index].LikeCount += 1;
        this.state.postList[index].AmILikeIt = true;
      } else {
        this.state.postList[index].LikeCount -= 1;
        this.state.postList[index].AmILikeIt = null;
      }
    } else {
      if (isLike === null) {
        this.state.appointmentList[appointmentIndex].LikeCount += 1;
        this.state.appointmentList[appointmentIndex].AmILikeIt = true;
      } else {
        this.state.appointmentList[appointmentIndex].LikeCount -= 1;
        this.state.appointmentList[appointmentIndex].AmILikeIt = null;
      }
    }

    const data = {
      postId: id,
      isLike: true
    };
    dispatch(HomeActions.like(data, (json) => {
      if (this.state.tabIndex === 0) {
        this.setState({
          postList: [
            ...this.state.postList
          ]
        });
      } else {
        this.setState({
          appointmentList: [
            ...this.state.appointmentList
          ]
        });
      }

    }, (error) => {
    }));
  }

  _showCommentInput(id) {
    //保存当前要评论的广告id
    commentId = id;
    this.setState({
      showCommentInput: true
    });
  }

  _closeCommentInput() {
    this.setState({
      showCommentInput: false,
      comment: '',
      commentInputHeight: 0
    });
  }

  //前往公告详情(先判断是否是本人发布的动态,然后获取公告详情和评论列表)
  _goAnnouncementDetail(rowData) {
    this._closeCommentInput();
    pageNavigator.push({
      component: AnnouncementDetail,
      name: 'AnnouncementDetail',
      params: {
        Id: rowData.Id,
        isSelf: tmpGlobal.currentUser.UserId === rowData.CreaterId,
        PostType: this.state.tabIndex + 1
      }
    });
  }

  _openImgModal(arr, index) {
    let tmpArr = [];
    for (let i = 0; i < arr.length; i++) {
      tmpArr.push(URL_DEV + '/' + arr[i]);
    }
    this.setState({
      imgList: tmpArr,
      showIndex: index,
    }, () => {
      this.refs.modalFullScreen.open();
    });
  }

  _closeImgModal() {
    this.refs.modalFullScreen.close();
  }

  _commonRefresh = () => {
    //调用时,重新绑定事件
  };

  //发送评论
  _sendComment() {
    //发送评论,并给当前广告评论数加一
    const {dispatch}=this.props;
    let data = {
      postId: commentId,
      forCommentId: null,
      comment: this.state.comment
    };

    //关闭评论输入框,并清空评论框内容
    this._closeCommentInput();

    if (this.state.tabIndex === 0) {
      let index = this.state.postList.findIndex((item) => {
        return item.Id === commentId;
      });
      this.state.postList[index].CommentCount += 1;
    } else {
      let index = this.state.appointmentList.findIndex((item) => {
        return item.Id === commentId;
      });
      this.state.appointmentList[index].CommentCount += 1;
    }

    dispatch(HomeActions.comment(data, (json) => {
      toastShort('评论成功');
      if (this.state.tabIndex === 0) {
        this.setState({
          postList: [
            ...this.state.postList
          ]
        });
      } else {
        this.setState({
          appointmentList: [
            ...this.state.appointmentList
          ]
        });
      }
    }, (error) => {
    }));
  }

  _resetScrollTo() {
    Animated.timing(
      this.state.viewMarginBottom,
      {
        toValue: 0,
        duration: 10,
      }
    ).start();
  }

  //多行评论输入框增加最大高度限制
  _handleInputHeight(event) {
    this.setState({
      comment: event.nativeEvent.text,
      commentInputHeight: Math.min(event.nativeEvent.contentSize.height, pxToDp(160))
    })
  }

  _renderCommentInputBar() {
    if (this.state.showCommentInput) {
      return (
        <Animated.View
          style={[styles.commentContainer, {
            marginBottom: this.state.viewMarginBottom
          }]}>
          <TextInput
            ref={'comment'}
            multiline={true}
            style={[styles.commentInput, {
              height: Math.max(pxToDp(80), this.state.commentInputHeight)
            }]}
            underlineColorAndroid={'transparent'}
            placeholder={'请输入回复'}
            maxLength={50}
            onChange={this._handleInputHeight}
            value={this.state.comment}/>
          <View>
            <NBButton
              theme={customTheme}
              primary
              textStyle={ComponentStyles.btnText}
              style={styles.sendBtn}
              onPress={() => {
                this._sendComment()
              }}>
              发送
            </NBButton>
          </View>
        </Animated.View>
      )
    } else {
      return null
    }
  }

  //顶部tab切换完成后才会触发此方法,如果切换tab时下拉刷新,速度过快,会出现加载指示器不消失的bug
  _handleChangeTab(index) {
    this._closeCommentInput();
    this.setState({
      tabIndex: index
    });
  }

  _renderLocationTips(data) {
    if (data) {
      return null;
    } else {
      return (
        <TouchableHighlight
          onPress={() => {
            this.refreshPage()
          }}
          underlayColor={'rgba(214,214,14,0.7)'}
          style={styles.gpsTips}>
          <View style={styles.tipsContent}>
            <Text style={styles.tipsText}>{this.state.tipsText}</Text>
          </View>
        </TouchableHighlight>
      )
    }
  }

  getPosition() {
    console.log('定位开始');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this._positionSuccessHandler(position);
      },
      (error) => {
        console.log(error);
        this._positionErrorHandler(error);
      },
      {enableHighAccuracy: false, timeout: LOCATION_TIME_OUT, maximumAge: 5000}
    );
  }

  refreshPage() {
    this.setState({
      pending: true,
      gpsStatus: false,
      tipsText: '正在获取您的位置信息'
    });
    this.getPosition();
  }

  _positionSuccessHandler(position) {
    tmpGlobal.currentLocation = {
      Lat: position.coords.latitude,
      Lng: position.coords.longitude
    };
    console.log('定位成功');
    this.setState({
      pending: false,
      gpsStatus: true
    }, () => {
      this._onRefresh();
      this._savePosition(position.coords.latitude, position.coords.longitude);
    });
  }

  _positionErrorHandler(error) {
    let index = this._errorCodeHandler(error, Platform.OS);
    this.setState({
      pending: false,
      gpsStatus: false,
      tipsText: this._tipsTextHandler(index, Platform.OS)
    });
  }

  _savePosition(lat, lng) {
    const {dispatch}=this.props;
    dispatch(VicinityActions.saveCoordinate({Lat: lat, Lng: lng}));
  }

  _tipsTextHandler(index, osType) {
    switch (index) {
      case 1:
        return osType === 'ios' ? '请前往设置->隐私->觅友 Meet U->允许访问位置信息改为始终,然后点此获取位置信息' : '请在设置中开启位置服务,并选择高精确度,然后点此获取位置信息';
      case 2:
        return osType === 'ios' ? '定位失败,点此重试' : '定位失败,点此重试';
      case 3:
        return osType === 'ios' ? '定位失败,点此重试' : '定位失败,点此重试';
      case 4://特殊处理的iOS错误码,表明虽然开启的定位服务,但是没有给本APP权限
        return '请前往设置->隐私->定位服务->开启->觅友 Meet U->始终,然后点此获取位置信息';
      default:
        return '定位失败,点此重试';
    }
  }

  _errorCodeHandler(error, osType) {
    if (osType === 'android' && '"No available location provider."' === JSON.stringify(error)) {
      return 1;
    } else if (osType === 'ios' && error.code === 2 && error.message === 'Location services disabled.') {
      return 4;
    }
    return error.code;
  }

  renderBody() {
    return (
      <View
        ref={'root'}
        style={ComponentStyles.container}>
        <SubTabView
          locationTips={() => this._renderLocationTips(this.state.gpsStatus)}
          index={this.state.tabIndex}
          tabIndex={this._handleChangeTab.bind(this)}
          _goUserInfo={this._goUserInfo.bind(this)}
          _goAnnouncementDetail={this._goAnnouncementDetail.bind(this)}
          refreshing={this.state.refreshing}
          appointmentRefreshing={this.state.appointmentRefreshing}
          pageSize={this.state.pageSize}
          pageIndex={this.state.pageIndex}
          appointmentPageSize={this.state.appointmentPageSize}
          appointmentPageIndex={this.state.appointmentPageIndex}
          postList={this.state.postList}
          appointmentList={this.state.appointmentList}
          _loadMoreData={this._loadMoreData.bind(this)}
          lastCount={lastCount}
          appointmentCount={appointmentCount}
          _doLike={this._doLike.bind(this)}
          _showCommentInput={this._showCommentInput.bind(this)}
          _closeCommentInput={this._closeCommentInput.bind(this)}
          _onRefresh={this._onRefresh.bind(this)}
          _openImgModal={this._openImgModal.bind(this)}/>
        <ActionSheet
          ref={(o) => this.ActionSheet = o}
          title="请选择你的操作"
          options={buttons}
          cancelButtonIndex={CANCEL_INDEX}
          destructiveButtonIndex={DESTRUCTIVE_INDEX}
          onPress={this._actionSheetPress.bind(this)}
        />
        {this._renderCommentInputBar()}
      </View>
    )
  }

  renderModal() {
    return (
      <ModalBox
        style={{
          position: 'absolute',
          width: width,
          height: height - pxToDp(97),
          backgroundColor: 'rgba(40,40,40,0.8)',
        }}
        backButtonClose={true}
        position={"center"}
        ref={"modalFullScreen"}
        swipeToClose={true}
        onClosingState={this.onClosingState}>
        <PhotoScaleViewer
          index={this.state.showIndex}
          pressHandle={() => {
            console.log('你点击了图片,此方法必须要有,否则不能切换下一张图片')
          }}
          imgList={this.state.imgList}/>
        <TouchableOpacity
          style={[styles.closeBtn]}
          onPress={() => {
            this._closeImgModal()
          }}>
          <IonIcon
            name={'ios-close-outline'}
            size={pxToDp(88)}
            color={'#fff'}
            style={{fontWeight: '100'}}/>
        </TouchableOpacity>
      </ModalBox>
    )
  }

  renderRefreshBtn() {
    if (this.state.needRefresh) {
      return (
        <Refresh
          text={'点击重试'}
          refresh={() => {
            this._commonRefresh()
          }}
        />
      )
    } else {
      return null
    }
  }

  renderSpinner() {
    if (this.props.pendingStatus || this.state.pending) {
      return (
        <Spinner animating={this.props.pendingStatus || this.state.pending}/>
      )
    }
  }
}

export default connect((state) => {
  return {
    ...state,
    pendingStatus: state.InitialApp.pending
  }
})(Home)