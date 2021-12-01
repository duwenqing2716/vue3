<template>
	<div class="cloud-aside">
		<van-sidebar v-model="active">
			<div class="common">
		    <van-sidebar-item title="发现音乐" to="/home"/>
		    <van-sidebar-item title="播客" />
		    <van-sidebar-item title="视频" />
			  <van-sidebar-item title="朋友" />
			  <van-sidebar-item title="直播" />
			  <van-sidebar-item title="私人FM" />
			  </div>
			<span class='myMusic'>我的音乐</span>
			<van-sidebar-item>
				<template #title>
					<i class="iconfont icon-download" style="font-weight: bold;"></i>
					<span>本地与下载</span>
				</template>
			</van-sidebar-item>
			<van-sidebar-item>
				<template #title>
					<i class="iconfont icon-zuijinbofang" style="font-weight: bold;font-size: 24px;"></i>
					<span>最近播放</span>
				</template>
			</van-sidebar-item>
			<div v-if="$store.getters.getLoginStatus">
				<van-sidebar-item>
					<template #title>
						<i class="iconfont icon-yun" style="font-weight: bold;font-size: 24px;"></i>
						<span>我的音乐云盘</span>
					</template>
				</van-sidebar-item>
				<van-sidebar-item>
					<template #title>
						<i class="iconfont icon-boke" style="font-size: 24px;"></i>
						<span>我的播客</span>
					</template>
				</van-sidebar-item>
				<van-sidebar-item>
					<template #title>
						<i class="iconfont icon-shoucang" style="font-weight: bold;font-size: 24px;"></i>
						<span>我的收藏</span>
					</template>
				</van-sidebar-item>
			</div>
			<aside-list :listData='myfavorite' :self = 'true' :index = 'active' @onDelete='onDelete'>
				<template v-slot:titles>
					<span class="myvList">创建的歌单</span>
				</template>
				<template v-slot:add>
					<div class="myvAdd" @click="onCreated" style="margin-right: 20px;cursor: pointer;">
						<i class="iconfont icon-tianjia"></i>
					</div>
				</template>
			</aside-list>
			<aside-list :listData='playlist' :self = 'false' :index = 'active'  @onDelete='onDelete'>
				<template v-slot:titles>
					<span class="myvList">收藏的歌单</span>
				</template>
			</aside-list>
		</van-sidebar>
		
		<van-dialog v-model:show="show" title="新建歌单" show-cancel-button style="width: 500px;" :overlayStyle='{backgroundColor:"transparent"}' @confirm='onConfirm' @cancel='onCancel' confirm-button-text='创建' :before-close='function(){return false}'>
			<input type="text" v-model="title" placeholder="请输入新的歌单标题" style="width: 90%;height: 30px;border-radius: 8px;border: 1px solid darkgray;margin: 10px 0;padding-left: 5px;font-size: 14px;z-index: 3;">
			<div style="text-align: left;font-size: 14px;margin-left: 15px;">
				<input type="checkbox"  v-model="hidden">设置为隐私歌单
			</div>
		</van-dialog>
	</div>
</template>

<script>
	//由于setup中不存在this,因此在setup中使用路由必须先声明
	import { useRouter } from 'vue-router';
	//vue功能引入
	import { ref,onMounted,watch,computed,nextTick } from 'vue';
	//本地存储引入
	import { getItem } from 'store/storage.js'
	//接口引入
	import { getUserPlaylist } from 'network/profile.js'
	import { createPlaylist,deletePlaylist } from 'network/songs.js'
	//vuex功能引入
	import { useStore } from 'vuex'
	//组件库引入
	import { Toast,Dialog } from 'vant'
	import AsideList from './childComps/AsideList.vue'
	export default {
		name:'Aside',
		props:{
			theme:{
				type:String,
				required:true,
				default(){
					return null
				}
			}
		},
		components:{
			AsideList
		},
		setup(props,context){
			const store = useStore();
			const router = useRouter();
			
			const show = ref(false);
			const active = ref(0);
			const theme = ref(null);
			const isShowIcon = ref(true);
			const isShowPlayList = ref(true);
			const playlist = ref([]);
			const myfavorite = ref([]);
			const uid = ref(null);
			const title = ref('');
			const hidden = ref(null);
			//确认
			const onConfirm = async() => {
				let res = null
				if(!title.value) return Toast('歌单名为空')
				if(hidden.value){
					res = await createPlaylist(title.value,10)
				}else{
					res = await createPlaylist(title.value)
				}
        if(res.code == 200){
        	onCancel()
					myfavorite.value.push(res.playlist)
        } 
			}
			//取消
			const onCancel = () => {
				title.value = ''
				hidden.value = false
				show.value = false
			}
			//创建歌单弹出层
			const onCreated = async() => {
				show.value = true
			}
			//分开获取我喜欢的音乐和我收藏的歌单
			const onGetUserPlayList = () => {
				getUserPlaylist(uid.value,Date.now()).then(res=>{
					if(res.code == 200){
						playlist.value = res.playlist.filter(val => val.subscribed)
						myfavorite.value = res.playlist.filter(val => !val.subscribed)
					}
				})
			}
			//
			const onDelete = async({item,index}) => {
				Toast.loading({
					duration: 0, // 持续时间，0表示持续展示不停止
					forbidClick: true, // 是否禁止背景点击
					message: '加载中...' // 提示消息
				})
				const res = await deletePlaylist(item.id, Date.now())
				if(res.code == 200){
					if(item.subscribed){
						playlist.value.splice(index,1)
						if(playlist.value[index]){
							reSongDetail(playlist.value[index].id)
						}else{
							reSongDetail(playlist.value[index*1-1].id)
							active.value--
						}
					} else {
						myfavorite.value.splice(index,1)
						console.log(myfavorite.value[index])
						if(myfavorite.value[index]){
							reSongDetail(myfavorite.value[index].id)
						}else{
							reSongDetail(myfavorite.value[index*1-1].id)
							active.value--
						}
					}
				}
				Toast.clear()
			}
			//歌单详情页面跳转
			const reSongDetail = (id) => {
				//路由视图组件引用了相同组件时，当路由参会变化时，会导致该组件无法更新，也就是我们常说中的页面无法更新的问题。
					router.push({
						path: '/home/songDetail',
						query: {
							id
						}
					})
			}
			//{immediate:true}立即执行因此不需要onMounted挂载执行			
			//监听登录状态,获取uid并获取自己收藏的歌单 (立即执行)
			watch(()=>store.state.isLogin,(newValue,oldValue)=>{
					if(store.getters.getUserId){
						uid.value = store.getters.getUserId
						onGetUserPlayList()
					}
			},{immediate:true})
			
			return { 
				active,
				isShowIcon,
				isShowPlayList,
				playlist,
				myfavorite,
				uid,
				onGetUserPlayList,
				show,
				onCreated,
				title,
				hidden,
				onConfirm,
				onCancel,
				onDelete,
				reSongDetail
			};
		}
	}
</script>

<style lang="less" scoped="scoped">
	.cloud-aside{
		width: 20%;
		height: 79%;
		overflow: auto;
		z-index: 99;
		position:fixed;
		margin-top: 80px;
		padding-right: 10px;
		border-right: 1px solid rgba(125,125,125,0.3);
		z-index: 2;
		:deep(.van-badge__wrapper){
			position: absolute;
			left: 25px;
			top: calc(50% - 10px);
		}
		.myMusic{
			display: flex;
			margin: 10px 0;
			margin-left: 35px;
			color: darkgray;
			justify-content: space-between;
			div{
				display: inline-block;
				cursor: pointer;
			}
		}
		.common{
			.van-sidebar-item--select{
				font-weight: bold;
			}
		}
		.van-sidebar-item{
			font-size: 16px;
			margin-left: 10px;
			height: 50px;
			background-color: white;
			button{
				margin-left: 70px;
				width: 50px;
				height: 30px;
				border-radius: 15px;
				border: none;
				background-color: white;
				border: 1px solid rgba(125,125,125,0.3);
				cursor: pointer;
				&:hover{
					background-color: rgba(125,125,125,0.1);
				}
				i{
					margin-right: 0px;
					font-size: 18px;
				}
			}
			i{
				margin-right: 10px;
				font-size: 20px;
			}
		}
		.van-sidebar-item--select{
			background-color: rgba(125,125,125,0.1);
		}
		.van-sidebar{
			width: 100%;
		}
		
		.van-badge__wrapper{
			.icon-gedan1{
				font-size: 22px;
				top: 3px;
			}
			.playlist{
				display: inline-block;
				width: 240px;
				height: 25px;
				line-height: 25px;
				text-align: left;
				margin-left: 26px;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}		
	}
	
</style>
