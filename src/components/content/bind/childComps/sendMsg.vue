<template>
	<div class="sendCode" v-if="currentIndex == 1">
		<span>{{updateData?'修改密码':'更换手机'}}</span>
		<p v-show="!updateData">您的手机号为:{{cell}}</p>
		<p style="margin-top:-5px">为了安全,我们会向你的手机发送短信校验</p>
		<div class="sendSms">
			<div style='width: 70%;float: left;margin-left: 25px;'>
				<van-cell-group inset style="border: 1px solid gray;">
				  <van-field v-model="verifyCode" placeholder="填写验证码">
					</van-field>
				</van-cell-group>
			</div>
			<div style="float: right;margin-right: 40px;">
				<van-count-down v-if="isCountDownShow" :time="time" format=" mm:ss" @finish='onFinish'/>
				<van-button v-else class="send-btn" @click='reCover'>重新获取</van-button>
			</div>
		</div>
		<div class='nextStep'>
		    <button @click="onVerify">下一步</button>
				<button @click="onCancel">取消</button>
		</div>
	</div>
	<div class="changeCell"  v-if="currentIndex == 2">
		<span>更换手机号</span>
		<p>手机号:</p>
		<div class="sendCell">
			<div style='width: 70%;float: left;margin-left: 25px;'>
				<van-cell-group inset style="border: 1px solid gray;">
				  <van-field v-model="verifyCell" placeholder="填写手机号" ref='pass'>
					</van-field>
				</van-cell-group>
			</div>
			<div style="float: right;margin-right: 40px;">
				<van-count-down v-if="isTimeShow" :time="time" format=" mm:ss" @finish='onFinish'/>
				<van-button v-else class="send-btn" @click='validate'>获取验证码</van-button>
			</div>
		</div>
		<p style="display: inline-block;position: relative;left: -150px;">为了安全,我们会向你的手机发送短信校验</p>
		<input type="text" v-model="code"  placeholder="填写验证码" style="display: block;width: 80%;height: 35px;margin-left: 40px;border-radius: 8px;border: 1px solid gray;padding-left: 10px;">
		<div class='nextStep' style="margin-top: 20px;">
		    <button @click="onNext">下一步</button>
				<button @click="onCancel">取消</button>
		</div>
	</div>
</template>

<script>
	//vue功能引入
	import { ref,onMounted,nextTick } from 'vue'
	//接口引入
	import { checkSms,sendSms,register } from 'network/login.js'
	import { replacePhone } from 'network/useDetail.js'
	//组件库引入
	import { Toast } from 'vant'
	export default{
		name:'sendMsg',
		emits:['updateData','onClose','onSuccess'],
		props:{
			cellPhone:{
				type:String,
				required:true,
				default(){
					return ''
				}
			},
			updateData:{
				type:String,
				required:true,
				default(){
					return ''
				}
			}
		},
		setup(props,context){
			const time = ref(60 * 1000);
			const verifyCode = ref('');
			const isCountDownShow = ref(false);
			const cell = ref(null);
			const currentIndex = ref(1);
			const code = ref('');
			const verifyCell = ref(null);
			const isTimeShow = ref(false);
			const pass = ref(null);
			//倒计时结束时触发
			const onFinish = () => {
				isCountDownShow.value = false
			}
			//发射事件,关闭
			const onCancel = () => {
				context.emit('onClose')
			}
			//手机号验证并发送验证码 此页面大多功能还未验证完毕 
			const validate = async() => {
				if(!verifyCell.value){
					Toast({
						message:'手机号不能为空',
						position: 'top'
					})
					pass.value.focus()
					return
				}
				if (!/^1[35789]\d{9}$/.test(verifyCell.value)) {
				  Toast({
				    message: '手机号码格式错误!',
				    position: 'top'
				  })
					verifyCell.value = ''
				  pass.value.focus()
				  return
				}
				isTimeShow.value = true
				const res = await sendSms(verifyCell.value)
				if(res.code != 200){
					let msg = res.message
					Toast({
						message: msg,
						position: 'top'
					})
					return
				}
			}
			//此处有一个bug 若用户发送验证码后清空手机号则会出问题 因为手机号处为响应式变化 解决方法:需将其放在另一处
			const onNext = async() => {
				if(!verifyCell.value){
					Toast({
						message:'请填写手机号并发送验证码!',
						position: 'top'
					})
					pass.value.focus()
					return
				}
				if(!code.value){
					Toast({
						message:'验证码不能为空',
						position: 'top'
					})
					return
				}
				//接口更换绑定手机
				Toast.loading({
				  duration: 0, // 持续时间，0表示持续展示不停止
				  forbidClick: true, // 是否禁止背景点击
				  message: '验证中...' // 提示消息
				})
				//手机换绑操作 
				const res = await replacePhone(verifyCell.value,verifyCode.value,code.value)
				if(res.code === 200){
					Toast.success({
						message: '换绑手机成功!'
					})
					context.emit('onSuccess',verifyCell.value)
				}else{
					Toast.fail({
						message: '换绑手机失败',
						position: 'top'
					})
					return 
				}
			}
			//验证码校验
			const onVerify = async() => {
				// 判断是否输入无效内容 优化:通过正则进行提前判断，防止多次乱发请求
				if(!verifyCode.value){
					console.log('验证码为空')
					Toast({
						message:'验证码不能为空',
						position: 'top'
					})
					return
				}
				if(props.updateData){
					Toast.loading({
					  duration: 0, // 持续时间，0表示持续展示不停止
					  forbidClick: true, // 是否禁止背景点击
					  message: '验证中...' // 提示消息
					})
					const res = await checkSms(props.cellPhone,verifyCode.value)
					if(res.code === 200 && res.data){
						// console.log('验证码比对成功')
							//修改密码操作
							const repwd = await register({
								phone:props.cellPhone,
							  password:props.updateData,
							  captcha:verifyCode.value,
							})
							//报错情况未处理
							Toast.success('修改密码成功,请重新登录!')
							context.emit('onClose')
					}else{
						Toast.fail({
							message: '验证码输入有误!',
							position: 'top'
						})
						return 
					}
					return
				}
				
				//接口验证验证码
				Toast.loading({
				  duration: 0, // 持续时间，0表示持续展示不停止
				  forbidClick: true, // 是否禁止背景点击
				  message: '验证中...' // 提示消息
				})
				
				const res = await checkSms(props.cellPhone,verifyCode.value)
				if(res.code === 200 && res.data){
					Toast.success({
						message: '验证码对比成功!'
					})
					 currentIndex.value++
				}else{
					Toast.fail({
						message: '验证码输入有误!',
						position: 'top'
					})
					isCountDownShow.value = false
					return 
				}
			}
			// 挂载时
			onMounted(async()=>{
				cell.value = props.cellPhone.replace(/^(\d{3})\d{4}(\d+)/,"$1****$2")
				
				isCountDownShow.value = true
				const res = await sendSms(props.cellPhone)
				// console.log(res)
				if(res.code != 200){
					let msg = res.message
					Toast({
						message: msg,
						position: 'top'
					})
					return
				}
			})
			//重新发送验证码
			const reCover = async() => {
				const res = await sendSms(props.cellPhone)
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
			
			return {
				time,
				verifyCode,
				isCountDownShow,
				onFinish,
				reCover,
				onVerify,
				onCancel,
				cell,
				currentIndex,
				code,
				verifyCell,
				onNext,
				isTimeShow,
				validate,
				pass
			}
		}
	}
</script>

<style lang="less" scoped>
	.sendCode , .changeCell{
		span{
			font-size: 22px;
			margin-top: 30px;
			margin-bottom:20px;
			display: block;
		}
		p{
			text-align: left;
			margin-left: 40px;
			font-size: 14px;
		}
		.sendSms,.sendCell{
			.van-count-down{
				font-size: 22px;
				margin-top: 10px;
				margin-right: 25px;
				color: #999999;
				
			}
			.send-btn{
				background-color:#EC4141;
				width: 105px;
				border-radius: 8px;
				height: 45px;
				color: white;
				border: none;
				&:hover{
					background-color:#C72E2E;
				}
			}
		}
		.nextStep {
			margin-top: 96px;
			button {
				width: 100px;
				height: 40px;
				border-radius: 24px;
				border: none;
				background-color: transparent;
				cursor: pointer;
				font-weight: bold;
				margin: 0 20px;
			
				&:hover {
					background-color: rgba(125, 125, 125, 0.1);
				}
			
				&:nth-child(1) {
					background-color: pink;
					color: white;
			
					&:hover {
						background-color: hotpink;
					}
				}
			
				&:nth-child(2) {
					border: 1px solid rgba(125, 125, 125, 0.8);
				}
			}
		}
	}
	
</style>
