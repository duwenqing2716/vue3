<template>
	<div>
		<div class="login-nav">
			<span class="change-modes" style="">
				<span @click="backLogin"> &lt 返回登录</span>
			</span>
			<img src="~assets/img/111.jpg" alt="">
		</div>
		<span class="notice">取一个昵称,让大家记住你</span>
		<van-cell-group inset>
		  <van-field v-model="name" class="nicheng"  ref='nickname' left-icon="contact" label="昵称" placeholder="昵称不少于4个英文或2个汉字" />
		</van-cell-group>
		<div style="margin: 16px;">
		    <van-button block class="next" @click='onStart'>
		      开启云音乐
		    </van-button>
		</div>
	</div>
</template>

<script>
	//vue功能引入
	import { ref,getCurrentInstance } from 'vue';
	//组件库引入
	import{ Toast } from 'vant'
	//接口引入
	import { register,initProfile } from 'network/login.js'
	export default {
		name:'initProfile',
		setup(props,context){
			const internalInstance = getCurrentInstance();
			const $bus = internalInstance.appContext.config.globalProperties.$bus
			
			const nickname = ref(null);
			const name = ref('');
			const cellphone = ref('')
			const password = ref('')
			const verifyCode = ref('')
			//接收事件总线发送的信息
			$bus.on('onInit', val=> {
		    cellphone.value = val.cellphone,
			  password.value = val.password,
			  verifyCode.value = val.verifyCode
			})
			//注册成功操作
			const onStart = async() =>{
				//昵称正则验证
				if(!name.value || name.value.length<4){
					Toast({
						message:'昵称不少于4个英文或2个汉字',
						position:'top'
					})
					return
				}
				Toast.loading({
				  duration: 0, // 持续时间，0表示持续展示不停止
				  forbidClick: true, // 是否禁止背景点击
				  message: '音乐之旅开启中...' // 提示消息
				})
				//注册接口
				const res = await register({
					phone:cellphone.value,
				  password:password.value,
				  captcha:verifyCode.value,
				  nickname:name.value})
				
					let message = ''
					if(res.code === 505){
						message = '该昵称被占用,注册失败！'
						nickname.value.focus()
					}else if(res.code === 200){
						Toast.success({
							message:'恭喜你注册成功!请重新登录',
							position:'top'
						})
						const data = await initProfile(nickname.value)
						console.log(data,'昵称初始化')
						context.emit('onSuccess','')
					}else{
						message = '未知原因,注册失败！'
						name.value = ''
						nickname.value.focus()
					}
					Toast.fail({
						message:message,
						position:'top'
					})
			}
			
			//发射事件返回登录页
			const backLogin = () =>{
				context.emit('backLogin',0)
			}
			
			return { 
				 name,
				 cellphone,
				 password,
				 verifyCode,
				 onStart,
				 backLogin
			};
		}
	}
</script>

<style lang="less" scoped>
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
	.van-cell-group{
		border: 1px solid black;
		margin-top: 20px;
	}
	
	.notice{
		color:darkgray;
	}
	.next{
		width: 78%;
		margin-top: 50px;
		margin-left: 40px;
		background-color:#EC4141;
		color: white;
		&:hover{
			background-color:#C72E2E;
		}
	}
</style>
