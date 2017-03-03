/**
 *
 * @author keyy/1501718947@qq.com 17/1/4 15:50
 * @description
 */
import React, {Component} from 'react'
import {
  Dimensions,
  StyleSheet,
  ScrollView,
  View,
  Image,
  Text,
  TouchableOpacity,
  TouchableHighlight
} from 'react-native'
import {URL_DEV} from '../constants/Constant'
import Icon from 'react-native-vector-icons/FontAwesome'
import {CommonStyles, StyleConfig} from '../style'

const window = Dimensions.get('window');

const styles = StyleSheet.create({
  menu: {
    flex: 1,
    width: window.width,
    height: window.height,
    backgroundColor: StyleConfig.color_primary
  },
  userInfoContainer: {
    padding: 20,
    paddingRight: 40//menu的宽度加宽了20,避免切换时出现白色缝隙
  },
  avatarContainer: {
    marginBottom: 20,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  name: {
    marginHorizontal: 10,
    flexWrap: 'wrap',
    flex: 1,
    fontSize: 16,
    overflow: 'hidden'
  },
  signatureContent: {
    flexWrap: 'nowrap',
    flexDirection: 'row',
  },
  listItemContainer: {
    backgroundColor: '#E9E9E9'
  },
  item: {
    fontSize: 14,
    fontWeight: '300',
    paddingTop: 5,
  },
  listItem: {},
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60
  },
  iconContainer: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemText: {
    fontSize: 16
  },
});

class Menu extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={[styles.menu, {width: this.props.openMenuOffset + 20}]}>
        <View style={styles.userInfoContainer}>
          <View style={[styles.avatarContainer]}>
            <Image
              style={styles.avatar}
              source={{uri: URL_DEV + this.props.userInfo.PhotoUrl}}/>
            <Text
              numberOfLines={1}
              style={styles.name}>{this.props.userInfo.Nickname}</Text>
          </View>
          <TouchableOpacity
            style={styles.signatureContent}
            onPress={() => {
              this.props.goSignature()
            }}>
            <Text
              numberOfLines={1}>{this.props.userInfo.PersonSignal ? this.props.userInfo.PersonSignal : '点击编辑个性签名'}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView scrollsToTop={false} style={styles.listItemContainer}>
          <View style={styles.listItem}>
            <TouchableHighlight
              onPress={() => {
                this.props.goAlbum()
              }}
              underlayColor={'#FFF'}>
              <View style={styles.itemContainer}>
                <View style={styles.iconContainer}>
                  <Icon name={'picture-o'} size={20} color={StyleConfig.color_primary}/>
                </View>
                <Text style={styles.itemText}>{'相册'}</Text>
              </View>
            </TouchableHighlight>
          </View>
          <View style={styles.listItem}>
            <TouchableHighlight
              onPress={() => {
                this.props.goUserInfo()
              }}
              underlayColor={'#FFF'}>
              <View style={styles.itemContainer}>
                <View style={styles.iconContainer}>
                  <Icon name={'address-card-o'} size={20} color={StyleConfig.color_primary}/>
                </View>
                <Text style={styles.itemText}>{'个人资料'}</Text>
              </View>
            </TouchableHighlight>
          </View>
          <View style={styles.listItem}>
            <TouchableHighlight
              onPress={() => {
                this.props.goAccount()
              }}
              underlayColor={'#FFF'}>
              <View style={styles.itemContainer}>
                <View style={styles.iconContainer}>
                  <Icon name={'credit-card'} size={20} color={StyleConfig.color_primary}/>
                </View>
                <Text style={styles.itemText}>{'账户资料'}</Text>
              </View>
            </TouchableHighlight>
          </View>
          <View style={styles.listItem}>
            <TouchableHighlight
              onPress={() => {
                this.props.goGiftList()
              }}
              underlayColor={'#FFF'}>
              <View style={styles.itemContainer}>
                <View style={styles.iconContainer}>
                  <Icon name={'gift'} size={20} color={StyleConfig.color_primary}/>
                </View>
                <Text style={styles.itemText}>{'我的礼物'}</Text>
              </View>
            </TouchableHighlight>
          </View>
          <View style={styles.listItem}>
            <TouchableHighlight
              onPress={() => {
                this.props.goScore()
              }}
              underlayColor={'#FFF'}>
              <View style={styles.itemContainer}>
                <View style={styles.iconContainer}>
                  <Icon name={'star-o'} size={20} color={StyleConfig.color_primary}/>
                </View>
                <Text style={styles.itemText}>{'给好评(送觅豆)'}</Text>
              </View>
            </TouchableHighlight>
          </View>
          <View style={styles.listItem}>
            <TouchableHighlight
              onPress={() => {
                this.props.goSettings()
              }}
              underlayColor={'#FFF'}>
              <View style={styles.itemContainer}>
                <View style={styles.iconContainer}>
                  <Icon name={'wrench'} size={20} color={StyleConfig.color_primary}/>
                </View>
                <Text style={styles.itemText}>{'设置'}</Text>
              </View>
            </TouchableHighlight>
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default Menu;