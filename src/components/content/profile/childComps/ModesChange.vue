<template>
	<div>
		<div class="user-subscribers-list">
			<div class="user-subscribers-list-title">
				<slot name="types"></slot>
				<div>
					<i class="iconfont icon-datumoshi" :class='modes==0?"active":""' @click='changeModes(0)' title="大图模式"></i>
					<i class="iconfont icon-31liebiao" :class='modes==1?"active":""' @click='changeModes(1)' title="列表模式"></i>
					<i class="iconfont icon-liebiao" :class='modes==2?"active":""' @click='changeModes(2)' title="图列模式"></i>
				</div>
			</div>

			<div class="user-subscribers-list-content" v-show="modes==0">
				<slot name="title"></slot>
				<div v-for="(item,index) in subscriber" :key='item.id'>
					<div style="position: relative;">
						<i class="iconfont icon-bofang"></i>
						<img v-lazyload="item.coverImgUrl + '?param=175y175'" alt="" @click="reSongDetail(item.id)">
						<div>
							<i class="iconfont icon-bofang1"></i>
							<span>{{item.playCount}}</span>
						</div>
					</div>
					<div>
						<span class="introduce">{{item.name}}</span>
						<p>{{item.trackCount}}首</p>
					</div>
				</div>
			</div>

			<div class="user-subscribers-list-second" v-show="modes==1">
				<slot name="title2"></slot>
				<div class="user-subscribers-list-main" v-for="(item,index) in subscriber" :key='item.id' :class="index%2?'':'differ'">
					<div style="width: 45%;">
						<div @click="reSongDetail(item.id)">
							<i class="iconfont icon-bofang"></i>
							<img v-lazyload="item.coverImgUrl + '?param=70y70'" alt="">
						</div>
						<span @click="reSongDetail(item.id)">{{item.name}}</span>
					</div>
					<div>
						<span>歌曲: {{item.trackCount}}曲</span>
						<span>by {{userInfo.nickname}}</span>
						<span @click="$store.state.uid == $route.query.id || item.subscribed?'':onCollect(item)">
							<i class="iconfont icon-wenjianshoucang" style="font-size: 20px;font-weight: bold;"></i>
							{{item.subscribedCount>9999?Math.floor(item.subscribedCount/10000)+'万':item.subscribedCount}}
						</span>
						<span>
							<i class="iconfont icon-bofang3" style="font-size: 18px;font-weight: bold;"></i>
							{{item.playCount>9999?Math.floor(item.playCount/10000)+'万':item.playCount}}
						</span>
					</div>
				</div>
			</div>

			<div class="user-subscribers-list-third" v-show="modes==2">
				<div class="user-subscribers-most" v-if="( $route.query.id == $store.state.uid || peopleCanSee )&& modify == 'ModesChange1'">
					<div class="user-subscribers-left" @click="recentListen">
						<img src="~assets/img/排行.png" alt="">
					</div>
					<div class="user-subscribers-right">
						<div class="user-subscribers-top" @click="recentListen">
							<span>听歌排行</span>
						</div>
						<div class="user-subscribers-bottom">
							<rencent-list :recentSongs='recentSongs' :isCompareShow='isCompareShow' @onLike='onLike' style="width: 890px;"></rencent-list>
							<div style="width: 890px;height: 30px;background-color: #F9F9F9;text-align: right;font-size: 14px;line-height: 30px;color: darkgray;border-radius: 4px;display: inline-block;cursor: pointer;"
							 v-if="recentSongs.nums>10" @click="recentListen">
								<span style='margin-right: 48px;'>查看全部{{recentSongs.nums}}首歌 ></span>
							</div>
						</div>
					</div>
				</div>
				<div class="user-subscribers-most" v-for="(item,index) in subscriber" :key='item.id'>
					<div class="user-subscribers-left" @click="reSongDetail(item.id)">
						<img v-lazyload="item.coverImgUrl + '?param=180y180'" alt="">
					</div>
					<div class="user-subscribers-right">
						<div class="user-subscribers-top">
							<span @click="reSongDetail(item.id)">{{item.name}}</span>
							<i class="iconfont icon-bofang3"></i>
							<i class="iconfont icon-wenjianshoucang" @click="onCollect(item)" v-if="!item.subscribed && $store.state.uid != $route.query.id"></i>
						</div>
						<div class="user-subscribers-bottom" v-if="selfSongs[item.id]!=undefined">
							<template v-if="selfSongs[item.id].length!=0">
								<rencent-list :recentSongs='selfSongs[item.id]' :isCompareShow='isCompareShow' @onLike='onLike' style="width: 890px;">
									<template v-slot:time = '{ time }'>
										<span class='time'>{{'0'+new Date(time).getMinutes()+':'+(new Date(time).getSeconds()<10?'0'+new Date(time).getSeconds():new Date(time).getSeconds())}}</span>
									</template>
								</rencent-list>
							</template>
							<div style="width: 890px;height: 30px;background-color: #F9F9F9;text-align: right;font-size: 14px;line-height: 30px;color: darkgray;border-radius: 4px;display: inline-block;cursor: pointer;"
							 v-if="selfSongs[item.id].nums>10" @click="reSongDetail(item.id)">
								<span style='margin-right: 48px;'>查看全部{{selfSongs[item.id].nums}}首歌 ></span>
							</div>
							<div class="user-subscribers-bottom-list differ" v-else>
								<span style='display: inline-block;margin: 0 auto;'>暂无音乐</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div style='width: 55%;margin: 50px auto 200px;' v-if="totalItems>1">
			<van-pagination v-model="currentPage" :page-count='totalItems' :show-page-size="totalItems>8?8:totalItems"
			 force-ellipses @change='changePage' />
		</div>
	</div>
</template>

<script>
	//由于setup中不存在this,因此在setup中使用路由必须先声明
	import {
		useRouter,
		useRoute
	} from 'vue-router';
	//vuex功能引入
	import {
		useStore
	} from 'vuex'
	//vue功能引入
	import {
		ref,
		onMounted,
		nextTick,
		watch,
		computed
	} from 'vue'
	//组件库引入
	import {
		Toast
	} from 'vant'
	//接口引入
	import {
		getRecord
	} from 'network/useDetail.js'
	import {
		userSubscribe,
		likeSongs,
		detailInfo,
		likeSongsList
	} from 'network/songs.js'
	//本地存储引入
	import {
		setItem,
		getItem
	} from 'store/storage.js'
	import rencentList from './rencentList.vue'
	export default {
		name: 'ModesChange',
		props: {
			listData: {
				type: Array,
				required: true,
				default () {
					return []
				}
			},
			peopleCanSee: {
				type: Boolean,
				default () {
					return false
				}
			},
			userInfo: {
				type: Object,
				required: true,
				default () {
					return {}
				}
			},
			modify: {
				type: String,
				required: true,
				default () {
					return ''
				}
			}
		},
		components: {
			rencentList
		},
		setup(props, ctx) {
			const store = useStore();
			const router = useRouter();
			const route = useRoute();

			const modes = ref(getItem([props.modify]) ? getItem([props.modify]) : 0);
			const likes = ref([]);
			const recentSongs = ref([]);
			const selfSongs = ref({});
			const currentPage = ref(1);
			const totalItems = ref(null);
			const subscriber = ref([]);
			const isCompareShow = ref({});

			const selfCreateList = computed(() => {
				return props.listData
			})
			//歌单详情页面跳转
			const reSongDetail = (id) => {
				router.push({
					path: '/home/songDetail',
					query: {
						id
					}
				})
			}
			//取消收藏与收藏功能 无需防抖
			const onCollect = async (item) => {
				// 判断登录状态
				if (store.state.isLogin) {
					const res = await userSubscribe(1, item.id, Date.now())
					Toast({
						message: '收藏成功'
					})
					//页面数据变化
					item.subscribedCount++
					item.subscribed = !item.subscribed
					//aside数据变化
					store.state.isLogin = ''
					nextTick(() => {
						store.state.isLogin = true
					})
				} else {
					Toast({
						message: '请登录后再操作(未做保存本地功能)'
					})
				}
			}
			//用户歌单请求操作
			const getSelfList = async (val) => {
				const data = await detailInfo(val, Date.now())
				let lists = data.playlist.tracks.filter((item, index) => index < 10)
				lists.nums = data.playlist.trackIds.length
				selfSongs.value[val] = lists
				//对比搜索时的喜欢音乐
				selfSongs.value[val].forEach(item => {
					isCompareShow.value[item.id] = likes.value.some(items => items == item.id)
				})
				Toast.clear()
			}
			//分页功能
			const changePage = () => {
				subscriber.value = []
				selfCreateList.value.filter((item, index) => {
					if (index < 20 * currentPage.value && index >= 20 * (currentPage.value - 1)) {
						subscriber.value.push(item)
					}
				})
			}
			//改变图列模式
			const changeModes = async (value) => {
				modes.value = value
				// 将图例模式存储于本地
				// console.log(props.modify)
				setItem([props.modify], value)
				//判断模式类型是否为图列模式
				watch(selfCreateList.value, (newValue, oldValue) => {
					//总页数
					totalItems.value = Math.ceil(selfCreateList.value.length / 20)
					//分页功能实现第一页 可封装为方法多次使用
					selfCreateList.value.filter((item, index) => {
						if (index < 20 * currentPage.value && index >= 20 * (currentPage.value - 1)) {
							subscriber.value.push(item)
						}
					})
					selfCreateList.value.filter(item => {
						getSelfList(item.id)
					})
				})

				if (value == 2) {
					//用户歌单请求
					//判断用户是否开放访问权限并且不是用户自己
					if (!props.peopleCanSee && route.query.id != store.state.uid) return
					//用户开放访问权限 获取歌单
					const res = await getRecord(route.query.id, 0)
					res.allData.filter((item, index) => {
						if (index < 10) {
							recentSongs.value.push(item.song)
						}
					})
					recentSongs.value.nums = res.allData.length
				}
			}
			//跳转最近用户听的歌曲页面
			const recentListen = () => {
				router.push({path:'/home/rank',query:{id:route.query.id}})
			}
			//判断登录状态 获取用户喜欢的歌曲列表(立即执行)
			watch(() => store.state.isLogin, (newValue, oldValue) => {
				if (store.state.isLogin) {
					//登录状态获取喜欢的音乐列表 此处建议获取到vuex中多处能使用
					likeSongsList(store.state.uid, Date.now()).then(res => {
						likes.value = res.ids
					})
				}
			}, {
				immediate: true
			})
			//歌曲喜欢
			const onLike = async (val) => {
				// 判断登录状态
				if (store.state.isLogin) {
					Toast.loading({
						duration: 0, // 持续时间，0表示持续展示不停止
						forbidClick: true, // 是否禁止背景点击
						message: '加载中...' // 提示消息
					})

					const res = await likeSongs({
						id: val.id,
						like: !isCompareShow.value[val.id],
						timerstamp: Date.now()
					})
					if (res.code == 200) {
						//判断是否为自己 将不喜欢的从列表删除歌曲数变化
						if (route.query.id == store.state.uid) {
							let loveIt = selfSongs.value[res.playlistId].some((item, index) => {
								if (item.id == val.id) {
									selfSongs.value[res.playlistId].splice(index, 1)
									return true
								}
							})
							if (!loveIt) {
								selfSongs.value[res.playlistId].unshift(val)
								if (selfSongs.value[res.playlistId].length > 10) {
									selfSongs.value[res.playlistId].splice(10, 1)
								}
							}
							if (selfSongs.value[res.playlistId] && isCompareShow.value[val.id]) {
								selfSongs.value[res.playlistId].nums--
							} else {
								selfSongs.value[res.playlistId].nums++
							}
						}
						isCompareShow.value[val.id] = !isCompareShow.value[val.id]
						if (isCompareShow.value[val.id]) {
							Toast('已添加到我喜欢的音乐')
						} else {
							Toast('取消喜欢成功')
						}
					}
					Toast.clear()
				} else {
					Toast({
						message: '请登录后再操作(未做保存本地功能)'
					})
				}
			}
			//监听路由变化页面不刷新bug 直接监听路由进行挂载 无需onMounted再执行
			watch(() => route.query.id, async (newValue, oldValue) => {
				changeModes(getItem([props.modify]) ? getItem([props.modify]) : 0)
			}, {
				immediate: true
			})

			return {
				modes,
				selfCreateList,
				reSongDetail,
				onCollect,
				changeModes,
				onLike,
				isCompareShow,
				getSelfList,
				selfSongs,
				recentSongs,
				currentPage,
				totalItems,
				changePage,
				subscriber,
				recentListen
			}
		}
	}
</script>

<style scoped lang="less">
	.icon-bofang {
		z-index: 1;
		color: var(--mainColor);
		width: 35px;
		height: 35px;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.9);
		line-height: 35px;
		text-align: center;
		opacity: 0;
		transition: all 0.3s ease-in;
		position: absolute;
	}

	.user-subscribers-list {
		margin-left: 20px;
		margin-top: 40px;

		.user-subscribers-list-title {
			display: flex;
			width: 94%;
			justify-content: space-between;

			.active {
				background-color: rgba(125, 125, 125, 0.3);
			}

			span {
				font-size: 18px;
				font-weight: bold;
			}

			div {
				i {
					width: 25px;
					height: 25px;
					border-radius: 2px;
					background-color: rgba(125, 125, 125, 0.1);
					display: inline-block;
					line-height: 25px;
					color: darkgray;
					cursor: pointer;

					&:nth-child(2) {
						margin: 0 2px;
					}

					&:hover {
						background-color: rgba(125, 125, 125, 0.2);
					}
				}
			}
		}

		.user-subscribers-list-content {
			display: flex;
			flex-wrap: wrap;
			text-align: left;
			margin-top: 10px;

			div {
				width: 15%;
				margin-right: 11px;

				&:nth-of-type(1):hover .icon-bofang {
					opacity: 1;
					transition: all 0.3s ease-in;
				}

				img {
					width: 175px;
					height: 175px;
					border-radius: 6px;
					display: block;
					position: relative;
					cursor: pointer;
				}

				.icon-bofang {
					bottom: 10px;
					right: 10px;
				}

				div {
					position: relative;

					div {
						position: absolute;
						top: 0px;
						color: white;
						right: 0px;
						font-weight: bold;
						text-align: right;

						i {
							color: white;
							font-weight: bold;
						}
					}
				}

				div {
					width: 175px;
					font-size: 14px;
					text-align: left;
					margin-top: 10px;

					.introduce {
						overflow: hidden;
						text-overflow: ellipsis;
						display: -webkit-box;
						-webkit-line-clamp: 2;
						-webkit-box-orient: vertical;
						cursor: pointer;
					}

					span {
						margin-top: 5px;
						opacity: 0.8;
						cursor: pointer;

						&:hover {
							opacity: 1;
						}
					}

					p {
						font-size: 13px;
						color: darkgray;
						margin-top: 2px;
					}
				}
			}
		}

		.user-subscribers-list-second {
			margin-top: 20px;

			.user-subscribers-list-main {
				display: flex;
				align-items: center;
				justify-content: space-between;
				width: 100%;
				height: 90px;
				margin-left: -25px;
				flex: 1;
				cursor: pointer;

				&:hover {
					background-color: rgba(125, 125, 125, 0.1);
				}

				div {
					display: flex;
					align-items: center;

					div {
						position: relative;

						&:hover .icon-bofang {
							opacity: 1;
							transition: all 0.3s ease-in;
						}

						i {
							position: absolute;
							left: calc(50% - 5px);
							top: 18px;
						}

						img {
							width: 70px;
							height: 70px;
							border-radius: 4px;
							margin-left: 25px;
							cursor: pointer;
							vertical-align: middle;
						}
					}

					span {
						display: inline-block;
						overflow: hidden;
						text-align: left;
						width: 430px;
						text-overflow: ellipsis;
						white-space: nowrap;
						margin-left: 15px;
						opacity: 0.8;

						&:hover {
							color: black;
						}
					}

					&:nth-of-type(2) {
						color: darkgray;
						display: flex;
						justify-content: space-between;
						width: 50%;
						margin-right: 60px;
						text-align: left;
						font-size: 14px;

						span {
							width: 160px;

							&:nth-of-type(1),
							&:nth-of-type(3),
							&:nth-of-type(4) {
								width: 100px;
							}
						}
					}
				}
			}


		}

		.user-subscribers-list-third {
			margin-top: 20px;

			.user-subscribers-most {
				display: flex;
				margin-bottom: 40px;

				.user-subscribers-left {
					img {
						width: 180px;
						height: 180px;
						border-radius: 8px;
						cursor: pointer;
					}
				}

				.user-subscribers-right {
					text-align: left;
					margin-left: 60px;

					.user-subscribers-bottom {
						margin-top: 10px;

						.user-subscribers-bottom-list {
							width: 890px;
							align-items: center;
							display: flex;
							height: 30px;
							color: darkgray;
							border-radius: 4px;
							cursor: pointer;
						}

						.time {
							position: absolute;
							right: 160px;
						}

					}

					.user-subscribers-top {
						span {
							font-size: 20px;
							font-weight: bold;
							cursor: pointer;
							opacity: 0.9;

							&:hover {
								opacity: 1;
							}
						}

						i {
							font-size: 22px;
							font-weight: bold;
							cursor: pointer;
							opacity: 0.8;

							&:nth-of-type(1) {
								margin: 0 20px;
							}

							&:hover {
								opacity: 1;
							}
						}
					}

					.differ {
						background-color: #F9F9F9;
					}


				}
			}
		}
	}
</style>
