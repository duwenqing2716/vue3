<template>
	<div class="followList">
    <h2 style="text-align: left;margin-left: 40px;">{{type == 1?nickname+'的关注:':nickname+'的粉丝:'}}</h2>
		<subscribers :allSubscribers='allSubscribers' :listId='id' :type='type'>
			<template v-slot:contnet="{item}">
				<div style="display: flex;align-items: center;">
				<div class="info" style="width: 190px;">
					<h4 style="margin-bottom: 0;width: 190px;" class="title">
					  {{item.nickname}}
						<template v-if="item.vipRights">
							<span style='width: 40px;height: 18px;line-height: 18px;display: inline-block;border-radius: 8px;text-align: center;font-size: 14px;margin-left: 5px;background-color: black;color: bisque;font-size: 12px;'>VIP·{{vipLevel(item.vipRights.redVipLevel)}}</span>
						</template>
					</h4>
					<p class="introduce" style="margin-bottom: 0;font-size: 14px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;height: 20px;">{{item.signature}}</p>
					<p style="font-size: 14px;margin-top: 5px;display: flex;justify-content: space-between;">
						<span>歌单: {{item.playlistCount}}</span>
						<span>|</span>
						<span>粉丝: {{item.followeds}}</span>
					</p>
				</div>
				<div class="sendMsg" v-if="item.userId != $store.getters.getUserId">
					<button @click="id == $store.getters.getUserId ? onSendMsgs(item) : onFollowed(item)" style="width: 70px;height: 30px;border-radius: 15px;border: 1px solid darkgray;background-color: transparent;
					font-size: 14px;margin-left: 8px;cursor: pointer;">
					<template v-if="id == $store.getters.getUserId && type!=2">
						<i class="iconfont icon-youjian" style="vertical-align: middle;"></i>
						<span style="margin: 0 2px;">私信</span>
					</template>
					<template v-else>
						<i class="iconfont icon-tianjia" v-if="!item.followed" style="color: #EC4141;margin-right: 4px;"></i>
						<span>{{item.followed?'已关注':'关注'}}</span>
					</template>
					</button>
				</div>
				</div>
			</template>
		</subscribers>
	</div>
</template>

<script>
	//接口引入
	import {
		getUserFollows,
		getUserFolloweds
	} from 'network/profile.js'
	import subscribers from 'components/content/songDetail/childComps/subscribers.vue'
	//接口引入
	import {
		getUserDetail,
		userFollowed
	} from 'network/useDetail.js'
	import { ref,onMounted,watchEffect,computed } from 'vue'
	//组件库引入
	import {
		Toast
	} from 'vant'
	//路由功能引入
	import {
		useRouter,
		useRoute
	} from 'vue-router'
	export default {
		name:'followList',
		props:{
			id: {
				type: String,
				required: true,
				default () {
					return null
				}
			}
		},
		components:{
			subscribers
		},
		setup(props,ctx){
			const router = useRouter(); //实例化路由
			const route = useRoute(); //实例化路由
			
			const allSubscribers = ref([]);
			const vip = ref('零壹贰叁肆伍陆柒捌玖')
			const nickname = ref('')
			const type = ref(1);
			
			const vipLevel = (val) =>{
				return vip.value.substr(val,1)
			}
			
			const onSendMsgs = (item) => {
				// console.log(item)
				Toast('功能未完善')
			}
			//关注与取消相关功能
			const onFollowed = async (val) => {
				// console.log(val)
				let t = 0
				let message = ''
				if (val.followed) {
					message = '取消关注成功！'
				} else {
					t = 1
					message = '关注成功！'
				}
				const res = await userFollowed(val.userId, t, Date.now())
				if (res.code == 200) {
					val.followed = !val.followed
					Toast({
						message: message
					})
				}
			}
			
			watchEffect(async()=>{
				if(route.path.indexOf('/followed')!=-1){
					type.value = 1
				}else{
					type.value = 2
				}
				// console.log(type.value)
			})
			onMounted(async()=>{
				Toast.loading({
					duration: 0, // 持续时间，0表示持续展示不停止
					forbidClick: true, // 是否禁止背景点击
					message: '加载中...' // 提示消息
				})
				const res = await getUserDetail(props.id, Date.now())
				nickname.value = res.profile.nickname
				//收藏页数据预先请求
				if(type.value == 1){
					const data = await getUserFollows({uid:props.id,limit:60,offset:0,timerstamp: Date.now()})
					allSubscribers.value = data.follow
					allSubscribers.value.total = res.profile.follows
				}else{
					const data = await getUserFolloweds({uid:props.id,limit:60,offset:0,timerstamp: Date.now()})
					allSubscribers.value = data.followeds
					allSubscribers.value.total = res.profile.followeds
				}
				Toast.clear()
			})
			return{
				allSubscribers,
				vipLevel,
				vip,
				nickname,
				onSendMsgs,
				onFollowed,
				type
			}
		}
	}
</script>

<style scoped lang="less">
  .followList{
		width: 82%;
		margin-left: calc(19.5%);
		position: absolute;
		margin-top: 60px;	
	}
</style>
