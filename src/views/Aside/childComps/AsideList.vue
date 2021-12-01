<template>
	<div>
		<div class='myMusic'>
			<div @click="onCreateList">
				<slot name="titles"></slot>
				<i class="iconfont icon-sanjiao_xia" v-if="isShowIcon"></i>
				<i class="iconfont icon-sanjiao_xia-copy" v-else></i>
			</div>
			<slot name="add"></slot>
		</div>
		<div v-show="isShowIcon">
			<van-sidebar-item v-for="(item,index) in listData" @click="reSongDetail(item.id)" @contextmenu.prevent="onDelete(item,index)">
				<template #title>
					<div style="display: flex;text-align: left;align-items: center;margin-top: -5px;height: 30px;">
						<i class="iconfont icon-xihuan1" style="font-weight: bold;" v-if="index == 0 && self"></i>
						<i class="iconfont icon-suoding" style="font-weight: bold;" v-else-if="item.privacy == 10"></i>
						<i class="iconfont icon-gedan1" style="font-weight: bold;" v-else></i>
						<span style="display: inline-block;width: 180px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">{{index == 0 && self?'我喜欢的音乐':item.name}}</span>
						<button style="" v-if="index == 0 && self">
							<i class="iconfont icon-xihuan" style="font-weight: bold;"></i>
						</button>
					</div>
				</template>
			</van-sidebar-item>
		</div>
	</div>
</template>

<script>
	import { ref } from 'vue'
	//由于setup中不存在this,因此在setup中使用路由必须先声明
	import { useRouter } from 'vue-router';
	//vuex功能引入
	import { useStore } from 'vuex'
	//组件库引入
	import { Toast,Dialog } from 'vant'
	import { deletePlaylist } from 'network/songs.js'
	export default {
		name: 'AsideList',
		props: {
			listData: {
				type: Array,
				required: true,
				default () {
					return []
				}
			},
			self:{
				type:Boolean,
				required: true,
				default () {
					return false
				}
			},
			index:{
				type:Number,
				required: true,
				default () {
					return null
				}
			}
		},
		setup(props, context) {
			const store = useStore();
			const router = useRouter();
			const isShowIcon = ref(true);
			//是否显示自我创建的歌单 默认显示
			const onCreateList = () => {
				isShowIcon.value = !isShowIcon.value
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
			//删除
			const onDelete = (item,index) => {
				if(index == 0 && props.self) return
				Dialog.confirm({
					message: '确定删除该歌单吗?',
				})
				.then(async() => {
					context.emit('onDelete',{item,index})
				})
				.catch(() => {
				});
			}
			return {
				isShowIcon,
				reSongDetail,
				onCreateList,
				onDelete
			}
		}
	}
</script>

<style scoped lang="less">
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
	:deep(.van-badge__wrapper){
		position: absolute;
		left: 25px;
		top: calc(50% - 10px);
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
			width: 50px;
			height: 30px;
			border-radius: 15px;
			margin-left: 0px;
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
			// position: absolute;
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
</style>
