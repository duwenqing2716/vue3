<template>
	<div>
		<div class="login-nav">
			<span class="change-modes" style="">
				<span @click="backLogin"> &lt 返回登录</span>
			</span>
			<img src="~assets/img/111.jpg" alt="">
		</div>
		<van-form>
		<van-cell-group inset class="input">
		  <van-field 
			  v-model="state.user.mobile" 
				type="tel" 
				label="+86" 
				name="手机号"
				center
		    placeholder="请填写手机号"
				ref="cell"
				:rules='state.formRules.mobile'>
		    <template #left-icon>
		      <i class="iconfont icon-shouji"></i>
		    </template>
		  </van-field>
			<van-field 
			  v-model="state.user.password" 
			  type="password"  
			  label="密码" 
				name="密码"
				ref="code"
			  placeholder="请设置登录密码"
				:rules='state.formRules.password'>
				<template #left-icon>
				  <i class="iconfont icon-suo"></i>
				</template>
			</van-field>
		</van-cell-group>
		<span class="notice">密码8-20位,至少包含字母/数字/字符2种组合</span>
		<div style="margin: 16px;">
		    <van-button round block type="primary" @click='onRegist'>
					{{registStatus? '注册' : '下一步' }}
		    </van-button>
		  </div>
		<!-- <button ></button> -->
		</van-form>
		<span style="color: black;" v-show="registStatus">------------------------- 其他登录方式 -------------------------</span>
		<div class="other" v-show="registStatus">
			<i class="iconfont icon-ziyuan"></i>
			<i class="iconfont icon-qq"></i>
			<i class="iconfont icon-xinlang"></i>
			<i class="iconfont icon-wangyi"></i>
		</div>
	</div>
</template>

<script>
	//vue功能引入
	import { ref,reactive,getCurrentInstance,inject,onMounted } from 'vue'
	
	//接口引入
	import { registPhone,sendSms } from 'network/login.js'
	
	//组件库引入
	import { Toast } from 'vant'
	export default {
		name:'regist',
		setup(pprops,context){
			const internalInstance = getCurrentInstance();
			const $bus = internalInstance.appContext.config.globalProperties.$bus
			
			const code = ref(null);
			const cell = ref(null);
			const registStatus = ref(null);
			
			const state = reactive({
				message: '',
				user:{
					mobile: '',
					password: ''
				},
				formRules: {
					mobile: [{
							required: true,
							message: '请填写手机号'
						},
						{
							pattern: /^1[3|5|7|8|9]\d{9}$/,
							message: '手机号填写格式错误'
						}
					],
					password: [{
						required: true,
						message: '请填写密码'
					}
				]
				}
			})
			
			//重设密码状态为0,注册状态为1
			// 方法一:
			$bus.on('regist', value => {
			  registStatus.value = value
			})
			// 方法二:
			// const emitter = inject("emitter");
			// emitter.on('regist', value => {
			// 	console.log(registStatus)
			//      registStatus.value = value
			// })
			
			const checkCode = () => {
				const password = state.user.password
				if(!password){
					Toast({
					  message: '密码不能为空!',
					  position: 'top'
					})
					code.value.focus()
				  return false
				}
				if (!/^1[35789]\d{9}$/.test(state.user.mobile)) {
				  Toast({
				    message: '手机号码格式错误!',
				    position: 'top'
				  })
				  cell.value.focus()
				  return false
				}
				return true
			}
			
			const checkPhone = () => {
				const mobile = state.user.mobile
				if (!mobile) {
				  Toast({
				    message: '手机号码不能为空!',
				    position: 'top'
				  })
					//设置焦点
				  cell.value.focus()
				  return false
				}
				if (!/(?!\d+$)(?!^[A-Za-z]+$)(?!^[_#@]+$).{8,20}/.test(state.user.password)) {
				  Toast({
				    message: '设置密码格式错误!',
				    position: 'top'
				  })
				  code.value.focus()
				  return false
				}
				return true
			}
			
			const onRegist = async() => {
				if(!checkPhone() || !checkCode()){
					return
				}
				// 若是优化则是判断手机号是否注册,只有当注册的情况下才发送验证码
				// const res = await registPhone(state.user.mobile)
				// if (res.exist === 1) {
				// 	console.log('该手机号已经注册')
				// 	Toast({
				// 	  message: '该手机号已经注册',
				// 	  position: 'top'
				// 	})
				// 	return
				// }
				
				//验证码发送
				Toast.loading({
				  duration: 0, // 持续时间，0表示持续展示不停止
				  forbidClick: true, // 是否禁止背景点击
				  message: '验证码发送中...' // 提示消息
				})
				const data = await sendSms(state.user.mobile)
				// console.log(data)
				if(data.code != 200){
					let msg = data.message
					Toast({
						message: msg,
						position: 'top'
					})
					return
				}else{
					Toast.success('发送成功!')
				}
				// 事件总线接收其他页面的信息
        $bus.emit('myevent',{
					cellphone:state.user.mobile,
					pwd:state.user.password
				})
				//发射事件,下一步
				context.emit('currentStep')
			}
			
			//发射事件,返回登录页
			const backLogin = () =>{
				context.emit('reLogin',0)
			}
			
			return{
				registStatus,
				backLogin,
				code,
				cell,
				state,
				onRegist
			}
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
				position: absolute;
				left:20px;
				cursor: pointer;
			}
		}
		img{
			width: 380px;
		}
	}
	.input{
		border: 2px solid black;
	  :deep(.van-field__label){
			margin-left: 5px;
		}
	}
	.notice{
		color:darkgray;
	}
	:deep(.van-button--round){
		background-color: #EC4141 ;
		border: none;
		cursor: pointer;
		margin-top: -10px;
		font-size: 18px;
		&:hover{
			background-color: #C72E2E;
		}
	}
	.regist-button{
		color: black;
		font-size: 16px;
		cursor: pointer;
		margin-top: -10px;
	}
	.other{
		margin-top: 10px;
		i{
			font-size: 50px;
			color: #EC4141;
			margin:0 8px;
			cursor: pointer;
			&:hover{
				color: skyblue;
			}
		}
		
	}
	
</style>
