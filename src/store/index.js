import { createStore } from 'vuex'
import { getItem,setItem,removeItem } from './storage.js'

const SEARCH_KEY = 'search-songs'

export default createStore({
  state: {
		user:getItem(SEARCH_KEY),
		userData:{},
		nickname: '',
		uid: null,
		cookie: null,
		isLogin:false,
		follows:{}
  },
  mutations: {
		//搜索历史存储
		setSongs(state,data){
			state.user = data
			setItem(USER_KEY,state.user)
		},
		//用户数据存储
		addUserData(state,data){
			state.userData = data
			state.nickname = data.profile.nickname
			state.uid = data.profile.userId;
			state.cookie = data.cookie;
		},
		//改变登录状态 移除本地存储数据
		changeLoginStatus(state,payload){
			state.isLogin = payload
			setItem('cloudMusicStatus',payload)
		}
  },
  getters: {
		//获取vuex中的cookie
		getCookie(state){
		  if(getItem('cloudMusicCookie')){
		    state.cookie = getItem('cloudMusicCookie');
		  }
		  return state.cookie;
		},
		//获取vuex中的uid
		getUserId(state){
		  if(getItem('cloudMusicUserId')){
		    state.uid = getItem('cloudMusicUserId');
		  }
		  return state.uid
		},
		//获取vuex中的nickname
		getNickname(state){
		  if(getItem('cloudMusicNickname')){
		    state.nickname = getItem('cloudMusicNickname');
		  }
		  return state.nickname
		},
		//获取vuex中的头像
		getAvatar(state){
		  let avatar='';
		  if(getItem('cloudMusicAvatar')){
		    avatar = getItem('cloudMusicAvatar');
		    return avatar;
		  }
		  avatar = state.userData && state.userData.profile.avatarUrl;
		  return avatar;
		},
		//获取vuex中的登录状态
		getLoginStatus(state){
			if(getItem('cloudMusicStatus')){
			  state.isLogin = getItem('cloudMusicStatus');
			}
			return state.isLogin
		}
  },
	actions:{
	},
  modules: {
  }
})
