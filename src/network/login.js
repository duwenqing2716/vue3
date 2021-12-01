import { request } from './request.js'

// 二维码key生成接口
export const getQRCode = (p) => {
	return request({
		url:'/login/qr/key',
		params:{
		    timerstamp:p
		}
	})
}
// 二维码生成接口
export const getQRImage = (key,timerstamp,qrimg) => {
	return request({
		url:'/login/qr/create',
		params:{
			  key,
		    timerstamp
		}
	})
}
// 二维码检测扫码状态接口
export const checkImage = (key,timerstamp) => {
	return request({
		url:'/login/qr/check',
		params:{
			key,
			timerstamp
		}
	})
}
// 刷新登录
export const refreshLogin = (timerstamp) => {
	return request({
		url:'/login/refresh',
		params:{
		    timerstamp
		}
	})
}
// 检测手机号码是否已注册
export const registPhone = (phone) => {
	return request({
		url:'/cellphone/existence/check',
		params:{
		    phone
		}
	})
}
//手机登录
export const cellphoneLogin = (phone,password,timerstamp) => {
	return request({
		url:'/login/cellphone',
		params:{
			phone,
			password,
			timerstamp
		}
	})
}
//手机验证码登录 功能重复 应采用params在前端选择传递参数
export const changePwd = (phone,password,captcha) =>{
	return request({
		url:'/login/cellphone',
		params:{
			phone,
			password,
			captcha
		}
	})
}
// 发送验证码
export const sendSms = (phone) => {
	return request({
		url:'/captcha/sent',
		params:{
			phone
		}
	})
}
// 验证验证码
export const checkSms = (phone,captcha) =>{
	return request({
		url:'/captcha/verify',
		params:{
			phone,
			captcha
		}
	})
}
// 注册(修改密码)
//当注册时传入nickname,当修改密码时无需传入nickname，因为会报错nickname已存在
export const register = params =>{
	return request({
		url:'/register/cellphone',
		params
	})
}
// 初始化昵称 
export const initProfile = (nickname) => {
	return request({
		url:'/activate/init/profile',
		params:nickname
	})
}

//获取登录状态
export const getLoginStatus = (timerstamp) =>{
	return request({
		url:'/login/status',
		params:{
			timerstamp
		}
	})
}