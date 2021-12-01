<template>
	<div class="header">
    <h2 style="text-align: left;margin-left: 40px;">我的听歌排行</h2>
		<van-row>
		  <van-col span="4" style="margin-left: 24px;">
				<van-tabs v-model:active="active" @change='change' line-width='0px'>
				  <van-tab title="最近一周">
						<div v-if="oneWeek.length!=0">
						<rencent-list :isCompareShow='likes' :recentSongs='oneWeek'  @onLike='onLike'  style="width: 1220px;margin-left: -28px;position: relative;border-top: 1px solid lightgray">
							<template v-slot:count='{count}'>
								<span class="count" style="position: absolute;right: 250px;">{{count}}次</span>
							</template>
						</rencent-list>
						</div>
						<div class="user-subscribers-bottom-list differ" v-else>
							<span style='display: inline-block;margin: 0 auto;'>暂无音乐</span>
						</div>
					</van-tab>
					
				  <van-tab title="所有时间">
						<div v-if="allWeek.length!=0">
						<rencent-list :isCompareShow='likes' @onLike='onLike' :recentSongs='allWeek' style="width: 1220px;margin-left: -28px;position: relative;border-top: 1px solid lightgray">
							<template v-slot:count='{count}'>
								<span class="count" style="position: absolute;right: 250px;">{{count}}次</span>
							</template>
						</rencent-list>
						</div>
						<div class="user-subscribers-bottom-list differ" v-else>
							<span style='display: inline-block;margin: 0 auto;'>暂无音乐</span>
						</div>
					</van-tab>
				</van-tabs>
			</van-col>
		</van-row>
	</div>
</template>

<script>
	//vuex功能引入
	import {
		useStore
	} from 'vuex'
	import { ref,onMounted } from 'vue';
	import rencentList from 'components/content/profile/childComps/rencentList.vue'
	//接口引入
	import {
		likeSongsList,
		likeSongs
	} from 'network/songs.js'
	//接口引入
	import {
		getRecord
	} from 'network/useDetail.js'
	//组件库引入
	import {
		Toast
	} from 'vant'
	export default {
		name:'recentList',
		components:{
			rencentList
		},
		props:{
			id:{
				type:String,
				required:true,
				default(){
					return null
				}
			}
		},
		setup(props,ctx){
			const store = useStore();
			
			const likes = ref({});
			const active = ref(0);
			const uid = ref(null);
			const allWeek = ref([]);
			const oneWeek = ref([]);
			
			//歌曲喜欢
			const onLike = async (val) => {
				// 判断登录状态
				if (store.state.isLogin) {
					console.log(val.id,!likes.value[val.id])
					Toast.loading({
						duration: 0, // 持续时间，0表示持续展示不停止
						forbidClick: true, // 是否禁止背景点击
						message: '加载中...' // 提示消息
					})
			
					const res = await likeSongs({
						id: val.id,
						like: !likes.value[val.id],
						timerstamp: Date.now()
					})
					
					likes.value[val.id] = !likes.value[val.id]
					
					Toast.clear()
				} else {
					Toast({
						message: '请登录后再操作(未做保存本地功能)'
					})
				}
			}
			
			const change = async() => {
				if(active.value == 1){
					if(allWeek.value.length!=0) return
					Toast.loading({
						duration: 0, // 持续时间，0表示持续展示不停止
						forbidClick: true, // 是否禁止背景点击
						message: '加载中...' // 提示消息
					})
					const { allData } = await getRecord(props.id, 0)
					allData.filter(item=>{
						item.song.num = item.playCount
						allWeek.value.push(item.song)
					})
					Toast.clear()
				}
			}
			
			onMounted(async()=>{
				Toast.loading({
					duration: 0, // 持续时间，0表示持续展示不停止
					forbidClick: true, // 是否禁止背景点击
					message: '加载中...' // 提示消息
				})
				//登录状态获取喜欢的音乐列表 此处建议获取到vuex中多处能使用
				uid.value = store.getters.getUserId
				likeSongsList(uid.value, Date.now()).then(res => {
					res.ids.forEach(item=>{
						likes.value[item] = true
					})
				})
				
				const { weekData } = await getRecord(props.id, 1)
				weekData.filter(item=>{
					item.song.num = item.playCount
					oneWeek.value.push(item.song)
				})
        Toast.clear()
			})
			return { 
				active,
				likes,
				uid,
				allWeek,
				oneWeek,
				change,
				onLike
			}
		}
	}
</script>

<style scoped lang="less">
  .header {
  	width: 80%;
  	margin-left:21%;
  	height: 600px;
  	position: absolute;
  	margin-top: 60px;
		:deep(.van-tab--active){
			color: black;
			font-size: 16px;
			font-weight: bold;
		}
	}
</style>
