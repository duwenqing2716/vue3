import axios from 'axios'
import { Toast } from 'vant'

export function request(config) {
	const instance = axios.create({
	  baseURL:"http://localhost:3000",
	  // timeout: 5000
		withCredentials: true//关键:跨域设置获取cookie请求头，否则将为null
	})
  // 2.axios的拦截器
  // 2.1.请求拦截的作用
  instance.interceptors.request.use(config => {
    return config
  }, err => {
    Toast.fail('请求超时!请刷新页面')
		return Promise.resolve(err);
  })
  // 2.2.响应拦截
  instance.interceptors.response.use(res => {
		if(res.data.code == 200 || res.data.code == 800 || res.data.code == 801 || res.data.code == 802 || res.data.code == 803){
			return res.data
		}else if(res.data.code == 401 ){
      // token无效重新登录
			Toast.fail('请重新登录')
		}else if(res.data.code == 201){
			Toast.fail({
				message:res.data.msg
			})
			return Promise.reject(res.data);
		}
		return res.data
  }, err => {
		// console.log(err.response.data.msg)
		let message = err.response.data.msg
		const status = err.response.status
		if(status == 400){//客户端参数错误
			Toast.fail('客户端参数异常')
		}else if(status == 504 || status == 404){//服务端异常
			Toast.fail('服务器被吃了⊙﹏⊙∥')
		}else if(status == 403){//无权限操作
			Toast.fail('权限不足,请联系管理员!')
		}else if(status >= 500){//服务端异常
			Toast.fail('因合作方要求，暂时下架该资源')
		}else{
			if(message){
				Toast.fail({message:message})
			}else{
				Toast.fail('出现未知错误')
			}
		}
    // console.log(err);
		return Promise.reject(err)
  })

  // 3.发送真正的网络请求
  return instance(config)
}