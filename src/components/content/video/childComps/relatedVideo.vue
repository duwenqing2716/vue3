<template>
	<div class="relate" style="margin-top: 80px;text-align: left;">
		<span style="font-size: 22px;display: inline-block;font-weight: bold;">相关推荐</span>
		<div class="video" v-for="(item,index) in relatedVideo" :key='item.vid' style="margin-top: 20px;display: flex;align-items: center;">
			<div class="video-left" @click="reVideo(item.vid)" style="position: relative;width: 180px;height: 115px;border-radius: 6px;cursor: pointer;">
				<img v-lazyload="item.coverUrl + '?param=180y115'" alt="" style="width: 100%;height: 100%;border-radius: 6px;">
				<div class="playcount" style="position: absolute;right: 8px;top: 3px;color: white;font-weight: bold;">
					<i class="iconfont icon-bofang1"></i>
					<span>{{item.playTime>9999?Math.floor(item.playTime/9999)+'万':item.playTime}}</span>
				</div>
				<span class="time" style="position: absolute;right: 8px;bottom: 3px;color: white;font-weight: bold;">{{'0'+new Date(item.durationms).getMinutes()+':'+(new Date(item.durationms).getSeconds()<10?'0'+new Date(item.durationms).getSeconds():new Date(item.durationms).getSeconds())}}</span>
			</div>
			<div class="video-right" style="margin-left: 20px;">
				<span @click="reVideo(item.vid)" style="font-size: 17px;width: 288px;overflow: hidden;text-overflow: ellipsis;display: -webkit-box;-webkit-line-clamp: 3;-webkit-box-orient: vertical;cursor: pointer;">{{item.title}}</span>
				<p style='color: darkgray;font-size: 15px;width: 288px;overflow: hidden;text-overflow: ellipsis;'>by <span v-for="(item,index) in item.creator" :key='item.userId' @click="reUserDetail(item.userId)" style="cursor: pointer;"> {{item.userName}}</span></p>
			</div>
		</div>
	</div>
</template>

<script>
	//路由功能引入
	import {
		useRouter
	} from 'vue-router'
	export default {
		name:'relatedVideo',
		props:{
			relatedVideo:{
				type:Array,
				required:true,
				default(){
					return []
				}
			}
		},
		setup(props,ctx){
			const router = useRouter(); //实例化路由
			
			const reVideo = (id) => {
				router.push({
					path: '/video',
					query: {
						id:id
					}
				})
			}
			
			const reUserDetail = (id) => {
				router.push({
					path: '/home/userDetail',
					query: {
						id:id
					}
				})
			}
			return{
				reVideo,
				reUserDetail
			}
		}
	}
</script>

<style scoped lang="less">
  
</style>