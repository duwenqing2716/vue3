<template>
	<div style="width: 100%;">
    <div v-if="!isShowDetail">
      <div style="max-width:440px;display: flex;flex-wrap: wrap;" v-if="!(Math.sqrt(picLists.length)%1)">
    		 <img :src="items.pcSquareUrl" alt="" style="border-radius: 0.5rem;margin:2px;cursor: pointer;" v-for="(items,index) in picLists" :key='items.pcSquareUrl' :title="picLists.length" :style="picName(picLists.length)" @click="showAll(index)"> 
    	</div>
    	<div style="max-width:440px;display: flex;flex-wrap: wrap;" v-else>
    		<div style="display: flex;width:100%;">
    			<img :src="item.pcSquareUrl" alt="" style="border-radius: 0.5rem;width: 100%;flex: 1;margin:2px;cursor: pointer;" v-for="(item,index) in picLists.slice(0,3)" :key='item.pcSquareUrl' :title="index" @click="showAll(index)">
    		</div>
    	  <div style="display: flex;width:100%;" v-if="picLists.length>3">
    	  	<img :src="item.pcSquareUrl" alt="" style="border-radius: 0.5rem;margin:2px;cursor: pointer;flex: 1;width: 100%;" v-for="(item,index) in picLists.slice(3,8)" :key='item.pcSquareUrl' :title="index+3" @click="showAll(index+3)">
    	  </div>
    	</div>
    	</div>
    	<div v-else style="width: 90.5%;height: 360px;background-color: rgba(125,125,125,0.1);border-radius: 8px;">
    		<div style="text-align: left;margin-left: 20px;padding-top: 10px;">
    			<i class="iconfont icon-shouqi-copy" style="cursor: pointer;" @click="isShowDetail = false">收起</i>
    			<i class="iconfont icon-tiaozhuan" style="margin: 0 10px;cursor: pointer;" @click="lookOrigin">查看原图</i>
					<a :href="showPic" download='图片' target="_blank" style="color: black;">
    			<i class="iconfont icon-xiazai" style="cursor: pointer;">下载</i>
					</a>	
    		</div>
    		<div class="showPics" style="width: 540px;">
					<!-- 监听图片加载未完成时使用 -->
					<!-- <div v-if="loadFlag" style="width: 540px;height: 280px;background-color: lightgray;">
						<van-loading type="spinner"  color="var(--mainColor)" style="margin-top: 100px auto;">加载中...</van-loading>
					</div> -->
					
					<img :src="showPic" alt="" ref='imgs' @mousemove="mouseOver($event)" @click="changePic($event)">
    		</div>
				<div style="margin: 0 auto;">
					<span style="width: 8px;height: 8px;border-radius: 50%;background-color:white;display: inline-block;margin: 0 6px;cursor: pointer;" v-for="(item,index) in picLists.length" @click="showAll(index)" :key='index' :class="currentIndex == index ? 'pics' : ''" :title="index"></span>
				</div>
    	</div>
			<van-image-preview v-model:show="show" :images="images" @change="onChange" :startPosition='index' :closeable='true' loop>
			</van-image-preview>
	</div>
</template>

<script>
	import { ref,computed,onMounted } from 'vue'
	import { Loading } from 'vant';
	import { ImagePreview } from 'vant';
	import '@vant/touch-emulator';
	
	export default {
		name:'eventPics',
		props:{
			picData:{
				type:Array,
				required:true,
				default(){
					return []
				}
			}
		},
		setup(props,ctx){
			const isShowDetail = ref(false);
			const showPic = ref(null);
			const currentIndex = ref(0);
			const loadFlag = ref(true);
			const imgs = ref(null);
			const pre = ref(0);
			
			const show = ref(false);
			const index = ref(0);
			const images = ref([]);
			
			const onChange = (newIndex) => {
				index.value = newIndex;
			};
			
			const lookOrigin = () => {
				show.value = true;
				index.value = currentIndex.value;
			}		
			//
			const picLists = computed(()=>{
				return JSON.parse(JSON.stringify(props.picData))
			})
			//
			const showAll = (val) => {
				loadFlag.value = true
				currentIndex.value = val
				showPic.value = null
				isShowDetail.value = true
				showPic.value = picLists.value[val].pcRectangleUrl
				loadFlag.value = false
			}
			//最大化节流
			const mouseOver = (e) => {
				let now = Date.now()
				if(now-pre.value>200){
					if(e.layerX<imgs.value.width/3 && currentIndex.value!=0){
						if(e.currentTarget.className.indexOf('left')!=-1) return
						e.currentTarget.className="left"
					}else if(e.layerX>imgs.value.width/2+50 && (currentIndex.value!=picLists.value.length-1)){
						if(e.currentTarget.className.indexOf('right')!=-1) return
						e.currentTarget.className="right"
					}else{
						if(e.currentTarget.className.indexOf('center')!=-1) return
						e.currentTarget.className = 'center'
					}
					pre.value = now
				}
			}
			
			const changePic = (e) => {
				if(e.layerX<imgs.value.width/3 && currentIndex.value!=0){
					showAll(--currentIndex.value)
				}else if(e.layerX>imgs.value.width/2+50 && (currentIndex.value!=picLists.value.length-1)){
					showAll(++currentIndex.value)
				}else{
					isShowDetail.value = false
				}
			}
			//计算属性传值的方法:
			//methods中建一个方法computed属性进行赋值,在赋值时会调用computed中的set方法,
			//set方法对值进行操作,methods中return computed属性，自动调用computed中的get方法，获取值。
			//相当于methods方法为中介进行computed缓存操作
			
			//推荐方法:闭包传参
			//compted中设置return function(){
			// 	对值进行操作再返回
			// }
			const picName = computed(()=>{
				return function(item){
					let v = Math.ceil(440/Math.sqrt(item)-2*(Math.sqrt(item)))
					return {
						'width':v+'px',
				  }
				}
			})
			onMounted(()=>{
				picLists.value.filter(item=>{
					images.value.push(item.originUrl)
				})
			})
			return{
				isShowDetail,
				picName,
				showAll,
				picLists,
				showPic,
				currentIndex,
				loadFlag,
				mouseOver,
				imgs,
				pre,
				changePic,
				show,
				index,
				images,
				onChange,
				lookOrigin
			}
		}
	}
</script>

<style scoped lang="less">
	.showPics{
		width: 540px;
		margin: 20px auto 10px;
		position: relative;
		img{
			width: 100%;
		}
		.left{
			cursor: url('~assets/img/frd_show_left.png'), auto;
		}
		.center{
			cursor: url('~assets/img/small.png'), auto;
		}
		.right{
			cursor: url('~assets/img/frd_show_right.png'), auto;
		}
	}
  .pics{
		background-color: var(--mainColor) !important;
	}
</style>