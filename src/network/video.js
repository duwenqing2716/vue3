import { request } from './request.js'


//收藏/取消收藏 视频  1 为收藏,其他为取消收藏
export const subVideo = (id,t,timerstamp) => {
	return request({
		url:'/video/sub',
		params:{
			id,
			t,
			timerstamp
		}
	})
}
//获取视频播放地址
export const getVideoUrl = id => {
	return request({
		url:'/video/url',
		params:{
			id
		}
	})
}
//获取视频点赞转发评论数数据
export const getVideoDetailData = (vid,timerstamp) => {
	return request({
		url:'/video/detail/info',
		params:{
			vid,
			timerstamp
		}
	})
}
//视频详情
export const getVideoData = (id,timerstamp) => {
	return request({
		url:'/video/detail',
		params:{
			id,
			timerstamp
		}
	})
}
//视频评论
export const getVideoComment = (id,limit,offset,timerstamp) => {
	return request({
		url:'/comment/video',
		params:{
			id,
			limit,
			offset,
			timerstamp
		}
	})
}
//点赞过的视频列表
export const getVideoList = () => {
	return request({
		url:'/playlist/mylike'
	})
}
//将 mlog id 转为视频 id
export const getMlogId = id => {
	return request({
		url:'/mlog/to/video',
		params:{
			id
		}
	})
}