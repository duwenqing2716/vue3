import {request} from "./request";
//热搜列表(详细)
// 说明 : 调用此接口,可获取热门搜索列表
export function _hotSearchDetail(){
    return request({
        url:'/search/hot/detail'
    })
}
// 搜索建议
// 说明 : 调用此接口 , 传入搜索关键词可获得搜索建议 , 搜索结果同时包含单曲 , 歌手 , 歌单 ,mv 信息
export function _searchSuggest(keyword){
	return request({
		url:'/search/suggest',
		params:{
		    keywords:keyword
		}
	})
}