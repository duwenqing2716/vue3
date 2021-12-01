import { request } from './request.js'
//通知-私信
export const privateInfo = params => {
	return request({
		url:'/msg/private',
		params
	})
}
//通知-评论
export const privateComment = params => {
	return request({
		url:'/msg/comments',
		params
	})
}
//通知-@我
export const privateAtme = params => {
	return request({
		url:'/msg/forwards',
		params
	})
}
//通知-通知
export const privateNotice = params => {
	return request({
		url:'/msg/notices',
		params
	})
}