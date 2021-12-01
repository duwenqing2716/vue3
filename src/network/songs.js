import { request } from './request.js'
//取歌单详情动态部分,如评论数,是否收藏,播放数
export const dynamicInfo = id => {
	return request({
		url:'/playlist/detail/dynamic',
		params:{
			id
		}
	})
}
//获取歌单详情
export const detailInfo = (id,timerstamp) => {
	return request({
		url:'/playlist/detail',
		params:{
			id,
			timerstamp
		}
	})
}
//获取歌曲详情
export const detailSongs = ids => {
	return request({
		url:'/song/detail',
		params:{
			ids
		}
	})
}
//传入音乐 id, 可喜欢该音乐
export const likeSongs = params => {
	return request({
		url:'/like',
		params
	})
}
//传入用户 uid, 可获取已喜欢音乐id列表(id数组)
export const likeSongsList = (uid,timerstamp) => {
	return request({
		url:'/likelist',
		params:{
			uid,
			timerstamp
		}
	})
}
//传入类型和歌单 id 可收藏歌单或者取消收藏歌单 1:收藏,2:取消收藏
export const userSubscribe = (t,id,timerstamp) => {
	return request({
		url:'/playlist/subscribe',
		params:{
			t,
			id,
			timerstamp
		}
	})
}
//传入歌单 id 可获取歌单的所有收藏者
export const allSubscribe = (id,limit,offset) => {
	return request({
		url:'/playlist/subscribers',
		params:{
			id,
			limit,
			offset
		}
	})
}
//传入 type, 资源 id 可获得对应资源热门评论 ( 不需要登录 )
// 0: 歌曲 1: mv 2: 歌单 3: 专辑 4: 电台 5: 视频
export const hotComment = (id,type,limit,offset,timerstamp) => {
	return request({
		url:'/comment/hot',
		params:{
			id,
			type,
			limit,
			offset,
			timerstamp
		}
	})
}
// 传入资源类型和资源id,以及排序方式,可获取对应资源的新评论
//sortType: 排序方式,1:按推荐排序,2:按热度排序,3:按时间排序
//cursor: 当sortType为3时且页数不是第一页时需传入,值为上一条数据的time
export const newComment = (id,type,pageNo,pageSize,sortType,timerstamp) => {
	return request({
		url:'/comment/new',
		params:{
			id,
			type,
			pageNo,
			pageSize,
			sortType,
			timerstamp
		}
	})
}
//传入 type, 资源 id, 和评论 id cid 和 是否点赞参数 t 即可给对 应评论点赞 ( 需要登录 )
export const likeComment = params => {
	return request({
		url:'/comment/like',
		params
	})
}
//可发送评论或者删除评论 t:1 发送, 2 回复
export const sendComment = params => {
	return request({
		url:'/comment',
		params
	})
}
//传入资源 parentCommentId 和资源类型 type和资源id 参数, 可获得该资源的歌曲楼层评论
export const parentComment = (parentCommentId,id,type,limit,timerstamp) => {
	return request({
		url:'/comment/floor',
		params:{
			parentCommentId,
			id,
			type,
			limit,
			timerstamp
		}
	})
}
//传入音乐 id 和 limit 参数 , 可获得该歌单的所有评论 ( 不需要 登录 )
export const playlistComment = (id,limit,offset,timerstamp) => {
	return request({
		url:'/comment/playlist',
		params:{
			id,
			limit,
			offset,
			timerstamp
		}
	})
}
//传入歌单名字可新建歌单 默认否，传'10'则设置成隐私歌单 
export const createPlaylist = (name,privacy) => {
	return request({
		url:'/playlist/create',
		params:{
			name,
			privacy
		}
	})
}
//传入歌单id可删除歌单
export const deletePlaylist = (id,timerstamp) => {
	return request({
		url:'/playlist/delete',
		params:{
			id,
			timerstamp
		}
	})
}