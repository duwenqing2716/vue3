<template>
	<div>
		<van-row class="row-songs-list-nav">
			<van-col span="4"></van-col>
			<van-col span="8" class='row-songs-list-content'>音乐标题</van-col>
			<van-col span="4" class='row-songs-list-content'>歌手</van-col>
			<van-col span="6" class='row-songs-list-content'>专辑</van-col>
			<van-col span="2" class='row-songs-list-content'>时长</van-col>
		</van-row>
		<van-row class="row-songs-list-details" :class="index%2?'':'differ'" v-for="(item,index) in listSongs" :key='item.id'>
			<van-col class="row-songs-list-num" span="4">
				<span>{{index+1<10?'0'+(index+1):index+1}}</span>
				<i class="iconfont icon-xihuan2" style="color: #EC4141;" v-if="isCompare[item.id]" @click='onLike(item.id,true,index,0)'></i>
				<i class="iconfont icon-xihuan1" v-else @click='onLike(item.id,false,index,0)'></i>
				<i class="iconfont icon-download"></i>
			</van-col>
			<van-col span="8" class="row-songs-list-name" style="color: black;">
				<span class="list-row">{{item.name}}</span>
				<span class="SQorMv">SQ</span>
				<span class="SQorMv">MV</span>
			</van-col>
			<van-col span="4" class="row-songs-list-name">{{item.ar[0].name===''?'未知歌手':item.ar[0].name}}</van-col>
			<van-col span="6" class="row-songs-list-name">{{item.al.name===''?'未知专辑':item.al.name}}</van-col>
			<van-col span="2" class="row-songs-list-name">{{'0'+new Date(item.dt).getMinutes()+':'+(new Date(item.dt).getSeconds()<10?'0'+new Date(item.dt).getSeconds():new Date(item.dt).getSeconds())}}</van-col>
		</van-row>
	</div>
</template>

<script>
	// 组件库引入
	import {
		Toast,
		Dialog
	} from 'vant'
	//vuex功能引入
	import {
		useStore
	} from 'vuex'
	//vue功能引入
	import {
		ref,
		reactive,
		computed
	} from 'vue'
	//接口引入
	import {
		likeSongs
	} from 'network/songs.js'
	//路由功能引入
	import {
		useRoute
	} from 'vue-router'
	export default {
		name: 'songLists',
		props: {
			isCompare: {
				type: [Object,Array],
				required: true,
				default () {
					return {} || []
				}
			},
			listSongs: {
				type: Array,
				required: true,
				default () {
					return []
				}
			},
			songsDetails: {
				type: Object,
				default () {
					return {}
				}
			}
		},
		setup(props, ctx) {
			const store = useStore();
			const route = useRoute(); //实例化路由
			//保存时间进行防抖操作 好像能用同一个
			const time = ref(null);
			const state = reactive({
				timer: null
			})
			const uid = ref(null);
			
			const isCompare = computed(()=>{
				return props.isCompare
			})
			const listSongs = computed(()=>{
				return props.listSongs
			})
			const songsDetails = computed(()=>{
				return props.songsDetails
			})
			//更新页面数据,将喜欢的音乐与点赞信息真正存于后端
			const getReCompare = async (id, like, timerstamp) => {
				const res = await likeSongs({
					id: id,
					like: !like,
					timerstamp: timerstamp
				})
				if (res.code == 200) {
					//判断是否为自己 将不喜欢的从列表删除歌曲数变化
					if(res.playlistId == route.query.id){
							// 未搜索时
							listSongs.value.some((item,index) => {
								if(item.id == id){
									listSongs.value.splice(index,1)
									//总音乐数更新
									songsDetails.value.trackCount--
								}
							})
					}
				}
			}
			//点击添加或者取消喜欢音乐
			const onLike = async (id, like, index, status) => {
				// 判断登录状态
				if (store.state.isLogin) {
					// 获取用户uid
					uid.value = store.getters.getUserId
					//判断歌单是否为用户本身 不喜欢时进行删除操作
					if(songsDetails.value.userId == store.state.uid){
						//是否确认操作
						Dialog.confirm({
							message: '确定将选中的歌曲从我喜欢的音乐中删除吗?',
						}).then(() => {
							//确认后直接删除无需防抖
							isCompare.value[id] = false
							Toast('取消喜欢成功')
							getReCompare(id, like, Date.now())
						}).catch(() => {
							//取消确认
						});
					}else{
					//不是用户本身歌单 进行操作防抖
					let message = ''
					if (like) {
						message = '取消喜欢成功'
						//判断是否为搜索时渲染 操作多余了直接取反就行
						isCompare.value[id] = false
					} else {
						message = '已添加到我喜欢的音乐'
						//判断是否为搜索时渲染  操作多余了直接取反就行
						isCompare.value[id] = true
					}
					Toast({
						message: message
					})
					//当用户快速点击时将未能及时快速响应 (已修复)几乎不会出现高频点击报错，但是6次后依然出现问题 后端设置问题(前端无力)
					if (time.value != null) {
						clearTimeout(time.value)
					}
					//防抖设置
					time.value = setTimeout(() => {
						getReCompare(id, like, Date.now())
					}, 500)
					}
				} else {
					Toast({
						message: '请登录后再操作(未做保存本地功能)'
					})
				}
			}
			return {
				onLike,
				getReCompare,
				time,
				state,
				isCompare,
				listSongs,
				uid
			}
		}
	}
</script>

<style scoped lang="less">
	.row-songs-list-nav {
		text-align: left;
		height: 35px;
		line-height: 35px;

		.row-songs-list-content {
			cursor: pointer;
			padding-left: 8px;
			color: darkgray;

			&:hover {
				background-color: rgba(125, 125, 125, 0.1);
			}
		}
	}

	.differ {
		background-color: #F9F9F9;
	}

	.row-songs-list-details {
		text-align: left;
		height: 35px;
		line-height: 35px;
		color: darkgray;
		cursor: pointer;

		&:hover {
			background-color: rgba(125, 125, 125, 0.15);
		}

		.row-songs-list-num {
			text-align: center;

			i {
				font-size: 18px;
				font-weight: bold;
			}

			.icon-xihuan1,
			.icon-download {
				opacity: 0.4;
				color: black;
				cursor: pointer;

				&:hover {
					opacity: 0.8;
				}
			}

			.icon-xihuan1,
			.icon-xihuan2 {
				margin: 0 10px 0 55px;
			}
		}

		.row-songs-list-name {
			width: 90%;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			padding-left: 8px;

			.SQorMv {
				display: inline-block;
				width: 25px;
				height: 14px;
				font-size: 13px;
				border: 2px solid var(--mainColor);
				border-radius: 4px;
				text-align: center;
				color: var(--mainColor);
				line-height: 15px;
				margin-right: 8px;
			}

			.list-row {
				display: inline-block;
				max-width: 80%;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				vertical-align: middle;
				margin-right: 10px;
			}
		}
	}
</style>
