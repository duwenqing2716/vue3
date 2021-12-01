<template>
	<div>
		<div class="login-nav">
			<span class="change-modes" style="">
				<span @click="backLogin"> &lt 返回登录</span>
			</span>
			<img src="~assets/img/111.jpg" alt="">
		</div>
		<span class="notice">为了安全,我们会向你的手机发送短信校验码</span>
		<div class="sendSms">
				<van-cell-group inset>
				  <van-field v-model="verifyCode" placeholder="填写验证码">
						<template #left-icon>
							<i class="iconfont icon-feidenglu-copy"></i>
						</template>
					</van-field>
				</van-cell-group>
				<van-count-down v-if="isCountDownShow" :time="time" format=" mm:ss" @finish='onFinish'/>
				<van-button v-else class="send-btn" @click='reCover'>重新获取</van-button>
		</div>
		<div style="margin: 16px;">
		    <van-button block class="next" @click='onVerify'>
		      下一步
		    </van-button>
		</div>
	</div>
</template>

<script>
	//vue功能引入
	import { ref,reactive,onUpdated,watch,getCurrentInstance,inject } from 'vue'
	//vuex功能引入
	import{ useStore } from 'vuex'
	//接口引入
	import { checkSms,sendSms,registPhone,register,changePwd } from 'network/login.js'
	//组件库引入
	import { Toast } from 'vant'
	//存储本地cookie
	import { setItem } from 'store/storage.js'
	export default {
		name:'verify',
		props:{
			currentStep:{
				type:Number,
				required:true,
				default(){
					return 0
				}
			}
		},
		setup(props,context){
			const store = useStore()
			const internalInstance = getCurrentInstance();
			const $bus = internalInstance.appContext.config.globalProperties.$bus
			
			const isCountDownShow = ref(false);
			const verifyCode = ref('');
			const cellphone = ref('');
			const password = ref('');
			const time = ref(60 * 1000);
			
			// 事件总线接收其他页面的数据
			$bus.on('myevent', val=> {
				cellphone.value=val.cellphone
				password.value=val.pwd
			})
			
			//注册或者修改密码操作
			const onVerify = async() => {
				//判断是否输入无效内容 优化:通过正则进行提前判断，防止多次乱发请求
				if(!verifyCode.value){
					console.log('验证码为空')
					Toast({
						message:'请输入验证码',
						position: 'top'
					})
					return
				}
				//接口验证验证码
				Toast.loading({
				  duration: 0, // 持续时间，0表示持续展示不停止
				  forbidClick: true, // 是否禁止背景点击
				  message: '验证中...' // 提示消息
				})
				const res = await checkSms(cellphone.value,verifyCode.value)
					if(res.code === 200 && res.data){
						// console.log('验证码比对成功')
						//验证手机号是否注册
						const res = await registPhone(cellphone.value)
						if (res.exist === 1) {
							//修改密码无需获取昵称 此处可省
							const data = await changePwd(cellphone.value,password.value,verifyCode.value)
							const nickname = data.profile.nickname
							// console.log('修改密码操作获取昵称',data,data.profile.nickname)
							//修改密码操作
							const repwd = await register({
								phone:cellphone.value,
							  password:password.value,
							  captcha:verifyCode.value,
							})
								//报错情况未处理
							Toast.success('修改密码成功,请重新登录!')
							setItem('cloudMusicCookie',data.cookie)
							setItem('cloudMusicAvatar',data.profile.avatarUrl)
							setItem('cloudMusicNickname',data.profile.nickname)
							setItem('cloudMusicUserId',data.profile.userId)
							store.commit("addUserData",data);
							//登录成功发射事件关闭弹出
							context.emit('onSuccess','')
						}else{
							Toast.success('验证码对比成功!')
							// 事件总线发射数据到其他页面
							$bus.emit('onInit',{
								cellphone: cellphone.value,
								password: password.value,
								verifyCode: verifyCode.value
							})
							//发射事件进入下一个页面
							context.emit('onVerify')
						}
					}else{
						Toast.fail({
							message: '验证码输入有误!',
							position: 'top'
						})
						isCountDownShow.value = false
						return 
					}
			}
			//.currentStep=2时开启可重新发送验证码,因为后端有缓存机制不做多次发送拦截
			watch(()=>props.currentStep,(newValue,oldValue)=>{
				if(newValue == 2){
					isCountDownShow.value = true
				}else{
					isCountDownShow.value = false
				}
			})
			//重新发送验证码
			const reCover = async() => {
				const res = await sendSms(cellphone.value)
				console.log(res)
				if(res.code != 200){
					let msg = res.message
					Toast({
						message: msg,
						position: 'top'
					})
					return
				}
				isCountDownShow.value = true
			}
			
			//倒计时结束触发
			const onFinish = () => {
				isCountDownShow.value = false
			}
			//发射事件,返回登录页
			const backLogin = () =>{
				context.emit('reLogin',0)
			}
			
			return {
				cellphone,
				isCountDownShow,
				onVerify,
				verifyCode,
				time,
				onFinish,
				reCover,
				backLogin
			}
		}
	}
</script>

<style lang="less" scoped="scoped">
	.login-nav{
		height: 215.3px;
		.change-modes{
			display: block;
			width: 200px;
			height: 60px;
			color: black;
			font-weight: bol;
			background-color:#FFFFFF;
			position: absolute;
			span{
				// display: block;
				position: absolute;
				left:20px;
				cursor: pointer;
			}
		}
		img{
			width: 380px;
		}
	}
	.notice{
		color:darkgray;
	}
	.sendSms{
		display: flex;
		margin-top: 30px;
		.van-cell-group{
			margin-left:15%;
			width: 125px;
			height: 45px;
			font-size: 22px;
			border: 1px solid black;
		}
		.van-count-down{
			font-size: 22px;
			margin-top: 10px;
			margin-left: 45px;
			color: #999999;
			
		}
		.send-btn{
			background-color:#EC4141;
			width: 125px;
			border-radius: 8px;
			height: 45px;
			color: white;
			border: none;
			&:hover{
				background-color:#C72E2E;
			}
		}
	}
	.next{
		width: 78%;
		margin-top: 50px;
		margin-left: 40px;
		background-color:#EC4141;
		color: white;
		&:hover{
			background-color: #C72E2E;
		}
	}
</style>
