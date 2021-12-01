<template>
	<div>
		<div class="signIn">
			<div class="signIn-nav">
				<div @click="onReProfile('events')">
					<p>{{state.events || 0}}</p>
					<span>动态</span>
				</div>
				<div @click="onReProfile('followed')">
					<p>{{state.follow || 0}}</p>
					<span>关注</span>
				</div>
				<div @click="onReProfile('fans')">
					<p>{{state.fans || 0}}</p>
					<span>粉丝</span>
				</div>
			</div>
			<div class="signIn-bottom" @click="onSign">
				<button><i class="iconfont"></i>{{!signStatus?'签到':'已签到'}}</button>
			</div>
		</div>
		<van-cell value="未订购" is-link>
		  <template #title>
				<i class="iconfont icon-huiyuan"></i>
		    <view class="van-cell-text">会员中心</view>
		  </template>
		</van-cell>
		<van-cell is-link>
			<template #value>
				Lv.{{level}}
			</template>
		  <template #title>
				<i class="iconfont icon-dengji"></i>
		    <view class="van-cell-text">等级</view>
		  </template>
		</van-cell>
		<van-cell value="" is-link>
		  <template #title>
				<i class="iconfont icon-shangcheng"></i>
		    <view class="van-cell-text">商场</view>
		    <div class='dot' style="position: absolute;left: 75px;top: 15px;width: 10px;height: 10px;background-color: red;z-index: 1;border-radius: 50%;"></div>
		  </template>
		</van-cell>
		<van-cell value="" is-link @click='userSet'>
		  <template #title>
				<i class="iconfont icon-geren"></i>
		    <view class="van-cell-text">个人信息设置</view>
		  </template>
		</van-cell>
		<van-cell value="" is-link @click='userBind'>
		  <template #title>
				<i class="iconfont icon-bangding"></i>
		    <view class="van-cell-text">绑定社交账号</view>
		  </template>
		</van-cell>
		<van-cell value="" is-link>
		  <template #title>
				<i class="iconfont icon-kefu"></i>
		    <view class="van-cell-text">我的客服</view>
		  </template>
		</van-cell>
		<van-cell value="" is-link @click='logout'>
		  <template #title>
				<i class="iconfont icon-secede"></i>
		    <view class="van-cell-text">退出登录</view>
		  </template>
		</van-cell>
	</div>
</template>

<script>
	//vuex功能引入
	import{ useStore } from 'vuex'
	//组件库引入
	import { Toast } from 'vant'
	//vue相关功能引入
	import { ref,reactive,inject,onMounted,computed } from 'vue'
	//接口引入
	import { userLogout,getUserSignin } from 'network/profile.js'
	import { getUserLevel,getUserDetail } from 'network/useDetail.js'
	//本地存储移除功能引入
	import { removeItem } from 'store/storage.js'
	//由于setup中不存在this,因此在setup中使用路由必须先声明
	import { useRouter } from 'vue-router'
	export default{
		name:'userSettings',
		setup(props,context){
			const router = useRouter() //实例化路由
			const store = useStore()
			
			const uid = ref(null)
			const level = ref (0)
			//挂载时获取后端的签到状态
			const signStatus = ref(false)
			
			const state = reactive({
				follow:0,
				events:0,
				fans:0
			})
			//退出登录
			const logout = async() => {
				const res = await userLogout()
				if(res.code!=200){
					Toast.fail('退出登录失败')
				}else{
					//清空cookie，好像切换登录状态自动清空，操作多余
					var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
					if (keys) {
						for (var i = keys.length; i--;)
							document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
					}
					context.emit('onCloseProfile')
					router.replace({path:'/home'})
				}
			}
			//签到功能 未完善 找不到后端记录签到的数据
			const onSign = async() => {
				const res = await getUserSignin(1)
				if(res.code === 200){
					Toast({
						message:'签到成功！'+res.point+'点经验'
					})
					signStatus.value = true
				}else{
					Toast({
						message:'签到重复!'
					})
				}
			}
			//
			const onReProfile = (val) => {
				router.push({path:'/user/'+val,query:{id:uid.value}})
			}
			//路由跳转用户设置页面
			const userSet = () => {
				router.push({path:'/home/profile'})
				context.emit('onClose')
			}
			//路由跳转用户绑定页面
			const userBind = () => {
				router.push({path:'/home/binding'})
				context.emit('onClose')
			}
			//挂载时获取用户信息
			onMounted(async()=>{
				uid.value = store.getters.getUserId
				
				const resData = await getUserDetail(uid.value, Date.now())
				level.value = resData.level
				state.events = resData.profile.eventCount
				state.follow = resData.profile.follows
				state.fans = resData.profile.followeds
			})
			
			return{
				state,
				logout,
				userSet,
				userBind,
				level,
				onSign,
				signStatus,
				onReProfile
			}
		}
	}
</script>

<style lang="less" scoped="scoped">
	.signIn{
		.signIn-nav{
			display: flex;
			div{
				flex: 1;
				text-align: center;
				cursor: pointer;
				&:hover{
					color:rgba(125,125,125,0.9);
				}
				p{
					font-size: 24px;
					font-weight: bold;
				}
				span{
					display: block;
					margin-top: -15px;
					font-size: 15px;
				}
			}
		}
		.signIn-bottom{
			
			button{
				width: 110px;
				height: 38px;
				background-color: white;
				border-radius: 8px;
				border: 1px solid #999999;
				margin-top: 10px;
				margin-left: calc(50% - 55px);
				cursor: pointer;
				&:hover{
					background-color:rgba(125,125,125,0.1);
				}
			}
			
		}
	}
	.van-cell__title{
		i{
			margin-right: 5px;
		}
	}
</style>
