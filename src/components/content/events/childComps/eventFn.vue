<template>
	<div class="eventFn">
    <div class="fn" style="text-align: right;margin-right: 9%;margin-top: 10px;">
    	<i class="iconfont icon-dianzan" style="font-size: 20px;cursor: pointer;" @click="onLike(InfoList.liked)" v-show="!InfoList.liked">({{InfoList.likedCount}})</i>
			<i class="iconfont icon-dianzan_kuai" style="font-size: 20px;cursor: pointer;color: red;" @click="onLike(InfoList.liked)" v-show='InfoList.liked'>({{InfoList.likedCount}})</i>
    	<i class="iconfont icon-zhuanfa" style="font-size: 20px;margin: 0 15px;cursor: pointer;" @click="onReport">({{InfoList.shareCount}})</i>
    	<i class="iconfont icon-pinglun" style="font-size: 20px;cursor: pointer;" @click="onComment">({{InfoList.commentCount}})</i>
    </div>
		<div class="comment" v-if="isShowComment" style="width: 80%;margin-left: 140px;margin-top: 20px;background-color: rgba(125,125,125,0.1);border-radius: 8px;padding-bottom: 20px;">
			<comment-lists :listId='InfoList.threadId' :listType='6' style="padding-top: 20px;width: 97%;" ></comment-lists>
		</div>
		<van-popup v-model:show="show" :overlay-style='{backgroundColor:"transparent"}' round :style="{boxShadow:' 0 2px 8px gray'}">
			<div style="width: 500px;height: 260px;border-radius: 8px;position: relative;">
				<i class="iconfont icon-guanbi" style='position: absolute;right: 10px;top: 10px;font-size: 22px;cursor: pointer;' @click='show = false'></i>
				<span style="margin: 20px auto;display: inline-block;font-size: 20px;">转发</span>
				<van-cell-group inset class="input" style="height: 100px;border: 1px solid darkgray">
				  <van-field
				    v-model="message"
				    rows="2"
				    autosize
				    type="textarea"
				    maxlength="140"
				    show-word-limit
				  />
				</van-cell-group>
				<button style="width: 110px;height: 35px;border-radius: 22px;border: none;background-color: var(--mainColor);color: white;margin-top: 20px;cursor: pointer;" @click="onReConent">转发</button>
			</div>
		</van-popup>
	</div>
</template>

<script>
	import { computed,ref,watchEffect,nextTick } from 'vue'
	import { getLikeResource,getEventReport } from 'network/mv.js'
	import commentLists from 'components/common/Comment/commentLists.vue'
	import { Toast } from 'vant'
	export default {
		name:'eventFn',
		props:{
			info:{
				type:Object,
				required:true,
				default(){
					return {}
				}
			},
			commentId:{
				type:String,
				required:true,
				default(){
					return ''
				}
			}
		},
		components:{
			commentLists
		},
		setup(props,ctx){
			const show = ref(false);	
			const message = ref('');
			const isShowComment = ref(false);
			const InfoList = computed(()=>{
				return JSON.parse(JSON.stringify(props.info))
			})
			//
			const onComment = () => {
				ctx.emit('onComment',props.info.threadId)
				nextTick(()=>{
					if(props.commentId == props.info.threadId){
						isShowComment.value = !isShowComment.value
					}
				})
			}
			//
			watchEffect(()=>{
				if(props.commentId != props.info.threadId){
					isShowComment.value = false
				}
			})
			//当对象为mlog时分享异常 因为PC端无mlog情况 userDetail页面初始化未完成
			const onReConent = async() => {
				Toast.loading({
					duration: 0, // 持续时间，0表示持续展示不停止
					forbidClick: true, // 是否禁止背景点击
					message: '加载中...' // 提示消息
				})
				let uid = InfoList.value.commentThread.resourceOwnerId || InfoList.value.commentThread.resourceInfo.userId
				let evId = InfoList.value.commentThread.resourceId || InfoList.value.commentThread.resourceInfo.id
				const res = await getEventReport(uid,evId,message.value)
				if(res.code != 200) return
				Toast('转发成功!')
				show.value = false
			}
			//
			const onReport = () => {
				show.value = true;
			}
			//
			const onLike = async(liked) => {
				let t=1
				if(liked){
					t=0
				}
				if(t){
					props.info.likedCount++
				}else{
					props.info.likedCount--
				}
				props.info.liked = !props.info.liked
				const res = await getLikeResource({type:6,t:t,threadId:InfoList.value.threadId,timerstamp:Date.now()})
				if(res.code != 200) return props.info.liked = !props.info.liked
			}
			return {
				onLike,
				InfoList,
				onComment,
				isShowComment,
				onReport,
				show,
				onReConent,
				message
			}
		}
	}
</script>

<style scoped lang="less">
  .eventFn{
		
	}
</style>