<template>
	<div class="recent" style="width: 100%;">
		<div class="user-subscribers-bottom-list" v-for="(item,index) in recentSongs" :key='item.id' :class="index%2?'':'differ'">
			<span>{{index+1<10?'0'+(index+1):index+1}}</span>
			<i class="iconfont icon-xihuan2" style="color: #EC4141;" v-if="isCompareShow[item.id]" @click='onLike(item)'></i>
			<i class="iconfont icon-xihuan1" v-else @click='onLike(item)'></i>
			<i class="iconfont icon-download"></i>
			<span style='color: black;font-size: 15px;'>{{item.name}}</span>
			<span class="SQorMv">SQ</span>
			<span class="SQorMv">MV</span>
			<slot :time='item.dt' name="time"></slot>
			<slot :count='item.num'  name="count"></slot>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'rencentList',
		props: {
			recentSongs: {
				type: Array,
				required: true,
				default () {
					return []
				}
			},
			isCompareShow: {
				type: Object,
				required: true,
				default () {
					return {}
				}
			}
		},
		setup(props, ctx) {
			//歌曲喜欢
			const onLike = val => {
				ctx.emit('onLike', val)
			}
			return {
				onLike,
			}
		}
	}
</script>

<style scoped lang="less">
	.differ {
		background-color: #F9F9F9;
	}

	.user-subscribers-bottom-list {
		width:100%;
		align-items: center;
		display: flex;
		height: 30px;
		color: darkgray;
		cursor: pointer;

		span,
		i {
			margin-left: 15px;
		}

		.icon-xihuan1 {
			color: black;
			font-size: 17px;
			opacity: 0.4;
			cursor: pointer;

			&:hover {
				opacity: 0.8;
			}
		}

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
			margin-left: 6px;
			cursor: pointer;
		}

		&:hover {
			background-color: rgba(125, 125, 125, 0.2);
		}
	}
</style>
