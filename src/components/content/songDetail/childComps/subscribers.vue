<template>
	<div class="subscribe">
		<div class="photos" v-for="(item,index) in isShowNew" :key='item.userId'>
			<div style="margin-left: 15px;position: relative;" @click="onUserProfile(item)">
				<img v-lazyload="item.avatarUrl + '?param=150y150'" alt="">
				<template v-if="item.avatarDetail">
					<img v-lazyload="item.avatarDetail.identityIconUrl + '?param=30y30'" alt="" style="width: 28px;height: 28px;position: absolute;bottom: 5px;right: 2px;">
				</template>
			</div>
			<div style="margin-left: 15px;text-align: left;">
				<slot name="contnet" :item='item'></slot>
			</div>
		</div>
		<div class="pages" v-if="totalItem>1">
			<van-pagination v-model="currentPage" :show-page-size="totalItem>6?6:totalItem" force-ellipses :page-count='totalItem' @change='changePage'
			/>
		</div>
	</div>
</template>

<script>
	//vue功能引入
	import { ref,onMounted,onUpdated,watchEffect } from 'vue'
	//接口引入
	import { allSubscribe } from 'network/songs.js'
	//接口引入
	import {
		getUserFollows,
		getUserFolloweds
	} from 'network/profile.js'
	//由于setup中不存在this,因此在setup中使用路由必须先声明
	import { useRouter } from 'vue-router'
	export default {
		name:'subscribers',
		props:{
			allSubscribers:{
				type:Object,
				required:true,
				default(){
					return {}
				}
			},
			listId:{
				type:String,
				required:true,
				default(){
					return null
				}
			},
			type:{
				type:Number,
				required:true,
				default(){
					return 0
				}
			}
		},
		setup(props,context){
			const router = useRouter() //实例化路由
			
			const subscribersList = ref([]);
			const isShowNew = ref([]);
			const totalItem = ref(0)
			const currentPage = ref(1);
      //点击其他页面时
			const changePage = async() => {
				isShowNew.value = []
				// //判断是否需要加载新评论 大幅减少请求数量
				let isSome = subscribersList.value.find(item =>item.page == currentPage.value)
				if(isSome){
					//加载缓存数据
					isShowNew.value = isSome.list
				}else{
					//发送新请求
					let res
					if(props.type == 0){
						res = await allSubscribe(props.listId,60,currentPage.value*60)
						getPush(res.subscribers)
					}else if(props.type == 1){
						const data = await getUserFollows({uid:props.listId,limit:60,offset:(currentPage.value-1)*60,timerstamp: Date.now()})
						getPush(data.follow)
					}else if(props.type == 2){
						const data = await getUserFolloweds({uid:props.listId,limit:60,offset:(currentPage.value-1)*60,timerstamp: Date.now()})
						getPush(data.followeds)
					}
				}	
			}
			//封装添加数据操作
			const getPush = (val) => {
				let listDetail = {}
				listDetail.list = val
				listDetail.page = currentPage.value
				subscribersList.value.push(listDetail)
				isShowNew.value = val
				
			}
			//路由跳转个人详情页
			const onUserProfile = (item) => {
				router.push({path:'/home/userDetail',query:{id:item.userId}})
			}
			
			watchEffect(()=>{
			  getPush(props.allSubscribers)
				totalItem.value = Math.ceil(props.allSubscribers.total/60)
			})

			return{
				subscribersList,
				currentPage,
				changePage,
				totalItem,
				isShowNew,
				onUserProfile
			}
		}
	}
</script>

<style scoped lang="less">
  .subscribe{
		margin-left: 20px;
		margin-top: 40px;
		display: flex;
		flex-wrap: wrap;
		.photos{
			display: flex;
			align-items: center;
			width: 33%;
			margin-bottom: 40px;
			
			img{
				width: 100px;
				height: 100px;
				border-radius: 50%;
				cursor:pointer
			}	
			&:hover{
				background-color: rgba(125,125,125,0.2);
			}
		}
		.pages{
			width: 55%;
			margin: 150px auto 200px;
		}
	}
</style>
