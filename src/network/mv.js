import { request } from './request.js'

//mv 地址
export const getMvUrl = (id,r) => {
	return request({
		url:'/mv/url',
		params:{
			id,
			r
		}
	})
}
//mv 数据
export const getMvData = (mvid,timerstamp) => {
	return request({
		url:'/mv/detail',
		params:{
			mvid,
			timerstamp
		}
	})
}
//获取 mv 点赞转发评论数数据
export const getMvDetailData = (mvid,timerstamp) => {
	return request({
		url:'/mv/detail/info',
		params:{
			mvid,
			timerstamp
		}
	})
}
//推荐mv
export const getRecommondVideo = offset => {
	return request({
		url:'/video/timeline/recommend',
		params:{
			offset
		}
	})
}
//相关mv
export const getRelatedVideo = id => {
	return request({
		url:'/related/allvideo',
		params:{
			id
		}
	})
}
//mv 评论
export const getMvComment = (id,limit,offset,timerstamp) => {
	return request({
		url:'/comment/mv',
		params:{
			id,
			limit,
			offset,
			timerstamp
		}
	})
}
//收藏/取消收藏 MV  1 为收藏,其他为取消收藏
export const subMv = (mvid,t,timerstamp) => {
	return request({
		url:'/mv/sub',
		params:{
			mvid,
			t,
			timerstamp
		}
	})
}
//资源点赞( MV,电台,视频)
export const getLikeResource = params => {
	return request({
		url:'/resource/like',
		params
	})
}
//收藏的 MV 列表
export const getMvList = timerstamp => {
	return request({
		url:'/mv/sublist',
		params:{
			timerstamp
		}
	})
}
//获取动态评论
export const getEventComment = (threadId,timerstamp) => {
	return request({
		url:'/comment/event',
		params:{
			threadId,
			timerstamp
		}
	})
}
//转发用户动态
export const getEventReport = (uid,evId,forwards) => {
	return request({
		url:'/event/forward',
		params:{
			uid,
			evId,
			forwards
		}
	})
}