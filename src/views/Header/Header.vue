<template>
	<div class="cloud-header">
		<van-row>
			<van-col span="4">
				<div class="icon">
					<img src="~assets/img/logo.47591c5c.png" alt="" @click="backHome">
				</div>
			</van-col>
			<van-col span="9" offset="2">
			  <search></search>
			</van-col>
			<van-col span="6" offset="2">
			  <nav-right @changeColor='changeColor'></nav-right>
			</van-col>
		</van-row>
	</div>
</template>

<script>
	//vue功能引入
  import { ref,onMounted,watch } from 'vue'
	//组件引入
	import Search from 'components/common/Search/Search.vue'
	import NavRight from './navRight/NavRight.vue'
	//获取本地存储引入
	import { getItem } from 'store/storage.js'
  //由于setup中不存在this,因此在setup中使用路由必须先声明
  import { useRouter } from 'vue-router'
	export default {
		name: 'Header',
		components: {
			Search,
			NavRight
		},
		setup(props,context) {	
			const router = useRouter() //实例化路由
			const theme = ref(null)
			const backHome = () => {
				router.replace({
					path: '/home'
				})
			}
			//接收事件并按值传给换肤less中的变量(处理所有换肤)
			const changeColor = (color) =>{
				document.body.style.setProperty('--mainColor',color.theme)
				document.body.style.setProperty('--van-tabs-bottom-bar-color',color.theme)
				document.body.style.setProperty('--van-sidebar-selected-border-color',color.theme)
			}
			//挂载时更改内容,(处理所有换肤)
			onMounted(()=>{
				//判断本地是否有换肤值
				if(getItem('theme')){
					theme.value = getItem('theme').theme
				}
			})
			//监听是否换肤,并更改less中的变量(处理所有换肤)
			watch(()=>theme.value,(newValue,oldValue)=>{
				document.body.style.setProperty('--mainColor',newValue)
				document.body.style.setProperty('--van-tabs-bottom-bar-color',newValue)
				document.body.style.setProperty('--van-sidebar-selected-border-color',newValue)
			})

			return {
				theme,
				backHome,
				changeColor
			};
		}
	}
</script>

<style lang="less" scoped="scoped">
	.cloud-header {
		height: 58px;
		background-color: var(--mainColor);
		line-height: 58px;
		color: white;
		font-size: 18px;
		width: 100%;
		z-index: 9;
		position: fixed;
		.van-row,
		.van-col {
			height: 58px;
		}
		.icon {
			height: 100%;
			img {
				margin-top: 5px;
				margin-left: 20px;
				position: relative;
				width: 70%;
				z-index: 2;
				cursor: pointer;
			}
		}
	}
</style>
