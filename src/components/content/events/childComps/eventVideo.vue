<template>
	<div class="eventVideo">
		<div class="video-cover" style="margin-left: 140px;margin-top: 20px;width:410px;position: relative;border-radius: 8px;"
		 v-if='isVideoCover' :style="types==2?coverWidth(videoDetail):''">
			<img :src="videoDetail.coverUrl" alt="" style="margin-top:auto;width: 100%;border-radius: 8px;">
			<i class="iconfont icon-bofang" @click="videoPlay(videoDetail)" style="position: absolute;right: 50%;width: 66px;height: 65px;font-size: 35px;line-height: 68px; position: absolute;left: 50%;top: 50%; transform: translate(-50%,-50%);cursor: pointer;opacity: 1;color: white;border: 2px solid whitesmoke;border-radius: 50%;background-color: rgba(125,125,125,0.5);"></i>
			<span style="position: absolute;bottom:10px;right: 10px;color: white;font-weight: bold;">{{'0'+new Date(videoDetail.durationms).getMinutes()+':'+(new Date(videoDetail.durationms).getSeconds()<10?'0'+new Date(videoDetail.durationms).getSeconds():new Date(videoDetail.durationms).getSeconds())}}</span>
			<div style="position: absolute;bottom: 10px;left: 10px;color: white;font-weight: bold;">
				<i class="iconfont icon-bofang1"></i>
				<span>{{videoDetail.playTime>9999?Math.floor(videoDetail.playTime/10000)+'万':videoDetail.playTime}}次</span>
			</div>
		</div>
		<div v-else style="margin-left: 140px;margin-top: 20px;text-align: left;color: #507DAF;">
			<span @click="isVideoCover = true">
				<i class="iconfont icon-shouqi-copy">收起</i>
			</span>
			<span style="margin-left: 15px;">
				<router-link :to="{ path: '/video', query: { id: videoDetail.videoId || videoDetail.id}}">
					<i class="iconfont icon-tiaozhuan">{{videoDetail.title || videoDetail.name}}</i>
				</router-link>
			</span>
			<mv-detail :url='videoDetail.url' style="width: 550px;cursor: pointer;" :style="types==2?videoWidth(videoDetail):''"></mv-detail>
		</div>
	</div>
</template>

<script>
	import {
		ref,
		onMounted,
		computed,
		watchEffect
	} from 'vue'
	import mvDetail from 'components/content/video/childComps/mvDetail'
	import {
		getVideoUrl,
		getMlogId
	} from 'network/video.js'
	import {
		getMvUrl
	} from 'network/mv.js'
	export default {
		name: 'eventVideo',
		props: {
			videoData: {
				type: Object,
				required: true,
				default () {
					return {}
				}
			},
			types: {
				type: Number,
				required: true,
				default () {
					return 0
				}
			},
			id:{
				type: [String,Number],
				required: true,
				default () {
					return ''
				}
			}
		},
		components: {
			mvDetail
		},
		setup(props, ctx) {
			const isVideoCover = ref(true);
      //过滤视频数据 防止数据量混乱 数据整理
			const videoDetail = computed(() => {
				let info = JSON.parse(JSON.stringify(props.videoData))
				if (props.types == 1) {
					info.coverUrl = info.imgurl16v9
					info.durationms = info.duration
					info.playTime = info.playCount
				} else if (props.types == 2) {
					info.coverUrl = info.content.video.coverUrl
					info.durationms = info.content.video.duration
					info.playTime = info.playCount
					info.title = info.content.text
				}
				return info
			})
      //点击切换视频播放界面 发送事件
			const videoPlay = async (item) => {
				if (props.types == 1) {
					const {
						data
					} = await getMvUrl(item.id, 720)
					item.url = data.url
				} else if (props.types == 0) {
					const {
						urls
					} = await getVideoUrl(item.videoId)
					item.url = urls[0].url
				} else if (props.types == 2) {
					item.url = videoDetail.value.content.video.urlInfo.url
					const {
						data
					} = await getMlogId(videoDetail.value.id)
					item.id = data
				}
				ctx.emit('onPlay',item.id || item.videoId)
			}
			//监听处理页面上多个视频同时播放的情况，只允许一个视频播放其他视频销毁
			watchEffect(()=>{
				if((videoDetail.value.videoId || videoDetail.value.id) == props.id){
					isVideoCover.value = false
				}else{
					isVideoCover.value = true
				}
			})
      //处理视频封面 此处多处理了网易云mlog视频情况 情况较为复杂未多做更好的优化(mlog只在移动端才显示,PC一般不支持)
			const coverWidth = computed(() => {
				return function(val) {
					//封面大小与视频大小不一致会出问题
					if (val.content.video.height > val.content.video.width) {
						return {
							'width': '200px',
						}
					} else {
						return {
							'width': '410px',
						}
					}
				}
			})
      //处理视频封面 此处多处理了网易云mlog视频情况 情况较为复杂未多做更好的优化(mlog只在移动端才显示,PC一般不支持)
			const videoWidth = computed(() => {
				return function(val) {
					if (val.content.video.height / val.content.video.width > 1.45) {
						return {
							'width': '300px',
						}
					} else {
						return {
							'width': '550px',
						}
					}
				}
			})
			
			return {
				isVideoCover,
				videoDetail,
				videoPlay,
				videoWidth,
				coverWidth,
				coverWidth
			}
		}
	}
</script>

<style scoped lang="less">
	.eventVideo {}
</style>
