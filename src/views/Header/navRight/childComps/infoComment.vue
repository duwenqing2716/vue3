<template>
	<div>
		<div class="email-header">
			<span class="aside" style="margin-left:-30px;">消息</span>
			<span style="width: 170px;"></span>
			<span class="aside">一键已读</span>
		</div>
		<van-tabs v-model:active="active" type="card">
			<van-tab title="私信" style="height: 530px;overflow: auto;">
				<van-badge v-show="countInfo" :content="countInfo" style="position: absolute;top: -5px;left: 100px;">
				</van-badge>
				<div class="mainInfo" v-for="(item,index) in lists">
					<div style="display: flex;margin-left: 20px;">
						<div class='dot' v-show="!item.noticeAccountFlag"></div>
						<div class="infoList">
							<img v-lazyload="item.fromUser.avatarUrl + '?param=45y45'" alt="">
						</div>
					</div>
					<van-cell style="width: 300px;">
						<template #title>
							<span class="custom-title">{{item.fromUser.nickname}}</span>
						</template>
						<template #label>
							<span>{{JSON.parse(item.lastMsg).msg}}</span>
						</template>	
					</van-cell>
						<span class="date">{{lastTime(item)}}</span>
				</div>
			</van-tab>
			<van-tab title="评论" style="height: 530px;overflow: auto;">
			  
			</van-tab>
			<van-tab title="@我"></van-tab>
			<van-tab title="通知"></van-tab>
		</van-tabs>
	</div>
</template>

<script>
	//vue功能引入
	import {
		ref,
		reactive,
		onMounted,
		computed
	} from 'vue'
	//接口引入
	import {
		privateInfo,privateComment,privateAtme,privateNotice
	} from 'network/infoMsg.js'
	//vuex功能引入
	import {
		useStore,
		mapState
	} from 'vuex'
	//本地存储功能引入
	import {
		getItem
	} from 'store/storage.js'
	//组件库引入
	import {
		Toast
	} from 'vant'
	export default {
		name: 'infoComment',
		setup() {
			const store = useStore();
			const active = ref(0);
			const uid = ref(null);
			const lists = ref({});
			const time = ref('');
			const countInfo = ref(null);
      //时间格式化功能 未完善 以后将其封装可多处使用
      const lastTime = (item) => {
					const date = new Date(item.lastMsgTime)
					const now = new Date()
					if(now-date<86400000){
						return date.getHours()+':'+date.getMinutes()
					}else if(now-date<31536000000){
						return (date.getMonth()+1)+'月'+date.getDate()+'日'
					}else{
						return date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日'
					}
			}
			//挂载时
			onMounted(async () => {
				Toast.loading({
				  duration: 0, // 持续时间，0表示持续展示不停止
				  forbidClick: true, // 是否禁止背景点击
				  message: '加载中...' // 提示消息
				})
				//获取私信操作
				privateInfo().then(res => {
					if (res.code != 200) {
						Toast.fail({
							message: '获取消息失败',
							position: 'top'
						})
					} else {
						lists.value = res.msgs //详细
						countInfo.value = res.newMsgCount //总数
						Toast.clear()
					}
				})
				//获取通知操作 未完善 因为不知道此处具体ui是什么样所以未做评论，@我，通知等等功能
				privateNotice().then(res =>{
					console.log(res)
				})
			})
			return {
				active,
				lists,
				time,
				lastTime,
				countInfo
			};
		}
	}
</script>

<style lang="less" scoped="scoped">
	.email-header {
		display: flex;
		height: 40px;

		.aside {
			flex: 1;
			text-align: center;
			line-height: 40px;
			font-size: 18px;
		}
	}
  .mainInfo{
	  display: flex;
		position: relative;
	.dot {
		width: 10px;
		height: 10px;
		background-color: red;
		border-radius: 50%;
		margin-top: calc(50% - 2px)
	}
	.infoList{
		margin-left: 10px;
		img{
			width: 45px;
			height: 45px;
			border-radius:50%;
			margin-top:calc(50% - 8px);
		}
	}
	.date{
		font-size: 14px;
		position: absolute;
		color: gray;
		right: 20px;
		margin-top: 15px;
	}
	:deep(.van-cell__title){
		flex: none;
		width: 100%;
		padding-bottom: 10px;
		.van-cell__label{
			margin-top: -5px;
		}
		span{
			width: 100%;
			display: inline-block;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
	.van-cell__value{
		span{
			display: block;
			line-height: 50px;
		}
	}
	
	}
</style>
