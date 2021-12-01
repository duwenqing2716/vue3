<template>
	<div class="commentList">
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
		<div class="comment-content" v-show="currentPage == 1" v-if="commentList.length!=0">
			<span class="comment-content-title">精彩评论</span>
			<div class="content-list" v-for="(item,index) in commentList" @contextmenu.prevent="onDelete(item)" >
				<div @click="reSongDetail(item.user.userId)">
					<img v-lazyload="item.user.avatarUrl + '?param=50y50'" alt="">
				</div>
				<div>
					<van-cell class="comment-details">
						<template #title>
							<p>
								<span class="nickname" @click="reSongDetail(item.user.userId)">{{item.user.nickname}}: </span>
							  {{item.content}}
							</p>
							<p class="comment-details-floor" v-if="item.beReplied.length!=0"><span class="exist-comment" @click="reSongDetail(item.beReplied[0].user.userId)">@{{item.beReplied[0].user.nickname}}: </span>{{item.beReplied[0].content}}</p>
						</template>
						<template #label>
							<span>{{compare(item.time)}}</span>
						</template>
					</van-cell>
				</div>
				<div>
					<span class="report">举报</span>
					<i class="iconfont icon-dianzan" id="zan" @click="onLike(item.commentId,1,index,0)" v-show="!item.liked">({{item.likedCount}})</i>
					<i class="iconfont icon-dianzan_kuai" id="zan" @click="onLike(item.commentId,0,index,0)" v-show="item.liked" style='color:#EC4141'>({{item.likedCount}})</i>
					<i class="iconfont icon-zhuanfa" @click="onTransmit"></i>
					<i class="iconfont icon-pinglun" @click="onComment(item)"></i>
				</div>
			</div>
		</div>
		<div class="comment-content" style="margin-top: 70px;" v-if="isShowNew.length!=0">
			<span class="comment-content-title">最新评论({{totalNums}})</span>
			<div class="content-list" v-for="(item,index) in isShowNew" @contextmenu.prevent="onDelete(item)">
				<div @click="reSongDetail(item.user.userId)">
					<img v-lazyload="item.user.avatarUrl + '?param=50y50'" alt="">
				</div>
				<div>
					<van-cell class="comment-details">
						<template #title>
							<p>
								<span class="nickname" @click="reSongDetail(item.user.userId)">{{item.user.nickname}}: </span>
							  {{item.content}}
							</p>
							<p class="comment-details-floor" v-if="item.beReplied && item.beReplied.length!=0">
								<span class="exist-comment" @click="reSongDetail(item.beReplied[0].user.userId)" v-if="item.beReplied[0].content">
									@{{item.beReplied[0].user.nickname}}: <span>{{item.beReplied[0].content}}</span>
								</span>
								<span class="delete-comment" v-else>
									该评论已被删除
								</span>
							</p>
						  <p v-if="item.beRepliedUser" style="width: 100%;background-color:rgba(125,125,125,0.1);border-radius: 8px;line-height: 40px;padding-left: 10px;" @click="reSongDetail(item.beRepliedUser.userId)"><span class="exist-comment">@{{item.beRepliedUser.nickname}}: </span>{{othersContent[item.commentId]}}</p>
						</template>
						<template #label>
							<span>{{compare(item.time)}}</span>
						</template>
					</van-cell>
				</div>
				<div>
					<span class="report">举报</span>
					<i class="iconfont icon-dianzan" @click="onLike(item.commentId,1,index,1)" v-show="!item.liked">({{item.likedCount?item.likedCount:item.likedCount=0}})</i>
					<i class="iconfont icon-dianzan_kuai" @click="onLike(item.commentId,0,index,1)" v-show="item.liked" style='color:#EC4141'>({{item.likedCount}})</i>
					<i class="iconfont icon-zhuanfa" @click="onTransmit"></i>
					<i class="iconfont icon-pinglun" @click="onComment(item)"></i>
				</div>
			</div>
		</div>
		<div style='width: 55%;margin: 150px auto 200px;'>
			<van-pagination v-model="currentPage" :page-count='totalItems' :show-page-size="totalItems>8?8:totalItems" force-ellipses @change='changePage'/>
		</div>
	</div>
</template>

<script>
	import { ref,onMounted } from 'vue';
	import { hotComment,likeComment,parentComment,playlistComment,sendComment } from 'network/songs.js'
	//vuex功能引入
	import{ useStore } from 'vuex'
	//路由功能引入
	import { useRouter } from 'vue-router'

	import { Toast,Dialog } from 'vant'
	export default {
		name:'commentLists',
		props:{
			listId:{
				type:String,
				required:true,
				default(){
					return null
				}
			}
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
			const commentId = ref(null);
			const timeMount = ref(null);
			const userSelfFloor = ref('');
			const currentPage = ref(1);
			const isShowNew = ref([]);
			const numsList = ref([]);
			const totalItems = ref(null);
			
			//日期格式化
			const compare = (val) => {
				const date =new Date(val)
				if(val-timeMount.value>0){
					return '刚刚'
				}
				return date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日 '+date.getHours()+':'+(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes())
			}
			//发送点赞功能请求
			const getLikeComment = async(id,val,status,num,time) => {
				const res = await likeComment(id,val,status,num,time)
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
						// if(preCommentId.value == val&&status == statusFirst.value) return
						getLikeComment(props.listId,val,status,2,Date.now())
						// if(preCommentId.value == val) statusFirst.value = status
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
			//跳转个人详情页面
			const reSongDetail = (id) => {
				router.push({path:'/home/userDetail',query:{id:id}})
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
				//此处请求最好用params自定义
				const res = await sendComment({t:t,type:2,id:props.listId,content:message.value,commentId:commentId.value,timerstamp:Date.now()})
				//将自己的评论放在page1的顶层
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
			//回滚到顶
			const toTop = () => {
				let timeTop = setInterval(()=>{
					if(document.documentElement.scrollTop<=0){
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
			//请求新数据以及回复楼层
			const getNewData = async(val) => {
				let listDetail = {}
				const resData = await playlistComment(props.listId,30,val*30,Date.now())
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
				totalItems.value = Math.ceil(totalNums.value/30)
			}
			//删除自己的评论(鼠标右键点击事件) 判断是否为自己 左击时间将与点赞功能冲突 功能未完善
			const onDelete = (item) => {
				if(item.user.userId == store.state.uid){
					Dialog.confirm({
						message: '确定删除你的评论吗',
					})
					.then(async() => {
						//发送请求删除自己的评论 
						const res = await sendComment({t:0,type:2,id:props.listId,commentId:item.commentId,timerstamp:Date.now()})
						if(res.code == 200) Toast('删除成功')
						//找到isShowNew.value中的评论并删除
						isShowNew.value.filter((val,index)=>{
							if(val.commentId==item.commentId){
								isShowNew.value.splice(index,1)
							}
						})
						//页面bug 删除原对话 重新刷新则评论不算数 已解决 网易云自身问题歌单详情页还是不算数 再删除则为-1
						//当在评论页和收藏页切换id时页面不更新 直接更新时切换为第一个页面
						totalNums.value--
						context.emit('changeNum',totalNums.value)
					})
					.catch(() => {
					});
				}
			}
			//转发功能未开发
			const onTransmit = () => {
				Toast('功能未开发!')
			}
      //挂载时
			onMounted(async()=>{
				timeMount.value = Date.now()
				input.value.focus()
				//热评数据
				const res = await hotComment(props.listId,2,10,1,Date.now())
				commentList.value = res.hotComments
				//新评数据
				getNewData(0)
			})
			return{
				message,
				commentList,
				compare,
				newList,
				totalNums,
				onLike,
				getLikeComment,
				preCommentId,
				othersContent,
				onComment,
				replay,
				input,
				sendComt,
				OnlyReplay,
				timeMount,
				userSelfFloor,
				toTop,
				currentPage,
				changePage,
				isShowNew,
				getNewData,
				onTransmit,
				numsList,
				onDelete,
				totalItems,
				reSongDetail
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
			.comment-content-title{
				font-size: 22px;
				font-weight: bold;
			}
			.content-list{
				display: flex;
				align-items: center;
				border-bottom: 1px solid darkgray;
				position: relative;
				cursor: pointer;
				&:hover .report{
					opacity: 0.8;
				}
				.report{
					margin-right: 10px;
					cursor: pointer;
					font-size: 14px;
					opacity: 0;
					&:hover{
						opacity: 1;
					}
				}
				div{
					img{
						width: 50px;
						height: 50px;
						border-radius: 50%;
						display: block;
						cursor: pointer;
					}
					&:nth-child(2){
						flex: 1;
						.comment-details{
							.comment-details-floor{
									width: 100%;
									height: 40px;
									background-color: rgba(125,125,125,0.1);
									border-radius: 8px;
									line-height: 40px;
									padding-left: 10px;
								}
							p{
								max-width: 800px;
								overflow: hidden;
								text-overflow: ellipsis;
								display: -webkit-box;
								-webkit-line-clamp: 3;
								-webkit-box-orient: vertical;
								font-size: 15px;
								.exist-comment,.nickname{
									color: darkblue;
									cursor: pointer;
									opacity: 0.7;
									&:hover{
										opacity: 1;
									}
									span{
										color:black
									}
								}
								.delete-comment{
									color: darkgray;
									margin-left: calc(50% - 49px);
								}
							}
							span{
								font-size: 0.875rem;
							}
						}
					}
					&:nth-child(3){
						position: absolute;
						right: 10px;
						bottom: 10px;
						i{
							font-size: 20px;
							cursor: pointer;
						}
						.icon-zhuanfa{
							margin: 0 20px;
						}
					}
				}
			}
		}
	}
</style>
