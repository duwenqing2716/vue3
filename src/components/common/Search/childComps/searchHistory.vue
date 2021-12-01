<template>
	<div>
    <van-cell style="width: 400px;">
    	<!-- 使用 title 插槽来自定义标题 -->
    	<template #title>
    		<span class="custom-title">搜索历史</span>
    		<van-icon name="delete-o" @click='onDeleteAll' />
    	</template>
    </van-cell>
    <div class="history-song">
    	<van-tag closeable size="round" 
    	@close="removeSongs(index)" 
    	v-for="(item,index) in searchList"
    	color="#999999" 
    	plain 
    	text-color="#333333" >
    		{{item}}
    	</van-tag>
    </div>
	</div>
</template>

<script>
	//组件库引入
	import {
		Dialog
	} from 'vant';
	
	export default {
		name:'searchHistory',
		components:{
			
		},
		props:{
			searchList:{
				type:Object,
				required:true,
				default(){
					return {}
				}
			}
		},
		setup(props,context){
			const onDeleteAll = () => {
				Dialog.confirm({
					message: '确定删除历史记录吗',
				})
				.then(() => {
					//发射事件删除所有历史搜索
					context.emit('onDeleteAll')
				})
				.catch(() => {
				});
			}
			//发射事件删除单个历史搜索
			const removeSongs = (index) => {
				context.emit('removeSongs',index)
			};
			
			return {
				onDeleteAll,
				removeSongs
			}
		}
	}
</script>

<style scoped lang="less">
  .van-icon-delete-o {
  	margin-left: 8px;
  	cursor: pointer;
  	font-size: 16px;
  
  	&:hover {
  		color: black;
  		font-weight: bold;
  	}
  }
  
  .history-song {
  	max-width: 360px;
  	margin-left: 10px;
  }
  
  .van-tag {
  	font-size: 13px;
  	padding: 6px;
  	margin: 10px 10px 0;
  
  	&:hover {
  		background-color: rgba(125, 125, 125, 0.1);
  	}
  }
</style>