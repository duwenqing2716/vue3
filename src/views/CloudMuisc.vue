<template>
	<div>
		<Header @onThemeChange='onThemeChange'></Header>
		<Aside :theme='state.theme'></Aside>
		<router-view :key="$route.query"/>
	</div>
</template>

<script>
	import Header from './Header/Header.vue'
	import Aside from './Aside/Aside.vue'
	
	//vue功能引入
	import { ref,reactive } from 'vue'
	export default{
		name:'CloudMuisc',
		components:{
			Header,
			Aside
		},
		setup(){
			const state = reactive({
				theme:''
			})
			const onThemeChange = (color) => {
				state.theme = color
			}
			return {
				state,
				onThemeChange
			}
		}
	}
</script>

<style lang="less" scoped="scoped">
	
</style>
