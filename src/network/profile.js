import { request } from './request.js'
//退出登录
export const userLogout = () => {
	return request({
		url:'/logout'
	})
}
//获取用户粉丝列表
export const getUserFolloweds = params => {
	return request({
		url:'/user/followeds',
		params
	})
}
//获取用户动态
export const getUserEvents = params => {
	return request({
		url:'/user/event',
		params
	})
}
//获取用户关注列表
export const getUserFollows = params => {
	return request({
		url:'/user/follows',
		params
	})
}
//签到 默认 0, 其中 0 为安卓端签到 ,1 为 web/PC 签到
export const getUserSignin = type => {
	return request({
		url:'/daily_signin',
		params:{
			type
		}
	})
}
//获取已喜欢音乐id列表(id数组)
export const getUserLikeList = (uid,timerstamp) => {
	return request({
		url:'/likelist',
		params:{
			uid,
			timerstamp
		}
	})
}
//传入用户 id, 可以获取用户歌单
export const getUserPlaylist = (uid,timerstamp) => {
	return request({
		url:'/user/playlist',
		params:{
			uid,
			timerstamp
		}
	})
}