<template>
	<div class="login">
		<div v-if="$store.getters.getLoginStatus">
			<router-link :to="{ path: '/home/userDetail', query: { id: $store.getters.getUserId }}">
				<img :src="$store.getters.getAvatar" alt="" id="login">
			</router-link>
		</div>
		<div v-else>
			<img src="~assets/img/test.b66d0610.jpg" alt="" id="login" @click="showPopup()">
		</div>
		<div style="display: inline-block" @click="$store.getters.getLoginStatus?userSetting():showPopup()">
			<span>{{$store.getters.getLoginStatus? $store.getters.getNickname : '未登录'}}</span>
		</div>
		<div>
			<i class="iconfont icon-sanjiao_xia"></i>
		</div>
	</div>
	<van-popup v-model:show="show" closeable :close-on-click-overlay='false' style="width: 380px;height: 600px;" @close='onClose'>
		<div class="scan" v-if="state.isQRcode">
			<p style="color: black;font-size: 24px;margin-top: 60px;">扫码登录</p>
			<div class="qrcode">
				<div class="wrap" v-show="isRefresh">
					<span>二维码已经失效</span>
					<p @click="onRefresh">点击刷新</p>
				</div>
				<canvas id="canvas"></canvas>
				<p>使用<span>网易云音乐APP</span>扫码登录</p>
				<span class="other-modes" @click="state.isQRcode=false">选择其他登录模式 ></span>
			</div>
		</div>
		<div class="other-scan" v-else-if='currentStep === 0'>
			<other-login @onChangeModes='onChangeModes' @onSuccessLogin='onSuccessLogin' @currentStep='addStep'></other-login>
		</div>
		<div class="regist" v-show='currentStep === 1'>
			<regist @currentStep='addStep' @reLogin='subtractStep'></regist>
		</div>
		<div class="verify" v-show='currentStep === 2'>
			<verify @reLogin='subtractStep' @onVerify='addStep' @onSuccess='onSuccessLogin' :currentStep='currentStep'></verify>
		</div>
		<div class="initProfile" v-show='currentStep === 3'>
			<init-profile @backLogin='subtractStep' @onSuccess='onSuccessLogin'></init-profile>
		</div>
	</van-popup>
	<van-popover v-model:show="loginDetail" v-if="loginDetail" class="info" :offset=[48,0] style="width: 300px" placement="bottom-end"
	 :overlay='true' :overlay-style="{backgroundColor:'transparent',zIndex:'1'}" :show-arrow='false'>
		<user-settings @onCloseProfile='onCloseProfile' @onClose='userSetting'></user-settings>
	</van-popover>
</template>

<script>
	// 组件库
	import {
		Popup,
		Toast
	} from 'vant';
	//第三方组件库:二维码渲染
	import QRcode from 'qrcode';
	//组件引入
	import otherLogin from './otherLogin.vue'
	import regist from './regist.vue'
	import verify from './verify.vue'
	import initProfile from './initProfile.vue'
	import userSettings from 'components/content/bind/userSettings.vue'
	//vue功能
	import {
		ref,
		onMounted,
		reactive,
		watch,
		onUpdated,
		nextTick,
		getCurrentInstance
	} from 'vue';
	//接口引入
	import {
		getQRCode,
		getQRImage,
		checkImage,
		refreshLogin,
		getLoginStatus
	} from '../../../../network/login.js'

	import {
		getItem,
		setItem,
		removeItem
	} from '../../../../store/storage.js'
	//vuex功能引入
	import {
		useStore
	} from 'vuex'

	export default {
		name: 'login',
		components: {
			otherLogin,
			regist,
			verify,
			initProfile,
			userSettings
		},
		setup(props, context) {
			const store = useStore()

			const show = ref(false);
			const currentStep = ref(0);
			const isRefresh = ref(false);
			const timerstamp = ref(null);
			const sucsTimer = ref(null);
			const loginDetail = ref(false);

			const state = reactive({
				isQRcode: true,
				unikey: null,
				timer: null,
				userData: {}
			})
			//弹出与关闭用户设置页面
			const userSetting = () => {
				loginDetail.value = !loginDetail.value
			}
			//展示弹出并发送请求获取key
			const showPopup = () => {
				//展示currentStep为0的页面
				currentStep.value = 0
				state.isQRcode = true
				//确认关闭长轮询
				onClose()
				Toast.loading({
					duration: 0, // 持续时间，0表示持续展示不停止
					forbidClick: true, // 是否禁止背景点击
					message: '加载中...' // 提示消息
				})
				show.value = true;
				// Toast.loading('加载中...')
				getQRCode(timerstamp.value || Date.now()).then(res => {
					state.unikey = res.data.unikey
				})
			}

			//下一步
			const addStep = () => {
				onClose()
				currentStep.value++
			}

			//上一步
			const subtractStep = (val) => {
				onClose()
				// 判断是否返回登录页
				if (val === 0) {
					currentStep.value = 0
				} else {
					currentStep.value--
				}
			}

			//长轮询监听二维码是否失效 
			const longPoll = async () => {
				if (state.timer) {
					clearTimeout(state.timer)
				}
				//长轮询开始
				checkImage(state.unikey, Date.now()).then(async res => {
					if (res.code == 803) {
						// 803为授权登录成功(803状态码下会返回cookies)
						clearTimeout(state.timer)
						Toast.success('登陆成功')
						const {
							data
						} = await getLoginStatus(Date.now())
						if (data.profile != null) {
							//登录状态
							//用户数据存储于本地和vuex
							//本地存储
							setItem('cloudMusicAvatar', data.profile.avatarUrl)
							setItem('cloudMusicNickname', data.profile.nickname)
							setItem('cloudMusicUserId', data.profile.userId)
							//vuex存储
							store.commit("addUserData", data);
							//改变登录状态并关闭页面
							onSuccessLogin(true)
						} else {
							//非登录状态
							// 改变登录状态并关闭页面
							onCloseProfile()
						}
						return
					} else if (res.code == 800) {
						//刷新验证码 800为二维码过期
						isRefresh.value = true;
						return
					}
				})
				state.timer = setTimeout(() => {
					longPoll()
				}, 2000)
			}

			//二维码失效刷新
			const onRefresh = () => {
				state.isQRcode = false
				//下一个周期刷新回原页面
				nextTick(() => {
					state.isQRcode = true
				})
				isRefresh.value = false;
			}
			//关闭并清空长轮询timer定时器
			const onClose = () => {
				clearTimeout(state.timer)
				state.timer = null
			}
			//登录失败时,清空cookie，改变登录状态并关闭profile弹出层
			const onCloseProfile = () => {
				if (store.state.isLogin) {
					store.commit('changeLoginStatus', '')
					removeItem('cloudMusicStatus')
					removeItem('cloudMusicUserId')
				}
				//关闭弹出层
				loginDetail.value = false
			}
			//登陆成功并关闭弹出层返回原页面
			const onSuccessLogin = async (val) => {
				show.value = false
				//关闭长轮询
				onClose()
				// getLoginStatus()
				store.commit('changeLoginStatus', val)
			}

			//切换二维码与登录页
			const onChangeModes = () => {
				state.isQRcode = true
			}

			//监听key值更新请求二维码并实时渲染在canvas中
			watch(() => state.unikey, (newValue, oldValue) => {
				// console.log(newValue)
				getQRImage(state.unikey, Date.now()).then(res => {
					Toast.clear();
					let canvas = document.getElementById('canvas')
					// console.log(res.data.qrurl)
					QRcode.toCanvas(canvas, res.data.qrurl, err => {
						if (err) {
							console.log('渲染图片失败')
							return err
						}
					})
				})
				//开启长轮询
				longPoll()
			})

			//切换二维码与登录页时，关闭并清空长轮询timer定时器
			watch(() => state.isQRcode, (newValue, oldValue) => {
				if (state.isQRcode) {
					showPopup()
				} else {
					clearTimeout(state.timer)
					state.timer = null
				}
			})

			return {
				sucsTimer,
				currentStep,
				isRefresh,
				state,
				show,
				showPopup,
				onRefresh,
				onClose,
				onChangeModes,
				onSuccessLogin,
				addStep,
				subtractStep,
				getLoginStatus,
				loginDetail,
				userSetting,
				onCloseProfile
			};
		}
	}
</script>

<style lang="less" scoped="scoped">
	.login {
		height: 100%;
		margin-right: 30px;
		cursor: pointer;
		z-index: 2;
		width: 150px;
		display: flex;

		&:hover {
			font-weight: bold;
		}

		div {
			flex: 1;

			span {
				display: inline-block;
				width: 80px;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		img {
			vertical-align: middle;
			width: 35px;
			height: 35px;
			margin-right: 10px;
			border-radius: 50%;
		}
	}

	.scan {
		color: black;
		height: 400px;

		span {
			font-size: 14px;
		}

		.qrcode {
			font-size: 14px;

			.wrap {
				width: 180px;
				height: 180px;
				background-color: rgba(0, 0, 0, 0.7);
				color: aliceblue;
				position: absolute;
				left: 25%;
				font-weight: bold;

				span {
					display: block;
					color: aliceblue;
					margin-top: 10px;
				}

				p {
					width: 75px;
					height: 16px;
					font-size: 13px;
					line-height: 16px;
					cursor: pointer;
					border-radius: 15px;
					background-color: royalblue;
					padding: 8px;
					margin-left: 25%;
					margin-top: 25px;
				}
			}

			span {
				color: royalblue;
				cursor: pointer;
			}
		}

		.other-modes {
			font-size: 12px;
			cursor: pointer;
		}
	}
</style>
