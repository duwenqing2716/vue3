<template>
	<div class="userDetail">
		<div class="user-nav">
			<img :src="userInfo.avatarUrl + '?param=200y200'" alt="">
			<div class="user-nav-right">
				<div class="user-nav-top">
					<div class="user-nickname-left">
						<span>{{userInfo.nickname}}</span>
						<div>
							<span class="vipType" v-show="userInfo.vipType == 11">vip·叁</span>
							<template v-if="identify && userInfo.allAuthTypes">
								<div class="labels" v-for="(item,index) in userInfo.allAuthTypes" :key='index'>
							  <img class='icon-label' :src="identify.imageUrl + '?param=22y22'" alt="" v-if="index==0">
								<img class='icon-label' src="https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/4761340149/f4bf/64a1/1ea2/31a08617d7dfddb21fffdb92390ce268.png?param=22y22" alt="" v-else-if="(item.desc).indexOf('达人')!=-1 || (item.desc).indexOf('合伙人')!=-1">
								<img class='icon-label' src="https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/4874132307/4499/f228/d867/da64b9725e125943ad4e14e4c72d0884.png?param=22y22" alt="" v-else>	
								<span class='iconRed' v-if="(item.desc).indexOf('达人')!=-1 || (item.desc).indexOf('合伙人')!=-1">{{item.desc}}</span>
								<span class='iconYellow' v-else>{{item.desc}}</span>
								</div>
							</template>
							<span class="levels">Lv.{{level}}</span>
							<span style='margin-top: 2px;'>
								<i class="iconfont icon-nanxing" v-if="userInfo.gender == 1"></i>
								<i class="iconfont icon-nvxing" style="background-color:#FFCDE8;color: #EF77AA;" v-else-if='userInfo.gender == 2'></i>
							</span>
						</div>
					</div>
					<div class="user-nickname-right">
						<div v-if="$store.state.uid != id">
							<button>
								<i class="iconfont icon-youjian"></i>
								<span>发私信</span>
							</button>
							<button @click="onFollowed(userInfo.followed)">
								<i class="iconfont icon-tianjia" v-if="!userInfo.followed"></i>
								<i class="iconfont icon-zhengque1" v-else style="font-weight: bolder;font-size: 20px;"></i>
								<span>{{userInfo.followed?'已关注':'关注'}}</span>
							</button>
							<button>
								...
							</button>
						</div>
						<div v-else>
							<router-link to='/home/profile'>
								<button style='width: 180px;color: black;'>
									<i class="iconfont icon-bianji"></i>
									编辑个人信息
								</button>
							</router-link>
						</div>
					</div>
				</div>
				<div class="user-nav-bottom">
					<div class="signIn-nav">
						<div @click="onReProfile('events')">
							<p>{{userInfo.eventCount}}</p>
							<span>动态</span>
						</div>
						<div @click="onReProfile('followed')">
							<p>{{userInfo.follows}}</p>
							<span>关注</span>
						</div>
						<div @click="onReProfile('fans')">
							<p>{{userInfo.followeds}}</p>
							<span>粉丝</span>
						</div>
					</div>
					<p v-show="city">用户所在地区: {{city}}</p>
					<p>社交网络: {{bindings.length>0?'已绑定'+bindings.length+'个账号':'未绑定'}}</p>
					<p style="width: 600px;">个人介绍: {{userInfo.signature?userInfo.signature:'暂无个人介绍'}}</p>
				</div>
			</div>
		</div>
		<modes-change :listData='selfCreateList' :peopleCanSee='peopleCanSee' :userInfo='userInfo' :modify='"ModesChange1"'>
			<template v-slot:types>
				<span>歌单({{selfCreateList.length}})</span>
			</template>
			<template v-slot:title>
				<div v-if="peopleCanSee || $route.query.id == $store.state.uid">
					<div style="position: relative;">
						<i class="iconfont icon-bofang"></i>
						<img src="~assets/img/排行.png" alt="" @click="recentListen">
					</div>
					<div>
						<span>听歌排行</span>
						<p>累计听歌{{listenSongs}}首</p>
					</div>
				</div>
			</template>
			<template v-slot:title2>
				<div class="user-subscribers-list-main" v-if="peopleCanSee || $route.query.id == $store.state.uid">
					<div>
						<div @click="recentListen">
							<i class="iconfont icon-bofang"></i>
							<img src="~assets/img/排行.png" alt="">
						</div>
						<span>听歌排行</span>
					</div>
					<div>
						<span style='width: 200px;'>累计听歌{{listenSongs}}首</span>
					</div>
				</div>
			</template>
		</modes-change>
		
		<modes-change :listData='playlist' :userInfo='userInfo' :peopleCanSee='false' :modify='"ModesChange2"'>
			<template v-slot:types>
				<span>收藏({{playlist.length}})</span>
			</template>
		</modes-change>
	</div>
</template>

<script>
	//由于setup中不存在this,因此在setup中使用路由必须先声明
	import {
		useRouter,
		useRoute
	} from 'vue-router';
	//vue功能引入
	import {
		ref,
		onMounted,
		nextTick,
		watch
	} from 'vue'
	//vuex功能引入
	import {
		useStore
	} from 'vuex'
	//接口引入
	import {
		getUserDetail,
		userFollowed,
		userPlayList,
		getRecord
	} from 'network/useDetail.js'
	import {
		likeSongsList,
		detailInfo,
		userSubscribe,
		likeSongs
	} from 'network/songs.js'
	//地区数据引入
	import {
		areaList
	} from '@vant/area-data';
	//组件库引入
	import {
		Toast
	} from 'vant'
	//本地存储引入
	import { setItem,getItem } from 'store/storage.js'
	import ModesChange from './childComps/ModesChange.vue'
	export default {
		name: 'userDetail',
		props: {
			id: {
				type: String,
				required: true,
				default () {
					return null
				}
			}
		},
		components:{
			ModesChange
		},
		setup(props, context) {
			const store = useStore();
			const router = useRouter();

			const bindings = ref([]);
			const userInfo = ref({});
			const level = ref(null);
			const listenSongs = ref(0);
			const city = ref('');
			const playlist = ref([]);
			const selfCreateList = ref([]);
			const selfSongs = ref({});
			const peopleCanSee = ref(false);
			const identify = ref({});
			//关注与取消相关功能
			const onFollowed = async (val) => {
				let t = 0
				let message = ''
				if (val) {
					t = 0
					message = '取消关注成功！'
					//页面数据变化
					userInfo.value.followeds--
				} else {
					t = 1
					message = '关注成功！'
					//页面数据变化
					userInfo.value.followeds++
				}
				const res = await userFollowed(props.id, t, Date.now())
				if (res.code == 200) {
					userInfo.value.followed = !userInfo.value.followed
					Toast({
						message: message
					})
				}
			}
			//
			const onReProfile = (val) => {
				router.push({path:'/user/'+val,query:{id:props.id}})
			}
			//跳转最近用户听的歌曲页面
			const recentListen = () => {
				router.push({path:'/home/rank',query:{id:props.id}})
			}
		  //监听路由变化页面不刷新bug 直接监听路由进行挂载 无需onMounted再执行
			watch(()=>props.id,async (newValue,oldValue)=>{
				city.value = '';
				playlist.value = [];
				selfCreateList.value = [];
				selfSongs.value = {};
				peopleCanSee.value = false;
							
				Toast.loading({
					duration: 0, // 持续时间，0表示持续展示不停止
					forbidClick: true, // 是否禁止背景点击
					message: '加载中...' // 提示消息
				})

				const res = await getUserDetail(props.id, Date.now())
				peopleCanSee.value = res.peopleCanSeeMyPlayRecord
				level.value = res.level
				userInfo.value = res.profile
				if(userInfo.value.allAuthTypes)
				userInfo.value.allAuthTypes = userInfo.value.allAuthTypes.filter(item=>item.type!=400)
        // console.log(res)
				bindings.value = res.bindings
				listenSongs.value = res.listenSongs
				identify.value = res.identify
				
				//省份数据操作,一些省份数据不对等,暂不考虑该情况
				for (let i in areaList.province_list) {
					if (i == userInfo.value.province) {
						city.value += areaList.province_list[i] + ' '
					}
				}
				for (let j in areaList.city_list) {
					if (j == userInfo.value.city) {
						city.value += areaList.city_list[j]
					}
				}
				//获取用户喜欢的歌曲列表
				const data = await likeSongsList(props.id, Date.now())
				//获取用户歌单将限制调整到5000,以一次性获取全部歌单
				const resData = await userPlayList(props.id, 5000, 0, Date.now())
				//筛选歌单是否为用户自己创建,分开处理
				if(!resData.playlist) return Toast.clear()
				resData.playlist.filter(item => {
					if (item.creator.userId == props.id) {
						selfCreateList.value.push(item)
					} else {
						playlist.value.push(item)
					}
				})
				Toast.clear()
			},{immediate:true})

			return {
				bindings,
				userInfo,
				level,
				listenSongs,
				city,
				playlist,
				selfCreateList,
				onFollowed,
				selfSongs,
				peopleCanSee,
				recentListen,
				onReProfile,
				identify
			}
		}
	}
</script>

<style scoped lang="less">
	.userDetail {
		width: 80%;
		margin-left: calc(21%);
		position: absolute;
		margin-top: 60px;

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

		.user-nav {
			display: flex;
			margin-left: 20px;
			margin-top: 30px;

			img {
				width: 200px;
				height: 200px;
				border-radius: 50%;
			}

			.user-nav-right {
				margin-left: 40px;
				width: 74%;

				.user-nav-top {
					display: flex;
					justify-content: space-between;
					width: 100%;
					height: 65px;
					border-bottom: 1px solid lightgray;

					.user-nickname-left {
						text-align: left;

						span {
							font-size: 24px;
							font-weight: bold;
						}

						div {
							display: flex;
							align-items: center;
							height: 28px;
							margin-top: 2px;
							i {
								background-color: #C0F3FF;
								color: #57B1DB;
								display: inline-block;
								width: 20px;
								height: 20px;
								border-radius: 50%;
								font-size: 12px;
								line-height: 20px;
								text-align: center;
								vertical-align: middle;
							}
							span{
								margin-right: 10px;
							}
							.vipType {
                font-size: 12px;
								display: inline-block;
								height: 22px;
								border-radius: 10px;
								padding:0 5px;
								background-color: #131312;
								line-height: 22px;
								color: #F0D6D3;
							}
							.labels{
								height: 22px;
								border-radius: 30px;
								font-size: 13px;
								font-weight: bold;
								display: flex;
								align-items: center;
								.icon-label	{
									width:22px;
									height: 22px;
								}
								span{
									font-size: 13px;
									padding:0 8px 0 25px;
									height: 22px;
									border-radius: 30px;
									display: inline-block;
									margin-left: -22px;
									z-index: -1;
									line-height: 22px;
									
								}
								.iconRed{
									background-color: #FFF3DC;
									color: #FFB014;
								}
								.iconYellow{
									background-color: #FDE4E2;
									color: #F2483B;
								}
							}
							.levels{
								font-size: 12px;
								display: inline-block;
								height: 22px;
								border-radius: 10px;
								padding:0 5px;
								background-color: rgba(125,125,125,0.2);
								line-height: 22px;
								margin-top: 4px;
							}
						}
					}

					.user-nickname-right {
						button {
							width: 100px;
							height: 40px;
							border-radius: 20px;
							border: 1px solid lightgray;
							background-color: transparent;
							cursor: pointer;

							&:hover {
								background-color: rgba(125, 125, 125, 0.1);
							}

							i {
								margin-right: 5px;
								font-size: 22px;
								vertical-align: middle;
							}

							&:nth-of-type(2) {
								margin: 0 8px;

								i {
									margin-right: 5px;
									font-size: 16px;
									vertical-align: middle;
									color: #EC4141;
								}
							}

							&:nth-of-type(3) {
								width: 40px;
								height: 40px;
								border-radius: 50%;
							}
						}
					}
				}

				.user-nav-bottom {
					margin-top: 20px;

					.signIn-nav {
						display: flex;

						div {
							opacity: 0.8;
							cursor: pointer;

							&:hover {
								opacity: 1;
							}

							&:nth-child(2) {
								margin: 0 40px;
								padding: 0 40px;
								border-left: 1px solid lightgray;
								border-right: 1px solid lightgray;
							}

							p {
								text-align: center;
								font-size: 24px;
								margin-bottom: 2px;
								margin-top: 2px
							}

							span {
								font-size: 14px;
							}
						}
					}

					p {
						text-align: left;
						margin-top: 4px;
						margin-bottom: 5px;
						font-size: 14px;
					}
				}
			}
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
							margin-left: 10px;
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

		}
	}
</style>
