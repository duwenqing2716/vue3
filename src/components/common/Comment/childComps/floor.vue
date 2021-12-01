<template>
	<div>
		<slot name="title"></slot>
    <div class="content-list" v-for="(item,index) in commentList" @contextmenu.prevent="onDelete(item)" >
    	<div @click="reSongDetail(item.user.userId)">
    		<img :src="item.user.avatarUrl + '?param=50y50'" alt="">
    	</div>
    	<div>
    		<van-cell class="comment-details">
					<template #title>
						<p>
							<span class="nickname" @click="reSongDetail(item.user.userId)">{{item.user.nickname}}: </span>
						  {{item.content}}
						</p>
						<p class="comment-details-floor" v-if="item.beReplied && item.beReplied.length!=0">
							<span class="exist-comment" v-if="item.beReplied[0].content">
								<span class="exist-comment-name" @click="reSongDetail(item.beReplied[0].user.userId)">@{{item.beReplied[0].user.nickname}}: </span>
								<span>{{item.beReplied[0].content}}</span>
							</span>
							<span class="delete-comment" v-else>
								该评论已被删除
							</span>
						</p>
					  <p v-if="item.beRepliedUser" style="width: 100%;background-color:rgba(125,125,125,0.1);border-radius: 8px;line-height: 40px;padding-left: 10px;" @click="reSongDetail(item.beRepliedUser.userId)">
							<span class="exist-comment-name">@{{item.beRepliedUser.nickname}}: </span>
							<span>{{othersContent[item.commentId]}}</span>
						</p>
					</template>
    			<template #label>
    				<span>{{compare(item.time)}}</span>
    			</template>
    		</van-cell>
    	</div>
    	<div style="">
    		<span class="report">举报</span>
    		<i class="iconfont icon-dianzan" id="zan" @click="onLike(item.commentId,1,index,t)" v-show="!item.liked">({{item.likedCount}})</i>
    		<i class="iconfont icon-dianzan_kuai" id="zan" @click="onLike(item.commentId,0,index,t)" v-show="item.liked" style='color:#EC4141'>({{item.likedCount}})</i>
    		<i class="iconfont icon-zhuanfa" @click="onTransmit"></i>
    		<i class="iconfont icon-pinglun" @click="onComment(item)"></i>
    	</div>
    </div>
	</div>
</template>

<script>
	import { sendComment } from 'network/songs.js'
	import { ref,onMounted } from 'vue';
	//vuex功能引入
	import{ useStore } from 'vuex'
	//路由功能引入
	import { useRouter,useRoute } from 'vue-router'
	import { Toast,Dialog } from 'vant'
	export default {
		name:'floor',
		props:{
			commentList:{
				type:Array,
				required:true,
				default(){
					return []
				}
			},
			othersContent:{
				type:Object,
				default(){
					return {}
				}
			},
			t:{
				type:Number,
				required:true,
				default(){
					return 1
				}
			},
			listType:{
				type:Number,
				default(){
					return null
				}
			},
			listId:{
				type:String,
				default(){
					return null
				}
			}
		},
		setup(props,ctx){
			const store = useStore();
			const router = useRouter(); //实例化路由
			const route = useRoute(); //实例化路由
			
			const timeMount = ref(null);
			//日期格式化
			const compare = (val) => {
				const date =new Date(val)
				if(val-timeMount.value>0){
					return '刚刚'
				}
				return date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日 '+date.getHours()+':'+(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes())
			}
			//跳转个人详情页面
			const reSongDetail = (id) => {
				router.push({path:'/home/userDetail',query:{id:id}})
			}
			//回滚到顶
			const toTop = () => {
				ctx.emit('toTop')
			}
			//删除自己的评论(鼠标右键点击事件) 判断是否为自己 左击时间将与点赞功能冲突 功能未完善
			const onDelete = (item) => {
				let uid = store.getters.getUserId
				if(item.user.userId == uid){
					Dialog.confirm({
						message: '确定删除你的评论吗',
					})
					.then(async() => {
						//发送请求删除自己的评论 
						let res;
						if(props.listType!=6){
						res = await sendComment({t:0,type:props.listType,id:route.query.id,commentId:item.commentId,timerstamp:Date.now()})
						}else{
							res = await sendComment({t:0,type:props.listType,threadId:props.listId,commentId:item.commentId,timerstamp:Date.now()})
						}
						if(res.code == 200) Toast('删除成功')
						//找到isShowNew.value中的评论并删除
						ctx.emit('onDelete',item)
						
					})
					.catch(() => {
					});
				}
			}
			//
			const onLike = (val,status,index,type) => {
				ctx.emit('onLike',val,status,index,type)
			}
			//点击评论按钮
			const onComment = (val) => {
				ctx.emit('onComment',val)
			}
			//转发功能未开发
			const onTransmit = () => {
				Toast('功能未开发!')
			}
			onMounted(()=>{
				timeMount.value = Date.now()
			})
			return {
				onDelete,
				reSongDetail,
				compare,
				onComment,
				onTransmit,
				timeMount,
				onLike
			}
		}
	}
</script>

<style scoped lang="less">
  
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
					background-color: transparent;
  				.comment-details-floor{
  						width: 100%;
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
							.exist-comment-name,.nickname{
								color: darkblue;
								cursor: pointer;
								opacity: 0.7;
								&:hover{
									opacity: 1;
								}
							}
  						span{
  							color:black
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
</style>
