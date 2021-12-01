<template>
	<div class="commentList" ref='aa'>
    <van-cell-group inset class="input">
      <van-field
        v-model="message"
        rows="2"
        autosize
        type="textarea"
        maxlength="140"
        :placeholder="replay"
        show-word-limit
				ref='input'
      />
    </van-cell-group>
		<span style="position: absolute;left: 15px;margin-top: 20px;cursor: pointer;" @click="OnlyReplay">只回复该歌单</span>
		<button class="comment-btn" @click="sendComt">评论</button>
		<van-loading type="spinner"  color="var(--mainColor)" style="margin-top: 20px;" v-show="loadFlag">加载中...</van-loading>
		<div class="comment-content" v-show="currentPage == 1" v-if="commentList.length!=0">
			<floor :commentList='commentList' @onLike='onLike' @onComment='onComment' :t='0'>
				<template v-slot:title>
					 <span class="comment-content-title">精彩评论</span>
				</template>
			</floor>
		</div>
		<div class="comment-content" style="margin-top: 70px;" v-if="isShowNew.length!=0">
			<floor :commentList='isShowNew' @onLike='onLike' @onComment='onComment' :othersContent='othersContent' @onDelete='onDelete' :t='1' :listType='listType' :listId='listId'>
				<template v-slot:title>
					 <span class="comment-content-title">最新评论({{totalNums}})</span>
				</template>
			</floor>
		</div>
		<div style='width: 55%;margin: 150px auto 200px;' v-if="totalItems>1 && listType!=6">
			<van-pagination v-model="currentPage" :page-count='totalItems' :show-page-size="totalItems>8?8:totalItems" force-ellipses @change='changePage'/>
		</div>
		<div v-else-if="listType==6" style="height: 20px;line-height: 40px;color: darkgray;cursor: pointer;">
			<span style="margin: 0 auto;">查看全部评论</span>
		</div>
	</div>
</template>

<script>
	import { ref,onMounted } from 'vue';
	import { likeComment,parentComment,playlistComment,sendComment,newComment } from 'network/songs.js'
	import { getMvComment,getEventComment } from 'network/mv.js'
	import { getVideoComment } from 'network/video.js'
	//vuex功能引入
	import{ useStore } from 'vuex'
	//路由功能引入
	import { useRouter } from 'vue-router'
	import { Toast,Dialog,Loading } from 'vant'
	import floor from './childComps/floor.vue'
	export default {
		name:'commentLists',
		props:{
			listId:{
				type:String,
				required:true,
				default(){
					return null
				}
			},
			listType:{
				type:Number,
				required:true,
				default(){
					return null
				}
			}
		},
		components:{
			floor
		},
		setup(props,context){
			const store = useStore();
			const router = useRouter(); //实例化路由
			
			const message = ref('');
			const commentList = ref([]);
			const totalNums = ref(null);
			const newList = ref([]);
			const time = ref(null);
			const preCommentId = ref(null);
			const othersContent = ref({});
			const replay = ref('请输入您的评论内容!');
			const input = ref(null);
			const userSelfFloor = ref('');
			const commentId = ref(null);
			const currentPage = ref(1);
			const isShowNew = ref([]);
			const numsList = ref([]);
			const totalItems = ref(null);
			const aa = ref(null);
			const loadFlag = ref(false);
			
			//发送点赞功能请求
			const getLikeComment = async(id,val,status,num,time) => {
				let res;
				if(props.listType!=6){
				  res = await likeComment({id:id,cid:val,t:status,type:num,timerstamp:time})
				}else{
					res = await likeComment({threadId:id,cid:val,t:status,type:num,timerstamp:time})
				}
			}
			// 1 为点赞 ,0 为取消点赞
			const onLike = async(val,status,index,type) => {
				// 判断登录状态
				if(store.state.isLogin){
					// if(statusOnce.value){
					// 	statusFirst.value = !status
					// 	statusOnce.value = false
					// }
					// console.log(preCommentId.value,val)
					if (time.value && preCommentId.value == val) {
						clearTimeout(time.value)
					}
					preCommentId.value = val
					//进一步优化方法:是否与第一次status相同，相同则不发请求 逻辑容易交错 不好做
					time.value = setTimeout(() => {
						getLikeComment(props.listId,val,status,props.listType,Date.now())
					}, 500)
				if(type){
					if(status==1){
						isShowNew.value[index].liked = true
						isShowNew.value[index].likedCount++
					}else{
						isShowNew.value[index].liked = false
						isShowNew.value[index].likedCount--
					}
				}else{
					if(status==1){
						commentList.value[index].liked = true
						commentList.value[index].likedCount++
					}else{
						commentList.value[index].liked = false
						commentList.value[index].likedCount--
					}
				}
				}else{
					Toast({
						message:'请登录后再操作！'
					})
				}
			}
			//评论初始化
			const OnlyReplay = () => {
				commentId.value = ''
				replay.value = '请输入您的评论内容!'
				message.value = ''
				input.value.focus()
			}
			//发送评论  还需判断是否登录
			const sendComt = async() => {
				let res;
				// 判断登录状态
				if(store.state.isLogin){
				let t = '';
				//判断发送还是回复
				if(commentId.value){
					t=2
				}else{
					t=1
				}
				if(!message.value){
					Toast('评论不能为空')
					return
				}
				if(props.listType!=6){
					//此处请求最好用params自定义
					res = await sendComment({t:t,type:props.listType,id:props.listId,content:message.value,commentId:commentId.value,timerstamp:Date.now()})
				}else{
					res = await sendComment({t:t,type:props.listType,threadId:props.listId,content:message.value,commentId:commentId.value,timerstamp:Date.now()})
				}
				
				//将自己的评论放在page1的顶层
				res.comment.likedCount = 0
				newList.value[0].list.unshift(res.comment)
				if(commentId.value){
					//直接将数据存在othersContent.value无需发请求
					othersContent.value[res.comment.commentId] = userSelfFloor.value
				}
				OnlyReplay()
				//总数据量++
				totalNums.value++
				context.emit('changeNum',totalNums.value)
				}else{
					Toast({
						message:'请登录后再操作！'
					})
				}
			}
			//
			const onDelete = (item) => {
				isShowNew.value.filter((val,index)=>{
					if(val.commentId==item.commentId){
						isShowNew.value.splice(index,1)
					}
				})
				//页面bug 删除原对话 重新刷新则评论不算数 已解决 网易云自身问题歌单详情页还是不算数 再删除则为-1
				//当在评论页和收藏页切换id时页面不更新 直接更新时切换为第一个页面
				totalNums.value--
				context.emit('changeNum',totalNums.value--)
			}
			//回滚到顶
			const toTop = () => {
				let timeTop = setInterval(()=>{
					if(document.documentElement.scrollTop<=aa.value.offsetTop){
						clearInterval(timeTop)
						input.value.focus()
					}
					document.documentElement.scrollTop-=60
				},10)		
			}
			//分页功能
			const changePage = async() => {
				isShowNew.value = []
				//判断是否需要加载新评论 大幅减少请求数量
				let isSome = newList.value.find(item =>item.page == currentPage.value)
				if(isSome){
					//加载缓存数据
					isShowNew.value = isSome.list
				}else{
					//发送新请求
					getNewData(currentPage.value)
				}
			}
			//点击评论按钮
			const onComment = (val) => {
				commentId.value = ''
				userSelfFloor.value = ''
				replay.value = '回复 '+val.user.nickname+' :'
				toTop()
				//他人内容暂存于此处
				userSelfFloor.value = val.content
				commentId.value = val.commentId
			}
			//请求新数据以及回复楼层
			const getNewData = async(val) => {
				loadFlag.value = true;
				let listDetail = {}
				let resData
				if(props.listType == 2){
					// console.log('2')
					resData = await playlistComment(props.listId,30,val*30,Date.now())
				}else if(props.listType == 1){
					// console.log('1')
					resData = await getMvComment(props.listId,30,val*30,Date.now())
				}else if(props.listType == 5){
					resData = await getVideoComment(props.listId,30,val*30,Date.now())
				}else if(props.listType == 6){
					resData = await getEventComment(props.listId,Date.now())
				}
				commentList.value = resData.hotComments.filter((item,index)=>index<10)
				listDetail.page = currentPage.value
				listDetail.list = resData.comments
				//方便分页功能查找
				newList.value.push(listDetail)
				isShowNew.value = resData.comments
				//分页数
				// 网易云后端total计数问题,不做深究 简单处理
				if(resData.total == 0){
					totalNums.value = resData.comments.length
					context.emit('changeNum',resData.comments.length)
				} else {
					totalNums.value = resData.total
					context.emit('changeNum',totalNums.value)
				}
				totalItems.value = Math.floor(totalNums.value/30)
				loadFlag.value = false;
			}
      //挂载时
			onMounted(async()=>{
				input.value.focus()
				//新评与热评数据
				getNewData(0)
			})
			return{
				message,
				commentList,
				newList,
				totalNums,
				onLike,
				getLikeComment,
				preCommentId,
				othersContent,
				replay,
				input,
				sendComt,
				toTop,
				currentPage,
				changePage,
				isShowNew,
				getNewData,
				numsList,
				totalItems,
				OnlyReplay,
				onComment,
				commentId,
				userSelfFloor,
				onDelete,
				aa,
				loadFlag
			}
		}
	}
</script>

<style scoped lang="less">
  .commentList{
		position: relative;
		.input{
			border: 1px solid darkgray
		}
		.comment-btn{
			width: 80px;
			height: 40px;
			background-color: transparent;
			border: 1px solid lightgray;
			border-radius: 20px;
			font-size: 17px;
			position: absolute;
			right: 15px;
			margin-top: 20px;
			background-color:white;
			cursor: pointer;
			&:hover{
				background-color: rgba(125,125,125,0.1);
			}
		}
		.comment-content{
			margin-top: 80px;
			width: 100%;
			margin-left: 15px;
			text-align: left;
			
		}
		.comment-content-title{
			font-size: 22px;
			font-weight: bold;
		}
	}
</style>
