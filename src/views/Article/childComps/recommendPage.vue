<template>
	<div class="recommend">
		<div class="header">
			<van-tabs v-model:active="active" class="header-nav">
				<van-tab title="个性推荐">
					<div>
						<van-swipe class="my-swipe" lazy-render :autoplay="5000" indicator-color="var(--mainColor)">
							<van-swipe-item v-for="(item,index) in banners" style="background-color: transparent;">
								<img v-lazyload="item.imageUrl + '?param=800y281'" alt="" style="width: 100%;height: 281px;">
								<div class="tag">{{item.typeTitle}}</div>
							</van-swipe-item>
						</van-swipe>
					</div>
					<div class="recomd-list">
							<span class="recomdInfo">推荐歌单</span>
							<van-grid :column-num="5" :border='false'>
								<van-grid-item @click='recentListen'>
									<img class="change-img" src="~assets/img/排行.png" >
									<div class="icon-xs">
										<div class="change-list">
										  <span>根据您的音乐口味生成</span>
										  <p>每日更新</p>
										</div>
										<i class="iconfont icon-bofang"></i>
									</div>
									<div class="change-date">
										<i class="iconfont icon-rili"></i>
										<span>{{day}}</span>
									</div>
									<span class="introduce">每日歌曲推荐</span>
								</van-grid-item>
								<van-grid-item v-for="(item,index) in recommends" :key="item.id"  @click='onSongsDetails(item.id)'>  
									<div class="playcount">
										<i class="iconfont icon-bofang1"></i>
										<span>{{item.playCount>9999?Math.floor(item.playCount/10000)+'万':item.playCount}}</span>
									</div>
									<img v-lazyload="item.picUrl + '?param=184y184'" />
									<div class="icon-xs">
										<i class="iconfont icon-bofang"></i>
									</div>
									<span class="introduce">{{item.name}}</span>
								</van-grid-item>
							</van-grid>
					</div>
					<div class="recomd-list">
						<span class="recomdInfo" style="width: 1080px;">{{personal.name}}</span>
						<van-grid :column-num="3" :border='false' style="width: 1080px;">
							<van-grid-item v-for="(item,index) in personal.result" :key="item.id" style="cursor: pointer;" @click='comeToMv(item.id)'> 
							  <i class="iconfont icon-bofang" style="position: absolute;top: 20px;left: 15px"></i>
							  <img v-lazyload="item.picUrl + '?param=340y117'" />
								<span class="introduce">{{item.name}}</span>
							</van-grid-item>
						</van-grid>	
					</div>
					<div class="recomd-list">
						<span class="recomdInfo">最新音乐</span>
						<div class="newSongs-list">
							<div class="newSongs" v-for="(item,index) in NewSongs">
								<div>
									<img v-lazyload="item.picUrl + '?param=65y65'" alt="">
									<i class="iconfont icon-bofang"></i>
								</div>
								<div class="list-text">
									<span>{{item.name}}</span>
									<p>
										<span class="SQorMv">SQ</span>
										<span class="SQorMv">MV</span>
									{{item.song.artists[0].name}}
									</p>
								</div>
							</div>
						</div>
					</div>
					<div class="recomd-list"  style="margin-top: 20px;">
						<span class="recomdInfo">推荐MV</span>
						<van-grid :column-num="3" :border='false'>
							<van-grid-item class="mv-list" v-for="(item,index) in recomdMv" :key="item.id"> 
								<div class="mv-show" @click='comeToMv(item.id)'>
									<div class="mv-show-top">
										<span>最新热门MV推荐</span>
									</div>
									<div class="mv-show-right">
									<i class="iconfont icon-bofang"></i>
									<span class="introduce-count">{{item.playCount>9999?Math.floor(item.playCount/10000)+'万':item.playCount}}</span>
									</div>
								</div>
							  <img v-lazyload="item.picUrl + '?param=317y178'" class="mv-img"/>
								<span class="introduce-text">
								  {{item.name}}
								</span>
								 <p>{{item.artistName}}</p>
							</van-grid-item>
						</van-grid>	
					</div>
				</van-tab>
				<van-tab title="专属定制">内容 2</van-tab>
				<van-tab title="歌单">内容 3</van-tab>
				<van-tab title="排行榜">内容 4</van-tab>
				<van-tab title="歌手">内容 3</van-tab>
				<van-tab title="最新音乐">内容 4</van-tab>
			</van-tabs>
		</div>
	</div>
</template>

<script>
	//移动端适配PC端
	import '@vant/touch-emulator';
	//接口引入
	import {
		getBanneers,getRecommends,getNewSong,getPersonalized,getPersonalMv,getRecomdResource
	} from 'network/recommend.js'
	//vue功能引入
	import {
		ref,
		onMounted,
		watch
	} from 'vue';
	//组件库引入
	import { Toast } from 'vant'
	//本地存储引入
	import { getItem } from 'store/storage.js'
	//vuex功能引入
	import{ useStore } from 'vuex'
	//由于setup中不存在this,因此在setup中使用路由必须先声明
	import { useRouter } from 'vue-router'
	export default {
		name: 'recommendPage',
		setup() {
			const router = useRouter() //实例化路由
			const store = useStore()
			
			const active = ref(0);
			const banners = ref({});
			const recommends = ref({});
			const personal = ref({});
			const NewSongs = ref({});
			const recomdMv = ref({});
			let date = new Date();
			const day = ref(date.getDate());
			//跳转详细歌单
			const onSongsDetails = (id) => {
				router.push({path:'/home/songDetail',query:{id}})
			}
			//
			const comeToMv = (id) => {
				router.push({path:'/mv',query:{id:id}})
			}
			//
			const recentListen = () => {
				if (store.state.isLogin) {
				  router.push({path:'/home/recommendList'})
				}else{
					Toast('该功能必须登录后才能使用！')
				}
			}
			//挂载时 此处功能最好用async await配合使用
			onMounted(async() => {
				Toast.loading({
				  duration: 0, // 持续时间，0表示持续展示不停止
				  forbidClick: true, // 是否禁止背景点击
				  message: '加载中...' // 提示消息
				})
				//获取banner数据
				const res = await getBanneers()
				if (res.code === 200) {
					banners.value = res.banners
				}
				
				//登录后功能 未完善(看不懂这个接口作用)
				// getRecomdResource()
				
				//独家放送数据获取
				const resData = await getPersonalized()
				if(resData.code === 200){
					personal.value = resData
				}
				Toast.clear()
				//最新歌曲数据获取
				const data = await getNewSong(12)
				if(data.code === 200){
					NewSongs.value = data.result
				}
				//推荐mv数据获取
				const result = await getPersonalMv()
				if(result.code === 200){
					const list = result.result
					recomdMv.value = list.filter((value,index)=> index<3 )
				}
				
			})
			//判断登录状态 获取不同的推荐歌单数据
			watch(()=>store.state.isLogin,(newValue,oldValue)=>{
				recommends.value=''
					getRecommends({limit:9,timestamp:Date.now()}).then(res => {
						if (res.code === 200) {
							recommends.value = res.result
						}
					})
			},{immediate:true})
			
			return {
				active,
				banners,
				recommends,
				personal,
				NewSongs,
				recomdMv,
				day,
				onSongsDetails,
				recentListen,
				comeToMv
			}
		}
	}
</script>

<style scoped lang="less">
	.recommend {
		width: 80%;
		margin-left: calc(20% - 35px);
		height: 600px;
		position: absolute;
		margin-top: 60px;
		.header-nav{
			margin-top: 20px;
			margin-left: 50px;
			.my-swipe{
				height: 310px;
				position: relative;
				margin-top: 40px;
				background-color: transparent;
				.tag{
					position: absolute;
					bottom:29px;
					right:0;
					display:inline-block;
					font-size: 14px;
					width: 90px;
					height: 34px;
					border-radius:15px 0 15px 0;
					background-color: #CC4A4A;
					z-index: 1;
					line-height: 34px;
					color: white;
					font-weight: bold;
					letter-spacing: 2px;
				}
			}
			.recomd-list{
				text-align: left;
				width: 1000px;
				margin-left:-110px;
				.icon-bofang{
					font-size: 16px;
					color:var(--mainColor);
					width: 28px;
					display: inline-block;
					text-align: center;
					height: 28px;
					padding-left: 2px;
					border-radius: 50%;
					background-color: rgba(255,255,255,0.9);
					line-height: 28px;
					z-index: 1;
				}
				.recomdInfo{
					font-size: 24px;
					font-weight: bold;
					padding-left: 8px;
					cursor: pointer;
					&:hover{
						opacity: 0.8;
					}
					&::after{
						position: absolute;
						content: '';
						width: 12px;
						height: 12px;
						border: 2px solid black;
						border-bottom-color:transparent ;
						border-right-color:transparent ;
						transform:translate(-50%,-50%) rotate(135deg);
						margin-left: 20px;
						margin-top: 16px;
					}	
				}
				.change-img{
					width:184px;
					height:184px;
					background:center center no-repeat;
					background-size: cover;
					border-radius: 8px;
					filter:blur(4px) ;
					-webkit-filter:blur(4px) ;
				}
				.change-date{
					cursor: pointer;
					text-align: center;
					i{
						font-size: 100px;
						position: absolute;
						top:52px;
						left:52px;
						color: white;
					}
					span{
						font-size: 40px;
						display: inline-block;
						width: 44px;
						position:absolute;
						top: 98px;
						left:calc(50% - 22px);
						color: white;
					}
				}
				.mv-list{
					cursor: pointer;
					.mv-show{
						width: 317px;
						height: 178px;
						position: absolute;
						border-radius: 8px;
						z-index: 1;
						top: 18px;
						overflow: hidden;
						.mv-show-top{
							position: absolute;
							z-index: 1;
							display: inline-block;
							width: 100%;
							background-color: rgba(0, 0, 0, 0.3);
							color: white;
							height: 40px;
							top: -30px;
							line-height: 40px;
							border-radius: 8px 8px 0 0;
							font-size: 14px;
							opacity: 0;
							transition: all 0.3s ease-in 1s;
							span{
								margin-left: 20px;
							}
						}
						&:hover .mv-show-top{
							opacity: 1;
							top: -6px;
							transition: all 0.3s ease-in 1s;
						}
						&:hover .mv-show-right{
							opacity: 0;
							transition: all 0.2s ease-in 1s;
						}
					}
					.mv-show-right{
						transition: all 0.2s ease-in 1s;
						i{
							position: absolute;
							top: 10px;
							right: 45px;
						}
						.introduce-count{
							position: absolute;
							z-index: 1;
							color: white;
							top: 15px;
							right: 10px;
							font-size: 14px;
							font-weight: bold;
						}
					}
					.mv-img{
						width: 317px;
						height: 178px;
					}
					.introduce-text{
						font-size: 14px;
						opacity: 0.8;
						overflow: hidden;
						text-overflow: ellipsis;
						display: -webkit-box;
						-webkit-line-clamp: 1;
						-webkit-box-orient: vertical;
						margin-top: 10px;
						align-self: flex-start;
						&:hover{
							opacity: 1;
						}
					}
					p{
						font-size: 14px;
						opacity: 0.7;
						align-self: flex-start;
						&:hover{
							opacity: 1;
						}
					}
				}
				.playcount{
					position:absolute;
					color:white;
					top: 20px;
					right: 15px;
					font-size: 14px;
					z-index: 1;
					font-weight: bold;
					cursor: pointer;
				}
					img{
						border-radius: 8px;
						box-shadow: -2px 2px 5px rgba(125,125,125,0.2);
					}
				.introduce{
					margin-top: 10px;
					font-size: 14px;
					display: block;
					height: 60px;
					align-self: flex-start;
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 3;
					-webkit-box-orient: vertical;
					cursor: pointer;
					opacity: 0.8;
					&:hover{
						opacity: 1;
					}
				}
				.icon-xs{
					cursor: pointer;
					width: 184px;
					height: 184px;
					position: absolute;
					overflow: hidden;
					top: 16px;
					z-index: 0;
					border-radius: 8px 8px 0 0;
					box-shadow:0 5px 30px gray inset;
					-webkit-box-shadow:0 5px 30px gray inset;
					-moz-box-shadow:0 5px 30px gray inset;
					-o-box-shadow:0 5px 30px gray inset;
					.icon-bofang{
						position: absolute;
						bottom: 10px;
						right: 10px;
						opacity: 0;
						transition: all 0.3s ease-in;
					}
					.change-list{
						position: absolute;
						font-size: 13px;
						width:100%;
						top: -50px;
						background-color: rgba(0,0,0,0.3);
						color: white;
						border-radius: 8px 8px 0 0;
						opacity: 0;
						transition: all 0.2s ease-in 1s;
						span{
							margin-top: 8px;
							display: block;
							margin-left:16px
						}
						p{
							margin-top: 5px;
							margin-left:16px
						}
					}
					&:hover .icon-bofang{
						opacity: 1;
						color: var(--mainColor);
						transition: all 0.3s ease-in;
					}
					&:hover .change-list{
						opacity: 1;
						top: 0px;
						transition: all 0.2s ease-in 1s;
					}
				}
				.newSongs-list{
					margin-top: 20px;
					margin-left: -10px;
					height: 330px;
					width: 100%;
					display: flex;
					flex-direction: column;
					flex-wrap: wrap;
					justify-content: space-between;
					align-items: center;
					.newSongs{
						width: 30%;
						display: flex;
						&:hover{
							border-radius: 6px;
							background-color: rgba(125,125,125,0.1);
						}
						div{
							position: relative;
							margin-top: 8px;
							img{
								width: 65px;
								border-radius: 6px;
								cursor: pointer;
							}
							i{
								position: absolute;
								left:calc(50% - 14px);
								top:calc(50% - 18px);
								margin-right: 10px;
							}
						}
						.list-text{
							margin-left: 10px;
							margin-top: 10px;
							span{
								overflow: hidden;
								text-overflow: ellipsis;
								display: -webkit-box;
								-webkit-line-clamp: 1;
								-webkit-box-orient: vertical;
							}
							p{
								font-size: 14px;
								color: dimgray;
								cursor: pointer;
								width: 218px;
								overflow: hidden;
								text-overflow: ellipsis;
								white-space: nowrap;
								opacity: 0.8;
								&:hover{
									opacity: 1;
								}
							}
							.SQorMv{
								display: inline-block;
								width: 25px;
								height: 14px;
								border: 2px solid var(--mainColor);
								border-radius: 4px;
								text-align: center;
								color: var(--mainColor);
								line-height: 15px;
								margin-right: 8px;
							}
						}
					}
				}
			}
		}

		:deep(.van-tabs__content) {
			width: 800px;
			margin-left: calc(50% - 400px);
		}
    :deep(.van-tabs__wrap--scrollable){
			span{
				font-size: 16px;
				font-weight: bold;
			}
		}
		:deep(.van-swipe__indicator){
				background-color:dimgray;
			}
		:deep(.van-swipe__indicator--active){
			color:red;
		}
		.my-swipe .van-swipe-item {
			color: var(--mainColor);
			font-size: 20px;
			line-height: 150px;
			text-align: center;
			background-color:transparent;
			border-radius: 15px;

			img {
				border-radius: 15px;
			}
		}
	}
</style>
