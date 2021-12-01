<template>
	<div>
		<div class="login-nav">
			<span class="change-modes" @click="onChangeModes"></span>
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
			  placeholder="请填写密码"
				:rules='state.formRules.password'>
				<template #left-icon>
				  <i class="iconfont icon-suo"></i>
				</template>
				<template #button>
				  <span @click="onRegist(0)" style="cursor: pointer;">重设密码</span>
				</template>
			</van-field>
		</van-cell-group>
		  <van-checkbox name="1"  class="login-radio" shape="square" icon-size='14' v-model="checked1" checked-color="#ee0a24"  style="margin-top:10px;margin-left: 20px;">自动登录</van-checkbox>
		<div style="margin: 16px;">
		    <van-button round block type="primary" @click="onLogin">
		      登 录
		    </van-button>
		  </div>
		<!-- <button ></button> -->
		</van-form>
		<div class="regist-button"  @click="onRegist(1)">
		  <span>注 册</span>
		</div>
		<div class="other">
			<i class="iconfont icon-ziyuan"></i>
			<i class="iconfont icon-qq"></i>
			<i class="iconfont icon-xinlang"></i>
			<i class="iconfont icon-wangyi"></i>
		</div>
		  <van-checkbox name="1" shape="square" icon-size='14' v-model="checked2" checked-color="#ee0a24" style="margin-top:10px;margin-left: 15%;font-size: 13px;">
				同意{{policy}}
			</van-checkbox>
	</div>
</template>

<script>
	//vue相关功能引入
	import { ref,reactive,inject,getCurrentInstance,onUnmounted } from 'vue'
	//vuex功能引入
	import{ useStore } from 'vuex'
	//组件库引入
	import { Toast } from 'vant'
	//接口引入
	import { cellphoneLogin,registPhone } from 'network/login.js'
	//存储本地cookie
	import { setItem } from 'store/storage.js'
	export default {
		name:'otherLogin',
		setup(props, context) {
			//使用vuex并实例化
			const store = useStore()
			//事件总线
			const internalInstance = getCurrentInstance();
			const $bus = internalInstance.appContext.config.globalProperties.$bus;
			// const emitter = inject("emitter");
			
			const code = ref(null);
			const policy = ref('<服务条款> <隐私政策> <儿童隐私政策>')
			const cell = ref(null);
			const checked1 = ref('true');
			const checked2 = ref(null);
			
			//onblur时验证手机号与密码 功能缺少:未验证密码8-20位,至少包含字母/数字/字符2种组合(可以不做此处的提醒,防止他人根据要求进行密码多次测验) 
			const state = reactive({
				message: '',
				user:{
					mobile: '',
					password: ''
				},
				formRules: {
					mobile: [{
							required: true,
							message: '请填写手机号!'
						},
						{
							pattern: /^1[3|5|7|8|9]\d{9}$/,
							message: '手机号填写格式错误!'
						}
					],
					password: [{
						required: true,
						message: '请填写密码!'
					}
				]
				}
			})
			
			//错误时清空输入框
			const formatter = (value) => value.replace(/\d/g, '');
			
			//向父组件发射事件,返回二维码页面
			const onChangeModes = () => {
				context.emit('onChangeModes')
			}
			
			//请求登录接口,并进行相应数据处理  更完善的注册流程:判断手机号是否注册,未注册直接跳转发送验证码页面进行一键注册
			const onLogin = async() => {
				
				//判断是否勾选相关政策  下方有封装的相同方法未使用
				let message = '请先勾选'+policy.value
				if(!checked2.value){
					Toast({
						message:message,
						position:'center'
					})
					return
				}
				
				//判断是否符合正则
				if(!checkPhone() || !checkCode()){
					return
				}
				
			  Toast.loading({
			    duration: 0, // 持续时间，0表示持续展示不停止
			    forbidClick: true, // 是否禁止背景点击
			    message: '登录中...' // 提示消息
			  })
				
				try{
					const res = await registPhone(state.user.mobile)
					if (res.exist != 1) {
						Toast({
						  message: '该手机号未注册!',
						  position: 'top'
						})
						//未做功能跳转昵称输入页一键注册
						return
					}
					const  data  = await cellphoneLogin(state.user.mobile,state.user.password,Date.now())
					// console.log(data)
					if( data.code && data.code === 200){
						Toast.success('登录成功!')
						//用户数据存储于本地和vuex
						//本地存储
						setItem('cloudMusicAvatar',data.profile.avatarUrl)
						setItem('cloudMusicNickname',data.profile.nickname)
						setItem('cloudMusicUserId',data.profile.userId)
						//cookie存储
						// let list = data.cookie.split(';');
						// for (let i = 0; i < list.length; i++) {
						// 	document.cookie = list[i]
						// }
						//vuex存储
						store.commit("addUserData",data);
						context.emit('onSuccessLogin',true)
					}else{
						    state.user.mobile=''
								state.user.password=''
							  Toast.fail('登录失败，手机号或密码错误！')
					}
				} catch (err) {
					if(err&&err.response&&err.response===509){
						state.message='手机号不存在或者异常,请稍后重试！'
					}else if(err&&err.response&&err.response===429){
						state.message='发送过于频繁,请稍后重试！'
					}else{
						// console.log(err)
						state.message='发生未知错误,请重新登录！'
					}
					state.user.mobile=''
					state.user.password=''
			    Toast.fail({
			    		message:state.message,
			    		position:'top'
			    })
			  }
			};
			
			
			//密码正则匹配
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
				return true
			}
			
			//手机号正则匹配
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
			
			const onRegist = (value) => {
				let message = '请先勾选'+policy.value
				if(value){
					if(!checked2.value){
						// console.log('123')
						Toast({
							message:message,
							position:'center'
						})
						return
					}
				}
					
				//重设密码状态为0,注册为1
				// 方法一 事件总线
				$bus.emit('regist',value)
				// 方法二 inject,provide暴露与接收
				// emitter.emit('regist',value);
				
				//向父组件发射事件,下一步
				context.emit('currentStep') 
			}
			
			return {
				code,
				policy,
				cell,
				state,
				checked1,
				checked2,
				onChangeModes,
				formatter,
				checkPhone,
				checkCode,
				onLogin,
				onRegist
			}
		}
	}
</script>

<style lang="less" scoped="scoped">
	.login-nav{
		height: 215.3px;
		.change-modes{
			display: block;
			width: 60px;
			height: 60px;
			position: absolute;
			cursor: pointer;
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
	:deep(.van-button--round){
		background-color: #EC4141 ;
		border: none;
		cursor: pointer;
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
		i{
			font-size: 50px;
			color: #EC4141;
			margin:0 8px;
			cursor: pointer;
			&:nth-child(1):hover{
				color: #68B734;
			}
			&:nth-child(2):hover{
				color: #34A0DF;
			}
			&:nth-child(3):hover{
				color: #FAD65F;
			}
			&:nth-child(4):hover{
				color: hotpink;
			}
		}
		
	}
	
</style>
