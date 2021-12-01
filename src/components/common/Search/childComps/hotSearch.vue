<template>
	<div>
		<van-cell>
			<!-- 使用 title 插槽来自定义标题 -->
			<template #title>
				<span class="custom-title">热搜榜</span>
			</template>
		</van-cell>
		<van-list finished-text="没有更多了" id="list-songs">
			<div class="hotSearch">
				<van-cell v-for="(item,index) in songList" :key="item.score">
					<!-- 使用 title 插槽来自定义标题 -->
					<template #title>
						<span :class='index+1<4 ?"hotColor":""' style="font-size: 25px;position: absolute;left: 20px;top: 20px;font-style: italic;">{{index+1}}</span>
						<span class="custom-title1">{{ item.searchWord }}</span>
						<span class="hotColor">{{index+1<4 ? "HOT":''}}</span>
						<span class="hot-score">{{ item.score }}</span>
					</template>
					<template #label>
						<span class="custom-title2">{{ item.content }}</span>
					</template>
				</van-cell>
			</div>
		</van-list>
	</div>
</template>

<script>
	export default {
		name:'hotSearch',
		props:{
			songList:{
				type:Object,
				required:true,
				default(){
					return {}
				}
			}
		},
		setup(){
			
		}
	}
</script>

<style lang="less" scoped="scoped">
	.hotSearch {
		height: 500px;
		overflow: auto;
	
		.custom-title1 {
			font-size: 16px;
			font-weight: bold;
			margin-left: 40px;
		}
	
		.custom-title2 {
			margin-left: 40px;
			width: 260px;
			display: inline-block;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
		}
	
		.hotColor {
			color: red;
			font-size: 12px;
			font-weight: bold;
			font-style: italic;
			margin: 0 8px;
		}
	
		.hot-score {
			font-size: 12px;
			font-weight: bold;
			color: #999;
		}
	}
</style>
