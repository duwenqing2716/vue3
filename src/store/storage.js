//获取本地存储
export function getItem(val){
	const data = window.localStorage.getItem(val)
	try{
		return  JSON.parse(data) || data 
	}catch(e){
		// console.log(e,'错误信息:获取本地存储失败！')
		return data
	}
}
//设置本地存储
export function setItem(info, value){
	// 判断类型转为JSON格式存储于本地
	if(typeof value === 'object'){
		
		value = JSON.stringify(value)
	}
	
	window.localStorage.setItem(info, value)
}
//清除本地存储
export const removeItem = val => {
    window.localStorage.removeItem(val)
    
}