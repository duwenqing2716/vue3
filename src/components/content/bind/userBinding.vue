<template>
	<div class="userBinding">
		<p class="title">绑定账号</p>
		<span class='other-title'>注册账号</span>
		<div class="bindList">
			<div class="cellInfo">
				<i class="iconfont icon-qunfengshouji"></i>
				<div>
					<span>手机</span>
					<p>使用手机号注册: {{cell}} &nbsp&nbsp
					<a href="" @click.prevent='changeBind'>更换手机</a>
					</p>
				</div>
			</div>
			<div class='change-pwd'>
				<button @click="showUpdatePwd=true">修改密码</button>
			</div>
		</div>
		<span class='other-title' style="margin-top: 40px;">其他登录方式</span>
		<div class="list">
		<div class="bindList listInfo" v-for="(item,index) in state.listBind">
		  <div class="iconInfo">
				<i class="iconfont" :class="item.icon" :style="{'color': item.isExpired? item.color:''}"></i>
				<span>
					{{item.title}}
				  <p v-show="item.isExpired">ID: {{item.id}}</p>
				</span>
			</div>
			<div class="iconUpdate">
				<button>
					<i class="iconfont icon-tianjia" v-if="!item.isExpired"><span>绑定账号</span></i>
					<span v-else @click="onCount">账号已绑定</span>
				</button>
			</div>
		</div>
		</div>
	</div>
	
	<van-popup v-model:show="show" :close-on-click-overlay='false' :closeable='true' style="width: 500px;height: 270px;border-radius: 10px;">
		<verity-popup @onClose='onClose'></verity-popup>
	</van-popup>
	
	<van-popup v-model:show="showVerityCell" v-if="showVerityCell" :close-on-click-overlay='false' :closeable='true' style="width: 600px;height: 320px;border-radius: 10px;">
		<send-msg :cellPhone='cellPhone' @onClose='showVerityCell=false' :updateData='updateData' @onSuccess='onSuccess'></send-msg>
	</van-popup>
	
	<van-popup v-model:show="showUpdatePwd" v-if="showUpdatePwd" :close-on-click-overlay='false' :closeable='true' style="width: 600px;height: 270px;border-radius: 10px;">
    <updated-pwd :cellPhone='cellPhone' @onClose='showUpdatePwd=false' @onUpdate='onUpdate'></updated-pwd>
	</van-popup>
</template>

<script>
	import { ref,onMounted,reactive,nextTick } from 'vue'
	import { getUserBinding } from 'network/useDetail.js'
	import VerityPopup from './childComps/VerityPopup.vue'
	import sendMsg from './childComps/sendMsg.vue'
	import updatedPwd from './childComps/updatedPwd.vue'
	import { Toast } from 'vant'
	//vuex功能引入
	import {
		useStore
	} from 'vuex'
	export default{
		name:'userBinding',
		emits:['updateData','onClose'],
		components:{
			VerityPopup,
			sendMsg,
			updatedPwd
		},
		setup(){
			const store = useStore()
			
			const bindings = ref({})
			const cellPhone = ref(null)
			const cell = ref(null)
			const show = ref(false)
			const showVerityCell = ref(false)
			const showUpdatePwd = ref(false)
			const updateData = ref('')
			
			const state = reactive({
				listBind:[
					{
						type:2,
						title:'新浪微博',
						icon:'icon-xinlang',
						color:'#EC4141',
						id:null,
						isExpired:false
					},
					{
						type:5,
						title:'QQ',
						icon:'icon-qq',
						color:'#34A0DF',
						id:null,
						isExpired:false
					},
					{
						type:0,
						title:'网易邮箱账号',
						icon:'icon-wangyi',
						color:'#EC4141',
						id:null,
						isExpired:false
					},
					{
						type:10,
						title:'微信',
						icon:'icon-ziyuan',
						color:'#68B734',
						id:null,
						isExpired:false
					},
				]
			})
			//弹出更换手机号弹出层 阻止默认事件发送
			const changeBind = () => {
				show.value = true;
			}
			//关闭弹出层
			const onClose = () => {
				show.value = false;
				showVerityCell.value = true;
				updateData.value=''
			}
			//成功时关闭弹出层并更新换绑的手机号并加密
			const onSuccess = (val) => {
				showVerityCell.value = false;
				cell.value = val.replace(/^(\d{3})\d{4}(\d+)/,"$1****$2")
			}
			
			const onCount = () => {
				Toast({
					message:'点击取消绑定功能由于后端无接口暂时不做',
				})
			}
			//刷新页面内容
			const onUpdate = (val) => {
				showUpdatePwd.value=false
				nextTick(()=>{
					updateData.value = val
					showVerityCell.value = true;
				})
			}
			//挂载时
			onMounted(()=>{
				//获取用户uid
				const uid = store.getters.getUserId
				// console.log(uid)
				Toast.loading({
				  duration: 0, // 持续时间，0表示持续展示不停止
				  forbidClick: true, // 是否禁止背景点击
				  message: '加载中...' // 提示消息
				})
				//获取用户绑定数据
				getUserBinding(uid).then(res => {
					if(res.code!=200){
						Toast.fail({
							message:'获取用户绑定数据失败',
							position:'top'
						})
					}else{
						bindings.value = res.bindings
						let phone = bindings.value.filter(item => item.type==1)
						cellPhone.value = JSON.parse(phone[0].tokenJsonStr).cellphone
						//手机号加密
						cell.value = cellPhone.value.replace(/^(\d{3})\d{4}(\d+)/,"$1****$2")
						// 微博
						let wb = bindings.value.filter(item => item.type==2)
						if(wb){
							state.listBind[0].id = JSON.parse(wb[0].tokenJsonStr).screen_name
							state.listBind[0].isExpired = true
						}
						// 微信
						let wx = bindings.value.filter(item => item.type==10)
						if(wx){
						  state.listBind[3].id = JSON.parse(wx[0].tokenJsonStr).nickname
						  state.listBind[3].isExpired = true
						}
						// QQ
						let qq = bindings.value.filter(item => item.type==5)
						if(qq){
						  state.listBind[1].id = JSON.parse(qq[0].tokenJsonStr).nickname
						  state.listBind[1].isExpired = true
						}
			      // 网易邮箱
						let wy = bindings.value.filter(item => item.type==0)
						if(wy){
						  state.listBind[2].id = JSON.parse(wy[0].tokenJsonStr).email
						  state.listBind[2].isExpired = true
						}
						Toast.clear()
					}
				})
			})
			return {
				state,
				cellPhone,
				cell,
				changeBind,
				show,
				onClose,
				showVerityCell,
				showUpdatePwd,
				onUpdate,
				updateData,
				onCount,
				onSuccess
			}
		}
	}
</script>

<style lang="less" scoped="scoped">
	.userBinding{
		width: 80%;
		margin-left: calc(20%);
		height: 600px;
		position: absolute;
		z-index: 2;
		.title{
			font-size: 25px;
			font-weight: bold;
			position: absolute;
			left: 40px;
			top: -5px;
		}
		.other-title{
			position: absolute;
			left: 40px;
			font-size: 18px;
			margin-top: 100px;
		}
		.bindList{
			margin-top: 150px;
			display: flex;
			margin-left: 40px;
			font-size: 20px;
			width: 90%;
			height: 80px;
			background-color: #F5F5F7;
			div{
				flex: 1;
			}
			.cellInfo{
				margin-left: 50px;
				display: flex;
				i{
					font-size: 54px;
					display: block;
					margin-top: 10px;
					color: #E7A84F;
				}
				div{
					margin-left: 30px;
					text-align: left;
					span{
						margin-top: 15px;
						font-size: 18px;
						display: inline-block;
					}
					p{
						margin-top: 5px;
						margin-left: 0px;
						font-size: 14px;
					}
				}
			}
			.change-pwd{
				position: relative;
				button{
					width: 120px;
					height: 40px;
					border-radius: 22px;
					border: 1px solid gray;
					font-size: 16px;
					background-color: transparent;
					position: absolute;
					right: 50px;
					margin-top: 20px;
					cursor: pointer;
					&:hover{
						background-color: rgba(125,125,125,0.1)
					}
				}
			}
		}
		.list{
			margin-top: 90px;
			height: 500px;
		}
		.listInfo{
			margin-top: 40px;
			display: flex;
			justify-content: space-between;
			.iconInfo{
				display:flex;
				align-items: center;
				i{
					font-size: 54px;
					margin-left: 50px;
					color: #B5B4B4;
				}
				span{
					display: inline-block;
					margin-left: 30px;
					margin-top: 10px;
					font-size: 18px;
					text-align: left;
					p{
						font-size: 14px;margin-top: 5px;margin-left: 0px;text-align:left
					}
				}
			}
			.iconUpdate{
				position: relative;
				button{
					width: 120px;
					height: 40px;
					border-radius: 22px;
					border: 1px solid gray;
					font-size: 16px;
					background-color: transparent;
					margin-top: 20px;
					position: absolute;
					right: 50px;
					cursor: pointer;
					&:hover{
						background-color: rgba(125,125,125,0.1)
					}
					span{
						display: inline-block;
						margin-left: 5px;
					}
				}
			}
		}
	}
</style>
