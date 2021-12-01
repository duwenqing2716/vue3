import { request } from './request.js'
//获取用户详情
export const getUserDetail = (uid,timerstamp) => {
	return request({
		url:'/user/detail',
		params:{
			uid,
			timerstamp
		}
	})
}
//获取账号信息
export const getUserCount = (timerstamp) => {
	return request({
		url:'/user/account',
		// withCredentials: true,
		params:{
			timerstamp
		}
	})
}
//获取用户信息 , 歌单，收藏，mv, dj 数量
export const getUserSubcount = () => {
	return request({
		url:'/user/subcount'
	})
}
//获取用户等级信息
export const getUserLevel = () => {
	return request({
		url:'/user/level'
	})
}
//获取用户绑定信息
export const getUserBinding = uid => {
	return request({
		url:'/user/binding',
		params:{
			uid
		}
	})
}
//用户绑定手机
export const replacePhone = (phone,oldcaptcha,captcha) => {
	return request({
		url:'/user/replacephone',
		params:{
			phone,
			oldcaptcha,
			captcha
		}
	})
}
//更新修改用户信息
export const updatedInfoMsg = (gender,signature,city,nickname,birthday,province) => {
	return request({
		url:'/user/update',
		params:{
			gender,
			signature,
			city,
			nickname,
			birthday,
			province
		}
	})
}

//更新修改用户头像
// 说明 : 登录后调用此接口,使用'Content-Type': 'multipart/form-data'上传图片formData(name为'imgFile'),可更新头像

export const updatedAvatar = (imgSize,imgX,imgY,timestamp,data) => {
	return request({
		method: 'post',
		url:'/avatar/upload',
		params:{
			imgSize,
			imgX,
			imgY,
			timestamp
		},
		headers: {
		  'Content-Type': 'multipart/form-data',
		},
		data
	})
}
//传入用户 id, 可获取用户播放记录
export const getRecord = (uid,type) => {
	return request({
		url:'/user/record',
		params:{
			uid,
			type
		}
	})
}
//登录后调用此接口 , 传入用户 id, 和操作 t,可关注/取消关注用户
// 1为关注,其他为取消关注
export const userFollowed = (id,t,timerstamp) => {
	return request({
		url:'/follow',
		params:{
			id,
			t,
			timerstamp
		}
	})
}
//
export const userPlayList = (uid,limit,offset,timerstamp) => {
	return request({
		url:'/user/playlist',
		params:{
			uid,
			limit,
			offset,
			timerstamp,
		}
	})
}