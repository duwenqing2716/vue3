<template>
	<div class="recommendList">
		<div class="list-header" style="display: flex;height: 130px;width: 100%;margin-left: 30px;margin-top: 10px;">
			<div class="change-date" style="width: 150px;height: 100%;">
				<i class="iconfont icon-rili"></i>
				<span>{{day}}</span>
			</div>
			<div style="margin-left: 20px;text-align: left;">
				<h2 style="margin-bottom: 10px;">每日歌曲推荐</h2>
				<span style="font-size: 15px;">根据你的音乐口味生成,每天6:00更新</span>
			</div>
		</div>
		<div class="iconInfo">
			<span>
				<div>
					<i class="iconfont icon-bofang"></i>
					播放全部
				</div>
				<div>
					<i class="iconfont icon-tianjia"></i>
				</div>
			</span>
			<span class='other-icon' @click="onCollect">
				<i class="iconfont icon-shoucang" v-if="subscribed"></i>
				<i class="iconfont icon-yishoucang" v-else></i>
				收藏全部
			</span>
			<span class='other-icon'>
				<i class="iconfont icon-download"></i>下载全部
			</span>
		</div>
		<song-lists :isCompare='likes' :listSongs='dataList'></song-lists>
	</div>
</template>

<script>
	import {
		ref,
		onMounted,
		watch
	} from 'vue'
	import songLists from './songLists.vue'
	import { getRecomdSongs } from 'network/recommend.js'
	//接口引入
	import {
		likeSongsList
	} from 'network/songs.js'
	//vuex功能引入
	import {
		useStore
	} from 'vuex'
	export default {
		name: 'recommendList',
		components: {
			songLists
		},
		setup() {
			const store = useStore();
			const subscribed = ref(true);
			let date = new Date();
			const day = ref(date.getDate());
			const dataList = ref([]);	
			const uid = ref(null);
			const likes = ref({});
			
			onMounted( async()=>{
				const { data } = await getRecomdSongs()
				dataList.value = data.dailySongs
				//登录状态获取喜欢的音乐列表 此处建议获取到vuex中多处能使用
				uid.value = store.getters.getUserId
				likeSongsList(uid.value, Date.now()).then(res => {
					res.ids.forEach(item=>{
						likes.value[item] = true
					})
				})
			})
			
			return {
				subscribed,
				day,
				dataList,
				uid,
				likes
			}
		}
	}
</script>

<style scoped lang="less">
	.recommendList {
		width: 80%;
		margin-left: 20.8%;
		height: 600px;
		position: absolute;
		margin-top: 60px;
		

		.change-date {
			cursor: pointer;
			text-align: center;
			position: relative;

			i {
				font-size: 100px;
				color: var(--mainColor);
			}

			span {
				font-size: 40px;
				display: inline-block;
				position: absolute;
				left:calc(50% - 22px);
				top: calc(50% - 15px);
				width: 44px;
				height: 44px;
				color: var(--mainColor);
			}
		}

		.iconInfo {
			font-size: 16px;
			width:600px;
			margin-left: 40px;
			margin-bottom: 30px;
			

			div {
				display: inline-block;

				&:nth-child(1) {
					width: 73%;
					height: 100%;
					position: relative;

					&:before {
						position: absolute;
						display: block;
						top: 0;
						right: 0;
						bottom: 0;
						left: 0;
						z-index: 1;
						border-radius: 25px 0 0 25px;
						background: rgba(0, 0, 0, .1);
					}

					&:hover:before {
						content: "";
					}
				}

				&:nth-child(2) {
					width: 25%;
					height: 100%;
					position: relative;
					border-radius: 0 25px 25px 0;
					border-left: 2px solid rgba(255, 255, 255, 0.4);

					&:before {
						position: absolute;
						display: block;
						top: 0;
						right: 0;
						bottom: 0;
						left: 0;
						z-index: 1;
						border-radius: 0 25px 25px 0;
						background: rgba(0, 0, 0, .1);
					}

					&:hover:before {
						content: "";
					}
				}
			}

			span {
				width: 150px;
				height: 40px;
				line-height: 40px;
				color: white;
				border-radius: 25px;
				display: inline-block;
				background-color: var(--mainColor);
				margin-right: 40px;
				cursor: pointer;
				position: relative;

				.icon-bangding,
				.icon-download,
					{
					margin-right: 10px;
					font-size: 24px;
					font-weight: bold;
					vertical-align: middle;
				}

				.icon-shoucang {
					margin-right: 10px;
					font-size: 22px;
					font-weight: bold;
					vertical-align: middle;
				}

				.icon-yishoucang {
					font-size: 20px;
					vertical-align: middle;
				}
			}

			.other-icon {
				&:before {
					position: absolute;
					display: block;
					top: 0;
					right: 0;
					bottom: 0;
					left: 0;
					z-index: 1;
					border-radius: 25px;
					background: rgba(0, 0, 0, .1);
				}

				&:hover:before {
					content: "";
				}
			}
		}
	}
</style>
