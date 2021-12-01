<template>
	<div class="eventsList" id="scroll-container">
		<h2 style="text-align: left;margin-left: 40px;">xxx的动态</h2>
		<div class="dt" v-for="(item,index) in eventList" :key='item.id' style="border-bottom: 1px solid lightgray;padding: 20px;margin-left: -22px;">
			<div class="dt-title" style="display: flex;margin-left: 40px;align-items: center;">
				<div style="position: relative;">
					<img :src="item.user.avatarDetail.identityIconUrl" v-if="item.user.avatarDetail" alt="" style="width: 20px;height: 20px;position: absolute;right: 0;bottom: 0;border: 1px solid lightgray;border-radius: 50%;">
					<img :src="item.user.avatarUrl" alt="" style="width: 80px;height: 80px;border-radius: 50%;border: 1px solid lightgray">
				</div>
				
				<div class="dt-nickname" style="text-align: left;margin-left: 20px;font-size: 17px;">
					<router-link :to="{path:'/home/userDetail',query:{id:item.user.userId}}">
						<span style="color: #507DAF;margin-right: 10px;">{{item.user.nickname}}</span>
					</router-link>
					<template v-if="item.json.song">
						<span>分享歌曲</span>
					</template>
					<template v-else-if="item.json.event">
						<span>转发</span>
					</template>
					<template v-else-if="item.json.album">
						<span>分享专辑</span>
					</template>
					<template v-else-if="item.json.playlist">
						<span>分享歌单</span>
					</template>
					<template v-else-if="item.json.video">
						<span>分享视频</span>
					</template>
					<template v-else-if="item.json.program">
						<span>分享声音</span>
					</template>
					<template v-else-if="item.json.mv">
						<span>分享MV</span>
					</template>
					<template v-else-if="item.json.topic">
						<span>分享专栏文章</span>
					</template>
					<template v-else-if="item.json.resource">
						<span v-if="item.json.resource.mlogDetail">发布Mlog</span>
						<span v-else>分享评论</span>
					</template>
					<template v-else>
						<span>发布动态</span>
					</template>
					<p style="font-size: 14px;">{{timeShow(item.eventTime)}}</p>
				</div>
			</div>
			
			<div class="dt-contnet" style="text-align: left;margin-left: 140px;font-size: 17px;width:80% ;">
				<span v-html="htmlContent(item.json)"></span>
			</div>
			<!-- {{item.json.topic}} -->
			<template v-if="item.json.song">
				<event-details :listData='item.json.song' :types='0'></event-details>
			</template>
			<template v-else-if="item.json.event" >
				<!-- {{item.json.event}} -->
				<!-- <event-details :listData='item.json.event' :types='1'></event-details> -->
			</template>
			<template v-else-if="item.json.playlist">
				<event-details :listData='item.json.playlist' :types='2'></event-details>
			</template>
			<template v-else-if="item.json.album">
				<event-details :listData='item.json.album' :types='3'></event-details>
			</template>
			<template v-else-if="item.json.program">
				<event-details :listData='item.json.program' :types='4'></event-details>
			</template>
			<template v-else-if="item.json.video">
				{{}}
				<event-video :videoData='item.json.video' :types='0' @onPlay='onPlay' :id='id'></event-video>
			</template>
			<template v-else-if="item.json.mv">
				<event-video :videoData='item.json.mv' :types='1' @onPlay='onPlay' :id='id'></event-video>
			</template>
			<template v-else-if="item.json.topic">
				<event-details :listData='item.json.topic' :types='5'>
					<template v-slot:pic>
						<img :src="item.json.topic.coverUrl" alt="" style="height: 60px;position: absolute;right: 8px;border-radius: 4px;">
					</template>
				</event-details>
			</template>
			<template v-else-if="item.json.resource">
				<div v-if='item.json.resource.mlogDetail'>
					<event-video :videoData='item.json.resource.mlogDetail' :types='2' @onPlay='onPlay' :id='id'></event-video>
				</div>
				<div v-else class="songs" style="text-align: left;margin-left: 140px;font-size: 17px;height: 80px;width: 80%;;border-radius: 8px;background-color: #EFEFF0;margin-top: 20px;align-items: center;cursor: pointer;position: relative;font-size: 15px;padding: 20px 0;">
					<div style="margin-left: 20px;">
					<p style="margin-top: 0;">
						<i class="iconfont icon-yinhao" style="color: darkgray;font-size: 25px;"></i>
						<span style="color: #507DAF;" v-if="item.json.resource.user">@{{item.json.resource.user.nickname}}: </span>
						<span>{{item.json.resource.content}}</span>
					</p>
					<p style="font-size: 12px;color: darkgray;">{{item.json.resource.resourceName}}</p>
					</div>
				</div>
			</template>

			<div class="pic" v-if="item.pics.length>0" style="margin-left: 140px;margin-top: 20px;">
			  <event-pics :picData='item.pics'></event-pics>
			</div>

			<event-fn :info='item.info' @onComment='onComment' :commentId='commentId'></event-fn>
		</div>
		<van-loading type="spinner"  color="var(--mainColor)" style="margin-top: 20px;" v-show="loadFlag">加载中...</van-loading>
	</div>
</template>

<script>
	import {
		onMounted,
		ref,
		onUnmounted,
		computed
	} from 'vue'
	import {
		getUserEvents
	} from 'network/profile.js'
	import eventDetails from './childComps/eventDetails.vue'
	import eventVideo from './childComps/eventVideo.vue'
	import eventPics from './childComps/eventPics.vue'
	import eventFn from './childComps/eventFn.vue'
	import { Loading } from 'vant';

	export default {
		name: 'eventsList',
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
			eventDetails,
			eventVideo,
			eventPics,
			eventFn
		},
		setup(props, ctx) {
			const eventList = ref([]);
			const lasttime = ref(null);
			const loadFlag = ref(false);
			const id = ref('');
			const commentId = ref('');

			//时间格式化功能 未完善 以后将其封装可多处使用
			const timeShow = (item) => {
				const date = new Date(item)
				const now = new Date()
				if (now - date < 86400000) {
					return date.getHours() + ':' + date.getMinutes()
				} else if (now - date < 31536000000) {
					return (date.getMonth() + 1) + '月' + date.getDate() + '日 ' + date.getHours() + ':' + date.getMinutes()
				} else {
					return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日 ' + date.getHours() + ':' +
						date.getMinutes()
				}
			}
      //内容追加设置
			const htmlContent = (item) => {
				let text = item.msg
        //检测换行
				text = text.replace(/\n/g, '<br>')
				let reg = /#[\u4e00-\u9fa5_a-zA-Z0-9]+#/g
				text = text.replace(reg, (words) => {
					return `<a href="#user/topic?id=${words}" style='color: #507DAF;'>${words}</a>`
				})
				//检测@他人行为 跳转有问题未动态设置id
				let regother = /@[\u4e00-\u9fa5_a-zA-Z0-9]+/g
				text = text.replace(regother, (word) => {
					return `<a href="#/home/userDetail?id=1809857550" style='color: #507DAF;'>${word}</a>`
				})
				//检测网址
				const urlRegex = /(https?:\/\/[^\s]+)/g;
				return text.replace(urlRegex, (url) => {
					return `<a href="${url}" style='color: #507DAF;'>${url}</a>`
				})
			}
      //滚动监听
			const scrollLazyLoad = () => {
				window.onscroll = () => {
				    const scrollTop = Number(window.pageYOffset || window.scrollY || document.body.scrollTop || document.documentElement.scrollTop) // 滚动的高度
				    const scrollHeight = Number(document.body.scrollHeight || document.documentElement.scrollHeight) // 总高度
				    const clientHeight = Number(document.documentElement.clientHeight || document.body.clientHeight) // 可视化(所能看到的)高度
				    if (Math.ceil(scrollTop + clientHeight) >= scrollHeight) { // 滚动到了底部，加载数据
							getEvents(lasttime.value)
				    }
				  }
			}
			//视频同时播放参数传递
			const onPlay = (val) => {
				id.value = val
			}
			//
			const onComment = (val) => {
				commentId.value = val
			}
			//数据请求
			const getEvents = async (time) => {
				loadFlag.value = true
				const res = await getUserEvents({
					uid: props.id,
					limit: 20,
					lasttime: time,
					timerstamp:Date.now()
				})
				res.events.filter(item => {
					item.json = JSON.parse(item.json)
					item.picNums = item.pics.length
				})
				eventList.value.push(...res.events)
				lasttime.value = res.lasttime
				loadFlag.value = false
				 //滚动解绑
				if(!res.more){
					window.onscroll = null;
				}
			}
      //滚动销毁解绑
      onUnmounted(()=>{
				window.onscroll = null;
			})
			
			onMounted(() => {
				getEvents(-1)
				scrollLazyLoad()
			})

			return {
				eventList,
				lasttime,
				timeShow,
				htmlContent,
				loadFlag,
				getEvents,
				onPlay,
				id,
				onComment,
				commentId
			}
		}
	}
</script>
<!-- //grad布局 -->
<style scoped lang="less">
	.eventsList {
		width: 80%;
		margin-left: calc(21%);
		position: absolute;
		margin-top: 60px;
	}
</style>
