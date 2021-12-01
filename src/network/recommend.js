import { request } from './request.js'
//获取 banner( 轮播图 ) 数据
export const getBanneers = () => {
	return request({
		url:'/banner'
	})
}
//可获取推荐歌单 (未登录)
export const getRecommends = params => {
	return request({
		url:'/personalized',
		params
	})
}
//获得每日推荐歌单 ( 需要登录 )
export const getRecomdResource = () => {
	return request({
		url:'/recommend/resource'
	})
}
//获得每日推荐歌曲 ( 需要登录 )
export const getRecomdSongs = () => {
	return request({
		url:'/recommend/songs'
	})
}
//可获取推荐 mv
export const getPersonalMv = () => {
	return request({
		url:'/personalized/mv'
	})
}
//获取独家放送
export const getPersonalized = () => {
	return request({
		url:'/personalized/privatecontent'
	})
}
//获取推荐新音乐
export const getNewSong = limit => {
	return request({
		url:'/personalized/newsong',
		params:{
			limit
		}
	})
}

export const getDjProgram = () => {
	return request({
		url:'/personalized/djprogram'
	})
}