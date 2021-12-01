<template>
	<div class="video">
		<Header></Header>
		<div style="display: flex;">
			<div class="video-left" style="width: 65%;">
				<mv-detail :url='url' style="width: 700px;margin: 0 auto;">
					<template v-slot:title>
						<span class="mv-nav" @click="back">
							{{type == 1?'MV详情':'视频详情'}}
						</span>
					</template>
				</mv-detail>
				<div class="info" style="margin-top: 40px;width: 50%;text-align: left;margin-left: 145px;">
					<div class="photo" style="height: 80px;width: 700px;;display: flex;justify-content: space-between;align-items: center;">
						<div>
						<img :src="cover + '?param=80y80'"  alt="" style="width: 80px;height: 80px;border-radius: 50%;cursor: pointer;vertical-align: middle;" @click="reSongDetail(mvData.userId)">
						<template v-if="type == 1">
							<span style="font-size: 18px;margin-left: 20px;cursor: pointer;" v-for="(item,index) in mvData.artists" :key='item.id' @click="reSongDetail(item.id)">{{item.name}}</span>
						</template>
						<template v-else>
							<span style="font-size: 18px;margin-left: 20px;cursor: pointer;" @click="reSongDetail(mvData.userId)">{{mvData.nickname}}</span>
						</template>
						</div>
						<div v-if="type != 1">
							<span @click="onFollowed" style="width: 120px;height: 40px;border-radius: 20px;background-color: #FCF4F4;display: inline-block;cursor: pointer;margin-right: 0;color: #FF3A3A;text-align: center;line-height: 40px;">
								<i class="iconfont icon-tianjia" v-show='!mvData.followed'>关注</i>
								<i class="iconfont icon-zhengque" v-show='mvData.followed'>已关注</i>
							</span>
						</div>
					</div>
					<div class="mv-title">
						<h2 style="width: 700px;">{{mvData.name || mvData.title}}</h2>
						<span style='font-size: 15px;color: darkgray'>发布: {{mvData.publishTime}}</span>
						<span style='font-size: 15px;color: darkgray;margin-left: 40px;'>播放:
							{{time>9999?Math.floor(time/9999)+'万':time}}
						</span>
						<div class="tags" style="margin-top: 10px;">
							<template v-if="mvData.videoGroup">
							<span v-for="(item,index) in mvData.videoGroup" :key='item.id' style="margin-right: 8px;display: inline-block;height: 30px;line-height: 30px;padding: 0 5px;background-color: rgba(125,125,125,0.15);border-radius: 12px;cursor: pointer;font-size: 13px;">
							  {{item.name}}
							</span>
							</template>
						</div>
					</div>
					<div class="desc" style="margin-top: 10px;width: 700px;font-size: 14px;color: darkgray;" v-if="mvData.description">
						<span>{{mvData.description}}</span>
					</div>
					<div class="iconInfo">
						<span class='other-icon' @click="onGetLike">
								<i class="iconfont icon-dianzan" v-if="!mvDetail.liked"></i>
								<i class="iconfont icon-dianzan_kuai" v-else></i>
								赞({{mvDetail.likedCount}})
						</span>
						<span class='other-icon' @click="onCollect">
							<i class="iconfont icon-yishoucang" v-if="subscribed"></i>
							<i class="iconfont icon-shoucang" v-else></i>
							收藏({{mvData.subCount}})
						</span>
						<span class='other-icon'>
							<i class="iconfont icon-zhuanfa"></i>分享({{mvDetail.shareCount}})
						</span>
						<span class='other-icon'>
							<i class="iconfont icon-download"></i>下载
						</span>
					</div>
					<commentLists :listId='id' :listType='type' style='margin-left: -16px;width: 700px;'></commentLists>
				</div>
			</div>
			<div class="video-right" style="width: 35%;">
				<related-video :relatedVideo='relatedVideo'></related-video>
			</div>
		</div>
	</div>
</template>

<script>
	import Header from 'views/Header/Header.vue'
	import mvDetail from './childComps/mvDetail.vue'
	import commentLists from 'components/common/Comment/commentLists.vue'
	import relatedVideo from './childComps/relatedVideo.vue'
	//vue功能引入
	import {
		ref,
		reactive,
		onMounted,
		watchEffect
	} from 'vue'
	import {
		getMvUrl,
		getMvData,
		getRecommondVideo,
		getRelatedVideo,
		subMv,
		getMvDetailData,
		getLikeResource,
		getMvList
	} from 'network/mv.js'
	import { getVideoUrl,getVideoDetailData,getVideoData,subVideo,getVideoList } from 'network/video.js'
	//接口引入
	import {
		userFollowed
	} from 'network/useDetail.js'
	// 组件库引入
	import {
		Toast,
		Dialog
	} from 'vant'
	//路由功能引入
	import {
		useRouter,
		useRoute
	} from 'vue-router'
	export default {
		name: 'mvDetailInfo',
		props: {
			id: {
				type: String,
				required: true,
				default () {
					return null
				}
			}
		},
		components: {
			Header,
			mvDetail,
			commentLists,
			relatedVideo
		},
		setup(props, ctx) {
			const router = useRouter(); //实例化路由
			const route = useRoute(); //实例化路由
			
			const url = ref(null);
			const mvData = ref({});
			const relatedVideo = ref([]);
			const cover = ref(null);
			const mvDetail = ref({});
			const subscribed = ref(false);
			const type = ref(null);
			const time  = ref(null);
			const back = () => {
				router.go(-1)
			}
			//收藏功能
			const onCollect = async() => {
				let t;
				let res;
				if(!subscribed.value){
					if(type.value == 1){
						res = await subMv(props.id,1,Date.now())
					}else if(type.value == 5){
						res = await subVideo(props.id,1,Date.now())
					}
					subscribed.value=!subscribed.value
					mvData.value.subCount++
					Toast('收藏成功')
				}else{
					Dialog.confirm({
							message: '确定取消收藏?',
					})
					.then(async() => {
						if(type.value == 1){
							res = await subMv(props.id,0,Date.now())
						}else if(type.value == 5){
							res = await subVideo(props.id,0,Date.now())
						}
						subscribed.value=!subscribed.value
						mvData.value.subCount--
						Toast('取消收藏成功')
					})
					.catch(() => {
					});
				}
			}
			//喜欢功能
			const onGetLike = async() => {
				let t;
				if(mvDetail.value.liked){
					t=0
				}else{
					t=1
				}
				const res = await getLikeResource({type:type.value,t:t,id:props.id,timerstamp:Date.now()})
				if(t){
					mvDetail.value.likedCount++
				}else{
					mvDetail.value.likedCount--
				}
				mvDetail.value.liked = !mvDetail.value.liked
			}
			//关注与取消相关功能
			const onFollowed = async () => {
				let t = 0
				let message = ''
				if (mvData.value.followed) {
					message = '取消关注成功！'
				} else {
					t = 1
					message = '关注成功！'
				}
				const res = await userFollowed(mvData.value.userId, t, Date.now())
				if (res.code == 200) {
					mvData.value.followed = !mvData.value.followed
					Toast({
						message: message
					})
				}
			}
      //跳转专辑详情页面
      const reSongDetail = (id) => {
      	router.push({
      		path: '/home/userDetail',
      		query: {
      			id:id
      		}
      	})
      }
			//mv
			const aboutMv = async () => {
				//mv视频地址
				const { data } = await getMvUrl(props.id, 720)
				url.value = data.url
				//mv 数据
				const res = await getMvData(props.id,Date.now())
				mvData.value = res.data
				cover.value = res.data.artists[0].img1v1Url
				time.value = mvData.value.playCount
				// mv 点赞转发评论数数据
				const resData = await getMvDetailData(props.id,Date.now())
				mvDetail.value = resData
				
				const list = await getMvList(Date.now())
				subscribed.value = list.data.some(item=>item.vid == props.id)
			}
			//视频
			const aboutVideo = async () => {
				//视频地址
				const { urls } = await getVideoUrl(props.id)
				url.value = urls[0].url
				//视频 数据
				const { data } = await getVideoData(props.id,Date.now())
				mvData.value = data
				mvData.value.nickname = data.creator.nickname
				mvData.value.userId = data.creator.userId
				mvData.value.subCount = mvData.value.subscribeCount
				cover.value = data.creator.avatarUrl
				time.value = mvData.value.playTime
				let date = new Date(mvData.value.publishTime)
				mvData.value.publishTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()
				mvData.value.followed = mvData.value.creator.followed
				// 视频 点赞转发评论数数据
				const resData = await getVideoDetailData(props.id,Date.now())
				mvDetail.value = resData
				
				const list = await getMvList(Date.now())
				subscribed.value = list.data.some(item=>item.vid == props.id)
			}
			//充当created 比onMounted更先执行
			watchEffect(async()=>{
				//收藏的视频列表
				if(route.path == '/mv'){
					type.value = 1
					aboutMv()
				}else if(route.path == '/video'){
					type.value = 5
					aboutVideo()
				}
			})
			onMounted(async () => {
				//相关视频列表
				const recmd = await getRelatedVideo(props.id)
				relatedVideo.value = recmd.data	
			})
			return {
				url,
				mvData,
				relatedVideo,
				cover,
				onCollect,
				mvDetail,
				onGetLike,
				subscribed,
				reSongDetail,
				type,
				time,
				onFollowed,
				back
			}
		}
	}
</script>

<style scoped lang="less">
	.video {
    .mv-nav{
    	margin-top: 80px;
    	font-size: 22px;
    	display: inline-block;
    	font-weight: bold;
    	cursor: pointer;
    	&:hover{
    		opacity: 0.9;
    	}
    	&::before{
    		content: '<';
    		margin-right: 10px;
    	}
    }
		.iconInfo {
			font-size: 16px;
			width: 700px;
			text-align: left;
			margin: 20px 0;

			span {
				text-align: center;
			}

			span {
				width: 150px;
				height: 40px;
				line-height: 40px;
				color: white;
				border-radius: 25px;
				display: inline-block;
				background-color: var(--mainColor);
				margin-right: 20px;
				position: relative;
				cursor: pointer;

				.icon-zhuanfa,
				.icon-download,
					{
					margin-right: 10px;
					font-size: 24px;
					font-weight: bold;
					vertical-align: middle;
				}

				.icon-shoucang,
				.icon-dianzan {
					font-size: 22px;
					font-weight: bold;
					vertical-align: middle;
				}
			}

			.other-icon {
				&:before {
					position: absolute;
					display: block;
					top: 0;
					right: 0;
					bottom: 0;
					left: 0;
					z-index: 1;
					border-radius: 25px;
					background: rgba(0, 0, 0, .1);
				}

				&:hover:before {
					content: "";
				}
			}
		}

	}
</style>
