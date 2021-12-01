<template>
	<div class="eventDetails">
    <div class="songs" style="text-align: left;margin-left: 140px;font-size: 17px;height: 70px;width: 80%;;border-radius: 8px;background-color: #EFEFF0;margin-top: 20px;display: flex;align-items: center;cursor: pointer;position: relative;">
    	<div class="img" v-if='types!=5'>
    		<i class="iconfont icon-bofang"></i>
    		<img :src="eventData.coverImgUrl" alt="" style="">
    	</div>
    	<div class="songs-right" style="margin-left: 10px;margin-top: 10px;">
    		<span style='font-size: 17px;'>{{eventData.name}}</span>
    		<p style='font-size: 14px;color: darkgray;margin-top: 4px;'>
				<span v-if='eventData.radio&&eventData.radio.category' style="color: var(--mainColor);margin-right: 10px;padding: 1px;border: 2px solid var(--mainColor);font-size: 13px;">{{eventData.radio.category}}</span>
				<span v-else-if='types == 5' style="color: var(--mainColor);margin-right: 10px;padding: 1px;border: 2px solid var(--mainColor);font-size: 13px;">专栏</span>
    		<span v-for="(item,index) in eventData.artists" :key='item.id' style="margin-right: 8px;">{{item.name || item.nickname }}</span>
    		</p>
    	</div>
			<slot name="pic"></slot>
    </div>
	</div>
</template>

<script>
	import { computed,onMounted,watchEffect,ref } from 'vue'
	export default {
		name:'eventDetails',
		props:{
			listData:{
				type:Object,
				required:true,
				default(){
					return {}
				}
			},
			types:{
				type:Number,
				required:true,
				default(){
					return 0
				}
			}
		},
		setup(props,ctx){
			const eventData = computed(()=>{
				return JSON.parse(JSON.stringify(props.listData))
			})
			watchEffect(()=>{
				if(props.types == 0 || props.types == 3 ){
					eventData.value.coverImgUrl = eventData.value.blurPicUrl ? eventData.value.blurPicUrl : eventData.value.album.blurPicUrl
				}else if(props.types == 1){
					
				}else if(props.types == 2){
					eventData.value.artists = []
					eventData.value.artists[0] = eventData.value.creator 
				}else if(props.types == 4){
					eventData.value.coverImgUrl = eventData.value.coverUrl
					eventData.value.artists = []
					eventData.value.artists[0] = eventData.value.radio
				}else if(props.types == 5){
					eventData.value.artists = []
					eventData.value.artists[0] = eventData.value.creator
					eventData.value.name = eventData.value.title
				}
			})
			return {
				eventData
			}
		}
	}
</script>

<style scoped lang="less">
  .eventDetails{
		.icon-bofang {
			z-index: 1;
			color: var(--mainColor);
			width: 36px;
			height: 35px;
			border-radius: 50%;
			background-color: rgba(255, 255, 255, 0.9);
			line-height: 35px;
			display: inline-block;
			text-align: center;
			transition: all 0.3s ease-in;
			position: absolute;
		}
		.img {
			position: relative;
			width: 50px;
			height: 50px;
			margin-left: 8px;
			cursor: pointer;
			&:hover .icon-bofang {
				opacity: 1;
				transition: all 0.3s ease-in;
			}
			i {
				position: absolute;
				left: calc(50% - 17.5px);
				top: calc(50% - 17.5px);
				opacity: 0;
			}
		
			img {
				width: 100%;
				height: 100%;
				border-radius:5px;
			}
		}
	}
</style>
