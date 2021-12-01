<template>
	<div class="mv-detail">
		<div class="header">
		<slot name='title'></slot>
		<div class="player">
			<video :src="url" controls="controls" autoplay="autoplay"></video>
		</div>
		</div>
	</div>
</template>

<script>
	import { useRouter } from 'vue-router'
	export default {
		name:'mvDetail',
		props:{
			url:{
				type:String,
				required:true,
				default(){
					return ''
				}
			}
		},
		setup(props,ctx){
			const router = useRouter()
			return {
				
			}
		}
	}
</script>

<style scoped lang="less">
  .mv-detail{
		.header{
			text-align: left;
		.player{
			margin-top: 20px;
			video{
				width: 100%;
				height: 100%;
			}
		}
		
		}
	}
</style>
